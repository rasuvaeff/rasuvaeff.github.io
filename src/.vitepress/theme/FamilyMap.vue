<script setup lang="ts">
import deep from '../data/deep.json'
import packages from '../data/packages.json'
import { useLocale } from './i18n'

interface Pkg { slug: string; family: string; version: string }
const all = packages as Pkg[]
const TOP = new Set<string>(deep)
const { ru, prefix } = useLocale()

const families = [
    { root: 'yii3-outbox', title: ['Outbox and delivery', 'Outbox и доставка'], text: ['Transactional outbox, DB and ClickHouse backends, webhooks bridged through it.', 'Transactional outbox, бэкенды на БД и ClickHouse, вебхуки поверх него.'] },
    { root: 'yii3-ab-testing', title: ['Experiments', 'Эксперименты'], text: ['Deterministic assignment with DB, web, outbox and ClickHouse siblings.', 'Детерминированное назначение; соседи для БД, веба, outbox и ClickHouse.'] },
    { root: 'context', title: ['Context', 'Context'], text: ['One deadline through HTTP, DB statements, CLI workers and subprocesses.', 'Один дедлайн через HTTP, запросы к БД, CLI-воркеры и подпроцессы.'] },
    { root: 'yii3-filestorage', title: ['File storage', 'Файловое хранилище'], text: ['Facade, deduplication ledger, Flysystem, signed downloads, attachments, images.', 'Фасад, реестр дедупликации, Flysystem, подписанные загрузки, вложения, изображения.'] },
    { root: 'yii3-mcp', title: ['MCP', 'MCP'], text: ['Tools for agents, with RBAC, audit log and telemetry on the same call.', 'Инструменты для агентов; RBAC, аудит и телеметрия на том же вызове.'] },
    { root: 'property-testing-core', title: ['Property testing', 'Property-тестирование'], text: ['Engine plus Testo, PHPUnit, OpenAPI and names adapters.', 'Движок и адаптеры для Testo, PHPUnit, OpenAPI и генераторов имён.'] },
    { root: 'understudy', title: ['Test doubles', 'Тестовые двойники'], text: ['Call-closure doubles with Testo, PHPUnit, Psalm and PHPStan adapters.', 'Двойники через замыкание вызова; адаптеры для Testo, PHPUnit, Psalm и PHPStan.'] },
    { root: 'yii3-idempotency', title: ['Idempotency', 'Идемпотентность'], text: ['Keyed request dedupe with a DB backend.', 'Дедупликация запросов по ключу; бэкенды на БД и Redis.'] },
]
const members = (root: string) => all.filter((p) => p.family === root).sort((a, b) => (a.slug === root ? -1 : b.slug === root ? 1 : a.slug.localeCompare(b.slug)))
const href = (slug: string) => (TOP.has(slug) ? `${prefix.value}/packages/${slug}` : `https://github.com/rasuvaeff/${slug}`)
const i = (pair: string[]) => (ru.value ? pair[1] : pair[0])
</script>

<template>
  <div class="fam-map">
    <div v-for="f in families" :key="f.root" class="fam-box">
      <h3>{{ i(f.title) }}</h3>
      <p>{{ i(f.text) }}</p>
      <div class="fam-chips">
        <a v-for="m in members(f.root)" :key="m.slug" :href="href(m.slug)" :class="{ core: m.slug === f.root }">{{ m.slug === f.root ? f.root : m.slug.slice(f.root.length) }}</a>
      </div>
    </div>
  </div>
</template>
