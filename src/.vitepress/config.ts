import { defineConfig } from 'vitepress'

const nav = (p: string, t: { deep: string; packages: string; agents: string; resume: string; workflow: string }) => [
    { text: t.deep, link: `${p}/#work` },
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
    appearance: false,
    markdown: {
        theme: { light: 'github-dark', dark: 'github-dark' },
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
        ['meta', { name: 'theme-color', content: '#0f1115' }],
    ],
    locales: {
        root: {
            label: 'English',
            lang: 'en-US',
            themeConfig: {
                nav: nav('', { deep: 'Deep dives', packages: 'Packages', agents: 'For agents', resume: 'Resume', workflow: 'Workflow' }),
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
                nav: nav('/ru', { deep: 'Разборы', packages: 'Пакеты', agents: 'Агентам', resume: 'Резюме', workflow: 'Процесс' }),
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
        logo: '/logo-mark.svg',
        siteTitle: 'Razuvaev',
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
