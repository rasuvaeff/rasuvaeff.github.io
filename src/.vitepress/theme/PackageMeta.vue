<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from './i18n'
import packages from '../data/packages.json'

const { ru } = useLocale()
const DEV = new Set(['understudy', 'property-testing-core', 'property-testing-openapi', 'doc-exec'])
const props = defineProps<{ slug: string; docs?: string; tests?: number; src?: number }>()
const p = computed(() => (packages as Array<{ slug: string; version: string; minMsi: number | null; skill: boolean }>).find((x) => x.slug === props.slug))
</script>

<template>
  <div v-if="p" class="pkg-head">
    <span>v{{ p.version }}</span>
    <span v-if="p.minMsi" class="msi">{{ ru ? `мутационный порог ${p.minMsi}%` : `mutation gate ${p.minMsi}%` }}</span>
    <span>PHP 8.3–8.5</span>
    <a :href="`https://github.com/rasuvaeff/${slug}`">GitHub</a>
    <a :href="`https://packagist.org/packages/rasuvaeff/${slug}`">Packagist</a>
    <a v-if="docs" :href="docs">{{ ru ? 'Сайт документации' : 'Docs site' }}</a>
  </div>
  <div v-if="p" class="pkg-install">
    <small>{{ ru ? 'Установка' : 'Install' }}</small>
    <code>composer require {{ DEV.has(slug) ? '--dev ' : '' }}rasuvaeff/{{ slug }}</code>
  </div>
  <div v-if="p && (tests || src)" class="pkg-facts">
    <div v-if="src"><small>{{ ru ? 'Файлов в src' : 'Source files' }}</small><b>{{ src }}</b></div>
    <div v-if="tests"><small>{{ ru ? 'Файлов тестов' : 'Test files' }}</small><b>{{ tests }}</b></div>
    <div v-if="p.minMsi"><small>{{ ru ? 'Мутационный порог' : 'Mutation gate' }}</small><b>{{ p.minMsi }}%</b></div>
    <div><small>{{ ru ? 'Для агентов' : 'For agents' }}</small><b><a :href="`${ru ? '/ru' : ''}/agents`">{{ p.skill ? 'SKILL.md + llms.txt' : 'llms.txt' }}</a></b></div>
  </div>
</template>
