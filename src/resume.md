---
layout: page
title: Resume
description: Victor Razuvaev, backend engineer. PHP and Yii, high-load services, open-source libraries.
---

<article class="cv">
  <header class="cv-top">
    <div>
      <p class="eyebrow"><span>Resume</span><span>Backend</span></p>
      <h1>Victor Razuvaev</h1>
      <p class="role">Backend engineer. High-load PHP, Yii, and the libraries underneath.</p>
    </div>
    <p class="cv-contact">
      <a href="https://github.com/rasuvaeff">github.com/rasuvaeff</a><br>
      <a href="https://packagist.org/packages/rasuvaeff/">packagist.org/packages/rasuvaeff</a><br>
      <a href="https://t.me/rasuvaeff">t.me/rasuvaeff</a><br>
      <a href="mailto:rasuvaeff@gmail.com">rasuvaeff@gmail.com</a><br>
      <a href="/">rasuvaeff.github.io</a>
    </p>
  </header>

  <h2>Profile</h2>
  <p>Fifteen years of commercial PHP. I design services where milliseconds and correctness both matter, and I publish the reusable parts instead of leaving them inside one application. The public record is <a href="/packages">89 libraries</a> on Packagist: deadlines, delivery, experiments, observability, payments, files, and a property-testing engine. Psalm level 1 with no suppressions, mutation scores from 85 to 100, SemVer, a backward-compatibility check before a major.</p>

  <h2>Selected systems</h2>
  <ul class="facts">
    <li><strong>cska.in</strong> — a fan community rebuilt on a 20-year-old database and the same domain. Yii3, PHP 8.5, PostgreSQL, Redis, Temporal, Centrifugo. Match calendar with live scores, a long archive of player and head-to-head statistics, stories, a guestbook, private messages, a Telegram bot and mini-app. An MCP door lets a personal agent use the same handlers as the site, with per-key scopes, quotas and an audit log. Running on 31 of my packages. <a href="https://teletype.in/@rasuvaeff/cskain">Write-up</a>.</li>
    <li><strong>Ad-tech, ten years.</strong> Advertising networks with RTB integrations, buying and selling traffic. MySQL for operational data, ClickHouse for impression analytics, Redis and Memcached for caching.</li>
    <li><strong>Training platform.</strong> Activity from <code>.fit</code> files, duels and leagues, JWT, S3, realtime via Centrifugo, a transactional outbox for event delivery. Clean Architecture, layer boundaries checked by Deptrac.</li>
    <li><strong>ecosystem-sandbox.</strong> A runnable Yii3 shop that puts 60+ packages through one checkout: outbox, idempotency, retries, circuit breaker, webhooks and telemetry together. <a href="https://github.com/rasuvaeff/ecosystem-sandbox">Source</a>.</li>
  </ul>

  <h2>Open source</h2>
  <p>The libraries are the portfolio. Nine of them are written up on the <a href="/#work">front page</a> — understudy, property-testing, context, the pinned HTTP client, schema, resilience, A/B assignment, idempotency, MCP. The <a href="/packages">catalog</a> groups the rest: delivery, observability, payments, files, Yii infrastructure, ClickHouse.</p>
  <p>Every package ships an <code>llms.txt</code> reference. Forty of them ship an agent skill that a project picks up on <code>composer install</code>.</p>

  <h2>How the work is produced</h2>
  <ul class="facts">
    <li><strong>Contract first.</strong> File layout, style, CI, docs and security rules come from a versioned rulebook, <a href="https://github.com/rasuvaeff/php-package-toolkit">php-package-toolkit</a>, not from a fresh decision per repository.</li>
    <li><strong>Write, then gate.</strong> An agent writes the code, the tests and the docs, then runs the gate: Psalm level 1, mutation testing, a compatibility check, SHA-pinned CI, Testo, property tests where an invariant exists.</li>
    <li><strong>Judgment stays mine.</strong> I design the API, the boundaries and the release. The agent does not merge, tag or publish.</li>
  </ul>
  <p>The same loop built cska.in. <a href="/workflow">The workflow page</a> is the longer form.</p>

  <h2>Stack</h2>
  <ul class="stack">
    <li>PHP 8.3–8.5</li>
    <li>Yii3</li>
    <li>Yii2</li>
    <li>PostgreSQL</li>
    <li>MySQL</li>
    <li>ClickHouse</li>
    <li>Redis</li>
    <li>Memcached</li>
    <li>Docker</li>
    <li>Nginx</li>
    <li>Centrifugo</li>
    <li>Temporal</li>
    <li>OpenTelemetry</li>
    <li>Prometheus</li>
    <li>Grafana</li>
    <li>MCP</li>
    <li>Psalm</li>
    <li>Testo</li>
    <li>Infection</li>
    <li>Deptrac</li>
  </ul>

  <h2>What I want to be building</h2>
  <ul class="facts">
    <li>Low-latency services where the tail latency and the correctness are the same problem.</li>
    <li>Distributed patterns done as libraries: outbox, idempotency, retries with backoff, bulkheads.</li>
    <li>A model inside the backend as a permissioned caller, with an audit log, not as a chat box beside it.</li>
  </ul>
</article>
