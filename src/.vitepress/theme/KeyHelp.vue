<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const route = useRoute()
const open = ref(false)
const ru = computed(() => route.path.startsWith('/ru/'))
const kind = computed(() => {
    const path = route.path.replace(/^\/ru/, '').replace(/\/$/, '') || '/'
    if (path === '/') return 'home'
    if (path === '/packages') return 'catalog'
    if (path.startsWith('/packages/')) return 'man'

    return 'page'
})
const rows = computed(() => {
    const r = ru.value
    const page: [string, string][] = {
        home: [['/', r ? 'фокус в apropos' : 'focus apropos']],
        catalog: [['/', r ? 'фокус в поиск по каталогу' : 'focus the catalog search']],
        man: [
            ['/', r ? 'поиск по странице' : 'search this page'],
            ['n  N', r ? 'следующее, предыдущее совпадение' : 'next, previous match'],
            ['g  G', r ? 'в начало, в конец' : 'top, bottom'],
            ['q', r ? 'назад к индексу' : 'back to the index'],
        ],
        page: [['/', r ? 'поиск по сайту' : 'search the site']],
    }[kind.value]

    return [...page, ['Ctrl K', r ? 'поиск по сайту' : 'search the site'], ['?', r ? 'эта подсказка' : 'this help'], ['Esc', r ? 'закрыть' : 'close']]
})

const editing = (e: KeyboardEvent) => (e.target as HTMLElement).closest('input, textarea, select, [contenteditable]') !== null
const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open.value) {
        open.value = false
        return
    }
    if (editing(e) || e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === '?') {
        e.preventDefault()
        open.value = !open.value
    }
}
onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div v-if="open" class="keyhelp" role="dialog" :aria-label="ru ? 'Клавиши' : 'Keys'" @click.self="open = false">
    <div class="keyhelp-box">
      <p class="keyhelp-title">{{ ru ? 'Клавиши на этой странице' : 'Keys on this page' }}</p>
      <dl>
        <template v-for="[k, d] in rows" :key="k"><dt><kbd>{{ k }}</kbd></dt><dd>{{ d }}</dd></template>
      </dl>
    </div>
  </div>
  <button v-else class="keyhelp-hint" type="button" :aria-label="ru ? 'Показать клавиши' : 'Show keys'" @click="open = true">?</button>
</template>
