<script setup lang="ts">
import { Content, useData, withBase } from 'vitepress'
import { computed, onMounted, onUnmounted } from 'vue'
import packages from '../data/packages.json'
import { useLocale } from './i18n'

interface Pkg { slug: string; version: string; minMsi: number | null; dependents: number; requires: string[]; releases: { tag: string; date: string }[] }

const { frontmatter, params } = useData()
const { ru, prefix } = useLocale()
const slug = computed(() => String(params.value?.pkg ?? frontmatter.value.package ?? frontmatter.value.title))
const section = computed(() => String(frontmatter.value.section ?? 3))
const pkg = computed(() => (packages as Pkg[]).find((p) => p.slug === slug.value))
const name = computed(() => `${slug.value.toUpperCase()}(${section.value})`)
const all = packages as Pkg[]
const known = new Set(all.map((p) => p.slug))
const requires = computed(() => (pkg.value?.requires ?? []).filter((s) => known.has(s)))
const requiredBy = computed(() => all.filter((p) => p.requires.includes(slug.value)).map((p) => p.slug).sort())
const releases = computed(() => pkg.value?.releases ?? [])
const firstRelease = computed(() => releases.value[releases.value.length - 1])

let onKey: ((e: KeyboardEvent) => void) | null = null
let bar: HTMLFormElement | null = null

onMounted(() => {
    const page = document.querySelector<HTMLElement>('.man-body')
    if (!page) return

    bar = document.createElement('form')
    bar.className = 'less'
    bar.hidden = true
    bar.innerHTML = '<label for="less-q">/</label><input id="less-q" autocomplete="off" spellcheck="false"><span></span>'
    document.body.append(bar)
    const input = bar.querySelector('input')!
    const count = bar.querySelector('span')!
    input.setAttribute('aria-label', ru.value ? 'Поиск по странице' : 'Search this page')
    let marks: HTMLElement[] = []
    let at = -1

    const clear = () => {
        page.querySelectorAll('mark.hit').forEach((m) => m.replaceWith(m.textContent ?? ''))
        page.normalize()
        marks = []
        at = -1
    }
    const go = (dir: number) => {
        if (!marks.length) {
            count.textContent = ru.value ? 'Шаблон не найден' : 'Pattern not found'
            return
        }
        marks[at]?.classList.remove('cur')
        at = (at + dir + marks.length) % marks.length
        marks[at].classList.add('cur')
        marks[at].scrollIntoView({ block: 'center' })
        count.textContent = `${at + 1}/${marks.length}`
    }
    const search = (term: string) => {
        clear()
        if (!term) {
            count.textContent = ''
            return
        }
        const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT)
        const nodes: Text[] = []
        while (walker.nextNode()) nodes.push(walker.currentNode as Text)
        const needle = term.toLowerCase()
        for (const node of nodes) {
            const text = node.nodeValue ?? ''
            let i = text.toLowerCase().indexOf(needle)
            if (i < 0) continue
            const frag = document.createDocumentFragment()
            let last = 0
            while (i >= 0) {
                frag.append(text.slice(last, i))
                const m = document.createElement('mark')
                m.className = 'hit'
                m.textContent = text.slice(i, i + term.length)
                frag.append(m)
                marks.push(m)
                last = i + term.length
                i = text.toLowerCase().indexOf(needle, last)
            }
            frag.append(text.slice(last))
            node.replaceWith(frag)
        }
        go(1)
    }
    bar.addEventListener('submit', (e) => {
        e.preventDefault()
        search(input.value)
        input.blur()
    })
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            bar!.hidden = true
            clear()
        }
    })
    onKey = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement
        if (target.closest('input, textarea, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return
        if (e.key === '/') {
            // Keep VitePress's own "/" (site search) from opening on top of the page search.
            e.preventDefault()
            e.stopPropagation()
            bar!.hidden = false
            input.select()
            input.focus()
        } else if (e.key === 'n') go(1)
        else if (e.key === 'N') go(-1)
        else if (e.key === 'g') window.scrollTo({ top: 0 })
        else if (e.key === 'G') window.scrollTo({ top: document.body.scrollHeight })
        else if (e.key === 'q') window.location.href = withBase(`${prefix.value}/#worth`)
    }
    document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
    if (onKey) document.removeEventListener('keydown', onKey)
    bar?.remove()
})
</script>

<template>
  <div class="man">
    <div class="hdr"><span><b>{{ name }}</b></span><span>{{ ru ? 'Руководство по PHP-библиотекам rasuvaeff' : 'rasuvaeff PHP Library Manual' }}</span><span><b>{{ name }}</b></span></div>
    <div class="vp-doc man-body"><Content /></div>
    <div class="vp-doc man-body man-extra">
      <template v-if="requires.length || requiredBy.length">
        <h2>{{ ru ? 'ЗАВИСИМОСТИ' : 'DEPENDENCIES' }}</h2>
        <p v-if="requires.length">{{ ru ? 'требует:' : 'requires:' }} <template v-for="(s, i) in requires" :key="s"><a :href="withBase(`${prefix}/packages/${s}`)">{{ s }}</a>(3)<template v-if="i < requires.length - 1">, </template></template></p>
        <p v-if="requiredBy.length">{{ ru ? 'от него зависят:' : 'required by:' }} <template v-for="(s, i) in requiredBy" :key="s"><a :href="withBase(`${prefix}/packages/${s}`)">{{ s }}</a>(3)<template v-if="i < requiredBy.length - 1">, </template></template></p>
      </template>
      <template v-if="releases.length">
        <h2>{{ ru ? 'ИСТОРИЯ' : 'HISTORY' }}</h2>
        <p>{{ ru ? `Первый релиз ${firstRelease.tag} — ${firstRelease.date}, всего релизов: ${releases.length}.` : `First released as ${firstRelease.tag} on ${firstRelease.date}; ${releases.length} releases in all.` }}</p>
        <table class="history"><tbody><tr v-for="r in releases.slice(0, 10)" :key="r.tag"><td><a :href="`https://github.com/rasuvaeff/${slug}/releases/tag/${r.tag}`">{{ r.tag }}</a></td><td>{{ r.date }}</td></tr></tbody></table>
        <p v-if="releases.length > 10" class="more">{{ ru ? `… и ещё ${releases.length - 10} раньше. ` : `… and ${releases.length - 10} earlier. ` }}<a :href="`https://github.com/rasuvaeff/${slug}/releases`">{{ ru ? 'Все релизы' : 'All releases' }}</a></p>
      </template>
    </div>
    <div class="ftr">
      <span>rasuvaeff/{{ slug }} {{ pkg?.version }}</span>
      <span v-if="pkg?.minMsi">{{ ru ? 'мутационный порог' : 'mutation gate' }} {{ pkg.minMsi }}%</span>
      <span v-if="pkg && pkg.dependents">{{ ru ? 'зависят пакетов' : 'used by' }} {{ pkg.dependents }}{{ ru ? '' : ' packages' }}</span>
      <span>{{ name }}</span>
    </div>
    <p class="keys">
      <template v-if="ru"><kbd>/</kbd> поиск · <kbd>n</kbd> <kbd>N</kbd> следующее, предыдущее · <kbd>g</kbd> <kbd>G</kbd> начало, конец · <kbd>q</kbd> к индексу</template>
      <template v-else><kbd>/</kbd> search · <kbd>n</kbd> <kbd>N</kbd> next, previous · <kbd>g</kbd> <kbd>G</kbd> top, bottom · <kbd>q</kbd> back to the index</template>
    </p>
  </div>
</template>
