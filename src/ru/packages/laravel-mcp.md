---
title: laravel-mcp
package: laravel-mcp
section: 3
layout: man
description: "MCP-сервер rasuvaeff/mcp в Laravel: инструменты из контейнера, Streamable HTTP, stdio."
---

## ИМЯ

laravel-mcp — сервер [mcp](/ru/packages/mcp)(3) в Laravel: инструменты из контейнера, Streamable HTTP, stdio

## ОБЗОР

<ManInstall />

```bash
php artisan vendor:publish --tag=rasuvaeff-mcp
```

```php
// config/rasuvaeff-mcp.php
'tools' => [App\Mcp\OrderTools::class],
'endpoint_secret' => env('MCP_SECRET', ''),
'allowed_hosts' => ['mcp.example.com'],
```

## ОПИСАНИЕ

Service provider, публикуемый файл настроек, маршрут `/mcp` и команды `mcp:list` / `mcp:serve`. Настройки те же, что читает [yii3-mcp](/ru/packages/yii3-mcp)(3); [mcp-openapi](/ru/packages/mcp-openapi)(3) превращает операции REST в инструменты. Laravel 12.41 и 13.

- Без секрета эндпоинт отвечает 503 на всё; `guard: oauth` делает его resource server OAuth 2.1.
- Маршрут вне группы `web`: ни сессии в cookie, ни CSRF-токена.
- Под Octane сервер собирается на каждый запрос; `config:cache` работает.
- Кеш, через который сервер считает, сохраняет типы чисел: иначе на Redis-хранилище Laravel лимит вызовов не действовал бы.

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

[mcp](/ru/packages/mcp)(3), [symfony-mcp](/ru/packages/symfony-mcp)(3), [yii3-mcp](/ru/packages/yii3-mcp)(3), [mcp-openapi](/ru/packages/mcp-openapi)(3)

Руководство (на английском): [rasuvaeff.github.io/mcp/laravel/getting-started](https://rasuvaeff.github.io/mcp/laravel/getting-started). Официальный пакет — [`laravel/mcp`](https://github.com/laravel/mcp); этот нужен, когда один и тот же код сервера работает в нескольких фреймворках.

## ОШИБКИ

Под RoadRunner поток `subscriptions/listen` приходит целиком, когда закончится. Лимит вызовов защищает от циклов, это не квота: одновременные вызовы могут пройти все.
