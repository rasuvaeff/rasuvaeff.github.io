---
title: symfony-mcp
package: symfony-mcp
section: 3
layout: man
description: "The rasuvaeff/mcp MCP server as a Symfony bundle: tools from the container, Streamable HTTP, stdio."
---

## NAME

symfony-mcp — the [mcp](/packages/mcp)(3) server as a Symfony bundle: tools from the container, Streamable HTTP, stdio

## SYNOPSIS

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

## DESCRIPTION

A bundle: the `/mcp` route, the `mcp:list` / `mcp:serve` commands and the options [yii3-mcp](/packages/yii3-mcp)(3) reads, under the `rasuvaeff_mcp` key. [mcp-openapi](/packages/mcp-openapi)(3) turns REST operations into tools. Symfony 7.4 and 8.

- Without a secret the endpoint answers 503 to everything; `guard: oauth` makes it an OAuth 2.1 resource server.
- `%env()%` works in the options; they are validated when the server is first built.
- The server is reset by `kernel.reset` between requests of a worker; a session store or a bus of your own replaces the default.
- A tool object lives across the requests of a worker: keep no request state in it, or implement `ResetInterface`.

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

[mcp](/packages/mcp)(3), [laravel-mcp](/packages/laravel-mcp)(3), [yii3-mcp](/packages/yii3-mcp)(3), [mcp-openapi](/packages/mcp-openapi)(3)

The guide: [rasuvaeff.github.io/mcp/symfony/getting-started](https://rasuvaeff.github.io/mcp/symfony/getting-started). The official bundle is [`symfony/mcp-bundle`](https://github.com/symfony/mcp-bundle), on the same `mcp/sdk`; this one is for the same server code in several frameworks.

## BUGS

Under RoadRunner a `subscriptions/listen` stream arrives in one piece when it ends. A tool class excluded with `exclude:` in `services.yaml` stops the container from compiling.
