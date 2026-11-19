---
title: schema
package: schema
section: 3
layout: man
description: "One schema that both validates input and generates test data for it."
---

## NAME

schema — one schema that both validates input and generates test data for it

## SYNOPSIS

<ManInstall />

```php
$user = Schema::object([
    'email' => Schema::string()->min(3)->max(254),
    'age' => Schema::int()->min(18)->max(120),
    'role' => Schema::enum(Role::class),                  // backed enum
    'tags' => Schema::arrayOf(Schema::string()->min(1))->maxCount(20),
    'bio' => Schema::string()->max(1000)->default(''),    // default ≡ optional
    'score' => Schema::float()->min(0.0)->max(1.0),       // finite floats only
]);

$result = $user->parse($payload);
```

## DESCRIPTION

One schema parses runtime input and generates test data for it.

Validation rules and test generators written apart drift, so tests are blind to what production lets through. Here one schema drives `parse()` and `arbitrary()`, and the package's own property suite pins their parity.

- `Schema::object`, `string`, `int`, `float`, `enum`, `arrayOf`, `mapOf`, literals, `dateTime`.
- `parse()` returns errors with JSONPath and RFC 6901 pointers; also `parseOrThrow` and `parseJson`.
- Unknown-key modes: `Reject`, `Strip`, `Passthrough`.
- `requireAnyOf`, `extend`, `pick`, `omit`, `partial` for composing objects.
- `arbitrary()` yields a property-testing generator for the same value set.
- Messages state kinds and sizes only, never the offending value.
- A Psalm plugin infers array shapes from the declaration.
- `into()` hydrates DTOs; a `yiisoft/validator` bridge is included.

## EXAMPLES

Collects every validation error with its path and JSON pointer, never echoing the offending value.

```php
$user = Schema::object([
    'email' => Schema::string()->min(3)->max(254),
    'age' => Schema::int()->min(18)->max(120),
]);

$result = $user->parse($payload);

if (!$result->ok) {
    foreach ($result->errors as $error) {
        $error->toPath();
        $error->toJsonPointer();
        $error->message;  // kinds and sizes only, never the offending value
    }
}

$value = $user->parseOrThrow($payload);  // SchemaException carries every error
```

Composes object schemas: require one of several keys, extend, pick, omit, or make everything optional.

```php
$order = Schema::object([
    'id' => Schema::int()->positive(),
    'email' => Schema::string()->optional(),
    'phone' => Schema::string()->optional(),
])->requireAnyOf('email', 'phone');   // at least one present; calls accumulate

$order->extend(['note' => Schema::string()->optional()]);   // add or replace
$order->pick('id', 'email');                                // keep only these
$order->omit('phone');                                      // drop these
$order->partial();                                          // every key optional (PATCH body)
```

Uses a schema as a yiisoft/validator rule; errors land at their exact nested paths.

```php
$result = (new Validator())->validate($data, [
    'payload' => [new SchemaRule(Schema::object([
        'items' => Schema::arrayOf(Schema::object(['sku' => Schema::string()->min(1)])),
    ]))],
]);

$result->getErrorMessagesIndexedByPath();
// ['payload.items.1.sku' => ['String length must be at least 1, got 0']]
```

## SEE ALSO

`property-testing-core` is a runtime dependency (the generator port). Use the generator in property tests through `property-testing-testo`.

## BUGS

The Psalm plugin does not encode constraints: `int()->min(0)` infers `int`, not `int<0, max>`, and `string()->min(1)` infers `string`. Narrow by hand.
