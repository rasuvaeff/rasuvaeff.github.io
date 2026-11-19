import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/manrope/cyrillic-500.css'
import '@fontsource/manrope/cyrillic-700.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import FamilyMap from './FamilyMap.vue'
import PackageCatalog from './PackageCatalog.vue'
import TopCards from './TopCards.vue'
import PackageMeta from './PackageMeta.vue'
import SkillList from './SkillList.vue'
import './custom.css'

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('PackageCatalog', PackageCatalog)
        app.component('FamilyMap', FamilyMap)
        app.component('PackageMeta', PackageMeta)
        app.component('TopCards', TopCards)
        app.component('SkillList', SkillList)
    },
} satisfies Theme
