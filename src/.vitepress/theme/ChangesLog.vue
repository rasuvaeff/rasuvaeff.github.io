<script setup lang="ts">
import { withBase } from 'vitepress'
import { computed, ref } from 'vue'
import packages from '../data/packages.json'
import { useLocale } from './i18n'

interface Pkg { slug: string; frozen: boolean; releases: { tag: string; date: string }[] }

const { ru, prefix } = useLocale()
const releases = (packages as Pkg[])
    .flatMap((p) => p.releases.map((r) => ({ slug: p.slug, tag: r.tag, date: r.date })))
    .filter((r) => r.date)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
const shown = ref(120)
const months = computed(() => {
    const out: { month: string; items: typeof releases }[] = []
    for (const r of releases.slice(0, shown.value)) {
        const month = r.date.slice(0, 7)
        if (out.at(-1)?.month !== month) out.push({ month, items: [] })
        out.at(-1)!.items.push(r)
    }

    return out
})
const label = (month: string) => new Date(`${month}-01T00:00:00Z`).toLocaleDateString(ru.value ? 'ru' : 'en', { month: 'long', year: 'numeric', timeZone: 'UTC' })
</script>

<template>
  <div class="changes">
    <p class="cat-count">{{ ru ? `${releases.length} релизов всех пакетов` : `${releases.length} releases across all packages` }} · <a :href="withBase('/feed.xml')">RSS</a></p>
    <section v-for="m in months" :key="m.month">
      <h3>{{ label(m.month) }}</h3>
      <div v-for="r in m.items" :key="`${r.slug}@${r.tag}`" class="ch-row">
        <span class="ch-date">{{ r.date }}</span>
        <a :href="withBase(`${prefix}/packages/${r.slug}`)">{{ r.slug }}</a>
        <a class="ch-tag" :href="`https://github.com/rasuvaeff/${r.slug}/releases/tag/${r.tag}`">{{ r.tag }}</a>
      </div>
    </section>
    <p v-if="shown < releases.length"><button class="more" type="button" @click="shown += 200">{{ ru ? `Показать ещё (${releases.length - shown})` : `Show more (${releases.length - shown})` }}</button></p>
  </div>
</template>
