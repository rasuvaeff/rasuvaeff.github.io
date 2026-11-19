---
title: resilience
package: resilience
section: 3
layout: man
description: "Retry, circuit breaker and bulkhead composed in the correct order."
---

## NAME

resilience — retry, circuit breaker and bulkhead composed in the correct order

## SYNOPSIS

<ManInstall />

```php
$pipeline = Pipeline::for('billing')
    ->bulkhead(new SharedBulkhead(
        name: 'billing',
        maxConcurrent: 2,
        store: new InMemoryBulkheadStore(),
        lease: Duration::seconds(5),
        maxWait: Duration::zero(),
    ))
    ->retry(
        Retry::new()
            ->maxAttempts(maxAttempts: 3)
            ->withImmediate(),
    )
    ->build(); // immutable, reusable
```

The README sample, with the breaker added, is executed on every build through `doc-exec`.

## DESCRIPTION

Retry, circuit breaker and bulkhead composed in the right order, with the glue built in.

The three leaf packages compose with closures, but wrong glue means retrying on an open circuit or a full bulkhead, which amplifies overload. `Pipeline` fixes the nesting order and appends the stop rules.

- `Pipeline::for(name)` builder over retry, circuit breaker and bulkhead; `build()` is immutable and reusable.
- Default nesting is `retry(circuitBreaker(bulkhead(callback)))`, so retry sleeps hold no slot.
- Retry stops on `CircuitOpenException` and the breaker's `StorageFailure`.
- Retry stops on `BulkheadFullException` unless `retryOnBulkheadFull()`.
- `breakerOutsideRetry()` switches breaker outcomes from per-attempt to per-operation.
- Optional fallback receives the terminal exception.
- `Rejection::is()` and `retryAfter()`; `onRejected()` maps to a domain exception.
- An optional `context` budget is threaded through every layer.

## EXAMPLES

Maps a full bulkhead rejection to a domain exception and reads the Retry-After hint.

```php
final class BillingUnavailable extends \RuntimeException {}

$store = new InMemoryBulkheadStore();
$store->tryAcquire('billing', 1, Duration::seconds(5)); // the only slot is busy

$pipeline = Pipeline::for('billing')
    ->bulkhead(new SharedBulkhead(
        name: 'billing',
        maxConcurrent: 1,
        store: $store,
        lease: Duration::seconds(5),
        maxWait: Duration::zero(),
    ))
    ->onRejected(static fn(\Throwable $e): \Throwable => new BillingUnavailable('billing is busy', previous: $e))
    ->build();

try {
    $pipeline->call(static fn(): string => 'charged');
} catch (BillingUnavailable $e) {
    $e->getMessage(); // => "billing is busy"
    Rejection::is($e->getPrevious()); // => true
    Rejection::retryAfter($e->getPrevious())?->toMillis(); // => 5000
}
```

With an open circuit the callback never runs, retries stop at once, and the fallback answers.

```php
$pipeline = Pipeline::for('payments')
    ->retry(Retry::new()->maxAttempts(maxAttempts: 5)->withImmediate())
    ->circuitBreaker($breaker)
    ->build();

// $breaker is already open: a previous failing call tripped it
// (see examples/02-fallback-on-open-circuit.php).
// With the circuit open, it rejects instantly, the glue stops the retry
// loop after zero callback invocations, and the fallback degrades gracefully.
$calls = 0;
$result = $pipeline->call(
    callback: function () use (&$calls): string {
        ++$calls;

        return 'never reached';
    },
    fallback: static fn(\Throwable $e): string => $e instanceof CircuitOpenException
        ? 'served from cache'
        : 'unexpected: ' . $e::class,
);

printf("with the circuit open: %s (callback invoked %d time(s))\n", $result, $calls);
```

Runs the pipeline under a request budget; the breaker ignores context expiry as a failure.

```php
$charge = $pipeline->call(
    static fn(Context $context): Charge => $stripe->charge($payload, $context),
    context: $requestContext,
);

new BreakerConfig(
    // ...
    isFailure: ContextOutcome::ignoring(static fn(\Throwable $e): bool => $e instanceof ClientExceptionInterface),
);
```

## RUNNABLE EXAMPLES

<RunExamples pkg="resilience" />

## SEE ALSO

`retry`, `circuit-breaker`, `bulkhead`, `duration`, and `context` for the request budget.

## BUGS

Breaker placement is a real semantic choice. With `breakerOutsideRetry()` an open circuit cannot cut the retry loop short.
