---
layout: post
title: "AWS re:Invent 2025: New AgentCore Features for Production AI Agents"
date: 2025-12-08 10:00:00 -0500
categories: [aws, ai, reinvent]
tags: [aws, bedrock, agentcore, reinvent, ai-agents, policy, evaluations, memory]
---

# AWS re:Invent 2025: New AgentCore Features for Production AI Agents

At AWS re:Invent 2025, Amazon announced significant enhancements to Amazon Bedrock AgentCore, addressing the key challenges enterprises face when moving AI agents from prototype to production. The three major new capabilities—**Policy**, **Evaluations**, and **Memory**—tackle security, observability, and personalization respectively.

This post breaks down each new feature and what it means for teams building production AI agents.

---

## TL;DR

**Three New AgentCore Capabilities:**

| Feature | Purpose | Status |
|---------|---------|--------|
| **Policy** | Define agent boundaries using natural language | Preview |
| **Evaluations** | 13 pre-built monitors for agent performance | Available |
| **Memory** | Episodic memory for personalized responses | Available |

**Key Takeaways:**
- Policy enables governance without code—define what agents can/cannot do in plain English
- Evaluations provides out-of-the-box monitoring for correctness, safety, and tool accuracy
- Memory allows agents to learn from past interactions and personalize responses over time
- These features address the #1 blocker for enterprise AI adoption: trust and control

---

## Policy in AgentCore (Preview)

### The Problem

Moving AI agents to production requires clear operational boundaries. Without guardrails, agents might:
- Access sensitive data they shouldn't see
- Take actions outside their intended scope
- Interact with systems without proper authorization

Traditionally, implementing these controls required custom code, complex IAM policies, and manual review processes.

### The Solution

**Policy in AgentCore** lets developers define operational boundaries using natural language. Instead of writing code or complex policy documents, you describe what the agent should and shouldn't do:

```
This agent should:
- Only access customer data for the logged-in user
- Never modify financial records directly
- Require human approval for refunds over $500
- Not access internal HR systems
```

### How It Works

1. **Natural Language Definition**: Write policies in plain English describing agent constraints
2. **Gateway Integration**: Policies integrate with AgentCore Gateway to intercept every agent action
3. **Automatic Enforcement**: The system automatically checks each action against defined policies
4. **Violation Handling**: Actions that violate policies are halted, logged, and can trigger human review

### Example Use Cases

**Customer Service Agent:**
```
Restrictions:
- Can only view order history for the authenticated customer
- Cannot issue refunds exceeding $100 without manager approval
- Cannot access payment card details (only last 4 digits)
- Must not share customer data with external systems
```

**Internal IT Agent:**
```
Restrictions:
- Can only access systems the requesting employee has permissions for
- Cannot modify production databases directly
- Requires ticket approval for any infrastructure changes
- Cannot disable security monitoring or alerting
```

### Why This Matters

Policy addresses the governance gap that prevents many enterprises from deploying AI agents. Security and compliance teams can now:
- Review agent boundaries in plain English (no code review needed)
- Set organization-wide policies that apply across all agents
- Audit policy violations with clear logs
- Iterate on policies without redeploying agent code

---

## AgentCore Evaluations

### The Problem

Once agents are in production, how do you know they're working correctly? Traditional monitoring tracks latency and errors, but doesn't capture AI-specific issues:
- Is the agent selecting the right tools for each task?
- Are responses accurate and safe?
- Is the agent following instructions correctly?
- How does performance change over time?

### The Solution

**AgentCore Evaluations** provides 13 pre-built evaluation systems that continuously monitor agent behavior across multiple dimensions.

### The 13 Evaluators

AgentCore Evaluations covers three main categories:

**Correctness Evaluators:**
- **Task Completion**: Did the agent successfully complete the user's request?
- **Response Accuracy**: Is the information provided factually correct?
- **Instruction Following**: Does the agent adhere to its system instructions?
- **Tool Selection Accuracy**: Did the agent choose the appropriate tools?
- **Tool Usage Correctness**: Were tools called with correct parameters?

