import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-sans/500-italic.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import Exhibit from './Exhibit.vue'
import './custom.css'

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('Exhibit', Exhibit)
    },
} satisfies Theme
