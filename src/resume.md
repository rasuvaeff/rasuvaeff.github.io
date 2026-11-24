---
layout: page
title: Resume
description: Victor Razuvaev, senior backend engineer. High-load PHP and Yii, distributed-systems patterns, 89 open-source libraries.
---

<article class="cv">
  <header class="cv-top">
    <div>
      <p class="kicker">Resume · Senior backend</p>
      <h1>Victor Razuvaev</h1>
      <p class="role">Senior backend engineer. High-load PHP and Yii services, and the reliability libraries underneath them.</p>
    </div>
    <p class="cv-contact">
      <a href="https://github.com/rasuvaeff">github.com/rasuvaeff</a><br>
      <a href="https://packagist.org/packages/rasuvaeff/">packagist.org/packages/rasuvaeff</a><br>
      <a href="https://t.me/rasuvaeff">t.me/rasuvaeff</a><br>
      <a href="mailto:rasuvaeff@gmail.com">rasuvaeff@gmail.com</a><br>
      <a href="/">rasuvaeff.github.io</a><br>
      <a class="no-print" href="/resume-en.pdf" download="victor-razuvaev-resume-en.pdf">Download PDF</a>
    </p>
  </header>

  <h2 id="profile">Profile</h2>
  <p>Senior backend engineer with fifteen years of commercial PHP, ten of them in advertising and real-time bidding. I own services end to end: the domain model, the data stores, the failure behaviour under load, and the release. Where a problem repeats, I extract it into a library. The public record is <a href="/packages">89 packages</a> on Packagist with Psalm level 1, no suppressions, a mutation gate on every package (median 95%), SemVer and a backward-compatibility check before a major.</p>

  <h2 id="strengths">What I bring</h2>
  <div class="caps">
    <div><h3>High-load design</h3><p>RTB and ad-serving paths where milliseconds and correctness are one problem. MySQL for operations, ClickHouse for impressions, Redis and Memcached in front. ClickHouse work is published as <a href="/packages/clickhouse-toolkit">clickhouse-toolkit</a>.</p></div>
    <div><h3>Failure behaviour</h3><p>Deadlines through every layer, retries with backoff, circuit breakers, bulkheads, idempotency keys, a transactional outbox. Published as <a href="/packages/context">context</a>, <a href="/packages/yii3-outbox">yii3-outbox</a>, <a href="/packages/yii3-idempotency">yii3-idempotency</a>, <a href="/packages/resilience">resilience</a>.</p></div>
    <div><h3>Architecture</h3><p>Clean Architecture on Yii3 with layer boundaries enforced by Deptrac. Core plus swappable backends, with the DI rules written down and checked by a merge harness.</p></div>
    <div><h3>Testing discipline</h3><p>Mutation testing as the gate, property-based tests with shrinking, doubles that are real calls. I built the tools: <a href="/packages/property-testing-core">property-testing-core</a>, <a href="/packages/property-testing-openapi">property-testing-openapi</a>, <a href="/packages/understudy">understudy</a>, <a href="/packages/doc-exec">doc-exec</a>.</p></div>
    <div><h3>Security-minded</h3><p>SSRF-safe fetching with <a href="/packages/pinned-http-client">pinned-http-client</a>, caller-scoped idempotency, fail-closed MCP endpoints, SHA-pinned CI audited with zizmor.</p></div>
    <div><h3>Models in the backend</h3><p>The application is an MCP server: assistants call domain tools with per-user RBAC, rate and budget limits and an audit log. See <a href="/packages/yii3-mcp">yii3-mcp</a>.</p></div>
  </div>

  <h2 id="selected-systems">Selected systems</h2>
  <ul class="facts">
    <li><strong>cska.in.</strong> A fan community rebuilt on a 20-year-old database and the same domain. Yii3, PHP 8.5, PostgreSQL, Redis, Temporal, Centrifugo. Live match calendar, a long archive of player and head-to-head statistics, stories, private messages, a Telegram bot and mini-app. An MCP door lets a personal agent use the same handlers as the site, with per-key scopes, quotas and an audit log. Runs on 31 of my packages. <a href="https://teletype.in/@rasuvaeff/cskain">Write-up</a> (in Russian).</li>
    <li><strong>Ad-tech, ten years.</strong> Advertising networks with RTB integrations, buying and selling traffic. MySQL for operational data, ClickHouse for impression analytics, Redis and Memcached for caching.</li>
    <li><strong>ecosystem-sandbox.</strong> A runnable Yii3 shop on 56 of the packages. Checkout and payment run outbox, idempotency, retries, circuit breaker, webhooks and telemetry together. <a href="https://github.com/rasuvaeff/ecosystem-sandbox">Source</a>.</li>
  </ul>

  <h2 id="open-source">Open source</h2>
  <p>The libraries are the portfolio. Fifteen have their own pages, among them <a href="/packages/understudy">understudy</a> (test doubles as real calls), <a href="/packages/property-testing-openapi">property-testing-openapi</a> (contract fuzzing for PHP), <a href="/packages/doc-exec">doc-exec</a>, <a href="/packages/context">context</a>, <a href="/packages/yii3-outbox">yii3-outbox</a>, <a href="/packages/mcp">mcp</a> and <a href="/packages/yii3-mcp">yii3-mcp</a>. The <a href="/packages">catalog</a> has the rest. Every package ships an <code>llms.txt</code> reference, and forty-three ship an agent skill.</p>

  <h2 id="how">How the work is produced</h2>
  <ul class="facts">
    <li><strong>Contract first.</strong> Layout, style, CI, docs and security rules come from a versioned rulebook, <a href="https://github.com/rasuvaeff/php-package-toolkit">php-package-toolkit</a>.</li>
    <li><strong>Write, then gate.</strong> An agent writes code, tests and docs, then the gate runs: Psalm level 1, mutation testing, a compatibility check, SHA-pinned CI, property tests where an invariant exists.</li>
    <li><strong>Judgment stays mine.</strong> I design the API, the boundaries and the release. The agent does not merge, tag or publish. <a href="/workflow">The workflow page</a> has the longer form.</li>
  </ul>

  <h2 id="stack">Stack</h2>
  <div>
    <div class="stack-row"><b>Languages</b><ul class="stack-group"><li>PHP 8.3–8.5</li><li>SQL</li><li>Bash</li></ul></div>
    <div class="stack-row"><b>Frameworks</b><ul class="stack-group"><li>Yii3</li><li>Yii2</li><li>PSR standards</li></ul></div>
    <div class="stack-row"><b>Data</b><ul class="stack-group"><li>PostgreSQL</li><li>MySQL</li><li>ClickHouse</li><li>Redis</li><li>Memcached</li></ul></div>
    <div class="stack-row"><b>Messaging</b><ul class="stack-group"><li>Centrifugo</li><li>Temporal</li><li>Transactional outbox</li></ul></div>
    <div class="stack-row"><b>Observability</b><ul class="stack-group"><li>OpenTelemetry</li><li>Jaeger</li><li>Prometheus</li><li>Grafana</li></ul></div>
    <div class="stack-row"><b>Quality</b><ul class="stack-group"><li>Psalm</li><li>Testo</li><li>PHPUnit</li><li>Infection</li><li>Rector</li><li>Deptrac</li></ul></div>
    <div class="stack-row"><b>Platform</b><ul class="stack-group"><li>Docker</li><li>Linux</li><li>Nginx</li><li>GitHub Actions</li><li>MCP</li></ul></div>
  </div>

  <h2 id="next">What I want to be building</h2>
  <ul class="facts">
    <li>Low-latency services where the tail latency and the correctness are the same problem.</li>
    <li>Distributed patterns done as libraries: outbox, idempotency, retries with backoff, bulkheads.</li>
    <li>A model inside the backend as a permissioned caller with an audit log, not as a chat box beside it.</li>
  </ul>
</article>
