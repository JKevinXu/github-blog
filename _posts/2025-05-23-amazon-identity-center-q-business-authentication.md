---
layout: post
title: "Amazon Identity Center with Amazon Q Business: Simplified Authentication Architecture"
date: 2025-05-23 10:00:00 -0500
categories: [aws, ai, security]
tags: [aws, amazon-q, identity-center, cognito, authentication, api-gateway, lambda-authorizer]
---

# Amazon Identity Center with Amazon Q Business: Simplified Authentication Architecture

As organizations adopt Amazon Q Business, understanding the authentication architecture is crucial for secure implementation. This guide presents a simplified view of authentication patterns combining Amazon Identity Center, Cognito, and custom authorizers.

## Simplified Architecture: Two Main Approaches

The authentication system can be implemented using two distinct patterns depending on your authorization needs:

### Approach 1: Cognito-Based Authorization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             IDENTITY LAYER                                  │
│                         (Where Users Authenticate)                          │
├─────────────────┬─────────────────┬─────────────────────────────────────────┤
│   External IdP  │  Amazon Cognito │      IAM Identity Center                │
│  (Okta/ADFS)    │   User Pools    │         (SSO)                          │
└─────────────────┴─────────┬───────┴─────────────────────────────────────────┘
                            │ (JWT Tokens with Groups/Roles)
                            │
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHORIZATION LAYER                                │
│                    (Built-in Cognito Authorization)                        │
├─────────────────────────────┬───────────────────────────────────────────────┤
│        API Gateway          │    Amazon Verified Permissions              │
│   (Cognito Authorizer)      │      (Policy Engine)                        │
└─────────────┬───────────────┴───────────────────────────────────────────────┘
              │
              │
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                  │
│                        (User Experience & Data)                            │
├─────────────────┬─────────────────┬─────────────────────────────────────────┤
│ Amazon Q Business│  Custom Plugins │        Data Sources                    │
│  Core Platform  │  External APIs  │    Enterprise Systems                  │
└─────────────────┴─────────────────┴─────────────────────────────────────────┘

Flow: Identity → Cognito JWT → API Gateway (Built-in Auth) → Applications
```

### Approach 2: Custom Lambda Authorizer

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             IDENTITY LAYER                                  │
│                         (Where Users Authenticate)                          │
├─────────────────┬─────────────────┬─────────────────────────────────────────┤
│   External IdP  │  Amazon Cognito │      IAM Identity Center                │
│  (Okta/ADFS)    │   User Pools    │         (SSO)                          │
└─────────┬───────┴─────────┬───────┴─────────┬───────────────────────────────┘
          │                 │                 │ (Various Token Types)
          └─────────────────┼─────────────────┘
                            │
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHORIZATION LAYER                                │
│                      (Custom Business Logic)                               │
├──────────────┬──────────────────┬─────────────────────────────────────────────┤
│ API Gateway  │ Lambda Authorizer│    Amazon Verified Permissions            │
│   (Entry)    │ (Custom Logic)   │      (Policy Engine)                      │
└──────┬───────┴────────┬─────────┴─────────────────────┬───────────────────────┘
       │                │                               │
       └────────────────┼───────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                  │
│                        (User Experience & Data)                            │
├─────────────────┬─────────────────┬─────────────────────────────────────────┤
│ Amazon Q Business│  Custom Plugins │        Data Sources                    │
│  Core Platform  │  External APIs  │    Enterprise Systems                  │
└─────────────────┴─────────────────┴─────────────────────────────────────────┘

Flow: Identity → Any Token → API Gateway → Lambda Authorizer → Applications
```

## Understanding Amazon Cognito: The Authentication Bridge

Amazon Cognito is a fully managed identity service that provides user sign-up, sign-in, and access control capabilities for web and mobile applications. In the context of Amazon Q Business, Cognito serves as a crucial bridge between external identity providers and your custom plugins, enabling secure authentication and authorization for backend systems.

