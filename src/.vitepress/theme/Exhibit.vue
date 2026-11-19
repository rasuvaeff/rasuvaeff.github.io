<script setup lang="ts">
defineProps<{
    n: string
    pkg: string
    title: string
    github: string
    packagist: string
    docs?: string
}>()
</script>

<template>
  <article :id="pkg" class="exhibit">
    <div class="exhibit-index">
      <span class="exhibit-n">{{ n }}</span>
      <span class="exhibit-pkg">{{ pkg }}</span>
    </div>
    <h2 class="exhibit-title">{{ title }}</h2>
    <div class="exhibit-body">
      <div class="exhibit-copy">
        <slot name="copy" />
      </div>
      <div class="exhibit-code">
        <slot />
      </div>
    </div>
    <p class="exhibit-links">
      <a :href="github">GitHub</a>
      <a :href="packagist">Packagist</a>
      <a v-if="docs" :href="docs">Documentation</a>
    </p>
  </article>
</template>
