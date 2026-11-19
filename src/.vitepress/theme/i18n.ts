import { computed } from 'vue'
import { useData } from 'vitepress'

export function useLocale() {
    const { lang } = useData()
    const ru = computed(() => lang.value.startsWith('ru'))
    const prefix = computed(() => (ru.value ? '/ru' : ''))
    return { ru, prefix }
}
