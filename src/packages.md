---
title: Packages
description: Open-source PHP 8.3+ libraries published as rasuvaeff/* on Packagist.
outline: [2, 3]
---

# Packages

Nine of these are written up with code on the [front page](/#work). This is the full catalog.

**89 packages** — reusable PHP 8.3+ libraries with hardened CI, SemVer, backward-compatibility checks, and tests on [Testo](https://php-testo.github.io) with mutation testing (MSI 85–100%).

Every package ships an `llms.txt` API reference. Forty of them also ship an agent skill (`SKILL.md`) that projects using the [llm/skills](https://github.com/roxblnfk/skills) Composer plugin pick up on `composer install`.

Docs sites exist for five repositories today. The rest link to GitHub. The full vendor index is on [Packagist](https://packagist.org/packages/rasuvaeff/).

| Package | Docs |
|---|---|
| [property-testing-core](https://github.com/rasuvaeff/property-testing-core) | [rasuvaeff.github.io/property-testing-core](https://rasuvaeff.github.io/property-testing-core/) |
| [property-testing](https://github.com/rasuvaeff/property-testing) (frozen 2.x) | [rasuvaeff.github.io/property-testing](https://rasuvaeff.github.io/property-testing/) |
| [yii3-ab-testing](https://github.com/rasuvaeff/yii3-ab-testing) | [rasuvaeff.github.io/yii3-ab-testing](https://rasuvaeff.github.io/yii3-ab-testing/) |
| [yii3-mcp](https://github.com/rasuvaeff/yii3-mcp) | [rasuvaeff.github.io/yii3-mcp](https://rasuvaeff.github.io/yii3-mcp/) |
| [understudy](https://github.com/rasuvaeff/understudy) | [rasuvaeff.github.io/understudy](https://rasuvaeff.github.io/understudy/) |

## Resilience

| Package | What it does |
|---|---|
| [resilience](https://github.com/rasuvaeff/resilience) | Retry, circuit breaker and bulkhead composed in the right order. |
| [retry](https://github.com/rasuvaeff/retry) | Retries with backoff. |
| [circuit-breaker](https://github.com/rasuvaeff/circuit-breaker) | Stop calling a dependency that is already failing. |
| [bulkhead](https://github.com/rasuvaeff/bulkhead) | Limit concurrency so one caller cannot exhaust the pool. |
| [duration](https://github.com/rasuvaeff/duration) | Typed durations. |
| [result](https://github.com/rasuvaeff/result) | Explicit success and failure. |

## Context and cancellation

[context](https://github.com/rasuvaeff/context) carries deadlines, cancellation and request-scoped values through every layer. One budget follows a request through HTTP calls, database statement timeouts, CLI worker shutdown and subprocesses.

| Package | Layer |
|---|---|
| [context](https://github.com/rasuvaeff/context) | The core, with no dependencies. |
| [context-http](https://github.com/rasuvaeff/context-http) | HTTP client timeouts. |
| [context-db](https://github.com/rasuvaeff/context-db) | Statement timeouts on MySQL, MariaDB and PostgreSQL. |
| [context-cli](https://github.com/rasuvaeff/context-cli) | Graceful shutdown of CLI workers on OS signals. |
| [context-process](https://github.com/rasuvaeff/context-process) | External processes stopped when the deadline passes. |

## Delivery

| Package | What it does |
|---|---|
| [yii3-outbox](https://github.com/rasuvaeff/yii3-outbox) | Transactional outbox. Backends: `-db`, `-clickhouse`. |
| [yii3-webhooks](https://github.com/rasuvaeff/yii3-webhooks) | Outbound webhooks. Backend: `-db`. |
| [yii3-outbox-webhooks-bridge](https://github.com/rasuvaeff/yii3-outbox-webhooks-bridge) | Delivers webhook events through the outbox. |
| [yii3-idempotency](https://github.com/rasuvaeff/yii3-idempotency) | Safe request retries via `Idempotency-Key`. Backends: `-db`, `-redis`. |

## Experiments

| Package | What it does |
|---|---|
| [yii3-feature-flags](https://github.com/rasuvaeff/yii3-feature-flags) | Feature flags. Backends and UI: `-db`, `-ui`. |
| [yii3-ab-testing](https://github.com/rasuvaeff/yii3-ab-testing) · [docs](https://rasuvaeff.github.io/yii3-ab-testing/) | Deterministic A/B assignment. Family: `-db`, `-clickhouse`, `-web`, `-outbox`. |

## Attribution

[yii3-utm](https://github.com/rasuvaeff/yii3-utm) (`-db`) captures UTM and click ids, keeps touchpoint history in one cookie, gates collection on consent, and writes an append-only attribution journal.

## Observability

| Package | What it does |
|---|---|
| [yii3-telemetry](https://github.com/rasuvaeff/yii3-telemetry) | Traces. OpenTelemetry export: `-otel`. |
| [yii3-metrics](https://github.com/rasuvaeff/yii3-metrics) | Metrics. Prometheus export: `-prometheus`. |
| [yii3-correlation-id](https://github.com/rasuvaeff/yii3-correlation-id) | One id across the request and its outbound calls. |
| [yii3-health-check](https://github.com/rasuvaeff/yii3-health-check) | Health endpoints. |
| [yii3-audit-log](https://github.com/rasuvaeff/yii3-audit-log) | Audit log. Backend: `-db`. |
| [domain-monitor](https://github.com/rasuvaeff/domain-monitor) | Domain monitoring. |

## AI / LLM

| Package | What it does |
|---|---|
| [yii3-mcp](https://github.com/rasuvaeff/yii3-mcp) · [docs](https://rasuvaeff.github.io/yii3-mcp/) | MCP server for Yii3. Domain operations and OpenAPI operations become tools. |
| [yii3-mcp-rbac-bridge](https://github.com/rasuvaeff/yii3-mcp-rbac-bridge) | Per-user RBAC on those tools. |
| [yii3-mcp-audit-log-bridge](https://github.com/rasuvaeff/yii3-mcp-audit-log-bridge) | Audit log for everything the model touches. |
| [yii3-mcp-telemetry-bridge](https://github.com/rasuvaeff/yii3-mcp-telemetry-bridge) | Telemetry for the same calls. |

## Payments

| Package | What it does |
|---|---|
| [payments](https://github.com/rasuvaeff/payments) | Provider-neutral payment contracts, PSR-18 transport and a webhook pipeline. |
| [payments-testing](https://github.com/rasuvaeff/payments-testing) | Deterministic fake gateways and framework-agnostic contract assertions. |

## Yii3 infrastructure

| Package | What it does |
|---|---|
| [yii3-tenancy](https://github.com/rasuvaeff/yii3-tenancy) | Tenancy. Backend: `-db`. |
| [yii3-settings](https://github.com/rasuvaeff/yii3-settings) | Settings. Backends and UI: `-db`, `-ui`. |
| [yii3-workflow](https://github.com/rasuvaeff/yii3-workflow) | Workflows. Backend: `-db`. |
| [yii3-api-problem](https://github.com/rasuvaeff/yii3-api-problem) | Problem details for HTTP APIs. |
| [yii3-maintenance-mode](https://github.com/rasuvaeff/yii3-maintenance-mode) | Maintenance mode. |
| [yii3-seo](https://github.com/rasuvaeff/yii3-seo) | SEO metadata. |
| [yii3-centrifugo](https://github.com/rasuvaeff/yii3-centrifugo) | Centrifugo / WebSocket. |
| [yii3-respect-validation](https://github.com/rasuvaeff/yii3-respect-validation) | Respect Validation integration. |
| [yii3-recaptcha](https://github.com/rasuvaeff/yii3-recaptcha) | reCAPTCHA. |
| [yii3-turnstile](https://github.com/rasuvaeff/yii3-turnstile) | Cloudflare Turnstile. |

## Files and media

| Package | What it does |
|---|---|
| [yii3-filestorage](https://github.com/rasuvaeff/yii3-filestorage) | Storage facade over swappable backends, a deduplication ledger, signed downloads, tenant-scoped attachments, named-preset image derivatives. Family: `-db`, `-flysystem`, `-web`, `-attachments`, `-images`. |
| [media-converter](https://github.com/rasuvaeff/media-converter) | Type-safe ffmpeg/ffprobe wrapper: transcode, remux and filter pipelines, retry, bulkhead, progress events, DRM-aware probing. |

## HTTP and semantics

| Package | What it does |
|---|---|
| [pinned-http-client](https://github.com/rasuvaeff/pinned-http-client) | PSR-18 client for untrusted URLs. Resolves the host, checks every address, pins the connection. |
| [link-preview](https://github.com/rasuvaeff/link-preview) | SSRF-safe OpenGraph and Twitter Card extraction. |
| [json-ld](https://github.com/rasuvaeff/json-ld) | JSON-LD 1.1 processor: expand, flatten, node API, RDF, N-Quads. |

## Query and domain

| Package | What it does |
|---|---|
| [specification](https://github.com/rasuvaeff/specification) | Specification pattern and composable type-safe query building. |
| [schema](https://github.com/rasuvaeff/schema) | Schema-as-code combinators. One definition drives runtime validation, property-based generation and JSON Schema export. |

## ClickHouse

[clickhouse-toolkit](https://github.com/rasuvaeff/clickhouse-toolkit) and the Yii3 integration [yii3-clickhouse-toolkit](https://github.com/rasuvaeff/yii3-clickhouse-toolkit).

## Property-based testing

| Package | What it does |
|---|---|
| [property-testing-core](https://github.com/rasuvaeff/property-testing-core) · [docs](https://rasuvaeff.github.io/property-testing-core/) | The engine: generators, shrinking, runner, regression corpus, events. |
| [property-testing-testo](https://github.com/rasuvaeff/property-testing-testo) | `#[Property]` for Testo. |
| [property-testing-phpunit](https://github.com/rasuvaeff/property-testing-phpunit) | Fluent `forAll()->check()` for PHPUnit. |
| [property-testing-names](https://github.com/rasuvaeff/property-testing-names) | Realistic person names (`en` / `ru`) as inputs. |
| [property-testing-openapi](https://github.com/rasuvaeff/property-testing-openapi) | Requests generated from an OpenAPI document. |
| [property-testing](https://github.com/rasuvaeff/property-testing) · [docs](https://rasuvaeff.github.io/property-testing/) | Frozen 2.x line. New work goes to `-core`. |

## Testing and quality

| Package | What it does |
|---|---|
| [understudy](https://github.com/rasuvaeff/understudy) · [docs](https://rasuvaeff.github.io/understudy/) | Test doubles with a call-closure API. Adapters and plugins: `-testo`, `-phpunit`, `-psalm`, `-phpstan`. |
| [openapi-contract](https://github.com/rasuvaeff/openapi-contract) | Framework-neutral OpenAPI contract validation for PSR-7. |
| [doc-exec](https://github.com/rasuvaeff/doc-exec) | Doctest for PHP: runs fenced code blocks from docs and diffs the output. |
| [quality-ledger](https://github.com/rasuvaeff/quality-ledger) | Append-only quality ledger. |
| [mutation-history](https://github.com/rasuvaeff/mutation-history) | Append-only mutation history with regression ratchets. |

## Tooling

| Package | What it does |
|---|---|
| [rector-named-literals](https://github.com/rasuvaeff/rector-named-literals) | Rector rule for named arguments. |
| [rector-datetime-immutable](https://github.com/rasuvaeff/rector-datetime-immutable) | Rector rule towards `DateTimeImmutable`. |
| [php-package-toolkit](https://github.com/rasuvaeff/php-package-toolkit) | The rulebook the packages are generated from. Open source, so the workflow is auditable. |
| [ecosystem-sandbox](https://github.com/rasuvaeff/ecosystem-sandbox) | Runnable checkout sandbox for the whole ecosystem. A demo application, not a package. |
