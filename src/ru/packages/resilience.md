---
title: resilience
description: "Retry, circuit breaker и bulkhead, собранные в правильном порядке."
outline: [2, 2]
---

# resilience

Retry, circuit breaker и bulkhead в правильном порядке, с готовой «склейкой».

<PackageMeta slug="resilience" :src="5" :tests="4" />

## Задача

Три базовых пакета компонуются через замыкания, но неверная склейка означает retry на открытом circuit или полном bulkhead, что усиливает перегрузку. `Pipeline` фиксирует порядок вложенности и добавляет правила остановки.

## Что умеет

- Билдер `Pipeline::for(name)` над retry, circuit breaker и bulkhead; `build()` неизменяем и переиспользуем.
- Вложенность по умолчанию `retry(circuitBreaker(bulkhead(callback)))`, поэтому сон между retry не удерживает слот.
- Retry останавливается на `CircuitOpenException` и `StorageFailure` breaker'а.
- Retry останавливается на `BulkheadFullException`, если не вызван `retryOnBulkheadFull()`.
- `breakerOutsideRetry()` переключает учёт исходов breaker'а с попытки на операцию.
- Необязательный fallback получает конечное исключение.
- `Rejection::is()` и `retryAfter()`; `onRejected()` отображает отказ в доменное исключение.
- Необязательный бюджет `context` пробрасывается через каждый слой.

## Пример

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

Пример из README, дополненный breaker'ом, выполняется при каждой сборке через `doc-exec`.

## Из чего собран

`retry`, `circuit-breaker`, `bulkhead`, `duration` и `context` для бюджета запроса.

## Ещё примеры

Превращает отказ переполненного bulkhead в доменное исключение и читает подсказку Retry-After.

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

При открытом контуре callback не вызывается, повторы прекращаются сразу, отвечает fallback.

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

Запускает конвейер под бюджетом запроса; брейкер не считает истечение контекста сбоем.

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

## Ограничения

Положение breaker'а — реальный семантический выбор. С `breakerOutsideRetry()` открытый circuit не может прервать цикл retry.
