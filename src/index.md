---
layout: page
title: Victor Razuvaev
titleTemplate: Senior backend engineer
description: Senior backend engineer. High-load PHP and Yii, and 89 published libraries for deadlines, delivery, experiments and testing.
---

<header class="mast">
  <p class="eyebrow">
    <span>Senior backend engineer</span>
    <span>PHP 8.3+</span>
    <span>Yii3</span>
    <span>High-load</span>
  </p>
  <h1>Libraries for the parts <em>that break quietly.</em></h1>
  <p class="lede">Victor Razuvaev. Fifteen years of commercial PHP, ten of them in advertising and real-time bidding. I design backend services where latency and correctness are the same problem, and I publish the reusable parts: deadlines, idempotency, retries, shrinking test engines, doubles that are real calls.</p>
  <div class="mast-actions">
    <a class="btn" href="#work">Deep dives</a>
    <a class="btn ghost" href="/packages">Catalog of 89</a>
    <a class="btn ghost" href="/resume">Resume</a>
  </div>
  <div class="bento">
    <div class="tile"><small>Packages</small><b>89</b><p>active on Packagist, PHP 8.3+</p></div>
    <div class="tile"><small>Median minMsi gate</small><b>95%</b><div class="meter"><i style="width: 95%"></i></div></div>
    <div class="tile"><small>Static analysis</small><b>Psalm 1</b><p>no suppressions, no baseline</p></div>
    <div class="tile"><small>Agent skills</small><b>40</b><p>packages ship a SKILL.md</p></div>
  </div>
</header>

<section id="work">
  <p class="section-label">Deep dives</p>
  <div class="section-head">
    <h2>The libraries worth opening.</h2>
    <p>Chosen for what is hard to find elsewhere in PHP, not for scores. Each page has the problem, the capabilities, a real example from the README, the family and the limits the package states itself.</p>
  </div>
  <TopCards />
</section>

<section>
  <p class="section-label">Code at a glance</p>
  <div class="section-head"><h2>Three calls, three decisions.</h2></div>
  <div class="code-grid">
<div>

<p class="code-cap">understudy: the stub is a real call</p>

```php
when(fn () => $repository->find(123))
    ->returns($book);

expect(fn () => $repository->save($book))
    ->times(1);
```

</div>
<div>

<p class="code-cap">context: one budget for the request</p>

```php
[$request] = Context::background()
    ->withTimeout(3.0);

$request->assertActive();
$request->remainingMs();
```

</div>
<div>

<p class="code-cap">yii3-mcp: a domain method becomes a tool</p>

```php
#[McpTool(name: 'order.status')]
public function status(
    string $orderId
): string {
    return $this->orders
        ->get($orderId)
        ->status->value;
}
```

</div>
  </div>
</section>

<section>
  <p class="section-label">Families</p>
  <div class="section-head">
    <h2>A core, and the adapters around it.</h2>
    <p>The core does not bind what a backend should. Install one core and one backend and it works without application config.</p>
  </div>
  <FamilyMap />
</section>

<section>
  <p class="section-label">For AI agents</p>
  <div class="section-head">
    <h2>The packages come with instructions for the model.</h2>
    <p>The same rules that keep the monorepo green are shipped to the projects that use it. <a href="/agents">How it works</a>, and the <a href="https://teletype.in/@rasuvaeff/ai-agents">long write-up</a> (in Russian).</p>
  </div>
  <div class="agent-steps">
    <div class="tile"><small>Every package</small><h3>llms.txt</h3><p>A compact, self-contained API reference. The model reads it instead of guessing a method name.</p></div>
    <div class="tile"><small>40 packages</small><h3>SKILL.md</h3><p>When to use the package and the safety rules to verify on every change, with a trigger the agent can match.</p></div>
    <div class="tile"><small>On install</small><h3>llm/skills</h3><p>The Composer plugin syncs installed skills into <code>.agents/skills/</code>. Nothing to copy by hand.</p></div>
  </div>
</section>

