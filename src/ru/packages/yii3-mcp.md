---
title: yii3-mcp
package: yii3-mcp
section: 3
layout: man
description: "Сервер Model Context Protocol для Yii3 на официальном mcp/sdk поверх PSR-15."
---

## ИМЯ

yii3-mcp — сервер Model Context Protocol для Yii3 на официальном mcp/sdk поверх PSR-15

## ОБЗОР

<ManInstall />

```php
final readonly class OrderTools
{
    public function __construct(private OrderRepository $orders) {}

    /**
     * Returns the current status of an order.
     */
    #[McpTool(name: 'order.status')]
    public function status(string $orderId): string
    {
        return $this->orders->get($orderId)->status->value;
    }
}
```

## ОПИСАНИЕ

Сервер Model Context Protocol для Yii3, построенный на официальном `mcp/sdk` и работающий поверх PSR-15. С версии 6.0 сам сервер живёт в [mcp](/ru/packages/mcp)(3), мост OpenAPI — в [mcp-openapi](/ru/packages/mcp-openapi)(3), а этот пакет подключает их к Yii3: конфигурация, DI и `mcp:doctor`.

Чтобы отдать операции приложения ИИ-агентам как tools, resources и prompts, нужны Streamable HTTP эндпоинт, tools, разрешаемые через контейнер, и защита от циклов агента и утечек секретов.

- Методы с `#[McpTool]`, `#[McpResource]` и `#[McpPrompt]` разрешаются через DI-контейнер.
- На одном эндпоинте обслуживает ревизии handshake от 2024-11-05 до 2025-11-25 и stateless 2026-07-28.
- `SharedSecretMiddleware` работает по принципу fail-closed; `BearerTokenMiddleware` превращает сервер в OAuth 2.1 resource server.
- `tool_call_budget` ограничивает число `tools/call` подряд, чтобы остановить циклы агента.
- Интерсепторы для rate limit, ограничения размера ответа и кеширования через PSR-16, плюс помощник `ArgumentMasker` для маскирования секретов в аргументах.
- Видимость tools, prompts и resources для каждой сессии.
- `OpenApiServerConfigurator` пробрасывает REST-операции из allow-list как tools.
- `McpTester`, `SchemaSnapshot`, `mcp:doctor`, `mcp:list` и stdio `mcp:serve`.

## ПРИМЕРЫ

Сообщает MCP-клиентам, что инструмент изменяет данные и деструктивен, через штатные аннотации SDK.

```php
#[McpTool(
    name: 'order.cancel',
    annotations: new ToolAnnotations(
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
    ),
)]
public function cancel(string $orderId): string
{
    $this->orders->cancel($orderId);

    return 'cancelled';
}
```

Ограничивает число подряд идущих tools/call: зациклившийся агент получает ошибку вместо нагрузки на приложение.

```php
'rasuvaeff/yii3-mcp' => [
    'tool_call_budget' => [
        'calls' => 50,     // 0 = unlimited (default)
        'window' => 3600,  // seconds, stateless era only
    ],
],
```

Тестирует инструменты в процессе через реальный Streamable HTTP-путь, без сервера и stdio.

```php
$tester = new McpTester($server, $psr17, $psr17, $psr17);

$result = $tester->callTool('order.status', ['orderId' => '42']);
$this->assertSame('paid', $result['content'][0]['text']);

$tester->listTools();                 // every paginated tool definition
$tester->listResources();             // every resource definition
$tester->readResource('app://x');     // resource contents
```

## СМОТРИТЕ ТАКЖЕ

| Пакет | Что добавляет |
|---|---|
| [mcp](/ru/packages/mcp)(3) | Сам сервер, без фреймворка |
| [mcp-openapi](/ru/packages/mcp-openapi)(3) | Операции OpenAPI как tools |
| [yii3-mcp-rbac-bridge](/ru/packages/yii3-mcp-rbac-bridge)(3) | RBAC по пользователю на tools |
| [yii3-mcp-audit-log-bridge](/ru/packages/yii3-mcp-audit-log-bridge)(3) | Audit log каждого вызова |
| [yii3-mcp-telemetry-bridge](/ru/packages/yii3-mcp-telemetry-bridge)(3) | Трассировки тех же вызовов |

## ОШИБКИ

`mcp/sdk` экспериментален до 1.0, отсюда pin `~0.10.0`. Бюджет вызовов tools защищает от циклов, а не служит квотой клиента. В stateless-режиме без `SharedSecretMiddleware` все анонимные вызывающие делят один бюджет.
