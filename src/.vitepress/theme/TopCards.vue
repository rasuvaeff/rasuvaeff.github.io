<script setup lang="ts">
import packages from '../data/packages.json'
import { useLocale } from './i18n'

interface Pkg { slug: string; version: string }
const all = packages as Pkg[]
const version = (slug: string) => all.find((p) => p.slug === slug)?.version ?? ''
const { ru, prefix } = useLocale()

const groups = [
    {
        title: ['Testing', 'Тестирование'],
        text: ['Tools I needed and did not find.', 'Инструменты, которых мне не хватало.'],
        cards: [
            { slug: 'understudy', tag: ['Test doubles', 'Тестовые двойники'], text: ['The stub is a real method call, not a string. A rename is a type error before the test runs.', 'Стаб задаётся реальным вызовом метода, а не строкой. Переименование ломает тест ещё до запуска.'] },
            { slug: 'property-testing-core', tag: ['Property engine', 'Property-движок'], text: ['Generates hundreds of inputs, shrinks the failing one, replays recorded failures from a corpus.', 'Генерирует сотни входов, сжимает упавший до минимального и воспроизводит записанные падения из корпуса.'] },
            { slug: 'property-testing-openapi', tag: ['Contract fuzzing', 'Фаззинг контракта'], text: ['Schemathesis for PHP: valid and invalid requests generated from your OpenAPI document and checked against the contract.', 'Schemathesis для PHP: валидные и невалидные запросы строятся из OpenAPI-документа и проверяются контрактом.'] },
            { slug: 'doc-exec', tag: ['Doctest', 'Doctest'], text: ['README code blocks run against the current code in CI. The sample cannot rot.', 'Блоки кода из README исполняются на текущем коде в CI. Пример не устареет.'] },
        ],
    },
    {
        title: ['Reliability under load', 'Надёжность под нагрузкой'],
        text: ['What keeps a service honest when things fail.', 'Что держит сервис корректным, когда что-то падает.'],
        cards: [
            { slug: 'context', tag: ['Deadlines', 'Дедлайны'], text: ['Go-style context for PHP: one budget and one cancellation signal through HTTP, DB, CLI and subprocesses.', 'Context в стиле Go для PHP: один бюджет и один сигнал отмены через HTTP, БД, CLI и подпроцессы.'] },
            { slug: 'yii3-outbox', tag: ['Delivery', 'Доставка'], text: ['Transactional outbox for Yii3, with DB and ClickHouse backends.', 'Transactional outbox для Yii3 с бэкендами на БД и ClickHouse.'] },
            { slug: 'yii3-idempotency', tag: ['Idempotency', 'Идемпотентность'], text: ['Same key and body run the handler once. Keys are scoped per caller.', 'Тот же ключ и тело запускают обработчик один раз. Ключи привязаны к вызывающему.'] },
        ],
    },
    {
        title: ['AI and security', 'AI и безопасность'],
        text: ['Letting models and untrusted URLs near a backend.', 'Модели и недоверенные URL рядом с бэкендом.'],
        cards: [
            { slug: 'yii3-mcp', tag: ['MCP server', 'MCP-сервер'], text: ['Domain methods become MCP tools, with a call budget, RBAC and an audit log on the call.', 'Доменные методы становятся MCP-инструментами, с лимитом вызовов, RBAC и аудитом на каждом вызове.'] },
            { slug: 'pinned-http-client', tag: ['SSRF', 'SSRF'], text: ['Resolve once, check every address, pin the connection. Checking the host name is not a defence.', 'Разрешить имя один раз, проверить каждый адрес, закрепить соединение. Проверка имени хоста не защита.'] },
        ],
    },
    {
        title: ['Data and experiments', 'Данные и эксперименты'],
        text: ['From ad-tech work, as libraries.', 'Опыт ad-tech в виде библиотек.'],
        cards: [
            { slug: 'clickhouse-toolkit', tag: ['ClickHouse', 'ClickHouse'], text: ['Parameterized query builder, batch writer, DDL and partition tooling for ClickHouse.', 'Параметризованный построитель запросов, пакетная запись, DDL и партиции для ClickHouse.'] },
            { slug: 'yii3-ab-testing', tag: ['Experiments', 'Эксперименты'], text: ['Stateless hash assignment, explicit exposure tracking, receipts that tie conversions to exposures.', 'Назначение вариантов по хэшу без состояния, явный учёт показов, квитанции, связывающие конверсию с показом.'] },
        ],
    },
]
const i = (pair: string[]) => (ru.value ? pair[1] : pair[0])
</script>

<template>
  <div class="top-groups">
    <div v-for="g in groups" :key="g.title[0]" class="top-group">
      <div class="top-group-head"><h3>{{ i(g.title) }}</h3><p>{{ i(g.text) }}</p></div>
      <div class="tops">
        <a v-for="c in g.cards" :key="c.slug" class="top-card" :href="`${prefix}/packages/${c.slug}`">
          <small>{{ i(c.tag) }}</small>
          <h3>{{ c.slug }}</h3>
          <p>{{ i(c.text) }}</p>
          <div class="meta"><span>v{{ version(c.slug) }}</span><span>{{ ru ? 'разбор →' : 'deep dive →' }}</span></div>
        </a>
      </div>
    </div>
  </div>
</template>