<section>
  <p class="section-label">Also on the bench</p>
  <div class="section-head">
    <h2>The rest of the interesting ones.</h2>
    <p>Same standard, narrower job. <a href="/packages">Search all of them</a>.</p>
  </div>
  <ul class="also">
    <li><a href="https://github.com/rasuvaeff/mutation-history">mutation-history</a><p>Infection is one-shot. This keeps the history and diffs two runs, so a mutant that just started escaping is told apart from old debt.</p></li>
    <li><a href="https://github.com/rasuvaeff/quality-ledger">quality-ledger</a><p>Append-only ledger for CI signals with a ratchet that fails only on a regression the change introduced.</p></li>
    <li><a href="https://github.com/rasuvaeff/rector-named-literals">rector-named-literals</a><p>A Rector rule against the boolean trap: adds parameter names to literal arguments. Used across the whole monorepo.</p></li>
    <li><a href="https://github.com/rasuvaeff/json-ld">json-ld</a><p>JSON-LD 1.1: expand, flatten, the node API, RDF and N-Quads. Tested against the vendored W3C conformance suites and RDFC-1.0 canonicalization.</p></li>
    <li><a href="https://github.com/rasuvaeff/payments">payments</a><p>Money is integer minor units, never a float. Intents, attempts and a replay-protected webhook ingress, with no provider chosen for you. 0.x.</p></li>
    <li><a href="https://github.com/rasuvaeff/yii3-filestorage">yii3-filestorage</a><p>One storage facade and a deduplication ledger; signed downloads, tenant-scoped attachments and image derivatives in its sibling packages. 0.x.</p></li>
    <li><a href="https://github.com/rasuvaeff/link-preview">link-preview</a><p>oEmbed, JSON-LD, OpenGraph and Twitter Cards from a URL you do not trust, with SSRF checks on redirects. The pinned client is the recommended transport.</p></li>
    <li><a href="/packages/resilience">resilience</a><p>Retry, circuit breaker and bulkhead nested in the order that does not amplify overload.</p></li>
    <li><a href="/packages/schema">schema</a><p>One schema validates input and generates test data for it.</p></li>
    <li><a href="https://github.com/rasuvaeff/yii3-telemetry">yii3-telemetry</a><p>Vendor-neutral tracing; OpenTelemetry export via yii3-telemetry-otel. Metrics, correlation ids, health and the audit log sit next to it.</p></li>
    <li><a href="https://github.com/rasuvaeff/media-converter">media-converter</a><p>A typed ffmpeg/ffprobe pipeline: transcode, remux, filter, retry, bulkhead, progress events.</p></li>
    <li><a href="https://github.com/rasuvaeff/yii3-webhooks">yii3-webhooks</a><p>HMAC-signed outbound webhooks, inbound verification and replay protection. Delivery through the outbox via yii3-outbox-webhooks-bridge.</p></li>
  </ul>
</section>

<section>
  <p class="section-label">Where they run</p>
  <div class="section-head"><h2>Not only in isolation.</h2></div>
  <div class="systems">
    <a class="system" href="https://cska.in">
      <p class="kicker">In production · 31 packages</p>
      <h3>cska.in</h3>
      <p>A fan community rebuilt on the same domain from a 20-year-old database. Yii3, PHP 8.5, PostgreSQL, Redis, Temporal, Centrifugo. Live scores, a statistics archive, a Telegram bot and mini-app, and an MCP door with per-key scopes.</p>
      <span class="more">cska.in →</span>
    </a>
    <a class="system" href="https://github.com/rasuvaeff/ecosystem-sandbox">
      <p class="kicker">Runnable · 56 packages</p>
      <h3>ecosystem-sandbox</h3>
      <p>A Yii3 shop. Checkout and payment run outbox, idempotency, retries, the circuit breaker, webhooks and telemetry in one flow.</p>
      <span class="more">Source →</span>
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
    <li><strong>Now.</strong> Product work on Yii3 and PHP 8.5. Domain, application, infrastructure and endpoint layers, with Deptrac holding the boundaries. Large Yii2 systems alongside.</li>
    <li><strong>Before that.</strong> Ten years in ad-tech: RTB, buying and selling traffic. MySQL for operations, ClickHouse for impressions, Redis and Memcached for cache.</li>
    <li><strong>A model inside the backend.</strong> The application is an MCP server. Assistants call domain tools with RBAC and an audit log on the call.</li>
    <li><strong>How 89 packages exist.</strong> An agent writes inside a rulebook I own. I design the API, review, and release. <a href="/workflow">The loop</a>.</li>
  </ul>
</section>

<p class="colophon">
  <a href="https://github.com/rasuvaeff">GitHub</a>
  <a href="https://packagist.org/packages/rasuvaeff/">Packagist</a>
  <a href="https://t.me/rasuvaeff">Telegram</a>
  <a href="mailto:rasuvaeff@gmail.com">rasuvaeff@gmail.com</a>
</p>
