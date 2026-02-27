# Contributing to AIReady Skills

Thank you for your interest in contributing! This document provides guidelines for contributing new rules and improvements.

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-rule`
3. Make your changes
4. Test locally: `pnpm run dev`
5. Submit a pull request

## Creating a New Rule

### 1. Choose the Right Section

Rules are organized by priority/impact:

| Section              | Impact   | Prefix         | Examples                    |
| -------------------- | -------- | -------------- | --------------------------- |
| Pattern Detection    | CRITICAL | `patterns-`    | Semantic duplicates, naming |
| Context Optimization | HIGH     | `context-`     | Import depth, cohesion      |
| Consistency          | MEDIUM   | `consistency-` | Naming conventions, errors  |
| Documentation        | MEDIUM   | `docs-`        | Code-doc sync               |
| Dependencies         | LOW      | `deps-`        | Circular deps               |

### 2. Use the Template

Copy `rules/_template.md` to `rules/section-description.md`:

```bash
cp aiready-best-practices/rules/_template.md aiready-best-practices/rules/patterns-my-rule.md
```

### 3. Fill in Required Fields

````markdown
---
title: Descriptive Rule Title
impact: CRITICAL | HIGH | MEDIUM | LOW
impactDescription: Brief impact description (e.g., "30-70% context waste")
tags: tag1, tag2, tag3
---

## Rule Title

**Impact: CRITICAL (impact description)**

Brief explanation of why this rule matters and its impact on AI comprehension.

**Incorrect:**

```typescript
// Bad code example with clear explanation
const badExample = () => {
  /* ... */
};
```
````

**Correct:**

```typescript
// Good code example with clear explanation
const goodExample = () => {
  /* ... */
};
```

Reference: [Link to documentation](https://example.com)

````

### 4. Guidelines for Good Rules

**DO:**
- ✅ Be specific and actionable
- ✅ Provide clear before/after examples
- ✅ Explain *why* it matters for AI
- ✅ Include measurable impact when possible
- ✅ Link to relevant documentation
- ✅ Use real-world examples

**DON'T:**
- ❌ Be vague or general
- ❌ Skip examples
- ❌ Use overly complex code
- ❌ Duplicate existing rules
- ❌ Ignore the template format

### 5. Test Your Rule

```bash
# Validate the rule file
pnpm run validate

# Build to see it in AGENTS.md
pnpm run build

# Test with different AI agents
# - GitHub Copilot
# - Cursor
# - Claude Code
````

## Impact Levels

Choose the appropriate impact level:

- **CRITICAL**: Causes major AI confusion, significant context waste (>30%)
- **HIGH**: Notable improvement in AI comprehension, moderate context optimization (10-30%)
- **MEDIUM**: Helpful improvement, minor context benefits (5-10%)
- **LOW**: Incremental improvement, best practices (<5%)

## Code Examples

### Good Example Format

```typescript
// ❌ Incorrect: Multiple implementations of same concept
function getUserData() {
  return fetch('/api/user');
}
function fetchUserInfo() {
  return fetch('/api/user');
}
function loadUser() {
  return fetch('/api/user');
}

// ✅ Correct: Single, consistent implementation
function getUser() {
  return fetch('/api/user');
}
```

### Explanation Style

- **Be concise**: 2-3 sentences per example
- **Focus on AI impact**: How does it affect model comprehension?
- **Use comments**: Annotate what's wrong/right
- **Show context**: Include enough code to understand the issue

## Testing

Before submitting:

1. **Validate syntax**: `pnpm run validate`
2. **Build output**: `pnpm run build`
3. **Review AGENTS.md**: Check your rule appears correctly
4. **Test with AI**: Try the rule with actual AI agents
5. **Check links**: Ensure references work

## Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(rules): add pattern detection for X`
- `fix(build): correct section mapping`
- `docs(readme): update installation instructions`
- `refactor(parser): simplify frontmatter parsing`

## Pull Request Process

1. **Title**: Clear, descriptive title
2. **Description**: Explain what and why
3. **Examples**: Show the rule in action
4. **Testing**: Describe how you tested
5. **Impact**: Mention expected benefits

## Questions?

- Open an issue for clarification
- Check existing rules for patterns
- Review [AGENTS.md](./aiready-best-practices/AGENTS.md) for context

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
