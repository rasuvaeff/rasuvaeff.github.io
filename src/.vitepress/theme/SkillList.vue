<script setup lang="ts">
import packages from '../data/packages.json'
import { useLocale } from './i18n'

interface Pkg { slug: string; description: string; skill: boolean; frozen: boolean; category: string }
const { ru } = useLocale()
const skills = (packages as Pkg[]).filter((p) => p.skill && !p.frozen)
const categories = Array.from(new Set(skills.map((p) => p.category))).sort()
const inCat = (c: string) => skills.filter((p) => p.category === c)
</script>

<template>
  <div>
    <p class="cat-count">{{ ru ? `${skills.length} пакетов с навыком` : `${skills.length} packages ship a skill` }}</p>
    <div v-for="c in categories" :key="c" class="fam-box" style="margin-bottom: 12px">
      <h3>{{ c }}</h3>
      <div class="fam-chips">
        <a v-for="p in inCat(c)" :key="p.slug" :href="`https://github.com/rasuvaeff/${p.slug}/blob/master/resources/skills/rasuvaeff-${p.slug}/SKILL.md`">{{ p.slug }}</a>
      </div>
    </div>
  </div>
</template>
