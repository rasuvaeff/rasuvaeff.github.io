---
title: clickhouse-toolkit
description: Framework-agnostic ClickHouse query builder, readers, writers and migrations for PHP.
outline: [2, 2]
---

# clickhouse-toolkit

Framework-agnostic ClickHouse helpers for PHP, built on `simpod/clickhouse-client`, with query and reader pieces that plug into `yiisoft/data`.

<PackageMeta slug="clickhouse-toolkit" :src="34" :tests="27" />

## The problem

ClickHouse has its own SQL dialect, async mutations, partitions and batch inserts, and a query built from user filters is an injection risk. This toolkit covers those parts with parameterized SQL and an allow-list.

## What it does

- `ClickHouseClientFactory` and `ClickHouseConfig` build a client over any PSR-18 HTTP client.
- `ClickHouseQueryBuilder` turns `yiisoft/data` filters and sorting into parameterized SQL.
- Allow-listed fields, and `withMandatoryFilter()` for tenant or ACL constraints.
- `ClickHouseDataReader` is an immutable `DataReaderInterface` for `yiisoft/data` paginators.
- `ClickHouseKeysetReader` streams large result sets with bounded memory.
- `ClickHouseBatchWriter` does buffered, batched inserts.
- `ClickHouseTableBuilder` for fluent `CREATE TABLE`; `ClickHousePartitionManager` for partitions.
- `ClickHouseMutationBuilder` for async `ALTER UPDATE` / `DELETE` with mutation tracking.
- `ClickHouseMigrationRunner`: idempotent, checksum-verified `.sql` migrations.

## Example

```php
$qb = new ClickHouseQueryBuilder(
    allowedFields: ['id', 'status', 'created_at'],
    fieldTypes: ['id' => T::UInt64, 'created_at' => T::DateTime],
    defaultSort: 'id DESC',
);

$where = $qb->buildWhere(new In('status', ['active', 'pending']));
$orderBy = $qb->buildOrderBy(Sort::only(['created_at'])->withOrder(['created_at' => 'desc']));
$sql = $qb->buildSelect(table: 'events', columns: ['id', 'status'], where: $where->sql, orderBy: $orderBy, limit: 20);
```

## More examples

Batch-inserts rows with ClickHouse async_insert settings applied to every INSERT.

```php
$writer = new ClickHouseBatchWriter(
    client: $client,
    table: 'events',
    columns: ['id', 'type', 'user_id', 'created_at'],
    batchSize: 10_000,
    settings: ['async_insert' => 1, 'wait_for_async_insert' => 0],
);
```

Creates a partitioned MergeTree table with a fluent DDL builder.

```php
ClickHouseTableBuilder::create($client, 'events')
    ->ifNotExists()
    ->column('id', T::UInt64)
    ->column('created_at', T::DateTime)
    ->engine('MergeTree()')
    ->partitionBy('toYYYYMM(created_at)')
    ->primaryKey('id')
    ->orderBy('(id, created_at)')
    ->execute();
```

Lists MergeTree partitions with row and byte counts, then drops or archives one by id.

```php
$pm = new ClickHousePartitionManager($client);

foreach ($pm->getPartitions('events') as $p) {
    // ['partition' => '202401', 'partition_id' => '202401', 'rows' => 12345, 'bytes' => 987654]
}

$pm->dropPartition('events', '202401');
$pm->movePartition('events', 'events_archive', '202401');     // MOVE … TO TABLE
```

## Family

| Package | Role |
|---|---|
| yii3-clickhouse-toolkit | Yii3 config bridge and console commands |
| yii3-outbox-clickhouse | Batched outbox exporter |
| yii3-ab-testing-clickhouse | Exposure and conversion trackers |
| context | Request budget mapped to `max_execution_time` |

## Limits

Migration rollback is intentionally not included. Use forward-fix migrations with idempotent DDL.
