---
title: laravel-mcp
package: laravel-mcp
section: 3
layout: man
description: "The rasuvaeff/mcp MCP server in Laravel: tools from the container, Streamable HTTP, stdio."
---

## NAME

laravel-mcp — the [mcp](/packages/mcp)(3) server in Laravel: tools from the container, Streamable HTTP, stdio

## SYNOPSIS

<ManInstall />

```bash
php artisan vendor:publish --tag=rasuvaeff-mcp
```

```php
// config/rasuvaeff-mcp.php: these keys sit inside the array the published file returns
'tools' => [App\Mcp\OrderTools::class],
'endpoint_secret' => env('MCP_SECRET', ''),
'allowed_hosts' => ['mcp.example.com'],
```

## DESCRIPTION

A service provider, a published config file, the `/mcp` route and the `mcp:list` / `mcp:serve` commands. The options are the ones [yii3-mcp](/packages/yii3-mcp)(3) reads; [mcp-openapi](/packages/mcp-openapi)(3) turns REST operations into tools. Laravel 12.41 and 13.

- Without a secret the endpoint answers 503 to everything; `guard: oauth` makes it an OAuth 2.1 resource server.
- The route is outside the `web` group: no cookie session, no CSRF token.
- Under Octane the server is built per request; `config:cache` works.
- The cache the server counts with keeps the types of numbers: on Laravel's Redis store the call budget would not limit otherwise.

Checked on real applications: FrankenPHP (classic and worker), Swoole and RoadRunner, PHP 8.3–8.6, Redis on two nodes, Keycloak.

## EXAMPLES

A tool is a container service:

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

## SEE ALSO

[mcp](/packages/mcp)(3), [symfony-mcp](/packages/symfony-mcp)(3), [yii3-mcp](/packages/yii3-mcp)(3), [mcp-openapi](/packages/mcp-openapi)(3)

The guide: [rasuvaeff.github.io/mcp/laravel/getting-started](https://rasuvaeff.github.io/mcp/laravel/getting-started). The official package is [`laravel/mcp`](https://github.com/laravel/mcp); this one is for the same server code in several frameworks.

## BUGS

Under RoadRunner a `subscriptions/listen` stream arrives in one piece when it ends. The call budget is loop protection, not a quota: calls sent at the same moment may all pass.
