// Builds src/.vitepress/data/packages.json from Packagist and the tagged sources on GitHub.
// Usage: node scripts/build-packages-data.mjs
// No monorepo checkout and no GitHub token needed: version, description and the abandoned flag
// come from Packagist; minMsi and the agent skill are read from the commit of the latest stable tag.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'src', '.vitepress', 'data', 'packages.json')

const CATEGORIES = {
    Resilience: ['resilience', 'retry', 'circuit-breaker', 'bulkhead', 'duration', 'result'],
    Context: ['context', 'context-http', 'context-db', 'context-cli', 'context-process'],
    Delivery: ['yii3-outbox', 'yii3-outbox-db', 'yii3-outbox-clickhouse', 'yii3-outbox-webhooks-bridge', 'yii3-webhooks', 'yii3-webhooks-db', 'yii3-idempotency', 'yii3-idempotency-db', 'yii3-idempotency-redis', 'yii3-centrifugo'],
    Experiments: ['yii3-feature-flags', 'yii3-feature-flags-db', 'yii3-feature-flags-ui', 'yii3-ab-testing', 'yii3-ab-testing-db', 'yii3-ab-testing-clickhouse', 'yii3-ab-testing-web', 'yii3-ab-testing-outbox', 'yii3-utm', 'yii3-utm-db'],
    Observability: ['yii3-telemetry', 'yii3-telemetry-otel', 'yii3-metrics', 'yii3-metrics-prometheus', 'yii3-metrics-otel', 'yii3-correlation-id', 'yii3-health-check', 'yii3-audit-log', 'yii3-audit-log-db', 'domain-monitor'],
    'AI / MCP': ['mcp', 'mcp-openapi', 'yii3-mcp', 'yii3-mcp-rbac-bridge', 'yii3-mcp-audit-log-bridge', 'yii3-mcp-telemetry-bridge'],
    Payments: ['payments', 'payments-testing'],
    Files: ['yii3-filestorage', 'yii3-filestorage-db', 'yii3-filestorage-flysystem', 'yii3-filestorage-web', 'yii3-filestorage-attachments', 'yii3-filestorage-images', 'media-converter'],
    HTTP: ['pinned-http-client', 'link-preview', 'json-ld', 'yii3-api-problem'],
    Testing: ['understudy', 'understudy-testo', 'understudy-psalm', 'understudy-phpunit', 'understudy-phpstan', 'property-testing-core', 'property-testing-testo', 'property-testing-phpunit', 'property-testing-names', 'property-testing-openapi', 'property-testing', 'openapi-contract', 'doc-exec', 'quality-ledger', 'mutation-history', 'doc-exec'],
    Domain: ['specification', 'schema', 'clickhouse-toolkit', 'yii3-clickhouse-toolkit', 'yii3-tenancy', 'yii3-tenancy-db', 'yii3-settings', 'yii3-settings-db', 'yii3-settings-ui', 'yii3-workflow', 'yii3-workflow-db'],
    Infrastructure: ['yii3-maintenance-mode', 'yii3-seo', 'yii3-respect-validation', 'yii3-recaptcha', 'yii3-turnstile', 'yii3-altcha', 'rector-named-literals', 'rector-datetime-immutable'],
}
const categoryOf = new Map(Object.entries(CATEGORIES).flatMap(([c, list]) => list.map((s) => [s, c])))

async function json(url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    return res.json()
}

async function text(url) {
    const res = await fetch(url)
    return res.ok ? res.text() : null
}

const semver = (v) => v.replace(/^v/, '').split('.').map(Number)
const newer = (a, b) => {
    const [x, y] = [semver(a), semver(b)]
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]
    return false
}

async function describe(name) {
    // The query string bypasses Packagist's CDN cache, which can serve metadata from before the last push.
    const pkg = (await json(`https://packagist.org/packages/${name}.json?t=${Date.now()}`)).package
    const tags = Object.keys(pkg.versions).filter((v) => /^v?\d+\.\d+\.\d+$/.test(v))
    if (tags.length === 0) return null
    const tag = tags.reduce((best, v) => (newer(v, best) ? v : best))
    const slug = name.split('/')[1]
    const ref = pkg.versions[tag].source?.reference ?? tag
    const requires = Object.keys(pkg.versions[tag].require ?? {}).filter((n) => n.startsWith('rasuvaeff/')).map((n) => n.split('/')[1])
    const raw = (path) => `https://raw.githubusercontent.com/rasuvaeff/${slug}/${ref}/${path}`
    const infection = await text(raw('infection.json5'))
    const msi = infection?.match(/"minMsi"\s*:\s*(\d+)/)
    const skill = (await text(raw(`resources/skills/rasuvaeff-${slug}/SKILL.md`))) !== null
    const readme = (await text(raw('README.md'))) ?? ''
    const dev = readme.includes(`composer require --dev rasuvaeff/${slug}`)
    if (!categoryOf.has(slug)) console.log(`no category for ${slug}, using Infrastructure`)

    return {
        slug,
        name,
        description: String(pkg.description ?? '').replace(/\s+/g, ' ').trim(),
        version: tag.replace(/^v/, ''),
        minMsi: msi ? Number(msi[1]) : null,
        skill,
        dev,
        category: categoryOf.get(slug) ?? 'Infrastructure',
        frozen: Boolean(pkg.abandoned),
        replacement: typeof pkg.abandoned === 'string' ? pkg.abandoned.split('/')[1] : null,
        requires,
        releases: tags
            .map((v) => ({ tag: v, date: String(pkg.versions[v].time ?? '').slice(0, 10) }))
            .sort((a, b) => (newer(a.tag, b.tag) ? -1 : 1)),
    }
}

async function pool(items, size, fn) {
    const results = []
    let next = 0
    await Promise.all(Array.from({ length: size }, async () => {
        while (next < items.length) {
            const i = next++
            results[i] = await fn(items[i])
        }
    }))
    return results
}

const names = (await json('https://packagist.org/packages/list.json?vendor=rasuvaeff')).packageNames
const rows = (await pool(names, 8, describe)).filter(Boolean)

if (rows.length < names.length * 0.8) {
    throw new Error(`only ${rows.length} of ${names.length} packages described; refusing to write`)
}

const slugs = rows.map((r) => r.slug)
for (const r of rows) {
    const parent = slugs.filter((s) => s !== r.slug && r.slug.startsWith(`${s}-`)).sort((a, b) => b.length - a.length)[0]
    r.family = parent ?? r.slug
}
for (const r of rows) {
    r.dependents = rows.filter((o) => o.slug !== r.slug && o.requires.includes(r.slug)).length
}
rows.sort((a, b) => a.slug.localeCompare(b.slug))

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`)
console.log(`${rows.length} packages -> ${out}`)