**Safety Evaluators:**
- **Harmful Content Detection**: Does the response contain inappropriate content?
- **PII Exposure**: Is personally identifiable information being leaked?
- **Prompt Injection Detection**: Is the agent being manipulated by adversarial inputs?
- **Off-Topic Detection**: Is the agent staying within its intended domain?

**Quality Evaluators:**
- **Response Relevance**: Does the response address what the user asked?
- **Response Coherence**: Is the response well-structured and clear?
- **Groundedness**: Are claims supported by the agent's knowledge sources?
- **Tone Appropriateness**: Does the response match the expected communication style?

### How It Works

1. **Continuous Sampling**: Evaluations samples live interactions automatically
2. **Parallel Assessment**: Multiple evaluators run simultaneously on each sample
3. **Threshold Alerts**: Define acceptable ranges; get alerted when performance drops
4. **Dashboard Visibility**: View trends and drill into specific failed evaluations
5. **Historical Analysis**: Track how agent performance changes over time

### Example Configuration

```yaml
evaluations:
  sampling_rate: 0.1  # Evaluate 10% of interactions
  
  alerts:
    task_completion:
      threshold: 0.85
      alert_channel: pagerduty
    
    pii_exposure:
      threshold: 0.0  # Zero tolerance
      alert_channel: security-team
    
    tool_selection_accuracy:
      threshold: 0.90
      alert_channel: slack-engineering
```

### Why This Matters

Evaluations transforms AI agent monitoring from "hope it works" to "know it works." Teams can:
- Catch regressions before users complain
- Quantify agent quality for stakeholders
- Identify specific failure modes to fix
- Build confidence for expanding agent capabilities

---

## AgentCore Memory

### The Problem

Stateless agents treat every interaction as if it's the first. This creates frustrating user experiences:
- Repeating preferences every session
- No continuity in ongoing tasks
- Unable to learn from past interactions
- Generic responses that don't adapt to users

### The Solution

**AgentCore Memory** introduces episodic memory functionality, enabling agents to retain and utilize information from past interactions.

### Memory Types

AgentCore Memory supports different memory patterns:

**User Preferences:**
```
Memory: User prefers window seats on flights
Memory: User is vegetarian
Memory: User's timezone is Pacific
Memory: User prefers formal communication style
```

**Interaction History:**
```
Memory: Last discussed project Alpha timeline on Dec 5
Memory: User reported bug #1234 three times this month
Memory: User's team uses Slack for notifications
```

**Learned Behaviors:**
```
Memory: User typically needs Python code examples
Memory: User prefers detailed explanations over summaries
Memory: User asks follow-up questions about security implications
```

### How It Works

1. **Interaction Logging**: Agent interactions are automatically logged
2. **Memory Extraction**: System identifies memorable information from conversations
3. **Memory Storage**: Information stored with user context and timestamps
4. **Memory Retrieval**: Relevant memories surfaced during future interactions
5. **Memory Decay**: Old/unused memories can be deprioritized or removed

### Example Flow

**Session 1:**
```
User: Book me a flight to NYC next Tuesday
Agent: I found several options. Do you have a seat preference?
User: Always window seat, and I'm vegetarian for meals.
Agent: Got it! [Books flight with window seat, vegetarian meal]
       [Stores: user prefers window seats, user is vegetarian]
```

**Session 2 (weeks later):**
```
User: I need a flight to Chicago on Friday
Agent: I found 3 options with window seats available. 
       I'll also note your vegetarian meal preference.
       Which departure time works best?
```

### Privacy and Control

AgentCore Memory includes privacy controls:
- **User Consent**: Memory collection can require explicit opt-in
- **Memory Visibility**: Users can view what the agent remembers about them
- **Deletion Rights**: Users can request memory deletion
- **Retention Policies**: Automatic memory expiration based on time or usage
- **Scope Limits**: Restrict what types of information can be memorized

### Why This Matters

Memory transforms agents from tools into assistants that genuinely know you. This enables:
- Significantly improved user satisfaction
- Reduced friction in repetitive tasks
- Natural conversation continuity
- Personalized recommendations and responses

---

## How These Features Work Together

The real power comes from combining Policy, Evaluations, and Memory:

### Scenario: Enterprise Customer Service Agent

