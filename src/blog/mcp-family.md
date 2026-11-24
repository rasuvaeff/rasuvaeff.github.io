---
title: "An MCP server without a framework: how and why yii3-mcp was split"
description: "The core of yii3-mcp and its OpenAPI bridge became the packages mcp and mcp-openapi. What changed for Yii3, which bugs turned up on the way, and what is planned for Laravel and Symfony."
date: 2026-11-24
outline: [2, 3]
figures:
  - ["2", "new packages"]
  - ["102 → 7", "classes in yii3-mcp"]
  - ["8", "releases"]
  - ["54/56", "operations unchanged"]
---

The Model Context Protocol lets an AI agent call your application's methods as tools. For Yii3 I have [yii3-mcp](/packages/yii3-mcp): a server on the official `mcp/sdk`, an OpenAPI bridge and three packages beside it (RBAC, audit, traces). Fans' agents reach the guestbook of [CSKA.IN](/blog/cska-in) through it.

Yet almost none of its code knew anything about Yii3. On 23 and 24 November I moved that code into two packages that depend on no framework: [mcp](/packages/mcp) and [mcp-openapi](/packages/mcp-openapi). `yii3-mcp` 6.0 now wires them into Yii3 and does only that.

---

## Why

**The code was shared already.** `yii3-mcp` 5.0.1 had 102 classes and interfaces. The HTTP endpoint is PSR-15, tools come from a PSR-11 container, the commands stand on `symfony/console`. What depended on Yii3 was reading the configuration, the DI wiring and the `mcp:doctor` check. After the split `yii3-mcp` has 7 classes, `mcp` has 65 and `mcp-openapi` has 27.

**Nobody on Slim, Laravel or Symfony installs a Yii3 package.** Its name and dependencies say "not for you", although the server would work there.

**A copy per framework would drift.** Checking the secret, binding a session to its client, call limits, OAuth: a mistake in that code is expensive, and it should be fixed in one place.

**The OpenAPI bridge is useful on its own.** To give an agent a few operations of an existing API you need a document, a PSR-18 HTTP client and PSR-17 factories.

## What came out

| Package | Version | Responsible for |
|---|---|---|
| [`mcp`](/packages/mcp) | 0.1.0 | Server, endpoint, sessions, OAuth, interceptors, visibility, test helpers |
| [`mcp-openapi`](/packages/mcp-openapi) | 0.1.0 | Allow-listed OpenAPI operations as tools |
| [`yii3-mcp`](/packages/yii3-mcp) | 6.0.0 | Wiring into Yii3: configuration, DI, `mcp:doctor` |
| [`yii3-mcp-rbac-bridge`](/packages/yii3-mcp-rbac-bridge) | 2.0.0 | User permissions on tools |
| [`yii3-mcp-audit-log-bridge`](/packages/yii3-mcp-audit-log-bridge) | 3.0.0 | Log of calls |
| [`yii3-mcp-telemetry-bridge`](/packages/yii3-mcp-telemetry-bridge) | 2.0.0 | Traces and metrics |

The split itself needed two more releases: [`openapi-contract`](/packages/openapi-contract) 0.19 and [`property-testing-openapi`](/packages/property-testing-openapi) 0.23.

A server without a framework looks like this:

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

`McpAction` is an ordinary PSR-15 handler. Put the secret check or OAuth in front of it and let the router do the rest.

## What turned up on the way

Moving the code unchanged would have been easier. But the new packages got checks on their first day that the old one never had.

**Somebody else's client id.** It lived in a static variable, one per process. Under PHP-FPM that is safe: a process serves one request at a time. Under Swoole, or with interleaved Fibers, two calls without a session owner could lose the id or exchange it. The test with two Fibers was red first. Now the id travels in the request's own access token, and there is no static state.

**A second OpenAPI parser.** The bridge parsed documents itself while [openapi-contract](/packages/openapi-contract) lived next door. Now it does the compiling. Compared on 56 operations, 54 matched completely and two got better (recursive schemas and `allOf`).

**Real documents.** Petstore worked before, so I took bigger APIs, 60 random operations each:

| Document | Bridge 5.0.1 | First version of the new one | After the fixes |
|---|---|---|---|
| DigitalOcean, 2 MB | did not load | 14 of 60 | 55 of 60 |
| Stripe, 8 MB | did not load | 13 of 60 | 30 of 60 |
| Petstore (all 19) | 18 | 18 | 18 |

Two causes of the losses were bugs. A percent-encoded `$ref` did not find its schema, and a response schema that was too large brought down the whole operation. Both are fixed. The rest are plain limits: `deepObject`, `anyOf` in parameters, headers and cookies are refused for now, and a Stripe operation takes about 4.5 seconds and up to 1.4 GB to build. For documents of that size the bridge is not suitable yet.

## How it was checked before release

- PHP 8.3–8.6 and the oldest allowed versions of the dependencies. The telemetry bridge still stops at 8.5.
- Mutation tests: `yii3-mcp` 98% against a gate of 97, audit 92 against 90, RBAC and telemetry 100 each.
- Two whole applications: the demo sandbox and the code of CSKA.IN, the latter on a separate stand without the production database. A foreign key with a foreign session got a 404; in 200 parallel calls with two keys no answers were mixed up.

The applications found something a package cannot see from inside: if the code names `Rasuvaeff\Mcp\*` classes, the application needs a direct dependency on `rasuvaeff/mcp`. That went into the upgrade guide.

One thing I missed: after the 6.0 release the build of the old documentation site went red, because its pages linked to classes that had moved. The site itself stayed up, and the same day the documentation moved to [rasuvaeff.github.io/mcp](https://rasuvaeff.github.io/mcp/); the old addresses now lead there.

## Upgrading from 5.x

```bash
composer require rasuvaeff/yii3-mcp:^6.0 rasuvaeff/mcp:^0.1
```

The bridges are upgraded in the same step. In the code, imports change:

| Before | After |
|---|---|
| `Rasuvaeff\Yii3Mcp\OpenApi\ExecutionIdentity*` | `Rasuvaeff\Mcp\Identity\ExecutionIdentity*` |
| `Rasuvaeff\Yii3Mcp\OpenApi\*` | `Rasuvaeff\Mcp\OpenApi\*` |
| `Rasuvaeff\Yii3Mcp\Doctor\*`, `McpDoctorCommand` | unchanged |
| any other `Rasuvaeff\Yii3Mcp\*` | `Rasuvaeff\Mcp\*` |

There are no aliases. Session, cache and configuration keys are the same, and open sessions survive the upgrade. Markdown prompts are removed: a non-empty `prompts_path` now fails the server build, so that prompts cannot vanish silently. `#[McpPrompt]` prompts stay. Details are in [UPGRADE.md](https://github.com/rasuvaeff/yii3-mcp/blob/master/UPGRADE.md).

## Next: Laravel and Symfony

The next stage is `rasuvaeff/laravel-mcp` and `rasuvaeff/symfony-mcp`. They are not written yet and I promise no dates. The plan:

- **Laravel:** a service provider and publishable config, a route and Artisan commands, state reset under Octane, Swoole and RoadRunner.
- **Symfony:** a bundle with a configuration tree, a controller and console commands, service reset through `kernel.reset`.

Both must stay thin: the server and the OpenAPI bridge come from `mcp` and `mcp-openapi`, with no copies. For that `mcp` will get a shared suite of behaviour tests, and every adapter, Yii3 included, will run it against its own build.

If you need MCP in a PSR-15 application right now, no adapter is required: `composer require rasuvaeff/mcp`.