### What is Amazon Cognito?

Amazon Cognito consists of two main components that work together to provide comprehensive identity management:

**1. User Pools**: A user directory service that handles user registration, authentication, and account recovery
**2. Identity Pools**: A service that provides temporary AWS credentials to users for accessing AWS services

### How Amazon Cognito Works

#### Core Authentication Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User/Client   │    │  Cognito User   │    │  Your Backend   │
│   Application   │    │     Pool        │    │   Application   │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │ 1. Sign In Request   │                      │
         ├─────────────────────►│                      │
         │                      │                      │
         │ 2. JWT Tokens        │                      │
         │◄─────────────────────┤                      │
         │                      │                      │
         │ 3. API Request + JWT │                      │
         ├──────────────────────┼─────────────────────►│
         │                      │                      │
         │                      │ 4. Token Validation  │
         │                      │◄─────────────────────┤
         │                      │                      │
         │ 5. API Response      │                      │
         │◄─────────────────────┼──────────────────────┤
```

#### Detailed Process Breakdown

**Step 1: User Authentication**
- User provides credentials (username/password, social login, or SAML/OIDC)
- Cognito User Pool validates credentials against configured identity sources
- Multi-factor authentication (MFA) can be enforced at this stage

**Step 2: Token Generation**
- Upon successful authentication, Cognito issues three types of JWT tokens:
  - **ID Token**: Contains user identity information and claims
  - **Access Token**: Used for accessing Cognito-secured APIs
  - **Refresh Token**: Used to obtain new access and ID tokens

**Step 3: API Authorization**
- Client includes JWT tokens in API requests to your backend
- API Gateway or Lambda authorizer validates token signature and claims
- Request proceeds to backend application if authorization succeeds

### Cognito User Pool Features

#### Identity Federation
Cognito can federate with external identity providers:

```
External IdP     ┌─── SAML 2.0 (Active Directory, Okta)
    Sources  ────┼─── OIDC (Google, Facebook, Apple)
                 └─── Social Providers (Amazon, GitHub)
                          │
                          ▼
                 ┌─────────────────┐
                 │ Cognito User    │  ────► Unified JWT Tokens
                 │     Pool        │
                 └─────────────────┘
```

#### User Management Capabilities
- **User Registration**: Self-service sign-up with email/phone verification
- **Password Policies**: Configurable complexity requirements
- **Account Recovery**: Password reset via email or SMS
- **User Attributes**: Custom and standard attributes (email, name, custom claims)
- **Groups and Roles**: Organize users and assign permissions

#### Security Features
- **Multi-Factor Authentication**: SMS, TOTP, hardware tokens
- **Advanced Security**: Risk-based authentication and adaptive security
- **Token Management**: Configurable token expiration and refresh policies
- **Audit Logging**: CloudTrail integration for compliance

### Integration with Amazon Q Business

#### Custom Plugin Authentication

When setting up custom plugins for Amazon Q Business, Cognito provides several key benefits:

**1. Seamless User Experience**
```yaml
# OpenAPI 3.x specification example
securitySchemes:
  CognitoAuth:
    type: oauth2
    flows:
      authorizationCode:
        authorizationUrl: https://your-domain.auth.region.amazoncognito.com/oauth2/authorize
        tokenUrl: https://your-domain.auth.region.amazoncognito.com/oauth2/token
        scopes:
          read: Read access to resources
          write: Write access to resources
```

**2. Token-Based Authorization**
- Q Business automatically handles OAuth 2.0 flow with Cognito
- JWT tokens contain user identity and group memberships
- Custom claims can encode business-specific permissions

**3. Session Management**
- Cognito handles token refresh automatically
- Q Business caches authentication state for smooth user experience
- Session timeout and security policies enforced consistently

#### Backend API Protection

Your custom plugins can leverage Cognito tokens for fine-grained access control:

```python
# Example Lambda authorizer using Cognito JWT
import jwt
import json

