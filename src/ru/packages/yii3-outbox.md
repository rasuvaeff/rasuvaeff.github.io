---
title: yii3-outbox
description: "Stateless-ядро transactional outbox для Yii3 с политиками повторов и сменным хранилищем."
outline: [2, 2]
---

# yii3-outbox

Stateless-ядро transactional outbox для Yii3 с политиками повторов.

<PackageMeta slug="yii3-outbox" :src="21" :tests="13" />

## Задача

Запись в базу и публикация сообщения — два шага, и сбой между ними теряет или дублирует сообщение. Outbox записывает сообщение в той же транзакции, что и данные, а публикует позже.

## Что умеет

- `Outbox::record()` с необязательными `aggregateId`, `id` и приоритетом; `recordMany()` читает часы один раз и сохраняет пачкой, если хранилище это умеет.
- Порядок захвата: приоритет по убыванию, затем `createdAt` по возрастанию (диапазон приоритета от -32768 до 32767).
- `Processor` захватывает, публикует и применяет `RetryPolicy(maxAttempts, delaySeconds)`.
- `PublishException::terminal()` сразу помечает сообщение как `Failed`.
- Параметр `types` у Processor ограничивает потребителя теми типами сообщений, которыми он владеет.
- Необязательные интерфейсы хранилища: учёт повторов, пакетное подтверждение, пакетное сохранение, requeue, статистика.
- Подключаемый `MessageIdGeneratorInterface`; реализация по умолчанию не требует библиотеки UUID.
- Поставляется с тестовым дублёром `InMemoryStorage` и `Serializer`.

## Пример

```php
$storage = new InMemoryStorage(); // rasuvaeff/yii3-outbox-db for a real one
$outbox = new Outbox(storage: $storage, clock: $clock);

$message = $outbox->record(
    type: 'order.created',
    payload: json_encode(['orderId' => 42]),
    aggregateId: 'order-42',
);

$processor = new Processor(
    storage: $storage,
    publisher: $publisher,
    retryPolicy: new RetryPolicy(maxAttempts: 3, delaySeconds: 60),
    clock: $clock,
    batchSize: 100,
);
$result = $processor->process();
```

## Ещё примеры

Сообщение outbox записывается в той же транзакции, что и бизнес-изменение: коммит либо у обоих, либо ни у одного.

```php
$db->transaction(static function () use ($orders, $outbox, $order, $json): void {
    $orders->insert($order);

    $outbox->record(
        type: 'order.created',
        payload: $json,
        aggregateId: $order->id,
    );
});
```

Публикатор сообщает об ошибке через PublishException, процессор повторяет попытки, пока они не кончатся.

```php
final class RabbitPublisher implements PublisherInterface
{
    public function publish(OutboxMessage $message): void
    {
        try {
            // publish to RabbitMQ, Kafka, etc.
        } catch (\Throwable $e) {
            throw new PublishException(
                message: $e->getMessage(),
                outboxMessage: $message,
                previous: $e,
            );
        }
    }
}
```

RetryPolicy решает, можно ли повторять сообщение и прошла ли задержка между попытками.

```php
$policy = new RetryPolicy(maxAttempts: 3, delaySeconds: 60);
$now = new DateTimeImmutable();

$attempted = new OutboxMessage(
    id: 'msg-1',
    type: 'order.created',
    payload: '{}',
    status: OutboxStatus::Pending,
    createdAt: new DateTimeImmutable(),
    attempts: 2,
    lastAttemptAt: new DateTimeImmutable('-30 seconds'),
);
echo "2 attempts, 30s ago — should retry: " . ($policy->shouldRetry($attempted) ? 'yes' : 'no') . "\n";
echo "2 attempts, 30s ago — ready (delay=60s): " . ($policy->isReadyForRetry($attempted, $now) ? 'yes' : 'no') . "\n";
```

## Семейство

| Package | Role |
|---|---|
| yii3-outbox-db | SQL-хранилище |
| yii3-outbox-clickhouse | Пакетный экспортёр в ClickHouse |
| yii3-outbox-webhooks-bridge | Доставка вебхуков через outbox |
| yii3-ab-testing-outbox | События показов и конверсий A/B |

## Ограничения

Ядро не открывает транзакцию, поэтому обязанность атомарной записи остаётся на вызывающем. Доставка at-least-once, а Processor без `types` захватывает сообщения всех типов в общем хранилище.
