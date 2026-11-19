import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import '@fontsource/instrument-sans/400.css'
import '@fontsource/instrument-sans/600.css'
import '@fontsource/instrument-sans/700.css'
import '@fontsource/manrope/cyrillic-400.css'
import '@fontsource/manrope/cyrillic-600.css'
import '@fontsource/manrope/cyrillic-700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import ChangesLog from './ChangesLog.vue'
import HomeReport from './HomeReport.vue'
import ManInstall from './ManInstall.vue'
import ManPage from './ManPage.vue'
import KeyHelp from './KeyHelp.vue'
import NotFound from './NotFound.vue'
import PackageCatalog from './PackageCatalog.vue'
import SkillList from './SkillList.vue'
import './custom.css'

export default {
    extends: DefaultTheme,
    Layout: () => h(DefaultTheme.Layout, null, { 'not-found': () => h(NotFound), 'layout-bottom': () => h(KeyHelp) }),
    enhanceApp({ app }) {
        app.component('HomeReport', HomeReport)
        app.component('ChangesLog', ChangesLog)
        app.component('man', ManPage)
        app.component('ManInstall', ManInstall)
        app.component('PackageCatalog', PackageCatalog)
        app.component('SkillList', SkillList)

        if (typeof document !== 'undefined') {
            // Copy button on build-time code listings: copies the code column only, without margin notes.
            document.addEventListener('click', (event) => {
                const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.listing .copy')
                if (!button) return
                const code = [...button.parentElement!.querySelectorAll('.c')].map((c) => c.textContent ?? '').join('\n')
                navigator.clipboard?.writeText(code.replace(/[ \t]+$/gm, '')).then(
                    () => {
                        button.textContent = 'copied'
                        setTimeout(() => (button.textContent = 'copy'), 1200)
                    },
                    () => {},
                )
            })
        }
    },
} satisfies Theme
