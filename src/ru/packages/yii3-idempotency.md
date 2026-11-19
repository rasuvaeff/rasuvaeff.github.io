---
title: yii3-idempotency
description: "PSR-15 middleware для Idempotency-Key, которое не даёт обработать POST, PUT и PATCH повторно."
outline: [2, 2]
---

# yii3-idempotency

PSR-15 middleware для `Idempotency-Key`. Один и тот же ключ с тем же телом запускает обработчик один раз.

<PackageMeta slug="yii3-idempotency" :src="27" :tests="33" />

## Задача

Повторённые или дважды отправленные запросы запускают обработчик дважды. Без привязки к вызывающему один клиент мог бы ещё и воспроизвести чужой ключ или заблокировать его.

## Что умеет

- Тот же ключ и тот же payload воспроизводят сохранённый ответ с заголовком `Idempotency-Replay: true`.
- Тот же ключ с другим payload отвечает `422`; дубликат, который ещё выполняется, отвечает `409`.
- Отпечаток покрывает метод, путь, query и тело.
- `scopeResolver` обязателен: ключи разделяются по вызывающим.
- Кешируются только 2xx-ответы обработчика; остальные снимают claim.
- `DomainFailureRenderer` и `FailureClassifier` кешируют доменные ошибки, поэтому `InsufficientFunds` не выполняется повторно.
- `cacheableRedirectStatuses` кеширует `303` для форм Post/Redirect/Get.
- `Set-Cookie`, `Date` и hop-by-hop заголовки никогда не сохраняются.

## Пример

```php
$middleware = new IdempotencyMiddleware(
    keyExtractor: new HeaderIdempotencyKeyExtractor(),
    storage: new InMemoryIdempotencyStorage($clock),
    responseFactory: $responseFactory,
    clock: $clock,
    scopeResolver: new RequestAttributeScopeResolver(attribute: 'user'), // who a key belongs to
    ttlSeconds: 3600,
);
```

## Ещё примеры

Кеширует детерминированные доменные ошибки как воспроизводимые ответы; баги и сбои инфраструктуры остаются повторяемыми.

```php
$middleware = new IdempotencyMiddleware(
    keyExtractor: new HeaderIdempotencyKeyExtractor(),
    storage: $storage,
    responseFactory: $responseFactory,
    clock: $clock,
    scopeResolver: new RequestAttributeScopeResolver(attribute: 'user'),
    domainFailureRenderer: $renderer,                     // your DomainFailureRenderer
    failureClassifier: new DefaultFailureClassifier([     // optional overrides
        MisconfiguredGatewayException::class => FailureKind::Bug,
    ]),
);
```

Сохраняет и повторяет редирект 303, чтобы двойная отправка формы не запускала обработчик дважды.

```php
$middleware = new IdempotencyMiddleware(
    // ... keyExtractor, storage, responseFactory, clock, scopeResolver ...
    cacheableRedirectStatuses: [303],
);
```

Ограничивает ключи идемпотентности вызывающим и эндпоинтом, чтобы одинаковые ключи не конфликтовали.

```php
// caller + "METHOD /path" — the wiring the bundled config builds by default
scopeResolver: new CompositeScopeResolver(
    new RequestAttributeScopeResolver(attribute: 'user'),
    new RequestTargetScopeResolver(),
);

// caller + an explicit namespace shared by related endpoints
scopeResolver: new CompositeScopeResolver(
    new RequestAttributeScopeResolver(attribute: 'user'),
    new IdempotencyScope('orders'),
);
```

## Семейство

`yii3-idempotency-db` даёт `DbIdempotencyStorage`; `yii3-idempotency-redis` — Redis-backend.

## Ограничения

Анонимные вызывающие делят одно пространство имён, поэтому не прячьте приватные данные вызывающего за анонимным идемпотентным эндпоинтом. `SharedKeyspaceScopeResolver` — задокументированный отказ от изоляции, безопасный только для единственного субъекта.
