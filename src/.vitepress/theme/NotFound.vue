<script setup lang="ts">
import { useRoute, withBase } from 'vitepress'
import { computed } from 'vue'
import packages from '../data/packages.json'

interface Pkg { slug: string; description: string; frozen: boolean }

const route = useRoute()
const ru = computed(() => route.path.startsWith('/ru/'))
const prefix = computed(() => (ru.value ? '/ru' : ''))
const term = computed(() => {
    const last = decodeURIComponent(route.path.replace(/\/+$/, '').split('/').pop() ?? '').replace(/\.html$/, '')

    return last || 'page'
})
const words = computed(() => term.value.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2))
// Edit distance where swapping two neighbouring letters counts as one edit, so "retyr" is one away from "retry".
function distance(a: string, b: string): number {
    const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
        }
    }

    return d[a.length][b.length]
}
const close = (word: string, slug: string) => [slug, ...slug.split('-')].some((part) => part.length > 2 && distance(word, part) <= (word.length >= 4 ? 2 : 1))
const hits = computed(() => {
    const live = (packages as Pkg[]).filter((p) => !p.frozen)
    const exact = live.filter((p) => words.value.some((w) => `${p.slug} ${p.description}`.toLowerCase().includes(w)))
    const score = (slug: string) => Math.min(...words.value.flatMap((w) => [slug, ...slug.split('-')].map((part) => distance(w, part))))
    const fuzzy = exact.length ? [] : live.filter((p) => words.value.some((w) => close(w, p.slug))).sort((a, b) => score(a.slug) - score(b.slug))

    return [...exact, ...fuzzy].slice(0, 8)
})
</script>

<template>
  <div class="man not-found">
    <p class="nf-line">{{ ru ? 'Нет справочной страницы для' : 'No manual entry for' }} <b>{{ term }}</b></p>
    <div class="apropos">
      <label><span>$ apropos</span><span class="q">{{ words.join(' ') || term }}</span></label>
      <ol>
        <li v-for="p in hits" :key="p.slug"><a :href="withBase(`${prefix}/packages/${p.slug}`)">{{ p.slug }}(3)</a><span>— {{ p.description }}</span></li>
        <li v-if="!hits.length" class="none">{{ words.join(' ') || term }}: nothing appropriate.</li>
      </ol>
    </div>
    <p class="nf-links"><a :href="withBase(`${prefix}/`)">{{ ru ? 'На главную' : 'Home' }}</a> · <a :href="withBase(`${prefix}/packages`)">{{ ru ? 'Все пакеты' : 'All packages' }}</a></p>
  </div>
</template>
