---
title: Write Agent-Actionable READMEs
impact: HIGH
impactDescription: Poor README quality reduces AI's understanding of project context
tags: grounding, readme, documentation, context, agents
---

## Write Agent-Actionable READMEs

**Impact: HIGH (AI needs high-level context to reason effectively)**

READMEs are often the first context AI loads when working on a repository. Poor-quality READMEs leave AI without the high-level understanding needed to make architectural decisions, understand business rules, or recognize domain boundaries.

A good README for AI agents should include:
- Project purpose and domain
- Architecture overview with diagram
- Key domain concepts and terminology
- Entry points and common workflows
- Testing and verification patterns

**Incorrect (minimal README):**

```markdown
# My Project

A TypeScript project.

## Install

npm install

## Test

npm test
```

This tells AI nothing about:
- What the project does
- How it's organized
- Key concepts or rules
- How to verify changes

**Correct (agent-actionable README):**

```markdown
# Order Processing Service

Domain: E-commerce Order Management

## Purpose

Handles order creation, validation, and fulfillment for the e-commerce platform. This service manages the complete order lifecycle from cart checkout to delivery confirmation.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Cart API      │────▶│  Order Service   │────▶│  Inventory API  │
│  (checkout)     │     │  (this service)  │     │   (reservation) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │   Database       │
                        │  (PostgreSQL)    │
                        └──────────────────┘
```

## Domain Concepts

- **Order**: Customer purchase with line items, pricing, and status
- **OrderItem**: Product reference with quantity and unit price
- **Fulfillment**: Process of preparing and delivering order to customer

## Key Services

| Service | Responsibility |
|---------|---------------|
| `OrderService.createOrder()` | Validate cart, create order, reserve inventory |
| `OrderService.updateStatus()` | Handle status transitions |
| `FulfillmentService.process()` | Trigger fulfillment workflow |

## Verification

Run tests before submitting PRs:
```bash
npm test
```

Integration tests require running services:
```bash
docker-compose up -d
npm run test:integration
```
```

**Key elements for AI:**

1. **Domain statement**: What problem space does this solve?
2. **Architecture diagram**: Visual context for file relationships
3. **Concept glossary**: Domain terminology AI needs to understand
4. **Service table**: Quick reference for key entry points
5. **Verification commands**: How AI can confirm its changes work

**Detection tip:** Run `npx @aiready/agent-grounding` to analyze README quality and directory semantics in your codebase.

Reference: [Agent Grounding Docs](https://getaiready.dev/docs/agent-grounding)