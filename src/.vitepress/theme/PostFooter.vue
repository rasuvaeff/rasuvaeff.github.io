<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, lang } = useData()
const ru = computed(() => lang.value.startsWith('ru'))
</script>

<template>
    <aside v-if="frontmatter.date && frontmatter.origin" class="post-footer">
        <template v-if="ru">
            Впервые опубликовано на <a :href="frontmatter.origin">teletype.in</a>. Здесь — версия с исправленными цифрами и кодом.
        </template>
        <template v-else>
            First published in Russian on <a :href="frontmatter.origin">teletype.in</a>. This version has updated figures and code.
        </template>
    </aside>
</template>
