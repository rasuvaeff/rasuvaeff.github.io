// Builds src/.vitepress/data/packages.json from the monorepo checkout next to this repo.
// Usage: node scripts/build-packages-data.mjs [monorepoRoot]
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(process.argv[2] ?? join(here, '..', '..'))
const out = join(here, '..', 'src', '.vitepress', 'data', 'packages.json')

const CATEGORIES = {
    Resilience: ['resilience', 'retry', 'circuit-breaker', 'bulkhead', 'duration', 'result'],
    Context: ['context', 'context-http', 'context-db', 'context-cli', 'context-process'],
    Delivery: ['yii3-outbox', 'yii3-outbox-db', 'yii3-outbox-clickhouse', 'yii3-outbox-webhooks-bridge', 'yii3-webhooks', 'yii3-webhooks-db', 'yii3-idempotency', 'yii3-idempotency-db', 'yii3-idempotency-redis', 'yii3-centrifugo'],
    Experiments: ['yii3-feature-flags', 'yii3-feature-flags-db', 'yii3-feature-flags-ui', 'yii3-ab-testing', 'yii3-ab-testing-db', 'yii3-ab-testing-clickhouse', 'yii3-ab-testing-web', 'yii3-ab-testing-outbox', 'yii3-utm', 'yii3-utm-db'],
    Observability: ['yii3-telemetry', 'yii3-telemetry-otel', 'yii3-metrics', 'yii3-metrics-prometheus', 'yii3-metrics-otel', 'yii3-correlation-id', 'yii3-health-check', 'yii3-audit-log', 'yii3-audit-log-db', 'domain-monitor'],
    'AI / MCP': ['yii3-mcp', 'yii3-mcp-rbac-bridge', 'yii3-mcp-audit-log-bridge', 'yii3-mcp-telemetry-bridge'],
    Payments: ['payments', 'payments-testing'],
    Files: ['yii3-filestorage', 'yii3-filestorage-db', 'yii3-filestorage-flysystem', 'yii3-filestorage-web', 'yii3-filestorage-attachments', 'yii3-filestorage-images', 'media-converter'],
    HTTP: ['pinned-http-client', 'link-preview', 'json-ld', 'yii3-api-problem'],
    Testing: ['understudy', 'understudy-testo', 'understudy-psalm', 'understudy-phpunit', 'understudy-phpstan', 'property-testing-core', 'property-testing-testo', 'property-testing-phpunit', 'property-testing-names', 'property-testing-openapi', 'property-testing', 'openapi-contract', 'doc-exec', 'quality-ledger', 'mutation-history', 'doc-exec'],
    Domain: ['specification', 'schema', 'clickhouse-toolkit', 'yii3-clickhouse-toolkit', 'yii3-tenancy', 'yii3-tenancy-db', 'yii3-settings', 'yii3-settings-db', 'yii3-settings-ui', 'yii3-workflow', 'yii3-workflow-db'],
    Infrastructure: ['yii3-maintenance-mode', 'yii3-seo', 'yii3-respect-validation', 'yii3-recaptcha', 'yii3-turnstile', 'rector-named-literals', 'rector-datetime-immutable'],
}
const categoryOf = new Map(Object.entries(CATEGORIES).flatMap(([c, list]) => list.map((s) => [s, c])))

// Family root = longest other package slug that is a prefix of this slug.
const rows = []
for (const dir of readdirSync(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    const composer = join(root, dir.name, 'composer.json')
    if (!existsSync(composer)) continue
    const json = JSON.parse(readFileSync(composer, 'utf8'))
    if (!String(json.name).startsWith('rasuvaeff/') || /-pr\d+$/.test(dir.name)) continue
    const git = (...args) => {
        try {
            return execFileSync('git', ['-C', join(root, dir.name), ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
        } catch {
            return ''
        }
    }
    const version = git('describe', '--tags', '--abbrev=0')
    if (version === '') continue // no tag: not published
    const skill = git('ls-tree', '-r', '--name-only', version).split('\n').some((f) => /resources\/skills\/.+\/SKILL\.md$/.test(f))
    let minMsi = null
    const inf = join(root, dir.name, 'infection.json5')
    if (existsSync(inf)) {
        const m = readFileSync(inf, 'utf8').match(/"minMsi"\s*:\s*(\d+)/)
        if (m) minMsi = Number(m[1])
    }
    rows.push({
        slug: dir.name,
        name: json.name,
        description: String(json.description ?? '').replace(/\s+/g, ' ').trim(),
        version: version.replace(/^v/, ''),
        minMsi,
        skill,
        category: categoryOf.get(dir.name) ?? 'Infrastructure',
        frozen: dir.name === 'property-testing',
    })
}

async function hasRemoteSkill(slug) {
    try {
        const res = await fetch(`https://api.github.com/repos/rasuvaeff/${slug}/git/trees/HEAD?recursive=1`)
        return ((await res.json()).tree ?? []).some((f) => /resources\/skills\/.+\/SKILL\.md$/.test(f.path))
    } catch {
        return false
    }
}

// Published packages that live in their own repositories, outside the monorepo checkout.
for (const slug of ['doc-exec']) {
    try {
        const res = await fetch(`https://packagist.org/packages/rasuvaeff/${slug}.json`)
        const pkg = (await res.json()).package
        const version = Object.keys(pkg.versions).find((v) => /^v?\d+\.\d+\.\d+$/.test(v))
        if (!version) continue
        rows.push({ slug, name: pkg.name, description: pkg.description, version: version.replace(/^v/, ''), minMsi: null, skill: await hasRemoteSkill(slug), category: categoryOf.get(slug) ?? 'Testing', frozen: false })
    } catch {
        console.log(`could not fetch ${slug} from Packagist, skipped`)
    }
}

const slugs = rows.map((r) => r.slug)
for (const r of rows) {
    const parent = slugs.filter((s) => s !== r.slug && r.slug.startsWith(`${s}-`)).sort((a, b) => b.length - a.length)[0]
    r.family = parent ?? r.slug
}
rows.sort((a, b) => a.slug.localeCompare(b.slug))

const uncategorised = rows.filter((r) => !categoryOf.has(r.slug)).map((r) => r.slug)
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`)
console.log(`${rows.length} packages -> ${out}`)
if (uncategorised.length) console.log(`defaulted to Infrastructure: ${uncategorised.join(', ')}`)
