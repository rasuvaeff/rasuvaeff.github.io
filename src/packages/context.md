---
title: context
description: Deadlines, cancellation and request-scoped values for PHP.
outline: [2, 2]
---

# context

Go's `context.Context` for PHP, with no dependencies. One budget follows a request through every layer.

<PackageMeta slug="context" :src="15" :tests="7" />

## The problem

Without a shared budget each layer has its own notion of time, so code can start a step after the request's budget is gone. Callers check one immutable deadline instead.

## What it does

- `withTimeout`, `withDeadline`, `withCancel`, `withReserve` derive child contexts.
- A child deadline is never later than its parent's.
- `assertActive()` throws `ContextCancelledException` or `ContextExpiredException`.
- `remainingMs()` maps the budget to a transport timeout.
- `onTerminate()` listeners; `requestCancel()` is safe in signal handlers.
- `iterate()` and `sleep()` respect the deadline.
- `WireCodec` carries the budget and allow-listed values across processes, with no `unserialize()`.
- `FakeTimeSource` and `SteppingTimeSource` for deterministic tests.

## Example

```php
$root = Context::background();                               // never terminates by itself

[$request, $requestController] = $root->withTimeout(3.0);    // seconds
[$step, $stepController] = $request->withCancel();           // cancellable branch

$traced = $request->withValue(RequestId::class, new RequestId('r-42'));
$traced->value(RequestId::class)?->value;                    // 'r-42' (nearest ancestor wins)

[$work] = $request->withReserve(0.2);                        // the parent deadline minus 200 ms
```

## More examples

A queue worker uses the job's TTR as a deadline and acknowledges only when every step finished in time.

```php
[$jobContext, $jobController] = Context::background()->withTimeout($ttrSeconds);
try {
    foreach ($steps as $step) {
        $jobContext->assertActive();
        $step($jobContext);
    }
    $queue->ack($message);
} catch (ContextExpiredException) {
    $queue->nack($message); // let the queue decide retry/dead-letter
} finally {
    $jobController->cancel();
}
```

WireCodec carries the remaining budget and typed values across a process boundary, treating input as untrusted.

```php
$codec = new WireCodec(['tenant' => TenantId::class]);

$message->attributes = $codec->encode($context);    // ['budget_ms' => 790, 'values' => ['tenant' => 'acme']]

[$context, $controller] = $codec->decode($message->attributes, Context::background(), maxBudgetMs: 30_000);
```

A fake clock makes deadline tests deterministic: advance time and the context expires.

```php
$clock = new FakeTimeSource();               // also the Sleeper: sleep() advances it
[$context] = Context::background($clock)->withTimeout(1.0);
$clock->advanceMs(2_000);
$context->isExpired();                        // true
```

## Family

| Package | Layer |
|---|---|
| context-http | PSR-15 / PSR-18 and Guzzle |
| context-db | Statement timeouts on MySQL, MariaDB, PostgreSQL |
| context-cli | Graceful shutdown on OS signals |
| context-process | Subprocesses stopped at the deadline |
| clickhouse-toolkit | `max_execution_time` |

## Next to it

[resilience](/packages/resilience) takes an optional context budget and composes `retry`, `circuit-breaker` and `bulkhead` in the order that does not amplify overload: bulkhead innermost, breaker around it, retry outside.

## Limits

The context stops work, it does not interrupt it. Cancellation is cooperative and deadlines are lazy (no background timer), so check before every step. Without `context-db` an in-flight PDO query cannot be aborted, and a blocking Redis call never can.
