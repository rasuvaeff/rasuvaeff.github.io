---
title: clickhouse-toolkit
description: "Framework-agnostic query builder, readers, writers и миграции ClickHouse для PHP."
outline: [2, 2]
---

# clickhouse-toolkit

Framework-agnostic инструменты ClickHouse для PHP на базе `simpod/clickhouse-client`; компоненты запросов и ридеры подключаются к `yiisoft/data`.

<PackageMeta slug="clickhouse-toolkit" :src="34" :tests="27" />

## Задача

У ClickHouse свой диалект SQL, асинхронные мутации, партиции и пакетные вставки, а запрос, собранный из пользовательских фильтров, создаёт риск инъекции. Тулкит закрывает эти части параметризованным SQL и allow-list.

## Что умеет

- `ClickHouseClientFactory` и `ClickHouseConfig` собирают клиент поверх любого PSR-18 HTTP-клиента.
- `ClickHouseQueryBuilder` превращает фильтры и сортировку `yiisoft/data` в параметризованный SQL.
- Поля из allow-list и `withMandatoryFilter()` для ограничений по tenant или ACL.
- `ClickHouseDataReader` — неизменяемый `DataReaderInterface` для пагинаторов `yiisoft/data`.
- `ClickHouseKeysetReader` стримит большие выборки с ограниченной памятью.
- `ClickHouseBatchWriter` выполняет буферизованные пакетные вставки.
- `ClickHouseTableBuilder` для fluent `CREATE TABLE`; `ClickHousePartitionManager` для партиций.
- `ClickHouseMutationBuilder` для асинхронных `ALTER UPDATE` / `DELETE` с отслеживанием мутаций.
- `ClickHouseMigrationRunner`: идемпотентные `.sql` миграции с проверкой контрольных сумм.

## Пример

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

## Ещё примеры

Пакетная вставка строк с настройками async_insert ClickHouse для каждого INSERT.

```php
$writer = new ClickHouseBatchWriter(
    client: $client,
    table: 'events',
    columns: ['id', 'type', 'user_id', 'created_at'],
    batchSize: 10_000,
    settings: ['async_insert' => 1, 'wait_for_async_insert' => 0],
);
```

Создаёт партиционированную таблицу MergeTree через fluent-построитель DDL.

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

Перечисляет партиции MergeTree со счётчиками строк и байт, затем удаляет или архивирует одну по id.

```php
$pm = new ClickHousePartitionManager($client);

foreach ($pm->getPartitions('events') as $p) {
    // ['partition' => '202401', 'partition_id' => '202401', 'rows' => 12345, 'bytes' => 987654]
}

$pm->dropPartition('events', '202401');
$pm->movePartition('events', 'events_archive', '202401');     // MOVE … TO TABLE
```

## Семейство

| Пакет | Роль |
|---|---|
| yii3-clickhouse-toolkit | Мост конфигурации Yii3 и консольные команды |
| yii3-outbox-clickhouse | Пакетный экспортёр outbox |
| yii3-ab-testing-clickhouse | Схема A/B-аналитики и миграции |
| context | Бюджет запроса, отображаемый в `max_execution_time` |

## Ограничения

Откат миграций намеренно не предусмотрен. Используйте миграции «исправление вперёд» с идемпотентным DDL.
