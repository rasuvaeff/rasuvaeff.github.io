---
layout: page
title: Victor Razuvaev
titleTemplate: PHP libraries
description: Backend engineer. High-load PHP and Yii, and the libraries published as rasuvaeff/* .
---

<header class="mast">
  <p class="eyebrow">
    <span>Backend engineer</span>
    <span>PHP 8.3+</span>
    <span>Yii3</span>
  </p>
  <h1>Libraries for the parts <em>that break quietly.</em></h1>
  <p class="lede">Victor Razuvaev. Fifteen years of commercial PHP, ten of them in advertising and real-time bidding. I design high-load services, and I publish the pieces other code depends on: deadlines, idempotency, shrinking, doubles that are real calls.</p>
  <div class="mast-actions">
    <a class="btn" href="#work">Nine libraries</a>
    <a class="btn ghost" href="/resume">Resume</a>
    <a class="btn ghost" href="/packages">All 89 packages</a>
  </div>
</header>

<dl class="stats">
  <div><dt>89</dt><dd>packages on Packagist, PHP 8.3+</dd></div>
  <div><dt>15+</dt><dd>years shipping commercial PHP</dd></div>
  <div><dt>10</dt><dd>of those in ad-tech and RTB</dd></div>
  <div><dt>85–100</dt><dd>mutation score on the libraries</dd></div>
</dl>

<section id="work">
  <p class="section-label">The work</p>
  <div class="section-head">
    <h2>What is worth opening.</h2>
    <p>Each block is a real API from the package README, shortened. The interesting part is the decision, not the install command.</p>
  </div>

  <ol class="toc">
    <li><a href="#understudy"><span>01</span><strong>understudy</strong><em>a real call</em></a></li>
    <li><a href="#property-testing-core"><span>02</span><strong>property-testing</strong><em>shrink the failure</em></a></li>
    <li><a href="#context"><span>03</span><strong>context</strong><em>one budget</em></a></li>
    <li><a href="#pinned-http-client"><span>04</span><strong>pinned-http-client</strong><em>the address, not the name</em></a></li>
    <li><a href="#schema"><span>05</span><strong>schema</strong><em>one tree, two ports</em></a></li>
    <li><a href="#resilience"><span>06</span><strong>resilience</strong><em>the right nesting</em></a></li>
    <li><a href="#yii3-ab-testing"><span>07</span><strong>ab-testing</strong><em>no session state</em></a></li>
    <li><a href="#yii3-idempotency"><span>08</span><strong>idempotency</strong><em>one execution</em></a></li>
    <li><a href="#yii3-mcp"><span>09</span><strong>yii3-mcp</strong><em>tools with guards</em></a></li>
  </ol>

  <Exhibit
    n="01"
    pkg="understudy"
    title="The stub is a real method call."
    github="https://github.com/rasuvaeff/understudy"
    packagist="https://packagist.org/packages/rasuvaeff/understudy"
    docs="https://rasuvaeff.github.io/understudy/"
  >

  <template #copy>

  No method name in a string. A rename or a wrong argument is a type error before the test runs, and the double adds no `shouldReceive` of its own for the contract to collide with.

  The call-closure shape is what MockK, FakeItEasy and moq already had. Nothing in PHP did. `for()` returns the contract's own type.

  </template>

  ```php
  use Rasuvaeff\Understudy\Understudy;
  use function Rasuvaeff\Understudy\expect;
  use function Rasuvaeff\Understudy\when;

  $repository = Understudy::for(BookRepository::class);

  when(fn () => $repository->find(123))->returns($book);

  expect(fn () => $repository->save($book))->times(1);
  ```

  

</Exhibit>

  <Exhibit
    n="02"
    pkg="property-testing-core"
    title="Generate hundreds of inputs. Shrink the one that breaks it."
    github="https://github.com/rasuvaeff/property-testing-core"
    packagist="https://packagist.org/packages/rasuvaeff/property-testing-core"
    docs="https://rasuvaeff.github.io/property-testing-core/"
  >

  <template #copy>

  One engine, no test-framework dependency. Testo gets a `#[Property]` attribute, PHPUnit gets `forAll()->check()`. The engine itself never prints and never exits: it returns a result.

  The line that matters is `Changed:`. The shrinker searched; you don't step through 54 to see that 100 is the boundary.

  </template>

  <pre class="tape">Property falsified after 0 successful run(s); seed=42
    Original: value=54
    Shrunk:   value=100 (3 shrink step(s), 11 trial(s))
    <b>Changed:  value=54 -&gt; 100</b>
    Failure:  100 is not below 100</pre>

  ```php
  $definition = new PropertyDefinition(
      id: 'demo::everyIntStaysBelowHundred',
      name: 'everyIntStaysBelowHundred',
      generators: ['value' => Gen::intBetween(0, 10_000)],
      parameterNames: ['value'],
      config: new PropertyConfig(runs: 200, seed: 42),
  );

  $result = (new PropertyRunner())->run(
      $definition,
      new CallableTrialExecutor(/* property body */),
  );
  ```

  

</Exhibit>

  <Exhibit
    n="03"
    pkg="context"
    title="One budget follows the request through every layer."
    github="https://github.com/rasuvaeff/context"
    packagist="https://packagist.org/packages/rasuvaeff/context"
  >

  <template #copy>

  Go's `context.Context`, with no dependencies. A child deadline is never later than its parent. Cancellation is cooperative: the context stops the next step, it does not interrupt a call already in flight.

  The package says plainly where an in-flight call cannot be aborted. HTTP via `context-http`, statement timeouts via `context-db`, worker shutdown via `context-cli`, subprocesses via `context-process`.

  </template>

  ```php
  use Rasuvaeff\Context\Context;

  $root = Context::background();
  [$request, $controller] = $root->withTimeout(3.0);

  $request->assertActive();
  $request->remainingMs();

  foreach ($request->iterate($rows) as $row) {
      process($row); // checked before each pull
  }
  ```

  

</Exhibit>

  <Exhibit
    n="04"
    pkg="pinned-http-client"
    title="Check the address you will actually connect to."
    github="https://github.com/rasuvaeff/pinned-http-client"
    packagist="https://packagist.org/packages/rasuvaeff/pinned-http-client"
  >

  <template #copy>

  A URL checked as public is still dangerous if DNS answers `127.0.0.1` or the cloud metadata address a moment later. Checking the host name is not an SSRF defence.

  The client resolves the name once, refuses the host if any address is non-public, and pins cURL to exactly those addresses. Redirects are a new untrusted URL, so each hop goes through the pin again.

  </template>

  ```php
  use GuzzleHttp\Psr7\Request;
  use Rasuvaeff\PinnedHttpClient\PinnedClient;
  use Rasuvaeff\PinnedHttpClient\RedirectFollower;

  $client = new PinnedClient();

  $response = (new RedirectFollower($client))
      ->sendRequest(new Request('GET', $untrustedUrl));
  ```

  

</Exhibit>

  <Exhibit
    n="05"
    pkg="schema"
    title="The validator and the generator are the same tree."
    github="https://github.com/rasuvaeff/schema"
    packagist="https://packagist.org/packages/rasuvaeff/schema"
  >

  <template #copy>

  Validation rules and test generators drift when they are written apart. Here one schema parses runtime input and feeds property tests. Anything `arbitrary()` generates parses back. The parity is pinned by the package's own property suite.

  Built on `property-testing-core`. A Psalm plugin infers the result shape from the declaration, so the consumer does not restate it.

  </template>

  ```php
  use Rasuvaeff\PropertyTesting\Random;
  use Rasuvaeff\Schema\Schema;

  $user = Schema::object([
      'email' => Schema::string()->min(3)->max(254),
      'age' => Schema::int()->min(18)->max(120),
      'role' => Schema::enum(Role::class),
  ]);

  $value = $user->parseOrThrow($payload);
  $generated = $user->arbitrary()->generate(new Random(42))->value;
  ```

  

</Exhibit>

  <Exhibit
    n="06"
    pkg="resilience"
    title="Retry, breaker and bulkhead, nested so they don't fight."
    github="https://github.com/rasuvaeff/resilience"
    packagist="https://packagist.org/packages/rasuvaeff/resilience"
  >

  <template #copy>

  The three leaves compose with closures, and the composition is easy to get wrong: retrying an open circuit, holding a bulkhead slot during a backoff sleep, treating saturation as a transient error.

  `Pipeline` fixes the order — bulkhead innermost, breaker around it, retry outside — and appends the stop rules onto a copy of your retry policy. The sample below is executed from the README on every build, via `doc-exec`.

  </template>

  ```php
  $pipeline = Pipeline::for('billing')
      ->bulkhead(new SharedBulkhead(
          name: 'billing',
          maxConcurrent: 2,
          store: new InMemoryBulkheadStore(),
          lease: Duration::seconds(5),
          maxWait: Duration::zero(),
      ))
      ->retry(Retry::new()->maxAttempts(maxAttempts: 3)->withImmediate())
      ->circuitBreaker($breaker)
      ->build();

  $pipeline->call(function () use (&$attempt): string {
      if (++$attempt < 2) {
          throw new RuntimeException('transient error');
      }

      return 'succeeded';
  }); // => "succeeded"
  ```

  

</Exhibit>

  <Exhibit
    n="07"
    pkg="yii3-ab-testing"
    title="Same subject, same variant, every time."
    github="https://github.com/rasuvaeff/yii3-ab-testing"
    packagist="https://packagist.org/packages/rasuvaeff/yii3-ab-testing"
    docs="https://rasuvaeff.github.io/yii3-ab-testing/"
  >

  <template #copy>

  Assignment is a hash of subject and salt, not a row in a session. Weighted variants, a forced variant for QA, and exposure recorded only when you say so.

  The family stores definitions (`-db`), ships exposures to ClickHouse (`-clickhouse`), reads the cookie at the edge (`-web`) and publishes through the outbox (`-outbox`).

  </template>

  ```php
  $ab = new AbTesting(
      provider: new ConfigExperimentProvider(config: [
          'checkout-button' => [
              'enabled' => true,
              'salt' => 'checkout-v1',
              'fallbackVariant' => 'control',
              'variants' => ['control' => 50, 'green' => 50],
          ],
      ]),
      strategy: new WeightedHashAssignmentStrategy(),
  );

  $assignment = $ab->assign(
      experiment: 'checkout-button',
      subjectId: (string) $userId,
  );
  ```

  

</Exhibit>

  <Exhibit
    n="08"
    pkg="yii3-idempotency"
    title="Same key and same body run the handler once."
    github="https://github.com/rasuvaeff/yii3-idempotency"
    packagist="https://packagist.org/packages/rasuvaeff/yii3-idempotency"
  >

  <template #copy>

  A retry of a payment or a webhook is not a second charge. The key is scoped to the caller, so two users never share a record. A different body on the same key is 422, not a silent replay. A domain failure can be stored as the outcome, so `InsufficientFunds` is not executed again.

  Backends: `-db` and `-redis`.

  </template>

  ```php
  $middleware = new IdempotencyMiddleware(
      keyExtractor: new HeaderIdempotencyKeyExtractor(),
      storage: $storage,
      responseFactory: $responseFactory,
      clock: $clock,
      scopeResolver: new RequestAttributeScopeResolver(attribute: 'user'),
      domainFailureRenderer: $renderer,
      ttlSeconds: 3600,
  );
  ```

  

</Exhibit>

  <Exhibit
    n="09"
    pkg="yii3-mcp"
    title="Domain methods become tools. The guards are not optional."
    github="https://github.com/rasuvaeff/yii3-mcp"
    packagist="https://packagist.org/packages/rasuvaeff/yii3-mcp"
    docs="https://rasuvaeff.github.io/yii3-mcp/"
  >

  <template #copy>

  An ordinary Yii3 service, annotated with the official MCP SDK attributes. The input schema comes from the signature. Per-user RBAC, the audit log and telemetry are bridges on the same call — `yii3-mcp-rbac-bridge`, `yii3-mcp-audit-log-bridge`, `yii3-mcp-telemetry-bridge` — not a comment in the prompt.

  This is the door cska.in opens for a fan's own agent: the same handlers as the site, with per-key scopes.

  </template>

  ```php
  use Mcp\Schema\ToolAnnotations;
  use Mcp\Server\Capability\Attribute\McpTool;

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

  

