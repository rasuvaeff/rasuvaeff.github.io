// Open Graph images (1200x630) in the site's report style, rendered at build time with satori + resvg.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

interface Pkg { slug: string; version: string; minMsi: number | null; dependents: number; frozen: boolean }
export interface OgPage { relativePath: string; title: string; description: string; date?: string; figures?: [string, string][] }

const here = dirname(fileURLToPath(import.meta.url))
const fonts = join(here, '..', '..', 'node_modules', '@fontsource')
const font = (path: string) => readFileSync(join(fonts, path))

const C = { bg: '#ffffff', fg: '#15171c', soft: '#4a505c', dim: '#737a89', rule: '#e3e5ea', ink: '#2346c9' }

type Node = { type: string; props: Record<string, unknown> }
const el = (type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node => ({
    type,
    props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children },
})

/** The image file a page uses, relative to the site root. */
export function ogImageFor(relativePath: string): string {
    const pkg = relativePath.match(/^(?:ru\/)?packages\/([^/]+)\.md$/)
    if (pkg) return `og/packages/${pkg[1]}.png`
    const ru = relativePath.startsWith('ru/')
    const name = relativePath.replace(/^ru\//, '').replace(/\.md$/, '').replace(/(^|\/)index$/, '$1home').replace(/\//g, '-') || 'home'

    return `og/${name}${ru ? '-ru' : ''}.png`
}

function card(kicker: string, title: string, description: string, footRight: string): Node {
    const limit = title.length > 40 ? 90 : 150
    const short = description.length > limit ? `${description.slice(0, limit - 3).replace(/\s+\S*$/, '')}…` : description

    return el(
        'div',
        { width: 1200, height: 630, background: C.bg, color: C.fg, padding: '64px 72px', flexDirection: 'column', fontFamily: 'Sans, SansCyr' },
        el('div', { fontFamily: 'Mono, MonoCyr', fontSize: 26, color: C.dim }, kicker),
        el('div', { fontSize: title.length > 40 ? 64 : title.length > 22 ? 76 : 96, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 28 }, title),
        el('div', { fontSize: 34, lineHeight: 1.4, color: C.soft, marginTop: 24, maxWidth: 1000 }, short),
        el(
            'div',
            { marginTop: 'auto', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `2px solid ${C.rule}`, paddingTop: 22, fontFamily: 'Mono, MonoCyr', fontSize: 26 },
            el('div', { color: C.ink }, 'rasuvaeff.github.io'),
            el('div', { color: C.dim }, footRight),
        ),
    )
}

/** A blog post cover: date kicker, title, and up to four key figures instead of the description. */
function post(page: OgPage, ru: boolean): Node {
    const date = new Date(`${page.date}T00:00:00Z`).toLocaleDateString(ru ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    const figures = (page.figures ?? []).slice(0, 4)

    return el(
        'div',
        { width: 1200, height: 630, background: C.bg, color: C.fg, padding: '64px 72px', flexDirection: 'column', fontFamily: 'Sans, SansCyr' },
        el('div', { fontFamily: 'Mono, MonoCyr', fontSize: 26, color: C.dim }, `${ru ? 'блог' : 'blog'} · ${date}`),
        el('div', { fontSize: page.title.length > 48 ? 58 : 68, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 28 }, page.title),
        el(
            'div',
            { marginTop: 'auto', marginBottom: 36, gap: 64 },
            ...figures.map(([value, label]) =>
                el(
                    'div',
                    { flexDirection: 'column' },
                    el('div', { fontSize: 60, fontWeight: 700, letterSpacing: '-0.02em', color: C.ink }, value),
                    el('div', { fontFamily: 'Mono, MonoCyr', fontSize: 22, color: C.dim, marginTop: 6 }, label),
                ),
            ),
        ),
        el(
            'div',
            { justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `2px solid ${C.rule}`, paddingTop: 22, fontFamily: 'Mono, MonoCyr', fontSize: 26 },
            el('div', { color: C.ink }, 'rasuvaeff.github.io'),
            el('div', { color: C.dim }, ru ? 'Виктор Разуваев' : 'Victor Razuvaev'),
        ),
    )
}

export async function renderOgImages(outDir: string, pages: OgPage[], packages: Pkg[]): Promise<number> {
    const options = {
        width: 1200,
        height: 630,
        fonts: [
            { name: 'Sans', data: font('instrument-sans/files/instrument-sans-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
            { name: 'Sans', data: font('instrument-sans/files/instrument-sans-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
            { name: 'SansCyr', data: font('manrope/files/manrope-cyrillic-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
            { name: 'SansCyr', data: font('manrope/files/manrope-cyrillic-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
            { name: 'Mono', data: font('ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
            { name: 'MonoCyr', data: font('ibm-plex-mono/files/ibm-plex-mono-cyrillic-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
        ],
    }
    const active = packages.filter((p) => !p.frozen).length
    const done = new Set<string>()

    for (const page of pages) {
        const file = ogImageFor(page.relativePath)
        if (done.has(file)) continue
        done.add(file)
        const ru = page.relativePath.startsWith('ru/')
        const slug = file.match(/^og\/packages\/(.+)\.png$/)?.[1]
        let node: Node
        if (page.date) {
            node = post(page, ru)
        } else if (slug) {
            const p = packages.find((x) => x.slug === slug)
            const meta = [p ? `v${p.version}` : '', p?.frozen ? 'frozen' : '', p?.minMsi ? `gate ${p.minMsi}%` : '', p?.dependents ? `used by ${p.dependents}` : ''].filter(Boolean).join(' · ')
            node = card('rasuvaeff PHP Library Manual', `${slug}(3)`, page.description, meta)
        } else {
            node = card(`rasuvaeff/* · ${active} ${ru ? 'пакетов' : 'packages'}`, page.title, page.description, ru ? 'Виктор Разуваев' : 'Victor Razuvaev')
        }
        const svg = await satori(node as never, options)
        const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
        const target = join(outDir, file)
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, png)
    }

    return done.size
}
