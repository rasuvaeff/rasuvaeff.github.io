<script setup lang="ts">
import { withBase } from 'vitepress'
import { computed, onMounted, ref } from 'vue'
import { renderAnnotatedPhp } from '../annotated'
import runnable from '../data/runnable.json'
import { useLocale } from './i18n'
import { isPhpLoaded, runExample } from './php'

const props = defineProps<{ pkg: string }>()
const { ru } = useLocale()
const t = (en: string, rus: string) => (ru.value ? rus : en)
const examples = computed(() => (runnable as Record<string, { file: string; en: string; ru: string }[]>)[props.pkg] ?? [])
const sources = ref<Record<string, string>>({})
const tag = ref('')
const expanded = ref<Record<string, boolean>>({})
const outputs = ref<Record<string, { text: string; ms: number; failed: boolean }>>({})
const busy = ref<string | null>(null)
const stage = ref<'php' | 'unpack' | 'run' | null>(null)
const skipPhp = ref(false)
const PREVIEW = 14

onMounted(async () => {
    try {
        const all = await (await fetch(withBase('/php/sources.json'))).json()
        sources.value = all[props.pkg] ?? {}
        tag.value = all[props.pkg]?.__tag ?? ''
    } catch {
        sources.value = {}
    }
})

const lines = (file: string) => (sources.value[file] ?? '').replace(/\n$/, '').split('\n')
// The preview skips the file preamble (<?php, declare, the docblock, namespace, use, require) and starts at the code.
function bodyStart(all: string[]): number {
    let inDoc = false
    for (let i = 0; i < all.length; i++) {
        const l = all[i].trim()
        if (inDoc) {
            if (l.endsWith('*/')) inDoc = false
            continue
        }
        if (l.startsWith('/*')) {
            inDoc = !l.endsWith('*/')
            continue
        }
        if (l === '' || l === '<?php' || /^(declare|namespace|use|require|require_once|include)\b/.test(l)) continue

        return i
    }

    return 0
}
const shown = (file: string) => {
    const all = lines(file)
    if (expanded.value[file]) return all.join('\n')
    const start = bodyStart(all)

    return all.slice(start, start + PREVIEW).join('\n')
}
const listing = (file: string) => renderAnnotatedPhp(shown(file))

async function run(file: string): Promise<void> {
    busy.value = file
    skipPhp.value = isPhpLoaded()
    delete outputs.value[file]
    try {
        const r = await runExample(props.pkg, `examples/${file}`, (s) => (stage.value = s))
        outputs.value[file] = { text: (r.text + (r.errors ? `\n${r.errors}` : '')).replace(/\n+$/, ''), ms: r.ms, failed: r.exitCode !== 0 }
    } catch (e) {
        outputs.value[file] = { text: String(e), ms: 0, failed: true }
    } finally {
        busy.value = null
        stage.value = null
    }
}
const order = ['php', 'unpack', 'run'] as const
const stepState = (s: (typeof order)[number]) => {
    if (s === 'php' && skipPhp.value) return 'done'
    const now = stage.value ? order.indexOf(stage.value) : -1

    return order.indexOf(s) < now ? 'done' : order.indexOf(s) === now ? 'active' : 'todo'
}
</script>

<template>
  <div class="runnable">
    <ol class="how">
      <li>{{ t('Your browser downloads PHP 8.4 compiled to WebAssembly: 7.7 MB the first time, cached after that.', 'Браузер скачивает PHP 8.4, скомпилированный в WebAssembly: 7,7 МБ в первый раз, дальше из кеша.') }}</li>
      <li>{{ t(`It unpacks rasuvaeff/${pkg} ${tag} exactly as composer require installs it, plus the example scripts from the repository at that tag.`, `Распаковывает rasuvaeff/${pkg} ${tag} ровно так, как его ставит composer require, и скрипты примеров из репозитория на этом теге.`) }}</li>
      <li>{{ t('It runs the script you pick and shows what PHP printed. Nothing is sent to a server.', 'Выполняет выбранный скрипт и показывает, что напечатал PHP. На сервер ничего не отправляется.') }}</li>
    </ol>

    <div v-for="e in examples" :key="e.file" class="run-item">
      <div class="run-head">
        <span><b>examples/{{ e.file }}</b> — {{ ru ? e.ru : e.en }}</span>
        <button type="button" class="run-btn" :disabled="busy !== null" @click="run(e.file)">{{ busy === e.file ? t('Running…', 'Идёт…') : outputs[e.file] ? t('Run again', 'Ещё раз') : 'Run' }}</button>
      </div>
      <div v-if="sources[e.file]" class="run-code" v-html="listing(e.file)" />
      <button v-if="lines(e.file).length > PREVIEW" type="button" class="run-more" @click="expanded[e.file] = !expanded[e.file]">
        {{ expanded[e.file] ? t('show less', 'свернуть') : t(`show the whole file, ${lines(e.file).length} lines`, `показать весь файл, ${lines(e.file).length} строк`) }}
      </button>
      <ol v-if="busy === e.file" class="steps" aria-live="polite">
        <li :class="stepState('php')">{{ t('download PHP 8.4 (7.7 MB, once)', 'скачать PHP 8.4 (7,7 МБ, один раз)') }}</li>
        <li :class="stepState('unpack')">{{ t(`unpack rasuvaeff/${pkg} ${tag}`, `распаковать rasuvaeff/${pkg} ${tag}`) }}</li>
        <li :class="stepState('run')">{{ t(`run examples/${e.file}`, `выполнить examples/${e.file}`) }}</li>
      </ol>
      <template v-if="outputs[e.file]">
        <p class="run-label">{{ outputs[e.file].failed ? t('PHP failed:', 'PHP завершился с ошибкой:') : t(`What PHP printed (ran in ${outputs[e.file].ms} ms, in this tab):`, `Что напечатал PHP (выполнено за ${outputs[e.file].ms} мс, в этой вкладке):`) }}</p>
        <pre class="run-out" :class="{ failed: outputs[e.file].failed }">{{ outputs[e.file].text }}</pre>
      </template>
    </div>
  </div>
</template>