</Exhibit>
</section>

<section>
  <p class="section-label">Also on the bench</p>
  <div class="section-head">
    <h2>The rest of the interesting ones.</h2>
    <p>Same standard — Psalm level 1, mutation tests, SemVer — and a narrower job.</p>
  </div>
  <ul class="also">
    <li>
      <a href="https://github.com/rasuvaeff/payments">payments</a>
      <p>Money is integer minor units, never a float. Intents, attempts and a replay-protected webhook ingress, with no provider chosen for you.</p>
    </li>
    <li>
      <a href="https://github.com/rasuvaeff/yii3-outbox">yii3-outbox</a>
      <p>Transactional outbox, with <code>-db</code> and <code>-clickhouse</code>. The webhooks bridge delivers through it instead of beside it.</p>
    </li>
    <li>
      <a href="https://github.com/rasuvaeff/yii3-filestorage">yii3-filestorage</a>
      <p>One storage facade, swappable backends, a deduplication ledger, signed downloads, tenant-scoped attachments, image derivatives.</p>
    </li>
    <li>
      <a href="https://github.com/rasuvaeff/openapi-contract">openapi-contract</a>
      <p>Framework-neutral OpenAPI checks for PSR-7. <code>property-testing-openapi</code> generates the valid and the negative requests from the same document.</p>
    </li>
    <li>
      <a href="https://github.com/rasuvaeff/doc-exec">doc-exec</a>
      <p>Doctest for PHP. Fenced blocks in a README run in CI and the <code>// =&gt;</code> lines are diffs, so the sample cannot rot.</p>
    </li>
    <li>
      <a href="https://github.com/rasuvaeff/link-preview">link-preview</a>
      <p>OpenGraph and Twitter Cards from a URL you do not trust. Fetching goes through the pinned client.</p>
    </li>
    <li>
      <a href="https://github.com/rasuvaeff/json-ld">json-ld</a>
      <p>JSON-LD 1.1: expand, flatten, the node API, RDF and N-Quads.</p>
    </li>
    <li>
      <a href="https://github.com/rasuvaeff/yii3-telemetry">yii3-telemetry</a>
      <p>Traces, with OpenTelemetry export. Metrics, correlation ids, health and the audit log sit next to it.</p>
    </li>
    <li>
      <a href="https://github.com/rasuvaeff/yii3-feature-flags">yii3-feature-flags</a>
      <p>Flags with a database backend and a UI. The A/B family is the sibling that assigns variants.</p>
    </li>
    <li>
      <a href="https://github.com/rasuvaeff/media-converter">media-converter</a>
      <p>A typed ffmpeg/ffprobe pipeline: transcode, remux, filter, retry, bulkhead, progress events.</p>
    </li>
  </ul>
