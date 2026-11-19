---
title: schema
package: schema
section: 3
layout: man
description: "Одна схема, которая и валидирует входные данные, и генерирует для них тестовые данные."
---

## ИМЯ

schema — одна схема, которая и валидирует входные данные, и генерирует для них тестовые данные

## ОБЗОР

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

## ОПИСАНИЕ

Одна схема разбирает входные данные в рантайме и генерирует для них тестовые данные.

Правила валидации и тестовые генераторы, написанные отдельно, расходятся, и тесты слепы к тому, что пропускает прод. Здесь одна схема управляет `parse()` и `arbitrary()`, а собственный property-набор пакета фиксирует их соответствие.

- `Schema::object`, `string`, `int`, `float`, `enum`, `arrayOf`, `mapOf`, литералы, `dateTime`.
- `parse()` возвращает ошибки с JSONPath и указателями RFC 6901; также есть `parseOrThrow` и `parseJson`.
- Режимы неизвестных ключей: `Reject`, `Strip`, `Passthrough`.
- `requireAnyOf`, `extend`, `pick`, `omit`, `partial` для композиции объектов.
- `arbitrary()` даёт генератор property-тестирования для того же множества значений.
- Сообщения называют только виды и размеры, никогда само значение-нарушитель.
- Psalm-плагин выводит array shapes из объявления.
- `into()` гидрирует DTO; в комплекте мост к `yiisoft/validator`.

## ПРИМЕРЫ

Собирает все ошибки валидации с путём и JSON Pointer, не раскрывая сами значения.

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

Композиция объектных схем: «хотя бы одно из полей», extend, pick, omit и partial для PATCH.

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

Схема как правило yiisoft/validator: ошибки попадают на точные вложенные пути.

```php
$result = (new Validator())->validate($data, [
    'payload' => [new SchemaRule(Schema::object([
        'items' => Schema::arrayOf(Schema::object(['sku' => Schema::string()->min(1)])),
    ]))],
]);

$result->getErrorMessagesIndexedByPath();
// ['payload.items.1.sku' => ['String length must be at least 1, got 0']]
```

## СМОТРИТЕ ТАКЖЕ

`property-testing-core` — runtime-зависимость (порт генератора). Используйте генератор в property-тестах через `property-testing-testo`.

## ОШИБКИ

Psalm-плагин не кодирует ограничения: `int()->min(0)` выводится как `int`, а не `int<0, max>`, и `string()->min(1)` выводится как `string`. Сужайте вручную.
