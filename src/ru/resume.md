---
layout: page
title: Резюме
description: "Виктор Разуваев, senior backend-разработчик. Высоконагруженный PHP и Yii, паттерны распределённых систем, 89 открытых библиотек."
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
  <p>Senior backend-разработчик, пятнадцать лет коммерческого PHP, десять из них в рекламе и real-time bidding. Веду сервисы от начала до конца: доменная модель, хранилища, поведение при сбоях под нагрузкой и релиз. Если задача повторяется, выношу её в библиотеку. Публичный след: <a href="/ru/packages">89 пакетов</a> на Packagist, Psalm level 1 без подавлений, мутационный порог на каждом пакете (медиана 95%), SemVer и проверка обратной совместимости перед мажором.</p>

  <h2 id="strengths">Что я приношу</h2>
  <div class="caps">
    <div><h3>Проектирование под нагрузку</h3><p>RTB и пути показа рекламы, где миллисекунды и корректность — одна задача. MySQL для операций, ClickHouse для показов, Redis и Memcached впереди. Работа с ClickHouse опубликована как <a href="/ru/packages/clickhouse-toolkit">clickhouse-toolkit</a>.</p></div>
    <div><h3>Поведение при сбоях</h3><p>Дедлайны через все слои, ретраи с backoff, circuit breaker, bulkhead, ключи идемпотентности, transactional outbox. Опубликовано как <a href="/ru/packages/context">context</a>, <a href="/ru/packages/yii3-outbox">yii3-outbox</a>, <a href="/ru/packages/yii3-idempotency">yii3-idempotency</a>, <a href="/ru/packages/resilience">resilience</a>.</p></div>
    <div><h3>Архитектура</h3><p>Clean Architecture на Yii3, границы слоёв проверяет Deptrac. Ядро плюс сменные бэкенды, правила DI записаны и проверяются harness-ом слияния конфигов.</p></div>
    <div><h3>Дисциплина тестирования</h3><p>Мутационное тестирование как гейт, property-тесты со shrinking, двойники как реальные вызовы. Инструменты написал сам: <a href="/ru/packages/property-testing-core">property-testing-core</a>, <a href="/ru/packages/property-testing-openapi">property-testing-openapi</a>, <a href="/ru/packages/understudy">understudy</a>, <a href="/ru/packages/doc-exec">doc-exec</a>.</p></div>
    <div><h3>Безопасность</h3><p>Загрузка по недоверенным URL без SSRF через <a href="/ru/packages/pinned-http-client">pinned-http-client</a>, идемпотентность с областью по вызывающему, MCP-эндпоинты fail-closed, CI с закреплёнными SHA и аудитом zizmor.</p></div>
    <div><h3>Модели внутри backend</h3><p>Приложение является MCP-сервером: ассистенты вызывают доменные инструменты с RBAC по пользователю, лимитами и аудит-логом. См. <a href="/ru/packages/yii3-mcp">yii3-mcp</a>.</p></div>
  </div>

  <h2 id="selected-systems">Избранные системы</h2>
  <ul class="facts">
    <li><strong>cska.in.</strong> Фанатское сообщество, пересобранное на 20-летней базе и том же домене. Yii3, PHP 8.5, PostgreSQL, Redis, Temporal, Centrifugo. Календарь матчей со счётом в реальном времени, большой архив статистики игроков и личных встреч, истории, личные сообщения, Telegram-бот и мини-апп. MCP-вход позволяет личному агенту пользоваться теми же обработчиками, что и сайт, с правами по ключам, квотами и аудит-логом. Работает на 31 моём пакете. <a href="https://teletype.in/@rasuvaeff/cskain">Разбор</a>.</li>
    <li><strong>Ad-tech, десять лет.</strong> Рекламные сети с RTB-интеграциями, покупка и продажа трафика. MySQL для операционных данных, ClickHouse для аналитики показов, Redis и Memcached для кеша.</li>
    <li><strong>ecosystem-sandbox.</strong> Запускаемый магазин на Yii3 на 56 пакетах. Оформление заказа и оплата прогоняют outbox, идемпотентность, ретраи, circuit breaker, вебхуки и телеметрию вместе. <a href="https://github.com/rasuvaeff/ecosystem-sandbox">Исходники</a>.</li>
  </ul>

  <h2 id="open-source">Открытый код</h2>
  <p>Библиотеки и есть портфолио. У пятнадцати есть свои страницы, среди них <a href="/ru/packages/understudy">understudy</a> (двойники как реальные вызовы), <a href="/ru/packages/property-testing-openapi">property-testing-openapi</a> (фаззинг контракта для PHP), <a href="/ru/packages/doc-exec">doc-exec</a>, <a href="/ru/packages/context">context</a>, <a href="/ru/packages/yii3-outbox">yii3-outbox</a>, <a href="/ru/packages/mcp">mcp</a> и <a href="/ru/packages/yii3-mcp">yii3-mcp</a>. В <a href="/ru/packages">каталоге</a> остальные. В каждом пакете есть справочник <code>llms.txt</code>, в сорока трёх ещё и навык для агента.</p>

  <h2 id="how">Как устроена работа</h2>
  <ul class="facts">
    <li><strong>Сначала контракт.</strong> Структура, стиль, CI, документация и правила безопасности берутся из версионируемого свода, <a href="https://github.com/rasuvaeff/php-package-toolkit">php-package-toolkit</a>.</li>
    <li><strong>Пишем, потом гейт.</strong> Агент пишет код, тесты и документацию, затем проходит гейт: Psalm level 1, мутационное тестирование, проверка совместимости, CI с закреплёнными SHA, property-тесты там, где есть инвариант.</li>
    <li><strong>Решения за мной.</strong> API, границы и релиз проектирую я. Агент не мержит, не ставит теги и не публикует. <a href="/ru/workflow">Страница про процесс</a> подробнее.</li>
  </ul>

  <h2 id="stack">Стек</h2>
  <div>
    <div class="stack-row"><b>Языки</b><ul class="stack-group"><li>PHP 8.3–8.5</li><li>SQL</li><li>Bash</li></ul></div>
    <div class="stack-row"><b>Фреймворки</b><ul class="stack-group"><li>Yii3</li><li>Yii2</li><li>PSR</li></ul></div>
    <div class="stack-row"><b>Данные</b><ul class="stack-group"><li>PostgreSQL</li><li>MySQL</li><li>ClickHouse</li><li>Redis</li><li>Memcached</li></ul></div>
    <div class="stack-row"><b>Сообщения</b><ul class="stack-group"><li>Centrifugo</li><li>Temporal</li><li>Transactional outbox</li></ul></div>
    <div class="stack-row"><b>Наблюдаемость</b><ul class="stack-group"><li>OpenTelemetry</li><li>Jaeger</li><li>Prometheus</li><li>Grafana</li></ul></div>
    <div class="stack-row"><b>Качество</b><ul class="stack-group"><li>Psalm</li><li>Testo</li><li>PHPUnit</li><li>Infection</li><li>Rector</li><li>Deptrac</li></ul></div>
    <div class="stack-row"><b>Платформа</b><ul class="stack-group"><li>Docker</li><li>Linux</li><li>Nginx</li><li>GitHub Actions</li><li>MCP</li></ul></div>
  </div>

  <h2 id="next">Что хочу строить</h2>
  <ul class="facts">
    <li>Сервисы с низкой задержкой, где хвостовая задержка и корректность — одна задача.</li>
    <li>Распределённые паттерны в виде библиотек: outbox, идемпотентность, ретраи с backoff, bulkhead.</li>
    <li>Модель внутри backend как вызывающую сторону с правами и аудит-логом, а не чат рядом с ним.</li>
  </ul>
</article>
