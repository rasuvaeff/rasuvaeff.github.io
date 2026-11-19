<script setup lang="ts">
import packages from '../data/packages.json'
import { useLocale } from './i18n'

interface Pkg { slug: string; skill: boolean; frozen: boolean; category: string }
const { ru } = useLocale()
const skills = (packages as Pkg[]).filter((p) => p.skill && !p.frozen)
const categories = Array.from(new Set(skills.map((p) => p.category))).sort()
const inCategory = (c: string) => skills.filter((p) => p.category === c)
</script>

<template>
  <div>
    <p class="cat-count">{{ ru ? `${skills.length} пакетов с навыком` : `${skills.length} packages ship a skill` }}</p>
    <div v-for="c in categories" :key="c" class="skill-group">
      <h3>{{ c }}</h3>
      <p><a v-for="p in inCategory(c)" :key="p.slug" :href="`https://github.com/rasuvaeff/${p.slug}/blob/master/resources/skills/rasuvaeff-${p.slug}/SKILL.md`">{{ p.slug }}</a></p>
    </div>
  </div>
</template>
