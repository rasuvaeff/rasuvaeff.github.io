---
title: mcp
package: mcp
section: 3
layout: man
description: "Framework-neutral Model Context Protocol server runtime over the official mcp/sdk."
---

## NAME

mcp — framework-neutral Model Context Protocol server runtime over the official mcp/sdk

## SYNOPSIS

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

## DESCRIPTION

An MCP server runtime that depends on the official `mcp/sdk`, PSR interfaces and two Symfony components, and on no framework.

The SDK speaks the protocol. This package adds what an application needs around it: tools resolved through any PSR-11 container, guardrails for agent loops, visibility per session, session ownership and OAuth.

- `McpServerFactory` turns classes with `#[McpTool]`, `#[McpResource]` and `#[McpPrompt]` methods into a configured SDK server.
- `McpAction` is a PSR-15 Streamable HTTP endpoint; `mcp:serve` and `mcp:list` work in any `symfony/console` application.
- `SharedSecretMiddleware` is fail-closed; `BearerTokenMiddleware` makes the endpoint an OAuth 2.1 resource server.
- Interceptors wrap `tools/call`, `prompts/get` and `resources/read`: call budget, rate limit, response size, caching.
- The client id travels in the request's own access token, with no static state, so interleaved Fibers cannot exchange it.
- `McpTester` and `SchemaSnapshot` test a server in-process.

## EXAMPLES

Serves the tools over HTTP. The same session store goes to the factory and to the action, which binds a session to its client.

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

Guards the calls. The first interceptor is the outermost one.

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

## SEE ALSO

| Package | Adds |
|---|---|
| [mcp-openapi](/packages/mcp-openapi)(3) | Allow-listed OpenAPI operations as tools |
| [yii3-mcp](/packages/yii3-mcp)(3) | Yii3 wiring, configuration and `mcp:doctor` |
| [laravel-mcp](/packages/laravel-mcp)(3) | Laravel wiring: service provider, route, commands |
| [symfony-mcp](/packages/symfony-mcp)(3) | Symfony bundle: route, commands |
| [yii3-mcp-rbac-bridge](/packages/yii3-mcp-rbac-bridge)(3) | Per-user RBAC on tools, over Yii3 |
| [yii3-mcp-audit-log-bridge](/packages/yii3-mcp-audit-log-bridge)(3) | Audit log for every call, over Yii3 |
| [yii3-mcp-telemetry-bridge](/packages/yii3-mcp-telemetry-bridge)(3) | Traces and metrics for the same calls, over Yii3 |

The guide and API reference: [rasuvaeff.github.io/mcp](https://rasuvaeff.github.io/mcp/).

## BUGS

`mcp/sdk` is experimental until 1.0, hence the `~0.10.0` pin. The package itself is 0.x: a minor release may break the API. The tool-call budget is loop protection, not a client quota.
