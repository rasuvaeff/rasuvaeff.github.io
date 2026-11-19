---
layout: page
title: Victor Razuvaev
titleTemplate: Senior backend-разработчик
description: "Senior backend-разработчик. Высоконагруженный PHP и Yii и 89 опубликованных библиотек: дедлайны, доставка, эксперименты и тестирование."
---

<header class="mast">
  <p class="eyebrow">
    <span>Senior backend-разработчик</span>
    <span>PHP 8.3+</span>
    <span>Yii3</span>
    <span>High-load</span>
  </p>
  <h1>Библиотеки для частей, <em>которые ломаются тихо.</em></h1>
  <p class="lede">Виктор Разуваев. Пятнадцать лет коммерческого PHP, десять из них в рекламе и real-time bidding. Проектирую backend-сервисы, где задержка и корректность — одна задача, и публикую то, что переиспользуется: дедлайны, идемпотентность, ретраи, тестовые движки со shrinking, двойники, которые являются реальными вызовами.</p>
  <div class="mast-actions">
    <a class="btn" href="#work">Разборы пакетов</a>
    <a class="btn ghost" href="/ru/packages">Каталог из 89</a>
    <a class="btn ghost" href="/ru/resume">Резюме</a>
  </div>
  <div class="bento">
    <div class="tile"><small>Пакетов</small><b>89</b><p>на Packagist, PHP 8.3+</p></div>
    <div class="tile"><small>Медианный порог minMsi</small><b>95%</b><div class="meter"><i style="width: 95%"></i></div></div>
    <div class="tile"><small>Статический анализ</small><b>Psalm 1</b><p>без подавлений и baseline</p></div>
    <div class="tile"><small>Навыки для агентов</small><b>40</b><p>пакетов с SKILL.md</p></div>
  </div>
</header>

<section id="work">
  <p class="section-label">Разборы</p>
  <div class="section-head">
    <h2>Библиотеки, которые стоит открыть.</h2>
    <p>Выбраны по тому, чего трудно найти в PHP, а не по цифрам. На каждой странице: задача, возможности, настоящий пример из README, семейство и ограничения, которые пакет называет сам.</p>
  </div>
  <TopCards />
</section>

<section>
  <p class="section-label">Код в двух словах</p>
  <div class="section-head"><h2>Три вызова, три решения.</h2></div>
  <div class="code-grid">
<div>

<p class="code-cap">understudy: стаб — реальный вызов</p>

```php
when(fn () => $repository->find(123))
    ->returns($book);

expect(fn () => $repository->save($book))
    ->times(1);
```

</div>
<div>

<p class="code-cap">context: один бюджет на запрос</p>

```php
[$request] = Context::background()
    ->withTimeout(3.0);

$request->assertActive();
$request->remainingMs();
```

</div>
<div>

<p class="code-cap">yii3-mcp: доменный метод становится инструментом</p>

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
  <p class="section-label">Семейства</p>
  <div class="section-head">
    <h2>Ядро и адаптеры вокруг него.</h2>
    <p>Ядро не навязывает бэкенд. Ставишь одно ядро и один бэкенд, и всё работает без конфигурации приложения.</p>
  </div>
  <FamilyMap />
</section>

<section>
  <p class="section-label">Для AI-агентов</p>
  <div class="section-head">
    <h2>К пакетам прилагается инструкция для модели.</h2>
    <p>Те же правила, что держат монорепо зелёным, доставляются в проекты, которые его используют. <a href="/ru/agents">Как это работает</a> и <a href="https://teletype.in/@rasuvaeff/ai-agents">подробная статья</a>.</p>
  </div>
  <div class="agent-steps">
    <div class="tile"><small>Каждый пакет</small><h3>llms.txt</h3><p>Компактный самодостаточный справочник по API. Модель читает его, а не угадывает имя метода.</p></div>
    <div class="tile"><small>40 пакетов</small><h3>SKILL.md</h3><p>Когда использовать пакет и какие правила безопасности проверять при каждом изменении, с триггером, по которому агент находит навык.</p></div>
    <div class="tile"><small>При установке</small><h3>llm/skills</h3><p>Composer-плагин синхронизирует навыки установленных пакетов в <code>.agents/skills/</code>. Вручную ничего копировать не нужно.</p></div>
  </div>
</section>