</section>

<section>
  <p class="section-label">Where they run</p>
  <div class="section-head">
    <h2>Not only in isolation.</h2>
  </div>
  <div class="systems">
    <a class="system" href="https://cska.in">
      <p class="kicker">In production · 31 packages</p>
      <h3>cska.in</h3>
      <p>A fan community rebuilt on the same domain from a 20-year-old database. Yii3, PHP 8.5, PostgreSQL, Redis, Temporal, Centrifugo. Live scores, a statistics archive, stories, a guestbook, a Telegram bot and mini-app, and an MCP door with per-key scopes.</p>
      <span class="more">cska.in →</span>
    </a>
    <a class="system" href="https://github.com/rasuvaeff/ecosystem-sandbox">
      <p class="kicker">Runnable · 60+ packages</p>
      <h3>ecosystem-sandbox</h3>
      <p>A Yii3 shop. Checkout and payment run outbox, idempotency, retries, the circuit breaker, webhooks and telemetry in one flow.</p>
      <span class="more">Source →</span>
    </a>
    <a class="system" href="/packages">
      <p class="kicker">Backend</p>
      <h3>Training platform</h3>
      <p>Activity from <code>.fit</code> files, duels and leagues, JWT, S3, Centrifugo, a transactional outbox. Clean Architecture, boundaries checked by Deptrac.</p>
      <span class="more">The libraries →</span>
    </a>
  </div>
  <p class="lede" style="margin-top: 16px; font-size: 15px;">How cska.in is put together, with code from the project: <a href="https://teletype.in/@rasuvaeff/cskain">the write-up</a> (in Russian).</p>