def lambda_handler(event, context):
    token = event['authorizationToken']
    
    try:
        # Validate JWT signature and claims
        decoded_token = jwt.decode(
            token, 
            cognito_public_key, 
            algorithms=['RS256'],
            audience=client_id
        )
        
        # Extract user groups and permissions
        user_groups = decoded_token.get('cognito:groups', [])
        user_id = decoded_token.get('sub')
        
        # Apply business logic for authorization
        if 'ProductAdmin' in user_groups:
            return generate_policy('Allow', event['methodArn'])
        else:
            return generate_policy('Deny', event['methodArn'])
            
    except jwt.InvalidTokenError:
        return generate_policy('Deny', event['methodArn'])
```

### Cognito vs Other Identity Solutions

#### When to Use Cognito

**Ideal for:**
- External user authentication (customers, partners)
- Mobile and web application user management
- Social identity federation
- Rapid development and deployment
- Fine-grained user attribute management

**Consider Alternatives When:**
- Primary users are internal employees (use IAM Identity Center)
- Existing enterprise identity infrastructure is sufficient
- Simple AWS service-to-service authentication (use IAM roles)

#### Cognito in Multi-Identity Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Internal      │    │   External      │    │   Customer      │
│   Employees     │    │   Partners      │    │   Users         │
│                 │    │                 │    │                 │
│ IAM Identity    │    │   Cognito +     │    │   Cognito       │
│   Center        │    │  External IdP   │    │  User Pools     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Amazon Q       │
                    │   Business      │
                    │ (Unified Auth)  │
                    └─────────────────┘
```


## Layer Breakdown

### 1. Identity Layer
**Purpose**: Authenticate users and establish their identity

**Components**:
- **External Identity Providers**: Corporate SSO systems like Okta, ADFS
- **Amazon Cognito**: Flexible user management for external users
- **IAM Identity Center**: AWS-native SSO for internal applications

**Key Function**: Verify "who the user is" through credentials validation

### 2. Authorization Layer  
**Purpose**: Determine what authenticated users can access

**Components**:
- **API Gateway**: Entry point for all requests with built-in security
- **Lambda Authorizer**: Custom business logic for access decisions  
- **Amazon Verified Permissions**: Policy-based access control engine

**Key Function**: Decide "what the user can do" based on policies and context

### 3. Application Layer
**Purpose**: Deliver business functionality to authorized users

**Components**:
- **Amazon Q Business**: Core AI platform providing chat and insights
- **Custom Plugins**: External APIs and integrations
- **Data Sources**: Enterprise systems and databases

**Key Function**: Provide "business value" through secure access to data and AI capabilities

## Authentication Flow Principles

### Basic Flow Pattern
```
User Request → Identity Verification → Authorization Check → Application Access
```

### Detailed Process
1. **User Authentication**: User proves identity through chosen provider
2. **Token Generation**: Identity provider issues signed token with user claims
3. **Request Authorization**: Each API call validated against policies
4. **Resource Access**: Authorized requests reach Q Business and plugins
5. **Audit Trail**: All actions logged for security and compliance

## Key Security Principles

### Defense in Depth
- **Identity verification** at multiple points
- **Token validation** for every request  
- **Policy enforcement** before resource access
- **Audit logging** for all activities

### Zero Trust Model
- Never trust based on network location
- Always verify user identity and permissions
- Continuously monitor for anomalous behavior
- Apply least privilege access principles

### Simplified Token Flow
```
[User] → [Identity Provider] → [Signed Token] → [API Gateway] 
    → [Lambda Authorizer] → [Policy Check] → [Q Business/Plugins]
```

## Implementation Approaches

### Option 1: Start Simple (Identity Center Only)
- Use IAM Identity Center for all authentication
- Leverage built-in Q Business integration
- Add custom policies as needed
- Scale to other providers later

### Option 2: Hybrid Approach (Multiple Providers)
- External IdP for corporate users
- Cognito for external/customer users  
- Identity Center for AWS-native applications
- Unified authorization layer

