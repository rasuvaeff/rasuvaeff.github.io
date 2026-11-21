<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from './blog.data'

const { lang } = useData()
const ru = computed(() => lang.value.startsWith('ru'))
const list = computed(() => posts.filter((p) => p.ru === ru.value))
const date = (d: string) =>
    new Date(d).toLocaleDateString(ru.value ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
</script>

<template>
    <ol class="blog-index">
        <li v-for="p in list" :key="p.url">
            <div class="blog-meta">
                <time :datetime="p.date">{{ date(p.date) }}</time>
                <span>{{ p.readingTime }} {{ ru ? 'мин чтения' : 'min read' }}</span>
            </div>
            <a class="blog-title stretched" :href="p.url">{{ p.title }}</a>
            <p>{{ p.description }}</p>
            <dl v-if="p.figures.length" class="post-figures">
                <div v-for="[value, label] in p.figures" :key="label">
                    <dt>{{ value }}</dt>
                    <dd>{{ label }}</dd>
                </div>
            </dl>
        </li>
    </ol>
</template>
