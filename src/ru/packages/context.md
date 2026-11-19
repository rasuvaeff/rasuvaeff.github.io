---
title: context
description: "Дедлайны, отмена и значения в рамках запроса для PHP."
outline: [2, 2]
---

# context

`context.Context` из Go для PHP, без зависимостей. Один бюджет проходит сквозь запрос через все слои.

<PackageMeta slug="context" :src="15" :tests="7" />

## Задача

Без общего бюджета у каждого слоя своё представление о времени, поэтому код может начать шаг, когда бюджет запроса уже исчерпан. Вызывающие проверяют один неизменяемый дедлайн.

## Что умеет

- `withTimeout`, `withDeadline`, `withCancel`, `withReserve` порождают дочерние контексты.
- Дедлайн потомка никогда не позже дедлайна родителя.
- `assertActive()` бросает `ContextCancelledException` или `ContextExpiredException`.
- `remainingMs()` переводит бюджет в таймаут транспорта.
- Слушатели `onTerminate()`; `requestCancel()` безопасен в обработчиках сигналов.
- `iterate()` и `sleep()` учитывают дедлайн.
- `WireCodec` передаёт бюджет и значения из белого списка между процессами, без `unserialize()`.
- `FakeTimeSource` и `SteppingTimeSource` для детерминированных тестов.

## Пример

```php
$root = Context::background();                               // never terminates by itself

[$request, $requestController] = $root->withTimeout(3.0);    // seconds
[$step, $stepController] = $request->withCancel();           // cancellable branch

$traced = $request->withValue(RequestId::class, new RequestId('r-42'));
$traced->value(RequestId::class)?->value;                    // 'r-42' (nearest ancestor wins)

[$work] = $request->withReserve(0.2);                        // the parent deadline minus 200 ms
```

## Ещё примеры

Воркер очереди берёт TTR задачи как дедлайн и подтверждает сообщение, только если все шаги уложились.

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

WireCodec передаёт остаток бюджета и типизированные значения между процессами, считая вход недоверенным.

```php
$codec = new WireCodec(['tenant' => TenantId::class]);

$message->attributes = $codec->encode($context);    // ['budget_ms' => 790, 'values' => ['tenant' => 'acme']]

[$context, $controller] = $codec->decode($message->attributes, Context::background(), maxBudgetMs: 30_000);
```

Фиктивные часы делают тесты дедлайнов детерминированными: сдвигаем время, и контекст истекает.

```php
$clock = new FakeTimeSource();               // also the Sleeper: sleep() advances it
[$context] = Context::background($clock)->withTimeout(1.0);
$clock->advanceMs(2_000);
$context->isExpired();                        // true
```

## Семейство

| Package | Layer |
|---|---|
| context-http | PSR-15 / PSR-18 и Guzzle |
| context-db | Таймауты выражений в MySQL, MariaDB, PostgreSQL |
| context-cli | Корректное завершение по сигналам ОС |
| context-process | Подпроцессы, останавливаемые на дедлайне |
| clickhouse-toolkit | `max_execution_time` |

## Рядом

[resilience](/ru/packages/resilience) принимает необязательный бюджет контекста и компонует `retry`, `circuit-breaker` и `bulkhead` в порядке, который не усиливает перегрузку: bulkhead внутри, breaker вокруг него, retry снаружи.

## Ограничения

Контекст останавливает работу, но не прерывает её. Отмена кооперативная, а дедлайны ленивые (фонового таймера нет), поэтому проверяйте перед каждым шагом. Без `context-db` выполняющийся запрос PDO прервать нельзя, а блокирующий вызов Redis — никогда.