### Option 3: Custom Plugin Focus
- Standard authentication for Q Business core
- Custom authorizers for plugin APIs
- Fine-grained permissions per plugin
- Business-specific authorization logic

## Benefits of Simplified Architecture

### Easier Understanding
- Three clear layers with distinct purposes
- Straightforward data flow between layers
- Reduced complexity for implementation teams

### Flexible Implementation
- Start with one identity provider
- Add authorization complexity gradually
- Scale application integrations over time

### Maintainable Security
- Clear separation of authentication and authorization
- Centralized policy management
- Consistent audit and monitoring

## Common Patterns

### Pattern 1: Corporate SSO Integration
```
Corporate Directory → External IdP → API Gateway → Q Business
```

### Pattern 2: Customer Access
```
Customer Portal → Cognito → Lambda Authorizer → Custom Plugins
```

### Pattern 3: Mixed Environment
```
Multiple Identity Sources → Unified Authorization → Various Applications
```

## Security Monitoring

### Essential Metrics
- **Authentication Success/Failure Rates**
- **Authorization Decision Latency** 
- **Unusual Access Patterns**
- **Policy Violations**

### Audit Requirements
- **Complete request tracing** through all layers
- **Policy evaluation details** for compliance
- **User activity patterns** for security analysis
- **System health metrics** for reliability

## Getting Started

### Phase 1: Foundation
1. Set up IAM Identity Center
2. Configure basic Q Business access
3. Establish monitoring and logging
4. Test with pilot user group

### Phase 2: Expansion  
1. Add external identity providers
2. Implement custom plugin authentication
3. Create fine-grained policies
4. Expand to production users

### Phase 3: Optimization
1. Performance tuning and caching
2. Advanced threat detection
3. Automated policy management
4. Compliance reporting

## Conclusion

This simplified three-layer architecture provides a clear framework for implementing secure Amazon Q Business authentication. By focusing on identity, authorization, and application layers, organizations can:

- **Build incrementally** from simple to complex implementations
- **Maintain security** through clear separation of concerns  
- **Scale effectively** as requirements grow
- **Ensure compliance** through comprehensive audit trails

The key to success is starting simple and adding complexity only as needed, while maintaining strong security principles throughout the implementation journey. 

**Automatic Key Discovery**
- Cognito queries the OIDC discovery endpoint: `{issuer}/.well-known/openid_configuration`
- Retrieves the JWKS URI from the discovery document
- Fetches public keys from the JWKS endpoint (e.g., `https://www.googleapis.com/oauth2/v3/certs`)
- Caches keys and refreshes them periodically

##### Detailed OIDC Discovery Process

**Step 1: OpenID Connect Discovery**

When you configure an OIDC provider in Cognito, the discovery process begins automatically:

```json
// Example OIDC Provider Configuration
{
  "ProviderName": "GoogleOIDC",
  "ProviderType": "OIDC", 
  "ProviderDetails": {
    "client_id": "123456789.apps.googleusercontent.com",
    "client_secret": "your-secret",
    "authorize_scopes": "openid email profile",
    "oidc_issuer": "https://accounts.google.com"
  }
}
```

Cognito constructs the discovery URL by appending the well-known path:
```
Discovery URL = {oidc_issuer}/.well-known/openid_configuration
Example: https://accounts.google.com/.well-known/openid_configuration
```

**Step 2: Discovery Document Retrieval**

Cognito makes an HTTP GET request to the discovery endpoint and receives a comprehensive configuration document:

