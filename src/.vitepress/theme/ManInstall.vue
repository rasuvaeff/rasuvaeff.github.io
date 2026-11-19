<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'
import packages from '../data/packages.json'
import { useLocale } from './i18n'

const { frontmatter, params } = useData()
const { ru } = useLocale()
const slug = computed(() => String(params.value?.pkg ?? frontmatter.value.package ?? frontmatter.value.title))
const dev = computed(() => (packages as { slug: string; dev: boolean }[]).find((p) => p.slug === slug.value)?.dev ?? false)
const command = computed(() => `composer require ${dev.value ? '--dev ' : ''}rasuvaeff/${slug.value}`)
const copied = ref('')

function copy(): void {
    navigator.clipboard?.writeText(command.value).then(
        () => {
            copied.value = ru.value ? 'скопировано' : 'copied'
            setTimeout(() => (copied.value = ''), 1200)
        },
        () => {},
    )
}
</script>

<template>
  <p class="synopsis" :data-copied="copied || undefined" :title="ru ? 'Нажмите, чтобы скопировать' : 'Click to copy'" @click="copy"><span class="pr">$ </span><b>composer require</b>{{ dev ? ' --dev' : '' }} rasuvaeff/{{ slug }}</p>
</template>
