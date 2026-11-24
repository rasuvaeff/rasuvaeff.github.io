---
title: mcp-openapi
package: mcp-openapi
section: 3
layout: man
description: "Serve allow-listed OpenAPI operations as MCP tools, with no framework."
---

## NAME

mcp-openapi — serve allow-listed OpenAPI operations as MCP tools, with no framework

## SYNOPSIS

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

## DESCRIPTION

Turns chosen operations of an OpenAPI 3.0 or 3.1 document into MCP tools. It needs a document, a PSR-18 client (or a PSR-15 handler) and PSR-17 factories.

A tool is named after its `operationId`, described by `summary` and `description`; parameters and the JSON request body become arguments. Documents are compiled by [openapi-contract](/packages/openapi-contract)(3).

- Only the operations you list are served; an empty list serves nothing.
- `safeMethodsOnly` refuses anything but GET when the server is built.
- A broken operation that is not listed does not refuse the document.
- Shared schemas are inlined; a recursive one stays a reference with its definition in the tool schema.
- `inProcessHandler` calls the application's own PSR-15 handler with no network I/O.
- `opaqueErrors` hides upstream error bodies from the model.

## EXAMPLES

Attaches the bridge to a server from [mcp](/packages/mcp)(3).

```php
$server = (new McpServerFactory(
    container: $container,
    sessionStore: $sessionStore,
    name: 'my-api',
    version: '1.0.0',
))->create([], [$bridge]);
```

## SEE ALSO

[mcp](/packages/mcp)(3), [yii3-mcp](/packages/yii3-mcp)(3), [openapi-contract](/packages/openapi-contract)(3), [property-testing-openapi](/packages/property-testing-openapi)(3)

## BUGS

Header and cookie parameters, `deepObject` and non-JSON request bodies are refused. The document is JSON up to 10 MiB. Very large documents are slow: an operation of the 8 MB Stripe document takes about 4.5 s and up to 1.4 GB to build. The document and `baseUrl` are trusted configuration: there is no SSRF protection.