</section>

<section class="band">
  <div>
    <p class="section-label" style="margin-top: 0;">Resume</p>
    <h2>The short version.</h2>
    <p style="margin: 14px 0 0;"><a class="btn" href="/resume">Full resume</a></p>
  </div>
  <ul>
    <li><strong>Now.</strong> Product work on Yii3 / PHP 8.5. Domain, application, infrastructure, endpoint — Deptrac keeps the boundaries. Large Yii2 systems alongside.</li>
    <li><strong>Before that.</strong> Ten years in ad-tech. RTB, buying and selling traffic. MySQL for operations, ClickHouse for impressions, Redis and Memcached for cache.</li>
    <li><strong>In production with a model.</strong> The application is an MCP server. Assistants call domain tools. RBAC and an audit log are on the call.</li>
    <li><strong>How the 89 packages exist.</strong> An agent writes inside a rulebook I own. I design the API, review, and release. <a href="/workflow">The loop</a>.</li>
  </ul>
</section>

<p class="colophon">
  <a href="https://github.com/rasuvaeff">GitHub</a>
  <a href="https://packagist.org/packages/rasuvaeff/">Packagist</a>
  <a href="https://t.me/rasuvaeff">Telegram</a>
  <a href="mailto:rasuvaeff@gmail.com">rasuvaeff@gmail.com</a>
</p>
