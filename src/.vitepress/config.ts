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
    cleanUrls: true,
    appearance: false,
    markdown: {
        theme: { light: 'github-dark', dark: 'github-dark' },
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
