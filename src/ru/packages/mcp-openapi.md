---
title: mcp-openapi
package: mcp-openapi
section: 3
layout: man
description: "Операции OpenAPI из allow-list как MCP-инструменты, без фреймворка."
---

## ИМЯ

mcp-openapi — операции OpenAPI из allow-list как MCP-инструменты, без фреймворка

## ОБЗОР

<ManInstall />

```php
$bridge = OpenApiBridgeFactory::create(
    spec: __DIR__ . '/openapi.json', // JSON file, URL or decoded array
    baseUrl: 'https://api.example.com',
    httpClient: $httpClient,
    requestFactory: $psr17,
    streamFactory: $psr17,
    operations: ['getBlogTags'],
    safeMethodsOnly: true,
    toolNames: ['getBlogTags' => 'blog_tags_list'],
);
```

## ОПИСАНИЕ

Превращает выбранные операции документа OpenAPI 3.0 или 3.1 в MCP-инструменты. Нужны документ, клиент PSR-18 (или обработчик PSR-15) и фабрики PSR-17.

Инструмент называется по `operationId`, описывается через `summary` и `description`; параметры и JSON-тело запроса становятся аргументами. Документы компилирует [openapi-contract](/ru/packages/openapi-contract)(3).

- Отдаются только перечисленные операции; пустой список не отдаёт ничего.
- `safeMethodsOnly` отказывает всему, кроме GET, ещё при сборке сервера.
- Сломанная операция, которой нет в списке, не мешает загрузить документ.
- Общие схемы встраиваются; рекурсивная остаётся ссылкой, а её определение лежит в схеме инструмента.
- `inProcessHandler` вызывает PSR-15-обработчик самого приложения без сети.
- `opaqueErrors` скрывает от модели тела ошибок вышестоящего API.

## ПРИМЕРЫ

Подключает мост к серверу из [mcp](/ru/packages/mcp)(3).

```php
$server = (new McpServerFactory(
    container: $container,
    sessionStore: $sessionStore,
    name: 'my-api',
    version: '1.0.0',
))->create([], [$bridge]);
```

## СМОТРИТЕ ТАКЖЕ

[mcp](/ru/packages/mcp)(3), [yii3-mcp](/ru/packages/yii3-mcp)(3), [openapi-contract](/ru/packages/openapi-contract)(3), [property-testing-openapi](/ru/packages/property-testing-openapi)(3)

## ОШИБКИ

Параметры в заголовках и cookie, `deepObject` и тела запроса не в JSON отклоняются. Документ — JSON до 10 МиБ. Очень большие документы медленные: операция из документа Stripe (8 МБ) собирается около 4,5 с и требует до 1,4 ГБ. Документ и `baseUrl` — доверенная конфигурация, защиты от SSRF нет.
