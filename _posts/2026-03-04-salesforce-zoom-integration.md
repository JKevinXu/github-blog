---
layout: post
title: "Salesforce Application Integrating with Zoom: API Endpoints, Auth, and Architecture"
date: 2026-03-04 10:00:00 -0500
categories: [salesforce, integration]
tags: [salesforce, zoom, oauth, api, integration, crm, video-conferencing]
---

# Salesforce Application Integrating with Zoom: API Endpoints, Auth, and Architecture

Connecting Salesforce with Zoom is one of the most common enterprise integration patterns — sales teams live in Salesforce but run meetings in Zoom, and the gap between those two systems creates friction, lost context, and manual data entry. This post walks through how to build a Salesforce application that integrates with Zoom at the API level, with emphasis on authentication flows, key API endpoints, and the architectural decisions you'll face.

---

## TL;DR

| Aspect | Details |
|--------|---------|
| **Auth Model** | OAuth 2.0 Authorization Code flow (Server-to-Server for backend) |
| **Zoom API Base** | `https://api.zoom.us/v2` |
| **Salesforce API Base** | `https://{instance}.salesforce.com/services/data/v{version}/` |
| **Key Integration Points** | Meeting creation, recording retrieval, participant mapping, activity logging |
| **Token Management** | Both platforms issue short-lived access tokens with refresh token rotation |
| **Rate Limits** | Zoom: 30 req/sec (light), 80 req/sec (heavy) per app; Salesforce: varies by org edition |

**Key Insight**: The hardest part of this integration is not calling APIs — it's managing two separate OAuth lifecycles and correctly mapping Zoom participants (identified by email) to Salesforce Contacts/Leads (identified by Salesforce ID).

---

## Why Integrate Salesforce with Zoom?

Before diving into the technical details, here are the business workflows this integration enables:

1. **One-click meeting scheduling** — Create Zoom meetings from Salesforce Opportunity or Contact records, pre-populated with attendee emails
2. **Automatic activity logging** — After a Zoom call ends, create a Salesforce Task or Event with duration, participants, and recording link
3. **Recording attachment** — Link Zoom cloud recordings to the relevant Salesforce record for post-call review
4. **Meeting intelligence** — Sync Zoom meeting summaries (via Zoom AI Companion) into Salesforce for deal context
5. **Pipeline analytics** — Correlate meeting frequency and duration with deal progression

---

## Integration Architecture Overview

There are three architectural patterns to consider:

### Pattern 1: Salesforce-Native (Apex + Named Credentials)

The integration lives entirely within Salesforce. Apex callouts hit Zoom APIs directly, and Named Credentials manage OAuth tokens.

```
Salesforce Org
├── Lightning Component (UI)
├── Apex Controller (business logic)
├── Named Credential (Zoom OAuth tokens)
└── Callout ──► Zoom REST API (api.zoom.us/v2)
```

**Pros**: No external infrastructure, everything is in Salesforce, deployable via managed package.
**Cons**: Apex callout limits (100 callouts per transaction, 120-second timeout), limited webhook handling, governor limits constrain batch operations.

### Pattern 2: Middleware / Integration Platform

An external service (AWS Lambda, Heroku, MuleSoft, etc.) sits between Salesforce and Zoom, handling orchestration, token management, and event processing.

```
Salesforce Org ◄──► Middleware (Heroku/Lambda/MuleSoft) ◄──► Zoom API
                         │
                    Token Store (encrypted)
                    Event Queue
                    Webhook Receiver
```

**Pros**: No governor limits, can handle Zoom webhooks natively, supports complex orchestration, scales independently.
**Cons**: Additional infrastructure to manage, added latency, separate deployment pipeline.

### Pattern 3: Hybrid

Salesforce handles synchronous user actions (create meeting, fetch recordings) via Named Credentials, while a lightweight middleware handles Zoom webhooks and async processing (post-meeting activity logging).

This is the most common production pattern and what the rest of this post focuses on.

---

## Authentication: The Foundation

This integration requires managing OAuth with **two** separate platforms simultaneously. Getting this right is critical.

### Zoom OAuth 2.0

Zoom supports three auth models. For a Salesforce integration, two are relevant:

