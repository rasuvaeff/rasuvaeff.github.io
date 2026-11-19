import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'Victor Razuvaev',
    description:
        'Backend engineer. High-load PHP and Yii, and the libraries published as rasuvaeff/* — deadlines, shrinking, test doubles, delivery.',
    lang: 'en-US',
    base: '/',
    cleanUrls: true,
    appearance: false,
    markdown: {
        theme: { light: 'github-dark', dark: 'github-dark' },
    },
    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
        ['meta', { name: 'theme-color', content: '#0b0f0d' }],
    ],
    themeConfig: {
        logo: '/logo-mark.svg',
        siteTitle: 'Razuvaev',
        search: { provider: 'local' },
        nav: [
            { text: 'Work', link: '/#work' },
            { text: 'Packages', link: '/packages' },
            { text: 'Resume', link: '/resume' },
            { text: 'Workflow', link: '/workflow' },
            { text: 'GitHub', link: 'https://github.com/rasuvaeff' },
        ],
        outline: { label: 'On this page', level: [2, 3] },
    },
})
