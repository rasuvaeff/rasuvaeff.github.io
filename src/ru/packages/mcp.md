---
title: mcp
package: mcp
section: 3
layout: man
description: "MCP-сервер без привязки к фреймворку поверх официального mcp/sdk."
---

## ИМЯ

mcp — MCP-сервер без привязки к фреймворку поверх официального mcp/sdk

## ОБЗОР

<ManInstall />

```php
final readonly class OrderTools
{
    public function __construct(private OrderRepository $orders) {}

    #[McpTool(name: 'order.status')]
    public function status(string $orderId): string
    {
        return $this->orders->get($orderId)->status;
    }
}
```

## ОПИСАНИЕ

Ядро MCP-сервера. Зависит от официального `mcp/sdk`, интерфейсов PSR и двух компонентов Symfony, но не от фреймворка.

SDK отвечает за протокол. Пакет добавляет то, что нужно приложению вокруг него: tools через любой контейнер PSR-11, защиту от циклов агента, видимость по сессиям, привязку сессии к клиенту и OAuth.

- `McpServerFactory` собирает сервер SDK из классов с методами `#[McpTool]`, `#[McpResource]` и `#[McpPrompt]`.
- `McpAction` — эндпоинт Streamable HTTP на PSR-15; команды `mcp:serve` и `mcp:list` работают в любом приложении на `symfony/console`.
- `SharedSecretMiddleware` работает по принципу fail-closed; `BearerTokenMiddleware` превращает эндпоинт в OAuth 2.1 resource server.
- Интерсепторы оборачивают `tools/call`, `prompts/get` и `resources/read`: бюджет вызовов, rate limit, размер ответа, кеш.
- Идентификатор клиента едет в access token самого запроса, без статического состояния, поэтому чередующиеся Fibers не могут им обменяться.
- `McpTester` и `SchemaSnapshot` тестируют сервер внутри процесса.

## ПРИМЕРЫ

Отдаёт инструменты по HTTP. Одно и то же хранилище сессий передаётся фабрике и действию, которое привязывает сессию к клиенту.

```php
$server = (new McpServerFactory(
    container: $container, // PSR-11
    sessionStore: $store,
    name: 'my-app',
    version: '1.0.0',
))->create([OrderTools::class]);

$action = new McpAction(
    server: $server,
    responseFactory: $psr17,
    streamFactory: $psr17,
    allowedHosts: ['mcp.example.com'],
    sessionStore: $store,
);
```

Ограничивает вызовы. Первый интерсептор — внешний.

```php
$server = $factory->create(
    toolClasses: [OrderTools::class],
    interceptors: [
        new ToolCallBudgetInterceptor(budget: 50, cache: $psr16, window: 3600),
        new ResponseSizeLimitInterceptor(maxBytes: 65_536),
    ],
    toolVisibility: new DeclarativeToolVisibility(deny: ['admin.*']),
);
```

## СМОТРИТЕ ТАКЖЕ

| Пакет | Что добавляет |
|---|---|
| [mcp-openapi](/ru/packages/mcp-openapi)(3) | Операции OpenAPI из allow-list как tools |
| [yii3-mcp](/ru/packages/yii3-mcp)(3) | Подключение к Yii3, конфигурация и `mcp:doctor` |
| [yii3-mcp-rbac-bridge](/ru/packages/yii3-mcp-rbac-bridge)(3) | RBAC по пользователю на tools, для Yii3 |
| [yii3-mcp-audit-log-bridge](/ru/packages/yii3-mcp-audit-log-bridge)(3) | Audit log каждого вызова, для Yii3 |
| [yii3-mcp-telemetry-bridge](/ru/packages/yii3-mcp-telemetry-bridge)(3) | Трассировки и метрики тех же вызовов, для Yii3 |

Руководство и справочник API (на английском): [rasuvaeff.github.io/mcp](https://rasuvaeff.github.io/mcp/). Адаптеры для Laravel и Symfony — следующий этап, они ещё не выпущены.

## ОШИБКИ

`mcp/sdk` экспериментален до 1.0, отсюда pin `~0.10.0`. Сам пакет 0.x: минорный релиз может ломать API. Бюджет вызовов защищает от циклов, а не служит квотой клиента.