```json
{
  "issuer": "https://accounts.google.com",
  "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
  "device_authorization_endpoint": "https://oauth2.googleapis.com/device/code",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
  "revocation_endpoint": "https://oauth2.googleapis.com/revoke",
  "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
  "response_types_supported": [
    "code",
    "token",
    "id_token",
    "code token",
    "code id_token",
    "token id_token",
    "code token id_token",
    "none"
  ],
  "subject_types_supported": [
    "public"
  ],
  "id_token_signing_alg_values_supported": [
    "RS256"
  ],
  "scopes_supported": [
    "openid",
    "email",
    "profile"
  ],
  "token_endpoint_auth_methods_supported": [
    "client_secret_post",
    "client_secret_basic"
  ],
  "claims_supported": [
    "aud",
    "email",
    "email_verified",
    "exp",
    "family_name",
    "given_name",
    "iat",
    "iss",
    "locale",
    "name",
    "picture",
    "sub"
  ],
  "code_challenge_methods_supported": [
    "plain",
    "S256"
  ]
}
```

**Step 3: JWKS Endpoint Extraction**

From the discovery document, Cognito extracts the `jwks_uri` field:
```json
"jwks_uri": "https://www.googleapis.com/oauth2/v3/certs"
```

This URI points to the JSON Web Key Set containing the public keys used to verify JWT signatures.

**Step 4: JWKS Fetching Process**

Cognito makes a GET request to the JWKS endpoint and receives the public keys:

```json
{
  "keys": [
    {
      "kty": "RSA",
      "alg": "RS256",
      "use": "sig",
      "kid": "1234567890abcdef1234567890abcdef12345678",
      "n": "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtV....",
      "e": "AQAB"
    },
    {
      "kty": "RSA",
      "alg": "RS256", 
      "use": "sig",
      "kid": "abcdef1234567890abcdef1234567890abcdef12",
      "n": "xf7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtV....",
      "e": "AQAB"
    }
  ]
}
```

**Step 5: Key Processing and Storage**

Cognito processes each key in the JWKS:

```python
# Simplified representation of Cognito's key processing
class CognitoOIDCKeyProcessor:
    def process_jwks(self, jwks_response):
        processed_keys = {}
        
        for key in jwks_response['keys']:
            # Extract key identifier
            kid = key['kid']
            
            # Validate key parameters
            if key['kty'] != 'RSA':
                continue  # Only RSA keys supported
            if key.get('use') not in ['sig', None]:
                continue  # Only signing keys
            if key.get('alg') not in ['RS256', 'RS384', 'RS512']:
                continue  # Only supported algorithms
                
            # Convert JWK to internal format
            public_key = self.jwk_to_rsa_key(key)
            
            # Store with metadata
            processed_keys[kid] = {
                'public_key': public_key,
                'algorithm': key.get('alg', 'RS256'),
                'use': key.get('use', 'sig'),
                'expires_at': self.calculate_expiry(),
                'last_updated': time.time()
            }
            
        return processed_keys
    
    def jwk_to_rsa_key(self, jwk):
        # Convert JWK parameters to RSA public key
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
        
        # Decode base64url encoded parameters
        n = self.base64url_decode(jwk['n'])
        e = self.base64url_decode(jwk['e'])
        
        # Create RSA public key
        public_numbers = rsa.RSAPublicNumbers(
            e=int.from_bytes(e, 'big'),
            n=int.from_bytes(n, 'big')
        )
        public_key = public_numbers.public_key()
        
        return public_key
```

##### Caching and Automatic Refresh Mechanism

**Caching Strategy**

Cognito implements a multi-level caching strategy for OIDC keys:

