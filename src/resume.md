---
layout: page
title: Resume
description: Victor Razuvaev, senior backend engineer. High-load PHP and Yii, distributed-systems patterns, 95 open-source libraries.
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
  <p>Senior backend engineer with 15+ years of commercial PHP, ten of them in advertising and real-time bidding. I design and run high-load services from the domain model to the release: storage, behaviour under failure and load, observability. Currently building a product on Yii3 with Clean Architecture and LLM assistants embedded in the backend through the Model Context Protocol, alongside maintaining a large Yii2 legacy codebase.</p>
  <p>Recurring problems become libraries: <a href="/packages">95 packages</a> on Packagist with Psalm level 1, no suppressions, a mutation gate on every package (median 95%), SemVer and a backward-compatibility check before a major.</p>

  <h2 id="strengths">What I bring</h2>
  <div class="caps">
    <div><h3>High-load design</h3><p>RTB and ad-serving paths where milliseconds and correctness are one problem. MySQL and PostgreSQL for operations, ClickHouse for analytics, Redis and Memcached in front. ClickHouse work is published as <a href="/packages/clickhouse-toolkit">clickhouse-toolkit</a>.</p></div>
    <div><h3>Failure behaviour</h3><p>Deadlines through every layer, retries with backoff, circuit breakers, bulkheads, idempotency keys, a transactional outbox — in production and as libraries: <a href="/packages/context">context</a>, <a href="/packages/yii3-outbox">yii3-outbox</a>, <a href="/packages/yii3-idempotency">yii3-idempotency</a>, <a href="/packages/resilience">resilience</a>.</p></div>
    <div><h3>Architecture</h3><p>Clean Architecture on Yii3 (Domain, Application, Infrastructure, Endpoint) with layer boundaries enforced by Deptrac. Core plus swappable backends, with the DI rules written down and checked by a merge harness.</p></div>
    <div><h3>Testing discipline</h3><p>Mutation testing as the gate, property-based tests with shrinking, OpenAPI contract fuzzing. I built the tools: <a href="/packages/property-testing-core">property-testing-core</a>, <a href="/packages/property-testing-openapi">property-testing-openapi</a>, <a href="/packages/understudy">understudy</a>, <a href="/packages/doc-exec">doc-exec</a>.</p></div>
    <div><h3>Security-minded</h3><p>SSRF-safe fetching with <a href="/packages/pinned-http-client">pinned-http-client</a>, caller-scoped idempotency, fail-closed MCP endpoints, SHA-pinned CI audited with zizmor.</p></div>
    <div><h3>Models in the backend</h3><p>The application is an MCP server: assistants call domain operations with per-user permissions, keys, quotas and an audit log. See <a href="/packages/yii3-mcp">yii3-mcp</a>.</p></div>
  </div>

  <h2 id="experience">Experience</h2>
  <div class="job">
    <h3>PHP Developer (Backend) — a social media company</h3>
    <p class="period">February 2025 — present</p>
    <p>Two of the company's products: a new creator platform (Yii3) and SaaS tools for social networks (legacy on Yii2).</p>
    <p class="sub">Creator platform — product development (Yii3, PHP 8.5)</p>
    <ul>
      <li>Backend on Yii3 and PHP 8.5, about 300k lines of code and tests: Clean Architecture, 21 layers with boundaries enforced by Deptrac.</li>
      <li>Storage: MySQL (yiisoft/db, ActiveRecord), ClickHouse for analytics, Memcached; events delivered to ClickHouse through a transactional outbox.</li>
      <li>Reliability on my own libraries: <a href="/packages/yii3-outbox">outbox</a> (MySQL and ClickHouse), <a href="/packages/retry">retry</a>, <a href="/packages/circuit-breaker">circuit breaker</a>, <a href="/packages/bulkhead">bulkhead</a>, <a href="/packages/specification">specification</a>, Prometheus metrics.</li>
      <li>Creator catalogue with legal compliance in mind: search and filters, profile card, contact reveal within a subscription quota.</li>
      <li>MCP server for LLM assistants: the same catalogue is available to an agent by a user API key, with the same quotas and contact masking; DNS-rebinding protection, a security journal (key, account-linking and profile events).</li>
      <li>Admin: action audit log, blog, FAQ, SEO fields, sitemap, landing-page API.</li>
      <li>Quality: Psalm, Deptrac, Infection, Codeception tests, REST contract fuzzing against OpenAPI (<a href="/packages/property-testing-openapi">property-testing-openapi</a>).</li>
    </ul>
    <p class="sub">SaaS tools for social networks — legacy maintenance and development (Yii2, PHP 8.3)</p>
    <ul>
      <li>A large inherited Yii2 codebase (advanced template), kept running on current PHP 8.3.</li>
      <li>Bug fixes, feature work, refactoring and paying down technical debt.</li>
      <li>MySQL, Redis, ClickHouse, queues (yii2-queue), external API integrations; Docker and Docker Compose.</li>
    </ul>
  </div>
  <div class="job">
    <h3>PHP Developer — <a href="https://buymedia.biz">buymedia.biz</a></h3>
    <p class="period">April 2014 — July 2024 (10 years 4 months)</p>
    <p>An advertising network: several ad formats, buying and selling traffic through RTB networks.</p>
    <ul>
      <li>Designed and built the ad network's backend services in PHP and Yii2.</li>
      <li>Integrations with external RTB networks: buying and selling traffic over the RTB protocol.</li>
      <li>Several ad formats, from development to maintenance.</li>
      <li>High-load data flows: MySQL for operational data, ClickHouse for impression analytics and statistics, Redis and Memcached for caching and taking load off the database.</li>
      <li>The full cycle: service architecture, code, optimisation, support.</li>
    </ul>
  </div>
  <div class="job">
    <h3>Earlier</h3>
    <p class="period">Before 2014</p>
    <ul>
      <li>The official website of the football club <a href="https://fakefc.ru">fakefc.ru</a>, built on CodeIgniter.</li>
      <li>Online shops <a href="https://sharfik.ru">sharfik.ru</a> and <a href="https://multibags.ru">multibags.ru</a>.</li>
      <li>Development at the real-estate agency <a href="https://transfert-vrn.ru">transfert-vrn.ru</a>.</li>
    </ul>
  </div>

  <h2 id="projects">Own projects</h2>
  <ul class="facts">
    <li><strong><a href="https://cska.in">cska.in</a>.</strong> A fan community with a 20-year history, rebuilt on the same domain: moved from CodeIgniter 2 and MySQL to a new platform, migrating and preserving all the data. Yii3, PHP 8.5, PostgreSQL, Redis, Temporal, Centrifugo, OpenTelemetry and Jaeger. Import and reconciliation of the archive of matches, player and head-to-head statistics, the guestbook and 16,600 private messages. Live match score, guestbook, comments and private messages; media through Temporal and ffmpeg; a Telegram bot and mini-app. An MCP door lets a personal agent use the same handlers as the site, with per-key scopes, quotas and an audit log. Runs on 32 of my packages. <a href="/blog/cska-in">Write-up</a>.</li>
    <li><strong><a href="https://github.com/rasuvaeff/ecosystem-sandbox">ecosystem-sandbox</a>.</strong> A runnable Yii3 shop on 56 of the packages. Checkout and payment run outbox, idempotency, retries, circuit breaker, webhooks and telemetry together.</li>
  </ul>

  <h2 id="open-source">Open source</h2>
  <p>The PHP 8.3+ libraries are the portfolio: full CI/CD, documentation in two languages and an <code>llms.txt</code> reference in every package, and an agent skill in forty-five of them. The <a href="/packages">catalog</a> has the rest.</p>
  <ul class="facts">
    <li><strong><a href="/packages/property-testing-core">property-testing</a></strong> (core, <a href="/packages/property-testing-testo">Testo</a> and <a href="/packages/property-testing-phpunit">PHPUnit</a> adapters) — property-based testing with integrated shrinking and stateful tests; on the level of Hypothesis, fast-check, jqwik.</li>
    <li><strong><a href="/packages/property-testing-openapi">property-testing-openapi</a></strong> and <strong><a href="/packages/openapi-contract">openapi-contract</a></strong> — fuzzing and validating an HTTP contract against OpenAPI.</li>
    <li><strong><a href="/packages/understudy">understudy</a></strong> — test doubles that behave like real calls.</li>
    <li><strong><a href="/packages/mcp">mcp</a></strong>, <strong><a href="/packages/yii3-mcp">yii3-mcp</a></strong> (and for <a href="/packages/laravel-mcp">Laravel</a>, <a href="/packages/symfony-mcp">Symfony</a>) — an MCP server for PHP: per-user RBAC on tools, limits, audit, an OpenAPI → MCP bridge.</li>
    <li><strong><a href="/packages/context">context</a></strong> — deadlines and cancellation through every layer: HTTP, database, processes, CLI.</li>
    <li><strong><a href="/packages/yii3-outbox">yii3-outbox</a></strong>, <strong><a href="/packages/yii3-idempotency">yii3-idempotency</a></strong>, <strong><a href="/packages/retry">retry</a></strong>, <strong><a href="/packages/circuit-breaker">circuit-breaker</a></strong>, <strong><a href="/packages/bulkhead">bulkhead</a></strong> — distributed patterns and reliability; bulkhead acquires slots atomically through Redis Lua and APCu and is tested against real forked processes.</li>
    <li><strong><a href="/packages/pinned-http-client">pinned-http-client</a></strong>, <strong><a href="/packages/link-preview">link-preview</a></strong> — fetching untrusted URLs without SSRF.</li>
    <li><strong><a href="/packages/clickhouse-toolkit">clickhouse-toolkit</a></strong>, <strong><a href="/packages/specification">specification</a></strong> — type-safe query building.</li>
  </ul>

  <h2 id="how">How the work is produced</h2>
  <ul class="facts">
    <li><strong>Contract first.</strong> Layout, style, CI, docs and security rules come from a versioned rulebook, <a href="https://github.com/rasuvaeff/php-package-toolkit">php-package-toolkit</a>.</li>
    <li><strong>Write, then gate.</strong> Code, tests and docs pass a gate: Psalm level 1, mutation testing, a compatibility check, SHA-pinned CI, property tests where an invariant exists.</li>
    <li><strong>Judgment stays mine.</strong> I design the API, the boundaries and the release; AI agents in the process do not merge, tag or publish. <a href="/workflow">The workflow page</a> has the longer form.</li>
  </ul>

  <h2 id="stack">Stack</h2>
  <div>
    <div class="stack-row"><b>Languages</b><ul class="stack-group"><li>PHP 8.3–8.5</li><li>SQL</li><li>Bash</li></ul></div>
    <div class="stack-row"><b>Frameworks</b><ul class="stack-group"><li>Yii3</li><li>Yii2</li><li>PSR-7/11/15/17/18</li></ul></div>
    <div class="stack-row"><b>Data</b><ul class="stack-group"><li>PostgreSQL</li><li>MySQL</li><li>ClickHouse</li><li>Redis</li><li>Memcached</li></ul></div>
    <div class="stack-row"><b>Messaging</b><ul class="stack-group"><li>Centrifugo</li><li>Temporal</li><li>yii2-queue</li><li>Transactional outbox</li><li>Webhooks</li></ul></div>
    <div class="stack-row"><b>Observability</b><ul class="stack-group"><li>OpenTelemetry</li><li>Jaeger</li><li>Prometheus</li><li>Grafana</li></ul></div>
    <div class="stack-row"><b>Quality</b><ul class="stack-group"><li>Psalm</li><li>Deptrac</li><li>Rector</li><li>PHP-CS-Fixer</li><li>Infection</li><li>Testo</li><li>PHPUnit</li><li>Codeception</li></ul></div>
    <div class="stack-row"><b>Platform</b><ul class="stack-group"><li>Docker</li><li>Linux</li><li>Nginx</li><li>GitHub Actions</li></ul></div>
    <div class="stack-row"><b>AI / LLM</b><ul class="stack-group"><li>Model Context Protocol</li><li>tool-calling</li><li>prompt templates</li><li>RBAC and audit of AI access</li></ul></div>
  </div>
</article>
