---
title: yii3-ab-testing
package: yii3-ab-testing
section: 3
layout: man
description: "Deterministic, stateless A/B testing for Yii3 with explicit exposure tracking."
---

## NAME

yii3-ab-testing — deterministic, stateless A/B testing for Yii3 with explicit exposure tracking

## SYNOPSIS

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

## DESCRIPTION

Deterministic, stateless A/B testing for Yii3 with explicit exposure tracking.

Re-resolving an assignment later can return a different variant than the visitor saw. This package gives stable hash-based assignment, decision reasons, and receipts for later conversions.

- The same salt and `subjectId` always give the same variant (`WeightedHashAssignmentStrategy`).
- Weighted variants, and a forced variant for QA validated against an allow-list.
- Every `Assignment` carries a `reason` (`assigned`, `forced`, `fallback_*`) and a `source` (`computed`, `store`).
- `assign()` is pure. `trackExposure()` and `trackConversion()` are explicit and return events.
- `AssignmentReceipt` links a conversion to the original exposure in a later request.
- Targeting rules, with a fallback variant on mismatch.
- Sticky variants through `AssignmentStore`; `ConfigurationAwareAssignmentStore` drops stale pins when weights change.
- Logger sinks, composite and deduplicating trackers; a reset hook for RoadRunner and Swoole.

## EXAMPLES

Attributes a later conversion to the variant the visitor actually saw, using an assignment receipt.

```php
$receipt = $exposure->receipt();
$_SESSION['ab_receipt'] = $receipt->toArray(); // or a signed cookie

// … a later request …

$receipt = AssignmentReceipt::fromArray($_SESSION['ab_receipt']);
$ab->trackConversionForReceipt($receipt, goal: 'purchase', context: $context);
```

Allow-lists which context attributes reach analytics, with renaming and redaction.

```php
new AllowListAnalyticsContextPolicy(
    allowedAttributes: ['country', 'plan', 'user'],
    renamedAttributes: ['country' => 'geo'],  // stored column name
    redactedAttributes: ['user'],             // kept as a column, value masked
);
```

Wraps a tracker so the same exposure is emitted at most once per request.

```php
$tracker = new DeduplicatingExposureTracker(tracker: $realExposureTracker);
$tracker->trackExposure($exposureEvent);
$tracker->trackExposure($exposureEvent); // suppressed in this request
```

## SEE ALSO

| Package | Role |
|---|---|
| [yii3-ab-testing-db](https://github.com/rasuvaeff/yii3-ab-testing-db)(3) | DB provider and sticky store |
| [yii3-ab-testing-web](https://github.com/rasuvaeff/yii3-ab-testing-web)(3) | Cookie sticky store, `SubjectIdMiddleware` |
| [yii3-ab-testing-outbox](https://github.com/rasuvaeff/yii3-ab-testing-outbox)(3) | Durable delivery of events |
| [yii3-ab-testing-clickhouse](https://github.com/rasuvaeff/yii3-ab-testing-clickhouse)(3) | ClickHouse analytics schema and migrations |

## BUGS

Changing weights or the variant set shifts bucket boundaries and reshuffles some subjects. Only a new salt freezes a cohort. Needs 64-bit PHP.
