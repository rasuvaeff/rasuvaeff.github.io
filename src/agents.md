---
title: For agents
description: Every package ships an llms.txt API reference, and forty ship an agent skill that a project picks up on composer install.
outline: [2, 2]
---

# For agents

A coding agent that works in a project with these packages gets two things from them, and neither depends on what the model remembers.

| File | In | What it is |
|---|---|---|
| `llms.txt` | every package | A compact, self-contained API reference. Share it with the model instead of letting it guess a method name. |
| `SKILL.md` | 40 packages | An agent skill: when to use the package and the rules to verify on every change. |

## How a skill reaches the agent

A project that uses the [llm/skills](https://github.com/roxblnfk/skills) Composer plugin gets each installed package's skill synced into `.agents/skills/` on `composer install`. Nothing is copied by hand, and a skill is updated with the package it describes.

## What is in a skill

The skills are written the way the monorepo's own rulebook is: for a reader that executes rules literally. Most skills carry:

- **A trigger in the front matter.** The description lists the public classes and says when to load the skill, usually "Use when writing, reviewing or debugging ... in a project that has this package installed".
- **Safety rules to verify on every change.** The traps that cost something, stated as rules, not as advice.
- **Canonical usage.** One construction that is known to be correct.
- **A pointer to the full API.** The package's `llms.txt`, to read before guessing a method name.

An excerpt from the skill of [yii3-idempotency](https://github.com/rasuvaeff/yii3-idempotency):

```markdown
---
name: rasuvaeff-yii3-idempotency
description: >-
  Prevent duplicate processing of POST/PUT/PATCH requests in Yii3 APIs with
  rasuvaeff/yii3-idempotency — IdempotencyMiddleware, IdempotencyKey, ...
  Use when writing, reviewing or debugging idempotency-key handling,
  duplicate-request replay, caller/key scoping, domain-failure caching, or
  409/422 conflict responses in a project that has this package installed.
---

...

## Safety rules — verify these on every change

...

2. **Only 2xx responses are cached.** Any non-2xx handler response (3xx/4xx —
   including retryable 409/423/429 — and any 5xx) releases the claim so the
   client can retry under the same key. Never "fix" a failing retry by caching
   an error response.

   ...

3. **Conflict semantics are fixed contract.** Same key + different payload
   fingerprint → 422; same key while the first request is still in flight
   → 409; replay (same key + same fingerprint) → cached response, handler NOT
   called. ...
```

The same pattern in a package about concurrency, from [bulkhead](https://github.com/rasuvaeff/bulkhead):

```markdown
2. **`lease` must exceed the longest possible callback runtime** (downstream
   timeout + margin). The lease TTL is what reclaims a dead worker's slot; if
   the callback outlives it, the slot is reclaimed mid-call and real
   concurrency exceeds `maxConcurrent`.
```

## Packages with a skill

<SkillList />

The long write-up of how the agent is kept inside the rules (in Russian): [Как я заставил AI-агента поддерживать 90 PHP-пакетов и не сойти с ума](https://teletype.in/@rasuvaeff/ai-agents).

The agent that writes these packages follows the monorepo's own rulebook, described on the [workflow page](/workflow). The skills are the consumer-side counterpart: the rules a project's agent needs when it uses a package.
