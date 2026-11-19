// Builds the generated manual pages: one per published package that has no hand-written page.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

interface Pkg {
    slug: string
    description: string
    family: string
    skill: boolean
    frozen: boolean
    replacement: string | null
}

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const packages = JSON.parse(readFileSync(join(here, 'data', 'packages.json'), 'utf8')) as Pkg[]

const lowerFirst = (s: string): string => (s.length > 1 && s[1] === s[1].toLowerCase() ? s[0].toLowerCase() + s.slice(1) : s)

function page(p: Pkg, ru: boolean): string {
    const prefix = ru ? '/ru' : ''
    const gh = `https://github.com/rasuvaeff/${p.slug}`
    const name = `${p.slug} — ${lowerFirst(p.description.replace(/\.$/, ''))}`
    const family = packages.filter((o) => o.slug !== p.slug && (o.family === p.family || o.slug === p.family) && !o.frozen)
    const H = ru
        ? { name: 'ИМЯ', syn: 'ОБЗОР', desc: 'ОПИСАНИЕ', files: 'ФАЙЛЫ', see: 'СМОТРИТЕ ТАКЖЕ' }
        : { name: 'NAME', syn: 'SYNOPSIS', desc: 'DESCRIPTION', files: 'FILES', see: 'SEE ALSO' }

    const out = [`## ${H.name}`, '', name, '', `## ${H.syn}`, '', '<ManInstall />', '', `## ${H.desc}`, '', p.description, '']
    out.push(
        ru
            ? `Это краткая страница: описание пакета на английском, как в \`composer.json\`. Полная документация и примеры — в [README](${gh}#readme), справочник по API для моделей — [llms.txt](${gh}/blob/master/llms.txt).`
            : `This is a short page generated from Packagist. The full documentation and examples are in the [README](${gh}#readme); the API reference for models is [llms.txt](${gh}/blob/master/llms.txt).`,
        '',
    )
    if (p.frozen && p.replacement) {
        out.push(ru ? `Пакет заморожен, новых релизов не будет. Используйте [${p.replacement}](${prefix}/packages/${p.replacement})(3).` : `Frozen: no new releases. Use [${p.replacement}](${prefix}/packages/${p.replacement})(3) instead.`, '')
    }
    out.push(`## ${H.files}`, '', `- \`vendor/rasuvaeff/${p.slug}/llms.txt\` — ${ru ? 'справочник по API для модели' : 'API reference for a model'}`)
    if (p.skill) out.push(`- \`.agents/skills/rasuvaeff-${p.slug}/SKILL.md\` — ${ru ? 'навык для агента, его кладёт плагин llm/skills' : 'agent skill, synced by the llm/skills plugin'}`)
    out.push('')
    if (family.length) {
        out.push(`## ${H.see}`, '', family.map((o) => `[${o.slug}](${prefix}/packages/${o.slug})(3)`).join(', '), '')
    }

    return out.join('\n')
}

export function manPaths(ru: boolean) {
    const dir = join(root, ru ? 'ru/packages' : 'packages')

    return packages
        .filter((p) => !existsSync(join(dir, `${p.slug}.md`)))
        .map((p) => ({ params: { pkg: p.slug }, content: page(p, ru) }))
}
