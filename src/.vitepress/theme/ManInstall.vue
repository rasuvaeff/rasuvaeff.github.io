<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'
import { useLocale } from './i18n'

const { frontmatter } = useData()
const { ru } = useLocale()
const command = computed(() => `composer require ${frontmatter.value.dev ? '--dev ' : ''}rasuvaeff/${frontmatter.value.package ?? frontmatter.value.title}`)
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
  <p class="synopsis" :data-copied="copied || undefined" :title="ru ? 'Нажмите, чтобы скопировать' : 'Click to copy'" @click="copy"><span class="pr">$ </span><b>composer require</b>{{ frontmatter.dev ? ' --dev' : '' }} rasuvaeff/{{ frontmatter.package ?? frontmatter.title }}</p>
</template>
