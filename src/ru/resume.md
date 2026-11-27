---
layout: page
title: Резюме
description: "Виктор Разуваев, senior backend-разработчик. Высоконагруженный PHP и Yii, паттерны распределённых систем, 95 открытых библиотек."
---

<article class="cv">
  <header class="cv-top">
    <div>
      <p class="kicker">Резюме · Senior backend</p>
      <h1>Виктор Разуваев</h1>
      <p class="role">Senior backend-разработчик. Высоконагруженные сервисы на PHP и Yii и библиотеки надёжности под ними.</p>
    </div>
    <p class="cv-contact">
      <a href="https://github.com/rasuvaeff">github.com/rasuvaeff</a><br>
      <a href="https://packagist.org/packages/rasuvaeff/">packagist.org/packages/rasuvaeff</a><br>
      <a href="https://t.me/rasuvaeff">t.me/rasuvaeff</a><br>
      <a href="mailto:rasuvaeff@gmail.com">rasuvaeff@gmail.com</a><br>
      <a href="/ru/">rasuvaeff.github.io</a><br>
      <a class="no-print" href="/resume-ru.pdf" download="victor-razuvaev-resume-ru.pdf">Скачать PDF</a>
    </p>
  </header>

  <h2 id="profile">Профиль</h2>
  <p>Senior backend-разработчик, более 15 лет коммерческого PHP, десять из них в рекламе и real-time bidding. Проектирую и веду высоконагруженные сервисы от доменной модели до релиза: хранилища, поведение при сбоях под нагрузкой, наблюдаемость. Сейчас — продуктовая разработка на Yii3 с Clean Architecture и встраиванием LLM-ассистентов в backend через Model Context Protocol, параллельно поддержка крупного legacy на Yii2.</p>
  <p>Повторяющиеся задачи выношу в библиотеки: <a href="/ru/packages">95 пакетов</a> на Packagist, Psalm level 1 без подавлений, мутационный порог на каждом пакете (медиана 95%), SemVer и проверка обратной совместимости перед мажором.</p>

  <h2 id="strengths">Что я приношу</h2>
  <div class="caps">
    <div><h3>Проектирование под нагрузку</h3><p>RTB и пути показа рекламы, где миллисекунды и корректность — одна задача. MySQL и PostgreSQL для операций, ClickHouse для аналитики, Redis и Memcached впереди. Работа с ClickHouse опубликована как <a href="/ru/packages/clickhouse-toolkit">clickhouse-toolkit</a>.</p></div>
    <div><h3>Поведение при сбоях</h3><p>Дедлайны через все слои, ретраи с backoff, circuit breaker, bulkhead, ключи идемпотентности, transactional outbox — в продакшене и в виде библиотек: <a href="/ru/packages/context">context</a>, <a href="/ru/packages/yii3-outbox">yii3-outbox</a>, <a href="/ru/packages/yii3-idempotency">yii3-idempotency</a>, <a href="/ru/packages/resilience">resilience</a>.</p></div>
    <div><h3>Архитектура</h3><p>Clean Architecture на Yii3 (Domain, Application, Infrastructure, Endpoint), границы слоёв проверяет Deptrac. Ядро плюс сменные бэкенды, правила DI записаны и проверяются harness-ом слияния конфигов.</p></div>
    <div><h3>Дисциплина тестирования</h3><p>Мутационное тестирование как гейт, property-тесты со shrinking, фаззинг контракта OpenAPI. Инструменты написал сам: <a href="/ru/packages/property-testing-core">property-testing-core</a>, <a href="/ru/packages/property-testing-openapi">property-testing-openapi</a>, <a href="/ru/packages/understudy">understudy</a>, <a href="/ru/packages/doc-exec">doc-exec</a>.</p></div>
    <div><h3>Безопасность</h3><p>Загрузка по недоверенным URL без SSRF через <a href="/ru/packages/pinned-http-client">pinned-http-client</a>, идемпотентность с областью по вызывающему, MCP-эндпоинты fail-closed, CI с закреплёнными SHA и аудитом zizmor.</p></div>
    <div><h3>Модели внутри backend</h3><p>Приложение является MCP-сервером: ассистенты вызывают доменные операции с правами по пользователю, ключами, квотами и аудит-логом. См. <a href="/ru/packages/yii3-mcp">yii3-mcp</a>.</p></div>
  </div>

  <h2 id="experience">Опыт работы</h2>
  <div class="job">
    <h3>PHP-разработчик (Backend) — компания в сфере социальных медиа</h3>
    <p class="period">Февраль 2025 — настоящее время</p>
    <p>Два продукта компании: новая платформа для работы с креаторами (Yii3) и SaaS-инструменты для социальных сетей (legacy на Yii2).</p>
    <p class="sub">Платформа для работы с креаторами — продуктовая разработка (Yii3, PHP 8.5)</p>
    <ul>
      <li>Backend-приложение на Yii3 и PHP 8.5, около 300 тыс. строк кода и тестов: Clean Architecture, 21 слой с границами под контролем Deptrac.</li>
      <li>Хранилища: MySQL (yiisoft/db, ActiveRecord), ClickHouse для аналитики, Memcached; доставка событий в ClickHouse через transactional outbox.</li>
      <li>Надёжность на собственных библиотеках: <a href="/ru/packages/yii3-outbox">outbox</a> (MySQL и ClickHouse), <a href="/ru/packages/retry">retry</a>, <a href="/ru/packages/circuit-breaker">circuit breaker</a>, <a href="/ru/packages/bulkhead">bulkhead</a>, <a href="/ru/packages/specification">specification</a>, метрики в Prometheus.</li>
      <li>Каталог креаторов с учётом legal compliance: поиск и фильтры, карточка профиля, раскрытие контактов по квоте подписки.</li>
      <li>MCP-сервер для LLM-ассистентов: тот же каталог доступен агенту по пользовательскому API-ключу, с теми же квотами и маскированием контактов; защита от DNS-rebinding, журнал безопасности (события ключей, привязок, профиля).</li>
      <li>Админка: аудит-лог действий, блог, FAQ, SEO-поля, карта сайта, API для лендинга.</li>
      <li>Качество: Psalm, Deptrac, Infection, тесты на Codeception, фаззинг REST-контракта по OpenAPI (<a href="/ru/packages/property-testing-openapi">property-testing-openapi</a>).</li>
    </ul>
    <p class="sub">SaaS-инструменты для социальных сетей — поддержка и развитие legacy (Yii2, PHP 8.3)</p>
    <ul>
      <li>Большой унаследованный кодбейз на Yii2 (advanced-шаблон), работа на актуальном PHP 8.3.</li>
      <li>Исправление ошибок, доработки, рефакторинг и снижение технического долга.</li>
      <li>MySQL, Redis, ClickHouse, очереди (yii2-queue), интеграции с внешними API; Docker и Docker Compose.</li>
    </ul>
  </div>
  <div class="job">
    <h3>PHP-разработчик — <a href="https://buymedia.biz">buymedia.biz</a></h3>
    <p class="period">Апрель 2014 — Июль 2024 (10 лет 4 месяца)</p>
    <p>Рекламная сеть: несколько форматов рекламы, покупка и продажа трафика через RTB-сети.</p>
    <ul>
      <li>Проектировал и разрабатывал backend-сервисы рекламной сети на PHP и Yii2.</li>
      <li>Интеграции с внешними RTB-сетями: покупка и продажа трафика по RTB-протоколу.</li>
      <li>Несколько форматов рекламы — от разработки до сопровождения.</li>
      <li>Высоконагруженные потоки данных: MySQL — операционные данные, ClickHouse — аналитика показов и статистика, Redis и Memcached — кэш и снижение нагрузки на БД.</li>
      <li>Полный цикл: архитектура сервисов, код, оптимизация, поддержка.</li>
    </ul>
  </div>
  <div class="job">
    <h3>Ранее</h3>
    <p class="period">До 2014 года</p>
    <ul>
      <li>Официальный сайт футбольного клуба <a href="https://fakefc.ru">fakefc.ru</a> на CodeIgniter.</li>
      <li>Интернет-магазины <a href="https://sharfik.ru">sharfik.ru</a> и <a href="https://multibags.ru">multibags.ru</a>.</li>
      <li>Разработка в агентстве недвижимости <a href="https://transfert-vrn.ru">transfert-vrn.ru</a>.</li>
    </ul>
  </div>

  <h2 id="projects">Собственные проекты</h2>
  <ul class="facts">
    <li><strong><a href="https://cska.in">cska.in</a>.</strong> Фанатское сообщество с 20-летней историей, пересобранное на том же домене: переход с CodeIgniter 2 и MySQL на новую платформу с переносом и сохранением всех данных. Yii3, PHP 8.5, PostgreSQL, Redis, Temporal, Centrifugo, OpenTelemetry и Jaeger. Импорт и сверка архива матчей, статистики игроков и личных встреч, гостевой книги и 16 600 личных сообщений. Счёт матча, гостевая, комментарии и личные сообщения в реальном времени; медиа через Temporal и ffmpeg; Telegram-бот и мини-апп. MCP-вход позволяет личному агенту пользоваться теми же обработчиками, что и сайт, с правами по ключам, квотами и аудит-логом. Работает на 32 моих пакетах. <a href="https://teletype.in/@rasuvaeff/cskain">Разбор</a>.</li>
    <li><strong><a href="https://github.com/rasuvaeff/ecosystem-sandbox">ecosystem-sandbox</a>.</strong> Запускаемый магазин на Yii3 на 56 пакетах. Оформление заказа и оплата прогоняют outbox, идемпотентность, ретраи, circuit breaker, вебхуки и телеметрию вместе.</li>
  </ul>

  <h2 id="open-source">Открытый код</h2>
  <p>Библиотеки на PHP 8.3+ и есть портфолио: полный CI/CD, документация на двух языках и справочник <code>llms.txt</code> в каждом пакете, у сорока пяти ещё и навык для агента. Остальное — в <a href="/ru/packages">каталоге</a>.</p>
  <ul class="facts">
    <li><strong><a href="/ru/packages/property-testing-core">property-testing</a></strong> (core, адаптеры <a href="/ru/packages/property-testing-testo">Testo</a> и <a href="/ru/packages/property-testing-phpunit">PHPUnit</a>) — property-based тестирование с integrated shrinking и stateful-тестами; уровень Hypothesis, fast-check, jqwik.</li>
    <li><strong><a href="/ru/packages/property-testing-openapi">property-testing-openapi</a></strong> и <strong><a href="/ru/packages/openapi-contract">openapi-contract</a></strong> — фаззинг и валидация HTTP-контракта по OpenAPI.</li>
    <li><strong><a href="/ru/packages/understudy">understudy</a></strong> — тестовые двойники, работающие как реальные вызовы.</li>
    <li><strong><a href="/ru/packages/mcp">mcp</a></strong>, <strong><a href="/ru/packages/yii3-mcp">yii3-mcp</a></strong> (и для <a href="/ru/packages/laravel-mcp">Laravel</a>, <a href="/ru/packages/symfony-mcp">Symfony</a>) — MCP-сервер для PHP: RBAC по пользователю на инструментах, лимиты, аудит, мост OpenAPI → MCP.</li>
    <li><strong><a href="/ru/packages/context">context</a></strong> — дедлайны и отмена через все слои: HTTP, БД, процессы, CLI.</li>
    <li><strong><a href="/ru/packages/yii3-outbox">yii3-outbox</a></strong>, <strong><a href="/ru/packages/yii3-idempotency">yii3-idempotency</a></strong>, <strong><a href="/ru/packages/retry">retry</a></strong>, <strong><a href="/ru/packages/circuit-breaker">circuit-breaker</a></strong>, <strong><a href="/ru/packages/bulkhead">bulkhead</a></strong> — распределённые паттерны и надёжность; bulkhead захватывает слоты атомарно через Redis Lua и APCu и проверен на реально форкнутых процессах.</li>
    <li><strong><a href="/ru/packages/pinned-http-client">pinned-http-client</a></strong>, <strong><a href="/ru/packages/link-preview">link-preview</a></strong> — загрузка по недоверенным URL без SSRF.</li>
    <li><strong><a href="/ru/packages/clickhouse-toolkit">clickhouse-toolkit</a></strong>, <strong><a href="/ru/packages/specification">specification</a></strong> — типобезопасная сборка запросов.</li>
  </ul>

  <h2 id="how">Как устроена работа</h2>
  <ul class="facts">
    <li><strong>Сначала контракт.</strong> Структура, стиль, CI, документация и правила безопасности берутся из версионируемого свода, <a href="https://github.com/rasuvaeff/php-package-toolkit">php-package-toolkit</a>.</li>
    <li><strong>Пишем, потом гейт.</strong> Код, тесты и документация проходят через гейт: Psalm level 1, мутационное тестирование, проверка совместимости, CI с закреплёнными SHA, property-тесты там, где есть инвариант.</li>
    <li><strong>Решения за мной.</strong> API, границы и релизы проектирую сам; AI-агенты в процессе не мержат, не ставят теги и не публикуют. <a href="/ru/workflow">Страница про процесс</a> подробнее.</li>
  </ul>

  <h2 id="stack">Стек</h2>
  <div>
    <div class="stack-row"><b>Языки</b><ul class="stack-group"><li>PHP 8.3–8.5</li><li>SQL</li><li>Bash</li></ul></div>
    <div class="stack-row"><b>Фреймворки</b><ul class="stack-group"><li>Yii3</li><li>Yii2</li><li>PSR-7/11/15/17/18</li></ul></div>
    <div class="stack-row"><b>Данные</b><ul class="stack-group"><li>PostgreSQL</li><li>MySQL</li><li>ClickHouse</li><li>Redis</li><li>Memcached</li></ul></div>
    <div class="stack-row"><b>Сообщения</b><ul class="stack-group"><li>Centrifugo</li><li>Temporal</li><li>yii2-queue</li><li>Transactional outbox</li><li>Вебхуки</li></ul></div>
    <div class="stack-row"><b>Наблюдаемость</b><ul class="stack-group"><li>OpenTelemetry</li><li>Jaeger</li><li>Prometheus</li><li>Grafana</li></ul></div>
    <div class="stack-row"><b>Качество</b><ul class="stack-group"><li>Psalm</li><li>Deptrac</li><li>Rector</li><li>PHP-CS-Fixer</li><li>Infection</li><li>Testo</li><li>PHPUnit</li><li>Codeception</li></ul></div>
    <div class="stack-row"><b>Платформа</b><ul class="stack-group"><li>Docker</li><li>Linux</li><li>Nginx</li><li>GitHub Actions</li></ul></div>
    <div class="stack-row"><b>AI / LLM</b><ul class="stack-group"><li>Model Context Protocol</li><li>tool-calling</li><li>prompt-шаблоны</li><li>RBAC и аудит доступа AI</li></ul></div>
  </div>
</article>
