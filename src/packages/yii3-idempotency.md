---
title: yii3-idempotency
package: yii3-idempotency
section: 3
layout: man
description: "Idempotency-key PSR-15 middleware that stops duplicate POST, PUT and PATCH processing."
---

## NAME

yii3-idempotency — idempotency-key PSR-15 middleware that stops duplicate POST, PUT and PATCH processing

## SYNOPSIS

<ManInstall />

```php
$middleware = new IdempotencyMiddleware(
    keyExtractor: new HeaderIdempotencyKeyExtractor(),
    storage: new InMemoryIdempotencyStorage($clock),
    responseFactory: $responseFactory,
    clock: $clock,
    scopeResolver: new RequestAttributeScopeResolver(attribute: 'user'), // who a key belongs to
    ttlSeconds: 3600,
);
```

## DESCRIPTION

PSR-15 middleware for `Idempotency-Key`. The same key and body run the handler once.

Retried or double-submitted requests run the handler twice. Without caller scoping, one client could also replay or lock out another client's key.

- Same key and same payload replays the stored response with `Idempotency-Replay: true`.
- Same key and a different payload answers `422`; an in-flight duplicate answers `409`.
- The fingerprint covers method, path, query and body.
- `scopeResolver` is required: keys are namespaced per caller.
- 2xx responses are cached by default; other statuses release the claim.
- `DomainFailureRenderer` and `FailureClassifier` cache domain failures, so `InsufficientFunds` is not executed again.
- `cacheableRedirectStatuses` caches `303` for Post/Redirect/Get forms.
- `Set-Cookie`, `Date` and hop-by-hop headers are never captured.

## EXAMPLES

Caches deterministic domain failures as replayable responses while bugs and infra errors stay retryable.

```php
$middleware = new IdempotencyMiddleware(
    keyExtractor: new HeaderIdempotencyKeyExtractor(),
    storage: $storage,
    responseFactory: $responseFactory,
    clock: $clock,
    scopeResolver: new RequestAttributeScopeResolver(attribute: 'user'),
    domainFailureRenderer: $renderer,                     // your DomainFailureRenderer
    failureClassifier: new DefaultFailureClassifier([     // optional overrides
        MisconfiguredGatewayException::class => FailureKind::Bug,
    ]),
);
```

Stores and replays a 303 redirect so a double-submitted form never runs the handler twice.

```php
$middleware = new IdempotencyMiddleware(
    // ... keyExtractor, storage, responseFactory, clock, scopeResolver ...
    cacheableRedirectStatuses: [303],
);
```

Scopes idempotency keys by caller and endpoint so identical keys never collide.

```php
// caller + "METHOD /path" — the wiring the bundled config builds by default
$scopeResolver = new CompositeScopeResolver(
    new RequestAttributeScopeResolver(attribute: 'user'),
    new RequestTargetScopeResolver(),
);

// caller + an explicit namespace shared by related endpoints
$scopeResolver = new CompositeScopeResolver(
    new RequestAttributeScopeResolver(attribute: 'user'),
    new IdempotencyScope('orders'),
);
```

## SEE ALSO

`yii3-idempotency-db` provides `DbIdempotencyStorage`; `yii3-idempotency-redis` is the Redis backend.

## BUGS

Anonymous callers share one namespace, so do not put caller-private data behind an anonymous idempotent endpoint. `SharedKeyspaceScopeResolver` is a documented opt-out, safe only for a single principal.