**Policy defines boundaries:**
```
- Only access customer's own order history
- Cannot process refunds over $200 without approval
- Must not store payment information in memory
```

**Memory enables personalization:**
```
- Remembers customer's preferred contact method
- Tracks ongoing support cases
- Notes communication preferences
```

**Evaluations ensures quality:**
```
- Monitors resolution rate
- Tracks policy violations
- Measures customer satisfaction signals
```

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  AgentCore Gateway                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Policy    │  │   Memory    │  │ Evaluations │     │
│  │ Enforcement │  │  Retrieval  │  │  Sampling   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  AgentCore Runtime                       │
│         (Your agent logic + tool execution)              │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Tool Execution                         │
│  (APIs, databases, external services via Gateway)        │
└─────────────────────────────────────────────────────────┘
```

---

## Early Adopter Results

Several organizations shared their AgentCore experiences at re:Invent:

**Cox Automotive:**
- Scaled from experimentation to production in one month
- Leveraged runtime, identity, gateway, and memory components
- Achieved significant reduction in development complexity

**PGA TOUR:**
- Used AgentCore for content generation
- Reported major improvements in content generation speed

**MongoDB:**
- Streamlined AI initiative deployment
- Reduced operational complexity with managed infrastructure

---

## Getting Started

### Prerequisites

- AWS Account with Bedrock access
- AgentCore enabled in your region
- Existing agent or new agent project

### Quick Start: Adding Policy

```python
import boto3

agentcore = boto3.client('bedrock-agentcore')

# Define policy in natural language
policy = """
This agent assists with customer inquiries.
Restrictions:
- Only access data for the authenticated customer
- Cannot modify account settings
- Cannot process payments or refunds
- Must escalate billing disputes to human agents
"""

response = agentcore.create_policy(
    agentId='your-agent-id',
    policyName='customer-service-boundaries',
    policyDefinition=policy
)
```

### Quick Start: Enabling Evaluations

```python
# Enable evaluations for your agent
response = agentcore.configure_evaluations(
    agentId='your-agent-id',
    evaluators=[
        'task_completion',
        'response_accuracy', 
        'pii_exposure',
        'tool_selection_accuracy'
    ],
    samplingRate=0.1,
    alertConfig={
        'snsTopicArn': 'arn:aws:sns:...',
        'thresholds': {
            'task_completion': 0.85,
            'pii_exposure': 0.0
        }
    }
)
```

### Quick Start: Enabling Memory

```python
# Enable memory for your agent
response = agentcore.configure_memory(
    agentId='your-agent-id',
    memoryConfig={
        'enabled': True,
        'memoryTypes': ['user_preferences', 'interaction_history'],
        'retentionDays': 90,
        'requireConsent': True
    }
)
```

---

## What's Next for AgentCore

Based on the re:Invent announcements, AWS is positioning AgentCore as the complete platform for enterprise AI agents. Expect continued investment in:

- **Multi-agent orchestration**: Coordinating multiple specialized agents
- **Advanced policy templates**: Industry-specific compliance frameworks
- **Enhanced observability**: Deeper integration with CloudWatch and X-Ray
- **Cross-account agent sharing**: Deploying agents across organizational boundaries

---

## Conclusion

The re:Invent 2025 AgentCore announcements address the practical challenges of deploying AI agents in production:

- **Policy** gives enterprises the governance controls they need
- **Evaluations** provides visibility into agent behavior at scale  
- **Memory** enables the personalization users expect

Together, these features significantly reduce the gap between "cool demo" and "production-ready system." If you've been waiting for AI agent infrastructure to mature before committing to production deployments, that time may have arrived.

---

## Resources

- [AWS re:Invent 2025 - Scale agent tools with Amazon Bedrock AgentCore Gateway (AIM3313)](https://www.youtube.com/watch?v=DlIHB8i6uyE)
- [AWS News: re:Invent 2025 AI Updates](https://www.aboutamazon.com/news/aws/aws-re-invent-2025-ai-news-updates)
- [TechCrunch: AWS announces new capabilities for its AI agent builder](https://techcrunch.com/2025/12/02/aws-announces-new-capabilities-for-its-ai-agent-builder/)

