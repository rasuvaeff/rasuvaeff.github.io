import { defineConfig } from 'vitepress'
import { renderAnnotatedPhp } from './annotated'

const nav = (p: string, t: { packages: string; agents: string; resume: string; workflow: string }) => [
    { text: t.packages, link: `${p}/packages` },
    { text: t.agents, link: `${p}/agents` },
    { text: t.resume, link: `${p}/resume` },
    { text: t.workflow, link: `${p}/workflow` },
    { text: 'GitHub', link: 'https://github.com/rasuvaeff' },
]

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

                return token.info.trim() === 'php' ? renderAnnotatedPhp(token.content) : fence(tokens, idx, options, env, self)
            }
        },
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
            ['meta', { name: 'twitter:card', content: 'summary' }],
        ]
    },
    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
        ['meta', { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' }],
        ['meta', { name: 'theme-color', content: '#121417', media: '(prefers-color-scheme: dark)' }],
    ],
    locales: {
        root: {
            label: 'English',
            lang: 'en-US',
            themeConfig: {
                nav: nav('', { packages: 'packages', agents: 'agents', resume: 'resume', workflow: 'workflow' }),
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
                nav: nav('/ru', { packages: 'пакеты', agents: 'агентам', resume: 'резюме', workflow: 'процесс' }),
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