```
┌─────────────────────────────────────────────────────────────┐
│                    Cognito Key Cache                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                   L1 Cache (Memory)                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │ Provider A  │  │ Provider B  │  │ Provider C  │    │  │
│  │  │ JWKS Keys   │  │ JWKS Keys   │  │ JWKS Keys   │    │  │
│  │  │ TTL: 1 hour │  │ TTL: 1 hour │  │ TTL: 1 hour │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  L2 Cache (Persistent)                 │  │
│  │  • Backup key storage for failover                     │  │
│  │  • Extended TTL for emergency use                      │  │
│  │  • Historical key versions                             │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Refresh Triggers**

Multiple events can trigger a key refresh:

```python
class CognitoKeyRefreshManager:
    def __init__(self):
        self.refresh_triggers = {
            'scheduled': 3600,      # Every hour
            'cache_miss': True,     # Key not found for kid
            'validation_failure': True,  # JWT validation fails
            'manual': True,         # Admin-triggered refresh
            'provider_notification': True  # Webhook from provider
        }
    
    def should_refresh_keys(self, provider_id, context):
        last_refresh = self.get_last_refresh_time(provider_id)
        current_time = time.time()
        
        # Scheduled refresh
        if current_time - last_refresh > self.refresh_triggers['scheduled']:
            return True, 'scheduled_refresh'
            
        # Cache miss - unknown kid in token
        if context.get('unknown_kid'):
            return True, 'cache_miss'
            
        # Recent validation failures
        failure_rate = self.get_recent_failure_rate(provider_id)
        if failure_rate > 0.1:  # 10% failure threshold
            return True, 'high_failure_rate'
            
        # Emergency refresh
        if context.get('force_refresh'):
            return True, 'manual_refresh'
            
        return False, None
```

**Refresh Process**

The refresh process is designed for high availability:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Refresh       │    │   Background    │    │   Validation    │
│   Trigger       │    │   Worker        │    │   Engine        │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │ 1. Refresh Request   │                      │
         ├─────────────────────►│                      │
         │                      │                      │
         │                      │ 2. Fetch New Keys   │
         │                      │    (Non-blocking)    │
         │                      │                      │
         │                      │ 3. Validate Keys    │
         │                      ├─────────────────────►│
         │                      │                      │
         │                      │ 4. Keys Valid        │
         │                      │◄─────────────────────┤
         │                      │                      │
         │                      │ 5. Atomic Update    │
         │                      │    Cache             │
         │                      │                      │
         │ 6. Refresh Complete  │                      │
         │◄─────────────────────┤                      │
```

**Error Handling During Refresh**

```python
class CognitoKeyRefreshHandler:
    def refresh_keys_with_fallback(self, provider_config):
        try:
            # Primary refresh attempt
            new_keys = self.fetch_fresh_keys(provider_config)
            
            # Validate new keys before replacing
            if self.validate_key_set(new_keys):
                self.atomic_cache_update(provider_config['id'], new_keys)
                return new_keys
            else:
                raise KeyValidationError("Invalid key set received")
                
        except (NetworkError, TimeoutError) as e:
            # Network issues - extend current cache TTL
            self.extend_cache_ttl(provider_config['id'], extension=1800)  # 30 min
            raise TemporaryRefreshFailure(f"Network error: {e}")
            
        except KeyValidationError as e:
            # Invalid keys - keep current cache, alert admins
            self.alert_administrators(provider_config['id'], str(e))
            raise PermanentRefreshFailure(f"Key validation failed: {e}")
            
        except Exception as e:
            # Unexpected error - fallback to backup cache
            backup_keys = self.get_backup_keys(provider_config['id'])
            if backup_keys:
                return backup_keys
            raise CriticalRefreshFailure(f"All refresh mechanisms failed: {e}")
```

**Performance Optimization**

To ensure minimal latency impact:

```python
# Asynchronous refresh to avoid blocking token validation
async def background_key_refresh(provider_id):
    """Non-blocking key refresh that doesn't impact active validation"""
    try:
        # Fetch new keys in background
        new_keys = await fetch_keys_async(provider_id)
        
        # Pre-validate keys
        if validate_keys(new_keys):
            # Atomic cache swap - no downtime
            await atomic_cache_update(provider_id, new_keys)
            
        # Update metrics
        update_refresh_metrics(provider_id, success=True)
        
    except Exception as e:
        # Log error but don't disrupt service
        log_refresh_error(provider_id, e)
        update_refresh_metrics(provider_id, success=False)
```

This comprehensive OIDC discovery and key management process ensures that Cognito can reliably authenticate users from external OIDC providers while maintaining high availability and security standards through automated key rotation and robust error handling. 