---
title: yii3-ab-testing
package: yii3-ab-testing
section: 3
layout: man
description: "Детерминированное stateless A/B-тестирование для Yii3 с явным учётом показов."
---

## ИМЯ

yii3-ab-testing — детерминированное stateless A/B-тестирование для Yii3 с явным учётом показов

## ОБЗОР

<ManInstall />

```php
$assignment = $ab->assign(experiment: 'checkout-button', subjectId: (string) $userId);

if ($assignment->isVariant('green')) {
    // Show green button.
}

// assign() does NOT auto-track. Call explicitly:
$exposure = $ab->trackExposure($assignment);
$ab->trackConversion($assignment, goal: 'purchase', exposure: $exposure);
```

## ОПИСАНИЕ

Детерминированное stateless A/B-тестирование для Yii3 с явным учётом показов.

Повторное вычисление назначения позже может вернуть другой вариант, чем видел посетитель. Пакет даёт стабильное хеш-назначение, причины решений и квитанции для последующих конверсий.

- Один и тот же salt и `subjectId` всегда дают один и тот же вариант (`WeightedHashAssignmentStrategy`).
- Варианты с весами и принудительный вариант для QA, проверяемый по allow-list.
- Каждый `Assignment` несёт `reason` (`assigned`, `forced`, `fallback_*`) и `source` (`computed`, `store`).
- `assign()` чистая. `trackExposure()` и `trackConversion()` вызываются явно и возвращают события.
- `AssignmentReceipt` связывает конверсию с исходным показом в более позднем запросе.
- Правила таргетинга с запасным вариантом при несовпадении.
- Закреплённые варианты через `AssignmentStore`; `ConfigurationAwareAssignmentStore` сбрасывает устаревшие привязки при смене весов.
- Logger-приёмники, составные и дедуплицирующие трекеры; reset-хук для RoadRunner и Swoole.

## ПРИМЕРЫ

Привязывает конверсию в следующем запросе к варианту, который реально видел посетитель, через receipt.

```php
$receipt = $exposure->receipt();
$_SESSION['ab_receipt'] = $receipt->toArray(); // or a signed cookie

// … a later request …

$receipt = AssignmentReceipt::fromArray($_SESSION['ab_receipt']);
$ab->trackConversionForReceipt($receipt, goal: 'purchase', context: $context);
```

Белый список атрибутов контекста для аналитики с переименованием и маскированием значений.

```php
new AllowListAnalyticsContextPolicy(
    allowedAttributes: ['country', 'plan', 'user'],
    renamedAttributes: ['country' => 'geo'],  // stored column name
    redactedAttributes: ['user'],             // kept as a column, value masked
);
```

Оборачивает трекер так, что одна и та же экспозиция отправляется не чаще раза за запрос.

```php
$tracker = new DeduplicatingExposureTracker(tracker: $realExposureTracker);
$tracker->trackExposure($exposureEvent);
$tracker->trackExposure($exposureEvent); // suppressed in this request
```

## СМОТРИТЕ ТАКЖЕ

| Пакет | Роль |
|---|---|
| [yii3-ab-testing-db](https://github.com/rasuvaeff/yii3-ab-testing-db)(3) | DB-провайдер и sticky store |
| [yii3-ab-testing-web](https://github.com/rasuvaeff/yii3-ab-testing-web)(3) | Cookie sticky store, `SubjectIdMiddleware` |
| [yii3-ab-testing-outbox](https://github.com/rasuvaeff/yii3-ab-testing-outbox)(3) | Надёжная доставка событий |
| [yii3-ab-testing-clickhouse](https://github.com/rasuvaeff/yii3-ab-testing-clickhouse)(3) | Схема аналитики в ClickHouse и миграции |

## ОШИБКИ

Изменение весов или набора вариантов сдвигает границы бакетов и перетасовывает часть субъектов. Когорту замораживает только новый salt. Нужен 64-битный PHP.
