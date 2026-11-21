<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from './blog.data'

// The post's cover: the same composition as its Open Graph image (date, title,
// key figures), rendered as HTML so it is sharp, themed and visible in dev.
const { frontmatter, lang, page } = useData()
const ru = computed(() => lang.value.startsWith('ru'))
const isPost = computed(() => Boolean(frontmatter.value.date) && /(^|\/)blog\/(?!index)/.test(page.value.relativePath))
const post = computed(() => posts.find((p) => p.url === `/${page.value.relativePath.replace(/\.md$/, '')}`))
const date = (d: string | Date) =>
    new Date(d).toLocaleDateString(ru.value ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const twin = computed(() => {
    const path = '/' + page.value.relativePath.replace(/\.md$/, '')
    return ru.value ? path.replace(/^\/ru/, '') : `/ru${path}`
})
const figures = computed<[string, string][]>(() => (frontmatter.value.figures ?? []).slice(0, 4))
</script>

<template>
    <header v-if="isPost" class="post-cover">
        <div class="post-meta">
            <a :href="ru ? '/ru/blog/' : '/blog/'">{{ ru ? 'блог' : 'blog' }}</a>
            <time :datetime="frontmatter.date">{{ date(frontmatter.date) }}</time>
            <span v-if="post">{{ post.readingTime }} {{ ru ? 'мин чтения' : 'min read' }}</span>
            <a :href="twin">{{ ru ? 'English version' : 'Русская версия' }}</a>
        </div>
        <h1 class="post-title">{{ frontmatter.title }}</h1>
        <p v-if="frontmatter.description" class="post-lede">{{ frontmatter.description }}</p>
        <dl v-if="figures.length" class="post-figures">
            <div v-for="[value, label] in figures" :key="label">
                <dt>{{ value }}</dt>
                <dd>{{ label }}</dd>
            </div>
        </dl>
    </header>
</template>
