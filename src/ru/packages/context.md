---
title: context
package: context
section: 3
layout: man
description: "Дедлайны, отмена и значения в рамках запроса для PHP."
---

## ИМЯ

context — дедлайны, отмена и значения в рамках запроса для PHP

## ОБЗОР

<ManInstall />

```php
$root = Context::background();                               // never terminates by itself

[$request, $requestController] = $root->withTimeout(3.0);    // seconds
[$step, $stepController] = $request->withCancel();           // cancellable branch

$traced = $request->withValue(RequestId::class, new RequestId('r-42'));
$traced->value(RequestId::class)?->value;                    // 'r-42' (nearest ancestor wins)

[$work] = $request->withReserve(0.2);                        // the parent deadline minus 200 ms
```

## ОПИСАНИЕ

`context.Context` из Go для PHP, без зависимостей. Один бюджет проходит сквозь запрос через все слои.

Без общего бюджета у каждого слоя своё представление о времени, поэтому код может начать шаг, когда бюджет запроса уже исчерпан. Вызывающие проверяют один неизменяемый дедлайн.

- `withTimeout`, `withDeadline`, `withCancel`, `withReserve` порождают дочерние контексты.
- Дедлайн потомка никогда не позже дедлайна родителя.
- `assertActive()` бросает `ContextCancelledException` или `ContextExpiredException`.
- `remainingMs()` переводит бюджет в таймаут транспорта.
- Слушатели `onTerminate()`; `requestCancel()` безопасен в обработчиках сигналов.
- `iterate()` и `sleep()` учитывают дедлайн.
- `WireCodec` передаёт бюджет и значения из белого списка между процессами, без `unserialize()`.
- `FakeTimeSource` и `SteppingTimeSource` для детерминированных тестов.

## ПРИМЕРЫ

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

## ЗАПУСКАЕМЫЕ ПРИМЕРЫ

<RunExamples pkg="context" />

## СМОТРИТЕ ТАКЖЕ

| Package | Layer |
|---|---|
| [context-http](https://github.com/rasuvaeff/context-http)(3) | PSR-15 / PSR-18 и Guzzle |
| [context-db](https://github.com/rasuvaeff/context-db)(3) | Таймауты выражений в MySQL, MariaDB, PostgreSQL |
| [context-cli](https://github.com/rasuvaeff/context-cli)(3) | Корректное завершение по сигналам ОС |
| [context-process](https://github.com/rasuvaeff/context-process)(3) | Подпроцессы, останавливаемые на дедлайне |
| [clickhouse-toolkit](https://github.com/rasuvaeff/clickhouse-toolkit)(3) | `max_execution_time` |

[resilience](/ru/packages/resilience) принимает необязательный бюджет контекста и компонует `retry`, `circuit-breaker` и `bulkhead` в порядке, который не усиливает перегрузку: bulkhead внутри, breaker вокруг него, retry снаружи.

## ОШИБКИ

Контекст останавливает работу, но не прерывает её. Отмена кооперативная, а дедлайны ленивые (фонового таймера нет), поэтому проверяйте перед каждым шагом. Без `context-db` выполняющийся запрос PDO прервать нельзя, а блокирующий вызов Redis — никогда.
