---
title: yii3-outbox
description: Stateless transactional outbox core for Yii3 with retry policies and swappable storage.
outline: [2, 2]
---

# yii3-outbox

A stateless transactional outbox core for Yii3, with retry policies.

<PackageMeta slug="yii3-outbox" :src="21" :tests="13" />

## The problem

Writing to the database and publishing a message are two steps, and a crash between them loses or duplicates the message. The outbox records the message in the same transaction as the data and publishes it afterwards.

## What it does

- `Outbox::record()` with optional `aggregateId`, `id` and priority; `recordMany()` reads the clock once and batch-saves when storage supports it.
- Claim order is priority descending, then `createdAt` ascending (priority range -32768 to 32767).
- `Processor` claims, publishes and applies `RetryPolicy(maxAttempts, delaySeconds)`.
- `PublishException::terminal()` marks a message `Failed` immediately.
- Processor `types` scopes a consumer to the message types it owns.
- Optional storage interfaces: retry-aware, batch ack, batch save, requeue, stats.
- Pluggable `MessageIdGeneratorInterface`; the default needs no UUID library.
- Ships an `InMemoryStorage` test double and a `Serializer`.

## Example

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

## More examples

The outbox message is recorded in the same transaction as the business write, so both commit or neither does.

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

A publisher reports failure with PublishException, which the processor retries until attempts run out.

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

RetryPolicy decides whether a message may be retried and whether its backoff delay has passed.

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

## Family

| Package | Role |
|---|---|
| yii3-outbox-db | SQL storage |
| yii3-outbox-clickhouse | Batched ClickHouse exporter |
| yii3-outbox-webhooks-bridge | Webhook delivery through the outbox |
| yii3-ab-testing-outbox | A/B exposure and conversion events |

## Limits

The core opens no transaction, so the atomic-write obligation stays with the caller. Delivery is at-least-once, and an unscoped `Processor` claims every message type in a shared storage.
