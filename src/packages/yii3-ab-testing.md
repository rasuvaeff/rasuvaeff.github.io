---
title: yii3-ab-testing
description: Deterministic, stateless A/B testing for Yii3 with explicit exposure tracking.
outline: [2, 2]
---

# yii3-ab-testing

Deterministic, stateless A/B testing for Yii3 with explicit exposure tracking.

<PackageMeta slug="yii3-ab-testing" docs="https://rasuvaeff.github.io/yii3-ab-testing/" :src="49" :tests="27" />

## The problem

Re-resolving an assignment later can return a different variant than the visitor saw. This package gives stable hash-based assignment, decision reasons, and receipts for later conversions.

## What it does

- The same salt and `subjectId` always give the same variant (`WeightedHashAssignmentStrategy`).
- Weighted variants, and a forced variant for QA validated against an allow-list.
- Every `Assignment` carries a `reason` (`assigned`, `forced`, `fallback_*`) and a `source` (`computed`, `store`).
- `assign()` is pure. `trackExposure()` and `trackConversion()` are explicit and return events.
- `AssignmentReceipt` links a conversion to the original exposure in a later request.
- Targeting rules, with a fallback variant on mismatch.
- Sticky variants through `AssignmentStore`, which drops stale pins when weights change.
- Logger sinks, composite and deduplicating trackers; a reset hook for RoadRunner and Swoole.

## Example

```php
$assignment = $ab->assign(experiment: 'checkout-button', subjectId: (string) $userId);

if ($assignment->isVariant('green')) {
    // Show green button.
}

// assign() does NOT auto-track. Call explicitly:
$exposure = $ab->trackExposure($assignment);
$ab->trackConversion($assignment, goal: 'purchase', exposure: $exposure);
```

## More examples

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
$tracker->trackExposure($assignment);
$tracker->trackExposure($assignment); // suppressed in this request
```

## Family

| Package | Role |
|---|---|
| yii3-ab-testing-db | DB provider and sticky store |
| yii3-ab-testing-web | Cookie sticky store, `SubjectIdMiddleware` |
| yii3-ab-testing-outbox | Durable delivery of events |
| yii3-ab-testing-clickhouse | Analytics export |

## Limits

Changing weights or the variant set shifts bucket boundaries and reshuffles some subjects. Only a new salt freezes a cohort. Needs 64-bit PHP.
