---
title: Workflow
description: How one person ships this many packages — an agent inside a rulebook, with a human gate on judgment and release.
outline: [2, 2]
---

# Workflow

The agent does the mechanical work inside a rulebook a human wrote. That rulebook is [php-package-toolkit](https://github.com/rasuvaeff/php-package-toolkit), and it is open source, so the claim can be checked. The same workflow built a production site: [how cska.in is put together](https://teletype.in/@rasuvaeff/cskain) (in Russian).

## The loop

### 1. Scaffold from a contract

An agent generates each package from versioned templates plus a machine-checked rulebook (`AGENTS.md`). File layout, code style, the CI pipeline, the doc structure and the security rules are a fixed contract.

### 2. Write, then gate

The agent writes the code, the tests and the docs, then runs the same gate every package must pass:

- Psalm level 1, with zero suppressions
- mutation testing, MSI 85–100% — line coverage is the wrong bar here; the toolkit's `ER-003` note covers why
- a backward-compatibility check before every major
- SHA-pinned CI
- [Testo](https://php-testo.github.io) tests, with property-based coverage where an invariant exists

### 3. A person owns the judgment

I design the API, decide the abstractions and the layer boundaries, review every change, and own the release. The agent does not merge, tag or publish on its own. Those steps are human gates in the skill workflows.

Deciding what a deadline-propagating context or a deterministic A/B engine should look like is the part I do. The toolkit makes shipping that decision a matter of hours.

## What I like building

- Low-latency, high-load services where milliseconds and correctness both matter.
- Distributed patterns done properly: outbox, idempotency, retries with backoff, bulkheads.
- Libraries other people can depend on — documented, versioned, mutation-tested.
- LLMs as a permission-aware part of a backend, with RBAC and an audit log on every tool call.

## Stack

PHP 8.3+, SQL, Bash. Yii3 and Yii2, PSR standards. MySQL, PostgreSQL, ClickHouse, Redis, Memcached. Docker, Linux, Nginx, GitHub Actions. Prometheus, Grafana, OpenTelemetry, Jaeger, Centrifugo. Model Context Protocol. Psalm, PHPUnit, Testo, Infection, Rector, Deptrac.
