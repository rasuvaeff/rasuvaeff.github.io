import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vitepress'
import { renderAnnotatedPhp } from './annotated'
import { type OgPage, ogImageFor, renderOgImages } from './og'
import packages from './data/packages.json'

const nav = (p: string, t: { blog: string; packages: string; changes: string; agents: string; resume: string; workflow: string }) => [
    { text: t.blog, link: `${p}/blog/`, activeMatch: `^${p}/blog/` },
    { text: t.packages, link: `${p}/packages` },
    { text: t.changes, link: `${p}/changes` },
    { text: t.agents, link: `${p}/agents` },
    { text: t.resume, link: `${p}/resume` },
    { text: t.workflow, link: `${p}/workflow` },
    { text: 'GitHub', link: 'https://github.com/rasuvaeff' },
]

const ogPages = new Map<string, OgPage>()
const blogPosts = new Map<string, { url: string; title: string; description: string; date: string; ru: boolean }>()

export default defineConfig({
    title: 'Victor Razuvaev',
    description:
        'Senior backend engineer. High-load PHP and Yii, and 89 published libraries: deadlines, delivery, experiments, shrinking, test doubles.',
    lang: 'en-US',
    base: '/',
    sitemap: { hostname: 'https://rasuvaeff.github.io' },
    cleanUrls: true,
    appearance: true,
    markdown: {
        theme: { light: 'github-light', dark: 'github-dark' },
        config(md) {
            const fence = md.renderer.rules.fence!
            md.renderer.rules.fence = (tokens, idx, options, env, self) => {
                const token = tokens[idx]

                return /^php(\s|$)/.test(token.info.trim()) ? renderAnnotatedPhp(token.content) : fence(tokens, idx, options, env, self)
            }
        },
    },
    async buildEnd(siteConfig) {
        // RSS feed of the latest releases across all packages.
        const site = 'https://rasuvaeff.github.io'
        const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        const items = packages
            .flatMap((p) => p.releases.map((r) => ({ slug: p.slug, description: p.description, ...r })))
            .filter((r) => r.date)
            .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
            .slice(0, 50)
            .map((r) => `<item><title>rasuvaeff/${r.slug} ${r.tag}</title><link>https://github.com/rasuvaeff/${r.slug}/releases/tag/${r.tag}</link><guid isPermaLink="false">rasuvaeff/${r.slug}@${r.tag}</guid><pubDate>${new Date(`${r.date}T00:00:00Z`).toUTCString()}</pubDate><description>${esc(r.description)}</description></item>`)
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>rasuvaeff/* releases</title><link>${site}/changes</link><description>Every release of every rasuvaeff/* PHP package.</description><language>en</language>${items.join('')}</channel></rss>\n`
        writeFileSync(join(siteConfig.outDir, 'feed.xml'), xml)
        // One blog feed per language: a reader subscribes to the language they read.
        for (const ru of [false, true]) {
            const posts = [...blogPosts.values()]
                .filter((p) => p.ru === ru)
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((p) => `<item><title>${esc(p.title)}</title><link>${p.url}</link><guid>${p.url}</guid><pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`)
            const blog = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${ru ? 'Блог Виктора Разуваева' : 'Victor Razuvaev — blog'}</title><link>${site}/${ru ? 'ru/' : ''}blog/</link><description>${ru ? 'Длинные заметки о пакетах, сайтах на них и работе с агентами.' : 'Long-form notes on the packages, the sites built on them, and working with coding agents.'}</description><language>${ru ? 'ru' : 'en'}</language>${posts.join('')}</channel></rss>\n`
            writeFileSync(join(siteConfig.outDir, ru ? 'blog-ru.xml' : 'blog.xml'), blog)
        }
        const images = await renderOgImages(siteConfig.outDir, [...ogPages.values()], packages)
        console.log(`og images: ${images}`)
    },
    transformPageData(pageData) {
        // Generated manual pages get their identity from the route parameter.
        const slug = pageData.params?.pkg as string | undefined
        if (!slug) {
            if (pageData.relativePath !== '404.md') {
                const blogPath = pageData.relativePath.match(/^(ru\/)?blog\/(?!index\.md$)(.+)\.md$/)
                if (blogPath && pageData.frontmatter.date) {
                    blogPosts.set(pageData.relativePath, {
                        url: `https://rasuvaeff.github.io/${pageData.relativePath.replace(/\.md$/, '')}`,
                        title: String(pageData.frontmatter.title),
                        description: String(pageData.frontmatter.description ?? ''),
                        date: new Date(pageData.frontmatter.date).toISOString().slice(0, 10),
                        ru: Boolean(blogPath[1]),
                    })
                }
                ogPages.set(pageData.relativePath, {
                    relativePath: pageData.relativePath,
                    title: String(pageData.frontmatter.ogTitle ?? pageData.frontmatter.title ?? pageData.title),
                    description: String(pageData.frontmatter.description ?? pageData.description ?? ''),
                    date: pageData.frontmatter.date ? new Date(pageData.frontmatter.date).toISOString().slice(0, 10) : undefined,
                    figures: pageData.frontmatter.figures,
                })
            }
            return
        }
        const pkg = packages.find((p) => p.slug === slug)
        pageData.title = slug
        pageData.frontmatter.title = slug
        pageData.frontmatter.package = slug
        pageData.frontmatter.description = pkg?.description ?? ''
        pageData.description = pkg?.description ?? ''
        ogPages.set(pageData.relativePath, { relativePath: pageData.relativePath, title: slug, description: pkg?.description ?? '' })
    },
    transformHead({ pageData, siteData }) {
        const path = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
        const url = `https://rasuvaeff.github.io/${path}`
        const title = pageData.frontmatter.title ?? pageData.title ?? siteData.title
        const description = pageData.frontmatter.description ?? pageData.description ?? siteData.description
        const ru = pageData.relativePath.startsWith('ru/')
        const twin = ru ? path.replace(/^ru\/?/, '') : `ru/${path}`

        return [
            ['link', { rel: 'canonical', href: url }],
            ['link', { rel: 'alternate', hreflang: ru ? 'ru' : 'en', href: url }],
            ['link', { rel: 'alternate', hreflang: ru ? 'en' : 'ru', href: `https://rasuvaeff.github.io/${twin}` }],
            ['meta', { property: 'og:type', content: 'website' }],
            ['meta', { property: 'og:site_name', content: 'Victor Razuvaev' }],
            ['meta', { property: 'og:title', content: title }],
            ['meta', { property: 'og:description', content: description }],
            ['meta', { property: 'og:url', content: url }],
            ['meta', { property: 'og:locale', content: ru ? 'ru_RU' : 'en_US' }],
            ['meta', { property: 'og:image', content: `https://rasuvaeff.github.io/${ogImageFor(pageData.relativePath)}` }],
            ['meta', { property: 'og:image:width', content: '1200' }],
            ['meta', { property: 'og:image:height', content: '630' }],
            ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ]
    },
    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
        ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'rasuvaeff/* releases', href: '/feed.xml' }],
        ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'Blog', href: '/blog.xml' }],
        ['meta', { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' }],
        ['meta', { name: 'theme-color', content: '#121417', media: '(prefers-color-scheme: dark)' }],
    ],
    locales: {
        root: {
            label: 'English',
            lang: 'en-US',
            themeConfig: {
                nav: nav('', { blog: 'blog', packages: 'packages', changes: 'changes', agents: 'agents', resume: 'resume', workflow: 'workflow' }),
                outline: { label: 'On this page', level: [2, 3] },
            },
        },
        ru: {
            label: 'Русский',
            lang: 'ru-RU',
            link: '/ru/',
            description:
                'Senior backend-разработчик. Высоконагруженный PHP и Yii и 89 опубликованных библиотек: дедлайны, доставка, эксперименты, shrinking, тестовые двойники.',
            themeConfig: {
                nav: nav('/ru', { blog: 'блог', packages: 'пакеты', changes: 'релизы', agents: 'агентам', resume: 'резюме', workflow: 'процесс' }),
                outline: { label: 'На этой странице', level: [2, 3] },
                langMenuLabel: 'Язык',
                returnToTopLabel: 'Наверх',
                sidebarMenuLabel: 'Меню',
                darkModeSwitchLabel: 'Тема',
                docFooter: { prev: 'Назад', next: 'Дальше' },
            },
        },
    },
    themeConfig: {
        siteTitle: 'rasuvaeff',
        search: {
            provider: 'local',
            options: {
                locales: {
                    ru: {
                        translations: {
                            button: { buttonText: 'Поиск', buttonAriaLabel: 'Поиск' },
                            modal: {
                                noResultsText: 'Ничего не найдено',
                                resetButtonTitle: 'Сбросить',
                                footer: { selectText: 'выбрать', navigateText: 'навигация', closeText: 'закрыть' },
                            },
                        },
                    },
                },
            },
        },
    },
})