<section>
  <p class="section-label">Ещё на полке</p>
  <div class="section-head">
    <h2>Остальные интересные.</h2>
    <p>Тот же стандарт, более узкая задача. <a href="/ru/packages">Искать по всем</a>.</p>
  </div>
  <ul class="also">
    <li><a href="https://github.com/rasuvaeff/mutation-history">mutation-history</a><p>Infection запускается один раз. Этот пакет хранит историю и сравнивает два прогона, отличая мутанта, который только что начал выживать, от старого долга.</p></li>
    <li><a href="https://github.com/rasuvaeff/quality-ledger">quality-ledger</a><p>Append-only журнал сигналов CI с храповиком, который падает только на регрессии, внесённой изменением.</p></li>
    <li><a href="https://github.com/rasuvaeff/rector-named-literals">rector-named-literals</a><p>Правило Rector против boolean trap: добавляет имена параметров к литеральным аргументам. Используется во всём монорепо.</p></li>
    <li><a href="https://github.com/rasuvaeff/json-ld">json-ld</a><p>JSON-LD 1.1: expand, flatten, node API, RDF и N-Quads. Проверен на vendored-наборах W3C и канонизацией RDFC-1.0.</p></li>
    <li><a href="https://github.com/rasuvaeff/payments">payments</a><p>Деньги как целые минорные единицы, никогда не float. Намерения, попытки и вебхуки с защитой от повтора, провайдер не навязан. 0.x.</p></li>
    <li><a href="https://github.com/rasuvaeff/yii3-filestorage">yii3-filestorage</a><p>Один фасад хранилища, реестр дедупликации, подписанные загрузки, вложения по арендаторам, производные изображения. 0.x.</p></li>
    <li><a href="https://github.com/rasuvaeff/link-preview">link-preview</a><p>OpenGraph и Twitter Cards по недоверенному URL, загрузка через pinned-клиент.</p></li>
    <li><a href="/ru/packages/resilience">resilience</a><p>Retry, circuit breaker и bulkhead во вложенности, которая не усиливает перегрузку.</p></li>
    <li><a href="/ru/packages/schema">schema</a><p>Одна схема валидирует вход и порождает для него тестовые данные.</p></li>
    <li><a href="https://github.com/rasuvaeff/yii3-telemetry">yii3-telemetry</a><p>Трейсы с экспортом в OpenTelemetry. Рядом метрики, correlation id, health и аудит-лог.</p></li>
    <li><a href="https://github.com/rasuvaeff/media-converter">media-converter</a><p>Типизированный конвейер ffmpeg/ffprobe: транскодирование, remux, фильтры, retry, bulkhead, события прогресса.</p></li>
    <li><a href="https://github.com/rasuvaeff/yii3-webhooks">yii3-webhooks</a><p>Исходящие вебхуки с HMAC-подписью и проверка входящих, доставка через outbox.</p></li>
  </ul>
</section>

<section>
  <p class="section-label">Где они работают</p>
  <div class="section-head"><h2>Не только по отдельности.</h2></div>
  <div class="systems">
    <a class="system" href="https://cska.in">
      <p class="kicker">В проде · 31 пакет</p>
      <h3>cska.in</h3>
      <p>Фанатское сообщество, пересобранное на том же домене из 20-летней базы. Yii3, PHP 8.5, PostgreSQL, Redis, Temporal, Centrifugo. Счёт матчей в реальном времени, архив статистики, Telegram-бот и мини-апп, MCP-вход с правами по ключам.</p>
      <span class="more">cska.in →</span>
    </a>
    <a class="system" href="https://github.com/rasuvaeff/ecosystem-sandbox">
      <p class="kicker">Запускается · 60+ пакетов</p>
      <h3>ecosystem-sandbox</h3>
      <p>Магазин на Yii3. Оформление заказа и оплата прогоняют outbox, идемпотентность, ретраи, circuit breaker, вебхуки и телеметрию в одном потоке.</p>
      <span class="more">Исходники →</span>
    </a>
  </div>
  <p class="lede" style="margin-top: 16px; font-size: 15px;">Как устроен cska.in, с кодом из проекта: <a href="https://teletype.in/@rasuvaeff/cskain">разбор</a>.</p>
</section>

<section class="band">
  <div>
    <p class="section-label" style="margin-top: 0;">Резюме</p>
    <h2>Коротко.</h2>
    <p style="margin: 14px 0 0;"><a class="btn" href="/ru/resume">Полное резюме</a></p>
  </div>
  <ul>
    <li><strong>Сейчас.</strong> Продуктовая работа на Yii3 и PHP 8.5. Слои домена, приложения, инфраструктуры и эндпоинтов, границы держит Deptrac. Рядом крупные системы на Yii2.</li>
    <li><strong>До этого.</strong> Десять лет в ad-tech: RTB, покупка и продажа трафика. MySQL для операций, ClickHouse для показов, Redis и Memcached для кеша.</li>
    <li><strong>Модель внутри backend.</strong> Приложение является MCP-сервером. Ассистенты вызывают доменные инструменты с RBAC и аудит-логом на вызове.</li>
    <li><strong>Как появились 89 пакетов.</strong> Агент пишет внутри свода правил, которым владею я. Я проектирую API, ревьюю и выпускаю релизы. <a href="/ru/workflow">Процесс</a>.</li>
  </ul>
</section>

<p class="colophon">
  <a href="https://github.com/rasuvaeff">GitHub</a>
  <a href="https://packagist.org/packages/rasuvaeff/">Packagist</a>
  <a href="https://t.me/rasuvaeff">Telegram</a>
  <a href="mailto:rasuvaeff@gmail.com">rasuvaeff@gmail.com</a>
</p>