#### Option A: Server-to-Server OAuth (Recommended for Org-Wide Access)

Server-to-Server OAuth apps use account-level credentials and don't require user interaction. Best when the integration acts on behalf of the Zoom account (e.g., an admin-provisioned integration).

**Token endpoint**: `POST https://zoom.us/oauth/token`

**Grant type**: `account_credentials`

**Request**:
```
POST https://zoom.us/oauth/token
Authorization: Basic base64({client_id}:{client_secret})
Content-Type: application/x-www-form-urlencoded

grant_type=account_credentials&account_id={account_id}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  "token_type": "bearer",
  "expires_in": 3600,
  "scope": "meeting:write meeting:read user:read recording:read"
}
```

Key details:
- Access tokens expire in **1 hour**
- No refresh token — you request a new access token each time using the same credentials
- Scopes are configured at app creation time in the Zoom Marketplace
- The `account_id` is your Zoom account ID, found in the Zoom Admin portal

#### Option B: OAuth 2.0 Authorization Code (Per-User Access)

Use this when each Salesforce user connects their own Zoom account. Supports user-level scopes and respects individual Zoom permissions.

**Authorization URL**: `https://zoom.us/oauth/authorize?response_type=code&client_id={id}&redirect_uri={uri}`

**Token exchange**: `POST https://zoom.us/oauth/token`

```
POST https://zoom.us/oauth/token
Authorization: Basic base64({client_id}:{client_secret})
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code={authorization_code}&redirect_uri={redirect_uri}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "scope": "meeting:write meeting:read user:read"
}
```

**Refresh token rotation**:
```
POST https://zoom.us/oauth/token
Authorization: Basic base64({client_id}:{client_secret})
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token={refresh_token}
```

Key details:
- Access tokens expire in **1 hour**
- Refresh tokens expire in **15 years** but are single-use — each refresh returns a new refresh token
- You **must** store and rotate refresh tokens; losing one means the user must re-authorize
- Redirect URI must be pre-registered in the Zoom Marketplace app settings

### Salesforce OAuth 2.0

On the Salesforce side, you need a Connected App for any external service that calls Salesforce APIs.

#### Connected App Setup

In Salesforce Setup, create a Connected App with:
- **OAuth Scopes**: `api`, `refresh_token`, `offline_access`
- **Callback URL**: Your middleware's callback endpoint
- **IP Relaxation**: Set to "Relax IP restrictions" for server-to-server or configure trusted IP ranges

#### Token Endpoints

**Authorization**: `https://login.salesforce.com/services/oauth2/authorize` (production) or `https://test.salesforce.com/services/oauth2/authorize` (sandbox)

**Token exchange**:
```
POST https://login.salesforce.com/services/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code={authorization_code}
&client_id={consumer_key}
&client_secret={consumer_secret}
&redirect_uri={callback_url}
```

**Response**:
```json
{
  "access_token": "00D5g00000...",
  "refresh_token": "5Aep861...",
  "instance_url": "https://yourorg.my.salesforce.com",
  "token_type": "Bearer",
  "issued_at": "1709560000000"
}
```

Critical: always use the `instance_url` from the token response for subsequent API calls — don't hardcode it. Salesforce orgs can be on different instances and can be migrated.

#### Salesforce Named Credentials (For Apex-Direct Pattern)

If calling Zoom from Apex, Salesforce Named Credentials handle OAuth automatically:

1. Create an **External Credential** with OAuth 2.0 client credentials pointing to Zoom's token endpoint
2. Create a **Named Credential** that references the External Credential with base URL `https://api.zoom.us/v2`
3. Apex callouts to the Named Credential automatically include a valid Bearer token, with Salesforce handling refresh internally

This eliminates manual token management from Apex code entirely.

### Token Storage and Security

For the middleware pattern, you need a secure token store:

- **Encrypt at rest** — Use AWS KMS, Vault, or platform-native encryption for stored tokens
- **Separate from application data** — Tokens should not live in the same database table as business data
- **Map tokens to users** — Store the Salesforce User ID alongside their Zoom access/refresh tokens
- **Audit access** — Log every token read/write for compliance
- **Handle revocation** — If a user disconnects, revoke both the Salesforce and Zoom tokens via their respective revocation endpoints

