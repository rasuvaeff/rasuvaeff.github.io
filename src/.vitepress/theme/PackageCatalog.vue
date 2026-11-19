<script setup lang="ts">
import { withBase } from 'vitepress'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useLocale } from './i18n'
import deep from '../data/deep.json'
import packages from '../data/packages.json'

interface Pkg {
    skill: boolean
    slug: string
    name: string
    description: string
    version: string
    minMsi: number | null
    category: string
    frozen: boolean
    family: string
}

const TOP = new Set<string>(deep)
const { ru, prefix } = useLocale()
const all = packages as Pkg[]
const categories = ['All', ...Array.from(new Set(all.map((p) => p.category))).sort()]
const query = ref('')
const category = ref('All')
const rootsOnly = ref(false)
const skillOnly = ref(false)

const rows = computed(() => {
    const q = query.value.trim().toLowerCase()
    return all.filter((p) => {
        if (category.value !== 'All' && p.category !== category.value) return false
        if (rootsOnly.value && p.family !== p.slug) return false
        if (skillOnly.value && !p.skill) return false
        return q === '' || p.slug.includes(q) || p.description.toLowerCase().includes(q)
    })
})
const searchBox = ref<HTMLInputElement>()
const focusSearch = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (e.key !== '/' || target.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return
    e.preventDefault()
    e.stopPropagation()
    searchBox.value?.focus()
}
onMounted(() => document.addEventListener('keydown', focusSearch))
onUnmounted(() => document.removeEventListener('keydown', focusSearch))
const href = (p: Pkg) => withBase(`${prefix.value}/packages/${p.slug}`)
</script>

<template>
  <div>
    <div class="cat-tools">
      <input ref="searchBox" v-model="query" type="search" :placeholder="ru ? 'Поиск пакетов: outbox, retry, ffmpeg' : 'Search packages, e.g. outbox, retry, ffmpeg'" :aria-label="ru ? 'Поиск пакетов' : 'Search packages'" />
      <label><input v-model="skillOnly" type="checkbox" /> {{ ru ? 'есть навык для агента' : 'has agent skill' }}</label>
      <label><input v-model="rootsOnly" type="checkbox" /> {{ ru ? 'только ядра семейств' : 'family cores only' }}</label>
    </div>
    <div class="chips" role="group" aria-label="Category">
      <button v-for="c in categories" :key="c" type="button" :class="{ on: c === category }" @click="category = c">{{ ru && c === 'All' ? 'Все' : c }}</button>
    </div>
    <p class="cat-count">{{ ru ? `${rows.length} из ${all.length} · активных ${all.filter((p) => !p.frozen).length}, замороженных ${all.filter((p) => p.frozen).length}` : `${rows.length} of ${all.length} listed · ${all.filter((p) => !p.frozen).length} active, ${all.filter((p) => p.frozen).length} frozen` }}</p>
    <div class="cat-list">
      <div v-for="p in rows" :key="p.slug" class="cat-row">
        <div>
          <a :href="href(p)">{{ p.slug }}</a>
          <span v-if="p.skill" class="tag skill" :title="ru ? 'Есть SKILL.md для агентов' : 'Ships an agent SKILL.md'">skill</span>
          <span v-if="p.frozen" class="tag">{{ ru ? 'заморожен' : 'frozen' }}</span>
          <span v-else-if="TOP.has(p.slug)" class="tag">{{ ru ? 'man' : 'man' }}</span>
        </div>
        <span>{{ p.description }}</span>
        <em>{{ p.minMsi ? `msi ≥ ${p.minMsi}` : '' }}</em>
        <u>v{{ p.version }}</u>
      </div>
      <p v-if="rows.length === 0" class="cat-count" style="padding: 16px 4px">{{ ru ? 'Ничего не найдено. Очисти поиск или выбери «Все».' : 'Nothing matches. Clear the search or pick All.' }}</p>
    </div>
  </div>
</template>
