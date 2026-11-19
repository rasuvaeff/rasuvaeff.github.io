---
title: yii3-mcp
description: Model Context Protocol server for Yii3 on the official mcp/sdk, over PSR-15.
outline: [2, 2]
---

# yii3-mcp

A Model Context Protocol server for Yii3, built on the official `mcp/sdk` and served over PSR-15.

<PackageMeta slug="yii3-mcp" docs="https://rasuvaeff.github.io/yii3-mcp/" :src="102" :tests="62" />

## The problem

Exposing application operations to AI agents as tools, resources and prompts needs a Streamable HTTP endpoint, tools resolved through the container, and guardrails around agent loops and secrets.

## What it does

- `#[McpTool]`, `#[McpResource]` and `#[McpPrompt]` methods resolved through the DI container.
- Serves handshake revisions 2024-11-05 to 2025-11-25 and the stateless 2026-07-28 on one endpoint.
- `SharedSecretMiddleware` is fail-closed; `BearerTokenMiddleware` makes it an OAuth 2.1 resource server.
- `tool_call_budget` caps `tools/call` in a row to stop agent loops.
- Interceptors for rate limits, response size limits and PSR-16 caching, plus an `ArgumentMasker` helper for secrets in arguments.
- Per-session tool, prompt and resource visibility.
- `OpenApiServerConfigurator` bridges allow-listed REST operations as tools.
- `McpTester`, `SchemaSnapshot`, `mcp:doctor`, `mcp:list` and stdio `mcp:serve`.

## Example

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

## Bridges

| Package | Adds |
|---|---|
| yii3-mcp-rbac-bridge | Per-user RBAC on tools |
| yii3-mcp-audit-log-bridge | Audit log for every call |
| yii3-mcp-telemetry-bridge | Traces for the same calls |

## More examples

Tells MCP clients that a tool is mutating and destructive, using the SDK's own annotations.

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

Caps tools/call in a row so a looping agent gets a tool error instead of hammering the app.

```php
'rasuvaeff/yii3-mcp' => [
    'tool_call_budget' => [
        'calls' => 50,     // 0 = unlimited (default)
        'window' => 3600,  // seconds, stateless era only
    ],
],
```

Tests tools in-process through the real Streamable HTTP path, with no server or stdio process.

```php
$tester = new McpTester($server, $psr17, $psr17, $psr17);

$result = $tester->callTool('order.status', ['orderId' => '42']);
$this->assertSame('paid', $result['content'][0]['text']);

$tester->listTools();                 // every paginated tool definition
$tester->listResources();             // every resource definition
$tester->readResource('app://x');     // resource contents
```

## Limits

`mcp/sdk` is experimental until 1.0, hence the `~0.10.0` pin. The tool-call budget is loop protection, not a client quota. On the stateless era without `SharedSecretMiddleware`, all anonymous callers share one budget.