**Zoom token revocation**: `POST https://zoom.us/oauth/revoke?token={access_token}`

**Salesforce token revocation**: `POST https://login.salesforce.com/services/oauth2/revoke?token={refresh_token}`

---

## Key Zoom API Endpoints

All Zoom REST API endpoints use the base URL `https://api.zoom.us/v2`. Authentication is via Bearer token in the `Authorization` header.

### Create a Meeting

```
POST /users/{userId}/meetings
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | path | Zoom user ID or email, or `me` for the authenticated user |
| `topic` | body | Meeting title (map from Salesforce Opportunity name or Subject) |
| `type` | body | `1` = instant, `2` = scheduled, `3` = recurring no fixed time, `8` = recurring fixed time |
| `start_time` | body | ISO 8601 datetime (e.g., `2026-03-15T14:00:00Z`) |
| `duration` | body | Duration in minutes |
| `timezone` | body | IANA timezone (e.g., `America/New_York`) |
| `agenda` | body | Meeting description |
| `settings.join_before_host` | body | Boolean |
| `settings.waiting_room` | body | Boolean |
| `settings.meeting_authentication` | body | Boolean — require authenticated Zoom users |

**Response** (key fields):
```json
{
  "id": 85746065,
  "topic": "Q1 Deal Review - Acme Corp",
  "join_url": "https://zoom.us/j/85746065?pwd=...",
  "start_url": "https://zoom.us/s/85746065?zak=...",
  "password": "abc123",
  "start_time": "2026-03-15T14:00:00Z",
  "duration": 30
}
```

The `join_url` is what you store on the Salesforce Event record. The `id` is what you use for all subsequent API calls related to this meeting.

### List Meetings

```
GET /users/{userId}/meetings?type=scheduled&page_size=30&next_page_token={token}
```

Paginated response. Use `next_page_token` for subsequent pages. Maximum `page_size` is 300.

### Get Meeting Details

```
GET /meetings/{meetingId}
```

Returns full meeting metadata including settings, recurrence, and current status.

### Get Past Meeting Participants

```
GET /past_meetings/{meetingId}/participants?page_size=30
```

This is the endpoint that powers post-meeting activity logging. It returns:

```json
{
  "participants": [
    {
      "id": "abcdef123",
      "name": "Jane Smith",
      "user_email": "jane@acme.com",
      "join_time": "2026-03-15T14:00:12Z",
      "leave_time": "2026-03-15T14:32:45Z",
      "duration": 1953
    }
  ]
}
```

The `user_email` field is the critical link for mapping back to Salesforce Contacts/Leads (more on this below).

### List Meeting Recordings

```
GET /meetings/{meetingId}/recordings
```

Returns cloud recording files with download URLs:

```json
{
  "recording_files": [
    {
      "id": "rec-uuid-123",
      "recording_type": "shared_screen_with_speaker_view",
      "file_type": "MP4",
      "file_size": 52428800,
      "download_url": "https://zoom.us/rec/download/...",
      "play_url": "https://zoom.us/rec/play/...",
      "status": "completed"
    }
  ]
}
```

Note: Download URLs require the access token as a query parameter (`?access_token=...`) or in the Authorization header. They expire — don't store them permanently; store the recording ID and fetch a fresh URL when needed.

### Get Meeting Summary (AI Companion)

```
GET /meetings/{meetingId}/meeting_summary
```

If the Zoom account has AI Companion enabled, this returns:

```json
{
  "meeting_id": 85746065,
  "summary": {
    "overview": "Team discussed Q1 pipeline targets...",
    "action_items": [
      "Jane to send revised proposal by Friday",
      "Kevin to schedule follow-up demo"
    ],
    "next_steps": "Follow-up meeting scheduled for March 22"
  }
}
```

This is high-value data to push into Salesforce Activity records or Opportunity notes.

### Zoom Webhooks

Instead of polling, Zoom can push events to your middleware:

**Webhook endpoint**: You configure a URL in the Zoom Marketplace app settings.

**Key events for Salesforce integration**:
- `meeting.ended` — Trigger post-meeting processing (log activity, fetch participants)
- `recording.completed` — Trigger recording link attachment to Salesforce record
- `meeting.participant_joined` / `meeting.participant_left` — Real-time attendance tracking

**Webhook validation**: Zoom sends a `POST` with a JSON body. You must validate the request using the webhook secret token:

1. Zoom sends a challenge request during setup — respond with `{ "plainToken": "{token}", "encryptedToken": "HMAC-SHA256({token}, {secret})" }`
2. For ongoing events, verify the `x-zm-signature` header: `v0=HMAC-SHA256({timestamp}:{body}, {secret})`

---

## Key Salesforce API Endpoints

### Create an Event (Activity Log)

```
POST /services/data/v62.0/sobjects/Event
```

```json
{
  "Subject": "Zoom Meeting: Q1 Deal Review - Acme Corp",
  "StartDateTime": "2026-03-15T14:00:00.000+0000",
  "EndDateTime": "2026-03-15T14:33:00.000+0000",
  "DurationInMinutes": 33,
  "WhoId": "003xx000004TmfQ",
  "WhatId": "006xx000004abc1",
  "Description": "Zoom Meeting ID: 85746065\nParticipants: Jane Smith, Kevin Xu\nRecording: https://zoom.us/rec/play/...",
  "Type": "Meeting",
  "Zoom_Meeting_ID__c": "85746065",
  "Zoom_Recording_URL__c": "https://zoom.us/rec/play/..."
}
```

- `WhoId` = Contact or Lead ID (the "Name" relation)
- `WhatId` = Opportunity, Account, or Case ID (the "Related To" relation)
- Custom fields (`Zoom_Meeting_ID__c`, `Zoom_Recording_URL__c`) require custom field creation in Salesforce Setup

### Create a Task (Follow-Up)

```
POST /services/data/v62.0/sobjects/Task
```

```json
{
  "Subject": "Follow-up: Send revised proposal to Acme Corp",
  "ActivityDate": "2026-03-19",
  "WhoId": "003xx000004TmfQ",
  "WhatId": "006xx000004abc1",
  "OwnerId": "005xx000001abc2",
  "Status": "Not Started",
  "Priority": "High",
  "Description": "Action item from Zoom meeting on 3/15: Jane to send revised proposal by Friday"
}
```

### Query Contacts by Email (Participant Mapping)

```
GET /services/data/v62.0/query?q=SELECT+Id,Name,Email,AccountId+FROM+Contact+WHERE+Email='jane@acme.com'
```

This is how you map Zoom participants (identified by email) to Salesforce records. If no Contact is found, fall back to Lead:

```
GET /services/data/v62.0/query?q=SELECT+Id,Name,Email+FROM+Lead+WHERE+Email='jane@acme.com'+AND+IsConverted=false
```

### Update Opportunity Fields

```
PATCH /services/data/v62.0/sobjects/Opportunity/{opportunityId}
```

```json
{
  "Last_Meeting_Date__c": "2026-03-15",
  "Meeting_Count__c": 4,
  "Last_Meeting_Summary__c": "Discussed pricing. Client requested revised proposal..."
}
```

### Salesforce Platform Events (For Real-Time Updates)

Instead of the middleware directly updating Salesforce records, publish a Platform Event and let Salesforce-side automation handle the business logic:

```
POST /services/data/v62.0/sobjects/Zoom_Meeting_Event__e
```

```json
{
  "Meeting_ID__c": "85746065",
  "Event_Type__c": "meeting.ended",
  "Participant_Emails__c": "jane@acme.com,kevin@company.com",
  "Duration_Minutes__c": 33,
  "Recording_URL__c": "https://zoom.us/rec/play/..."
}
```

A Salesforce Flow or Apex Trigger subscribing to `Zoom_Meeting_Event__e` then handles Contact lookup, Event creation, and Opportunity updates. This decouples the middleware from Salesforce business logic and makes customization easier for admins.

---

## Participant Mapping: The Hard Problem

Mapping Zoom participants to Salesforce records is the integration's trickiest challenge:

### The Problem

- Zoom identifies participants by **email** (and sometimes display name)
- Salesforce identifies records by **Salesforce ID**
- Emails aren't always unique — people use personal emails for Zoom
- Some Zoom participants aren't in Salesforce at all (internal team members, external consultants)
- Display names in Zoom are unreliable ("John's iPhone", "User123")

### Resolution Strategy

1. **Email exact match** — Query Contact.Email and Lead.Email for the participant's Zoom email. This resolves ~70-80% of participants.
2. **Email domain match** — If no exact match, check if the email domain matches an Account's Website domain. Associate with the Account even if no specific Contact is found.
3. **Internal user exclusion** — Maintain a list of internal email domains. Skip creating activity associations for internal participants (or associate them as the Event Owner).
4. **Unmatched handling** — For participants that don't match any Salesforce record, store the name and email in the Event description or a custom related list for manual resolution.
5. **Caching** — Cache email-to-Salesforce-ID mappings. Participant lists for recurring meetings rarely change, so a cache hit rate of 90%+ is achievable.

---

## Rate Limits and Throttling

### Zoom Rate Limits

Zoom categorizes API endpoints into rate limit tiers:

| Category | Rate Limit | Example Endpoints |
|----------|-----------|-------------------|
| Light | 30 requests/second | GET meeting details, list meetings |
| Medium | 20 requests/second | GET participants, recordings |
| Heavy | 80 requests/second | POST create meeting |
| Resource-intensive | 1 request/second | Dashboard APIs, reports |

Rate limit headers in responses:
- `X-RateLimit-Limit` — Maximum requests allowed
- `X-RateLimit-Remaining` — Remaining requests in the window
- `X-RateLimit-Reset` — Unix timestamp when the limit resets (ADDED: found inconsistently in Zoom docs — verify by inspecting actual response headers)

When rate-limited, Zoom returns `429 Too Many Requests`. Implement exponential backoff with jitter.

### Salesforce API Limits

Salesforce limits depend on org edition:

| Edition | Daily API Calls (per user license) |
|---------|-----------------------------------|
| Enterprise | 1,000 per license (min 15,000) |
| Unlimited | 5,000 per license (min 15,000) |
| Performance | 5,000 per license (min 15,000) |

Additional constraints:
- **Concurrent API limit**: 25 long-running requests simultaneously
- **Bulk API**: Use Bulk API 2.0 for batch operations (e.g., syncing many meeting activities at once) — up to 15,000 batches per 24 hours
- **Query result size**: SOQL queries return max 2,000 records per request (use `nextRecordsUrl` for pagination)

For an integration processing post-meeting data, a single meeting typically requires 3-5 API calls to Salesforce (query contacts, create event, update opportunity). Plan your daily API budget accordingly.

---

## Error Handling and Resilience

### Common Failure Modes

| Failure | Cause | Handling |
|---------|-------|----------|
| `401 Unauthorized` from Zoom | Access token expired | Refresh token (Authorization Code) or request new token (Server-to-Server) |
| `401 Unauthorized` from Salesforce | Access token expired or revoked | Use refresh token; if that fails, prompt re-authorization |
| `404 Not Found` for meeting | Meeting deleted or ID incorrect | Log and skip — don't retry |
| `429 Too Many Requests` | Rate limit exceeded | Exponential backoff with jitter, respect `Retry-After` header |
| Webhook delivery failure | Middleware downtime | Zoom retries webhooks for up to 3 days; ensure idempotent processing |
| `INVALID_FIELD` from Salesforce | Custom field not deployed | Validate Salesforce schema on startup; fail fast with clear error message |

### Idempotency

Zoom webhooks can be delivered more than once. Use the Zoom Meeting ID + event type as an idempotency key. Before creating a Salesforce Event, query for existing records with the same `Zoom_Meeting_ID__c` to avoid duplicates.

### Circuit Breaker

If either Zoom or Salesforce is consistently returning errors, stop calling that API temporarily. A circuit breaker pattern prevents cascading failures and avoids burning through API limits on retried failures.

---

## Security Considerations

1. **Principle of least privilege** — Request only the Zoom scopes you need. If you only read meetings and recordings, don't request `meeting:write`.
2. **Zoom scopes to request**: `meeting:read`, `recording:read`, `user:read` for read-only integration; add `meeting:write` only if creating meetings from Salesforce.
3. **Salesforce Connected App scopes**: Use `api` and `refresh_token`. Avoid `full` unless absolutely necessary.
4. **Webhook secret validation** — Always validate Zoom webhook signatures. Never trust unverified payloads.
5. **Recording access** — Zoom recording download URLs contain embedded auth. Don't store these in Salesforce Long Text fields visible to all users unless appropriate. Consider using a proxy that checks Salesforce user permissions before redirecting to the recording.
6. **Data residency** — Zoom stores recordings in regional data centers. If your Salesforce org has data residency requirements, ensure recording links (not files) are stored in Salesforce, and Zoom's data region aligns with compliance requirements.
7. **Token encryption** — Never store OAuth tokens in plaintext. Use platform-native secrets management (Salesforce Named Credentials, AWS Secrets Manager, etc.).

---

## Zoom App Marketplace vs. Custom Build

### Using the Existing Zoom for Salesforce App

Zoom offers an official "Zoom for Salesforce" managed package on Salesforce AppExchange. It covers:
- Meeting scheduling from Salesforce
- Automatic activity logging
- Recording links on Salesforce records
- Zoom Phone integration

**When to use it**: If your requirements are standard and you don't need heavy customization.

**When to build custom**: 
- You need to map participants to custom objects (not just Contact/Lead)
- Your meeting-to-opportunity association logic is non-standard
- You need AI Companion summary data synced into specific Salesforce fields
- You have compliance requirements that prevent using third-party managed packages
- You need to integrate Zoom with Salesforce CPQ, Health Cloud, or other specialized clouds

### Registering a Custom App on Zoom Marketplace

If building custom, register your app at [marketplace.zoom.us](https://marketplace.zoom.us):

1. Choose **Server-to-Server OAuth** (org-wide) or **OAuth** (per-user)
2. Configure required scopes
3. Set webhook event subscriptions and endpoint URL
4. For distribution, decide between **Account-level** (single org) or **Published** (multi-tenant, requires Zoom review)

---

## End-to-End Flow: Post-Meeting Activity Logging

Putting it all together, here's the complete flow for the most common integration use case:

1. **Meeting ends** → Zoom fires `meeting.ended` webhook to middleware
2. **Middleware validates** webhook signature using HMAC-SHA256
3. **Middleware calls** `GET /past_meetings/{id}/participants` on Zoom API
4. **Middleware calls** `GET /meetings/{id}/recordings` on Zoom API (if recording exists)
5. **Middleware calls** `GET /meetings/{id}/meeting_summary` on Zoom API (if AI Companion enabled)
6. **For each external participant email**, middleware queries Salesforce: `SELECT Id, Name, AccountId FROM Contact WHERE Email = '{email}'`
7. **Middleware determines** the related Opportunity (by Account association, or by a pre-stored mapping if the meeting was created from Salesforce)
8. **Middleware creates** a Salesforce Event with participants, duration, recording link, and summary
9. **Middleware updates** the Opportunity's custom meeting fields (last meeting date, count, summary)
10. **Middleware logs** the operation result and stores the Zoom-to-Salesforce mapping for idempotency

Total API calls: 3-4 to Zoom + 3-6 to Salesforce per meeting. At typical enterprise volumes (50-200 meetings/day), this is well within both platforms' rate limits.

---

## Summary

Building a Salesforce-Zoom integration is fundamentally an exercise in **two-platform OAuth management** and **identity resolution** (mapping email addresses to CRM records). The API calls themselves are straightforward REST. The complexity lives in:

- Managing two separate token lifecycles with different expiration and refresh semantics
- Handling Zoom webhook validation and delivery guarantees
- Resolving Zoom participants (emails) to Salesforce records (IDs) with fallback strategies
- Staying within rate limits on both platforms during batch processing
- Keeping the integration resilient when either platform has issues

If your requirements are standard, start with the official Zoom for Salesforce package. If you need custom participant mapping, AI summary sync, or integration with non-standard Salesforce objects, a lightweight middleware handling Zoom webhooks and publishing Salesforce Platform Events gives you the best balance of flexibility and maintainability.
