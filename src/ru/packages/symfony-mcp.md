---
title: symfony-mcp
package: symfony-mcp
section: 3
layout: man
description: "MCP-сервер rasuvaeff/mcp как бандл Symfony: инструменты из контейнера, Streamable HTTP, stdio."
---

## ИМЯ

symfony-mcp — сервер [mcp](/ru/packages/mcp)(3) как бандл Symfony: инструменты из контейнера, Streamable HTTP, stdio

## ОБЗОР

<ManInstall />

```php
// config/bundles.php
return [
    Rasuvaeff\SymfonyMcp\RasuvaeffMcpBundle::class => ['all' => true],
];
```

```yaml
# config/packages/rasuvaeff_mcp.yaml
rasuvaeff_mcp:
    tools: ['App\Mcp\OrderTools']
    endpoint_secret: '%env(MCP_SECRET)%'
    allowed_hosts: ['mcp.example.com']
```

## ОПИСАНИЕ

Бандл: маршрут `/mcp`, команды `mcp:list` / `mcp:serve` и настройки, которые читает [yii3-mcp](/ru/packages/yii3-mcp)(3), под ключом `rasuvaeff_mcp`. [mcp-openapi](/ru/packages/mcp-openapi)(3) превращает операции REST в инструменты. Symfony 7.4 и 8.

- Без секрета эндпоинт отвечает 503 на всё; `guard: oauth` делает его resource server OAuth 2.1.
- В настройках работает `%env()%`: они проверяются при первой сборке сервера.
- Между запросами worker сервер сбрасывается через `kernel.reset`; своё хранилище сессий или шина заменяют стандартные.
- Объект инструмента живёт между запросами worker: не храните в нём состояние запроса или реализуйте `ResetInterface`.

Проверено на настоящих приложениях: FrankenPHP (обычный режим и worker), Swoole и RoadRunner, PHP 8.3–8.6, Redis на двух узлах, Keycloak.

## ПРИМЕРЫ

Инструмент — сервис контейнера:

```php
use Mcp\Server\Capability\Attribute\McpTool;

final readonly class OrderTools
{
    public function __construct(private OrderRepository $orders) {}

    #[McpTool(name: 'order.status')]
    public function status(string $orderId): string
    {
        return $this->orders->status($orderId);
    }
}
```

## СМОТРИТЕ ТАКЖЕ

[mcp](/ru/packages/mcp)(3), [laravel-mcp](/ru/packages/laravel-mcp)(3), [yii3-mcp](/ru/packages/yii3-mcp)(3), [mcp-openapi](/ru/packages/mcp-openapi)(3)

Руководство (на английском): [rasuvaeff.github.io/mcp/symfony/getting-started](https://rasuvaeff.github.io/mcp/symfony/getting-started). Официальный бандл — [`symfony/mcp-bundle`](https://github.com/symfony/mcp-bundle) на том же `mcp/sdk`; этот нужен, когда один и тот же код сервера работает в нескольких фреймворках.

## ОШИБКИ

Под RoadRunner поток `subscriptions/listen` приходит целиком, когда закончится. Класс инструмента, исключённый через `exclude:` в `services.yaml`, не даёт контейнеру собраться.
