<script setup lang="ts">
import { withBase } from 'vitepress'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import packages from '../data/packages.json'
import trace from '../data/shrink-trace.json'
import { useLocale } from './i18n'
import { runExample } from './php'

interface Pkg { slug: string; description: string; version: string; minMsi: number | null; category: string; frozen: boolean; dependents: number; requires: string[] }

const { ru, prefix } = useLocale()
const all = packages as Pkg[]
const active = all.filter((p) => !p.frozen)
const gated = active.filter((p) => p.minMsi !== null)
const fullGate = gated.filter((p) => p.minMsi === 100).length
const sortedGates = gated.map((p) => p.minMsi as number).sort((a, b) => a - b)
const median = sortedGates[Math.floor(sortedGates.length / 2)]
const href = (slug: string) => withBase(`${prefix.value}/packages/${slug}`)
const t = (en: string, rus: string) => (ru.value ? rus : en)

// Honest-MSI audit of 2026-11-01 (docs/mutation-honest-msi.md in the monorepo): 75 packages run with --with-uncovered.
const AUDIT = { total: 42348, invisible: 7874, packages: 75, met: 4 }

const groups = [
    { title: ['Testing', 'Тестирование'], items: [
        ['understudy', 'Test doubles where the stub is a real method call. A rename is caught before the test runs.', 'Тестовые двойники, где стаб — реальный вызов метода. Переименование ловится до запуска теста.'],
        ['property-testing-core', 'Generates hundreds of inputs, shrinks the failing one, replays recorded failures from a corpus.', 'Генерирует сотни входов, сжимает упавший и воспроизводит записанные падения из корпуса.'],
        ['property-testing-openapi', 'Valid and invalid requests generated from an OpenAPI document, checked against the contract.', 'Валидные и невалидные запросы из OpenAPI-документа, проверенные контрактом.'],
        ['doc-exec', 'README code blocks run against the current code in CI.', 'Блоки кода из README исполняются на текущем коде в CI.'],
    ] },
    { title: ['Reliability under load', 'Надёжность под нагрузкой'], items: [
        ['context', 'One deadline and one cancellation signal through HTTP, DB, CLI and subprocesses.', 'Один дедлайн и один сигнал отмены через HTTP, БД, CLI и подпроцессы.'],
        ['yii3-outbox', 'Transactional outbox for Yii3, with DB and ClickHouse backends.', 'Transactional outbox для Yii3 с бэкендами на БД и ClickHouse.'],
        ['yii3-idempotency', 'Same key and body run the handler once. Keys are scoped per caller.', 'Тот же ключ и тело запускают обработчик один раз. Ключи привязаны к вызывающему.'],
    ] },
    { title: ['AI and security', 'AI и безопасность'], items: [
        ['mcp', 'Domain methods become MCP tools in any PSR application, with call budgets, visibility and OAuth.', 'Доменные методы становятся MCP-инструментами в любом PSR-приложении, с лимитом вызовов, видимостью и OAuth.'],
        ['mcp-openapi', 'Allow-listed OpenAPI operations become MCP tools.', 'Операции OpenAPI из allow-list становятся MCP-инструментами.'],
        ['yii3-mcp', 'The same server in Yii3, with RBAC, an audit log and traces from its bridges.', 'Тот же сервер в Yii3, с RBAC, аудитом и трассировками из мостов.'],
        ['pinned-http-client', 'Resolve once, check every address, pin the connection.', 'Разрешить имя один раз, проверить каждый адрес, закрепить соединение.'],
    ] },
    { title: ['Data and experiments', 'Данные и эксперименты'], items: [
        ['clickhouse-toolkit', 'Parameterized query builder, batch writer, DDL and partitions for ClickHouse.', 'Параметризованные запросы, пакетная запись, DDL и партиции для ClickHouse.'],
        ['yii3-ab-testing', 'Stateless hash assignment, explicit exposure tracking.', 'Назначение вариантов по хэшу без состояния, явный учёт показов.'],
    ] },
]
const version = (slug: string) => all.find((p) => p.slug === slug)?.version ?? ''

const NS = 'http://www.w3.org/2000/svg'
const svgEl = (n: string, a: Record<string, string | number> = {}): SVGElement => {
    const e = document.createElementNS(NS, n)
    for (const k in a) e.setAttribute(k, String(a[k]))
    return e
}

/* shrink replay */
const shrinkLine = ref<SVGSVGElement>()
const shrinkValue = ref(trace.original)
const shrinkState = ref('')
const shrinkLog = ref<{ text: string; ok: boolean }[]>([])
const running = ref(false)
const finished = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
const accepted = trace.trials.filter((x) => x.accepted).length
const lx = (v: number) => 14 + (Math.log10(Math.max(v, 1)) / 4) * (724 - 14)

function resetShrink(): void {
    clearInterval(timer)
    shrinkValue.value = trace.original
    shrinkLog.value = []
    shrinkLine.value?.querySelectorAll('.trial').forEach((n) => n.remove())
    shrinkLine.value?.querySelector('#cur')?.setAttribute('cx', String(lx(trace.original)))
}
function runShrink(): void {
    resetShrink()
    const svg = shrinkLine.value!
    const cur = svg.querySelector('#cur')!
    let i = 0
    const step = () => {
        const { candidate, accepted: ok } = trace.trials[i]
        svg.insertBefore(svgEl('circle', { cx: lx(candidate), cy: 22, r: 3, class: `${ok ? 't-acc' : 't-rej'} trial` }), cur)
        shrinkLog.value.push({
            ok,
            text: `trial ${String(i + 1).padStart(2)}  try ${String(candidate).padStart(4)}  ${ok ? t('still fails, keep it', 'всё ещё падает, берём') : t('passes, discard', 'проходит, отбрасываем')}`,
        })
        if (shrinkLog.value.length > 4) shrinkLog.value.shift()
        if (ok) {
            shrinkValue.value = candidate
            cur.setAttribute('cx', String(lx(candidate)))
        }
        i++
    }
    const finish = () => {
        running.value = false
        finished.value = true
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        while (i < trace.trials.length) step()
        finish()
        return
    }
    running.value = true
    timer = setInterval(() => {
        step()
        if (i >= trace.trials.length) {
            clearInterval(timer)
            finish()
        }
    }, 140)
}
const live = ref<'idle' | 'loading' | 'done' | 'failed'>('idle')
const liveStage = ref<'php' | 'unpack' | 'run' | null>(null)
const liveNote = ref('')
async function runLive(): Promise<void> {
    resetShrink()
    finished.value = false
    live.value = 'loading'
    const started = performance.now()
    try {
        const r = await runExample('property-testing-core', 'examples/readme-sample.php', (s) => (liveStage.value = s))
        const lines = r.text.trim().split('\n')
        shrinkLog.value = lines.slice(0, 5).map((text) => ({ text, ok: /Shrunk|Changed/.test(text) }))
        const shrunk = r.text.match(/Shrunk:\s+value=(\d+)/)
        if (shrunk) {
            shrinkValue.value = Number(shrunk[1])
            shrinkLine.value?.querySelector('#cur')?.setAttribute('cx', String(lx(Number(shrunk[1]))))
        }
        const total = ((performance.now() - started) / 1000).toFixed(1)
        liveNote.value = t(`This is real output. Your browser downloaded PHP 8.4, installed rasuvaeff/property-testing-core, ran the README sample in ${r.ms} ms and printed what PHP printed (${total} s in all). No server was involved.`, `Это настоящий вывод. Браузер скачал PHP 8.4, поставил rasuvaeff/property-testing-core, выполнил сэмпл из README за ${r.ms} мс и показал то, что напечатал PHP (всего ${total} с). Сервер не участвовал.`)
        live.value = 'done'
    } catch (e) {
        liveNote.value = String(e)
        live.value = 'failed'
    }
}
const shrinkStatus = computed(() => {
    if (live.value === 'loading') {
        if (liveStage.value === 'unpack') return t('installing the package…', 'ставим пакет…')
        if (liveStage.value === 'run') return t('running the sample…', 'выполняем сэмпл…')

        return t('downloading PHP 8.4 (7.7 MB, once)…', 'скачиваем PHP 8.4 (7,7 МБ, один раз)…')
    }
    if (live.value === 'done') return t('shrunk live in your browser', 'сжато вживую в вашем браузере')
    if (running.value) return t('shrinking', 'сжимаем')
    if (finished.value) return t(`shrunk in ${accepted} accepted steps, ${trace.trials.length} trials`, `сжато за ${accepted} принятых шагов, ${trace.trials.length} попыток`)
    return t('first failing input', 'первый упавший вход')
})

/* Fig. 1 */
const fig1 = ref<SVGSVGElement>()
const readout = ref(' ')
const category = ref('All')
const categories = ['All', ...Array.from(new Set(gated.map((p) => p.category))).sort()]
const dots: SVGElement[] = []
function pickCategory(c: string): void {
    category.value = c
    dots.forEach((d) => d.classList.toggle('off', c !== 'All' && d.dataset.cat !== c))
    const n = c === 'All' ? dots.length : dots.filter((d) => d.dataset.cat === c).length
    readout.value = c === 'All' ? ' ' : t(`${c}: ${n} packages`, `${c}: пакетов ${n}`)
}

/* Fig. 2 */
const fig2 = ref<SVGSVGElement>()
const after = ref(false)
let setFig2: (v: boolean) => void = () => {}

/* Fig. 3: who depends on whom, both directions */
const fig3 = ref<SVGSVGElement>()
const known = new Set(all.map((p) => p.slug))
const requiresOf = (p: Pkg) => p.requires.filter((s) => known.has(s))
const requiredBy = (slug: string) => active.filter((p) => p.requires.includes(slug)).map((p) => p.slug).sort()
const topDeps = [...active].sort((a, b) => b.dependents - a.dependents || a.slug.localeCompare(b.slug)).slice(0, 10)
const topConsumers = [...active].sort((a, b) => requiresOf(b).length - requiresOf(a).length || a.slug.localeCompare(b.slug)).slice(0, 10)
const depMode = ref<'required' | 'requires'>('required')
const picked = ref<string>(topDeps[0].slug)
const pickedList = computed(() => (depMode.value === 'required' ? requiredBy(picked.value) : requiresOf(all.find((p) => p.slug === picked.value)!)))
let drawFig3: () => void = () => {}
function setDepMode(mode: 'required' | 'requires'): void {
    depMode.value = mode
    picked.value = (mode === 'required' ? topDeps : topConsumers)[0].slug
    drawFig3()
}

/* apropos */
const query = ref('deadline')
const hits = computed(() => {
    const words = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return []

    return active.filter((p) => words.every((w) => `${p.slug} ${p.description}`.toLowerCase().includes(w)))
})

onMounted(() => {
    // shrink number line
    const line = shrinkLine.value!
    line.append(svgEl('line', { x1: 14, y1: 22, x2: 724, y2: 22, class: 'axis' }))
    for (const v of [1, 10, 100, 1000, 10000]) {
        const tx = svgEl('text', { x: lx(v), y: 42, class: 'tick', 'text-anchor': 'middle' })
        tx.textContent = v.toLocaleString('en')
        line.append(tx)
    }
    line.append(svgEl('line', { x1: lx(100), y1: 6, x2: lx(100), y2: 30, class: 'median' }))
    const lim = svgEl('text', { x: lx(100) + 5, y: 12, class: 'tick' })
    lim.textContent = t('fails from 100', 'падает от 100')
    line.append(lim)
    line.append(svgEl('circle', { id: 'cur', cx: lx(trace.original), cy: 22, r: 7, class: 't-acc' }))

    // Fig. 1
    const s1 = fig1.value!
    const x0 = 46, x1 = 740, y0 = 260, lo = Math.min(83, sortedGates[0]), hi = 100
    const x = (v: number) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0)
    s1.append(svgEl('line', { x1: x0, y1: y0, x2: x1, y2: y0, class: 'axis' }))
    for (const v of [lo, 85, 90, 95, 100]) {
        const tx = svgEl('text', { x: x(v), y: y0 + 20, class: 'tick', 'text-anchor': 'middle' })
        tx.textContent = String(v)
        s1.append(tx)
    }
    s1.append(svgEl('line', { x1: x(median), y1: 22, x2: x(median), y2: y0, class: 'median' }))
    const ml = svgEl('text', { x: x(median) + 6, y: 30, class: 'lbl' })
    ml.textContent = t(`median ${median}`, `медиана ${median}`)
    s1.append(ml)
    const cap = svgEl('text', { x: x1, y: y0 + 36, class: 'tick', 'text-anchor': 'end' })
    cap.textContent = t('minMsi, % of mutants that must be killed', 'minMsi, % мутантов, которые нужно убить')
    s1.append(cap)
    const by: Record<number, Pkg[]> = {}
    ;[...gated].sort((a, b) => a.slug.localeCompare(b.slug)).forEach((p) => (by[p.minMsi as number] ??= []).push(p))
    for (const v in by) {
        by[v].forEach((p, i) => {
            const d = svgEl('circle', { cx: x(+v), cy: y0 - 8 - i * 10, r: 4.2, class: 'dot', tabindex: 0, role: 'link', 'aria-label': `${p.slug}, ${v}%` })
            d.dataset.cat = p.category
            const show = () => (readout.value = `${p.slug}(3) — ${t('gate', 'порог')} ${v}% · ${p.category} · v${p.version}`)
            d.addEventListener('mouseenter', show)
            d.addEventListener('focus', show)
            d.addEventListener('click', () => (window.location.href = href(p.slug)))
            d.addEventListener('keydown', (e) => {
                if ((e as KeyboardEvent).key === 'Enter') window.location.href = href(p.slug)
            })
            s1.append(d)
            dots.push(d)
        })
    }

    // Fig. 2
    const s2 = fig2.value!
    const W = 720, X = 20, vis = AUDIT.total - AUDIT.invisible
    const a = svgEl('rect', { x: X, y: 30, height: 34, class: 'vis' })
    const b = svgEl('rect', { y: 30, height: 34, class: 'inv' })
    const l1 = svgEl('text', { x: X, y: 20, class: 'lbl' })
    const l2 = svgEl('text', { x: X + W, y: 20, class: 'lbl', 'text-anchor': 'end' })
    const l3 = svgEl('text', { x: X + W, y: 88, class: 'tick', 'text-anchor': 'end' })
    s2.append(a, b, l1, l2, l3)
    const fmt = (n: number) => n.toLocaleString(ru.value ? 'ru' : 'en')
    setFig2 = (v: boolean) => {
        after.value = v
        const scale = v ? W / AUDIT.total : W / vis
        a.setAttribute('width', String(vis * scale))
        b.setAttribute('x', String(X + vis * scale))
        b.setAttribute('width', String(v ? AUDIT.invisible * scale : 0))
        l1.textContent = t(`seen by the gate: ${fmt(vis)}`, `видел гейт: ${fmt(vis)}`)
        l2.textContent = v ? t(`never mutated before: ${fmt(AUDIT.invisible)} (19%)`, `раньше не мутировали: ${fmt(AUDIT.invisible)} (19%)`) : 'Not Covered: 0'
        l3.textContent = v ? t(`${fmt(AUDIT.total)} mutants exist`, `всего мутантов: ${fmt(AUDIT.total)}`) : t(`${fmt(vis)} mutants, all accounted for?`, `${fmt(vis)} мутантов — все учтены?`)
    }
    setFig2(false)

    // Fig. 3
    const s3 = fig3.value!
    drawFig3 = () => {
        s3.replaceChildren()
        const list = depMode.value === 'required' ? topDeps : topConsumers
        const count = (p: Pkg) => (depMode.value === 'required' ? p.dependents : requiresOf(p).length)
        const max = Math.max(...list.map(count))
        list.forEach((p, i) => {
            const y = 14 + i * 26
            const g = svgEl('g', { class: `dep${p.slug === picked.value ? ' on' : ''}`, tabindex: 0, role: 'button', 'aria-label': `${p.slug}: ${count(p)}` })
            const name = svgEl('text', { x: 200, y: y + 13, class: 'lbl', 'text-anchor': 'end' })
            name.textContent = p.slug
            const bar = svgEl('rect', { x: 210, y, width: Math.max(2, (count(p) / max) * 470), height: 18, class: p.slug === picked.value ? 'inv' : 'vis' })
            const n = svgEl('text', { x: 216 + (count(p) / max) * 470, y: y + 13, class: 'tick' })
            n.textContent = String(count(p))
            const hit = svgEl('rect', { x: 0, y: y - 4, width: 760, height: 26, fill: 'transparent' })
            g.append(hit, name, bar, n)
            const pick = () => {
                picked.value = p.slug
                drawFig3()
                ;(s3.querySelector(`[aria-label^="${p.slug}:"]`) as SVGElement | null)?.focus()
            }
            g.addEventListener('click', pick)
            g.addEventListener('keydown', (e) => {
                if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
                    e.preventDefault()
                    pick()
                }
            })
            g.addEventListener('mouseenter', () => {
                if (picked.value !== p.slug) {
                    picked.value = p.slug
                    drawFig3()
                }
            })
            s3.append(g)
        })
        s3.setAttribute('viewBox', `0 0 760 ${16 + list.length * 26}`)
    }
    drawFig3()
})

function focusApropos(e: KeyboardEvent): void {
    const target = e.target as HTMLElement
    if (e.key !== '/' || target.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return
    e.preventDefault()
    e.stopPropagation()
    const input = document.getElementById('apropos-q') as HTMLInputElement | null
    input?.focus()
    input?.select()
    input?.scrollIntoView({ block: 'center' })
}
onMounted(() => document.addEventListener('keydown', focusApropos))
onUnmounted(() => {
    clearInterval(timer)
    document.removeEventListener('keydown', focusApropos)
})
</script>

<template>
  <div class="report">
    <p class="kicker">rasuvaeff/* · {{ active.length }} {{ t('packages', 'пакетов') }} · {{ t('data from Packagist and the tagged sources', 'данные с Packagist и тегированных исходников') }}</p>
    <h1>{{ t('PHP libraries, and how sure I am they work.', 'PHP-библиотеки и то, насколько я уверен, что они работают.') }}</h1>
    <p class="lede">{{ t('Victor Razuvaev, senior backend engineer: fifteen years of PHP, ten in ad-tech. The libraries cover deadlines, delivery, experiments and testing. This page shows the numbers behind them, including the one that turned out to be wrong.', 'Виктор Разуваев, senior backend-разработчик: пятнадцать лет PHP, десять в ad-tech. Библиотеки закрывают дедлайны, доставку, эксперименты и тестирование. Здесь — цифры, на которых они держатся, включая ту, что оказалась неверной.') }}</p>
    <p class="byline">
      <a :href="withBase(`${prefix}/resume`)">{{ t('Resume', 'Резюме') }}</a> ·
      <a :href="withBase(ru ? '/resume-ru.pdf' : '/resume-en.pdf')" :download="ru ? 'victor-razuvaev-resume-ru.pdf' : 'victor-razuvaev-resume-en.pdf'">PDF</a> ·
      <a :href="withBase(`${prefix}/packages`)">{{ t(`All ${active.length} packages`, `Все ${active.length} пакетов`) }}</a> ·
      <a href="https://github.com/rasuvaeff">GitHub</a>
    </p>

    <h2>{{ t('A failing input, shrunk', 'Упавший вход, сжатый') }}</h2>
    <p>{{ t('The property says every integer from 0 to 10,000 stays below 100. The engine finds 3989, then tries smaller candidates until nothing smaller fails. This replays the real run, recorded from', 'Свойство утверждает, что любое целое от 0 до 10 000 меньше 100. Движок находит 3989 и пробует кандидатов поменьше, пока меньшие не перестанут падать. Ниже — повтор настоящего прогона, записанного из') }} <a :href="href('property-testing-core')">property-testing-core</a>{{ t(': seed 42, ', ': seed 42, ') }}{{ trace.trials.length }} {{ t('trials.', 'попыток.') }}</p>
    <div class="shrink">
      <div class="top">
        <span class="val">{{ shrinkValue }}</span>
        <span class="state">{{ shrinkStatus }}</span>
        <button class="run" type="button" :disabled="running || live === 'loading'" @click="live = 'idle'; runShrink()">{{ running ? t('Running…', 'Идёт…') : finished ? t('Replay', 'Повтор') : t('Replay', 'Повтор') }}</button>
        <button class="live" type="button" :disabled="running || live === 'loading'" @click="runLive">{{ live === 'loading' ? t('Loading PHP…', 'Загружаем PHP…') : t('Run live', 'Запустить вживую') }}</button>
      </div>
      <svg ref="shrinkLine" viewBox="0 0 760 46" aria-hidden="true" />
      <div class="log" aria-live="polite">
        <template v-if="shrinkLog.length"><div v-for="(l, i) in shrinkLog" :key="i" :class="l.ok ? 'a' : 'r'">{{ l.text }}</div></template>
        <template v-else><div v-for="(l, i) in trace.message.split('\n').slice(0, 5)" :key="i" :class="i === 2 ? 'a' : 'r'">{{ l }}</div></template>
      </div>
      <p class="live-note" aria-live="polite">{{ liveNote || t('Replay plays back a recording of the run. Run live does the real thing: your browser downloads PHP 8.4 (7.7 MB, once), installs the package and executes the sample in this tab. The code is on the package page.', 'Повтор проигрывает запись прогона. «Запустить вживую» делает его по-настоящему: браузер скачивает PHP 8.4 (7,7 МБ, один раз), ставит пакет и выполняет сэмпл в этой вкладке. Код — на странице пакета.') }}</p>
    </div>

    <h2>{{ t('Every package has a mutation gate', 'У каждого пакета есть мутационный порог') }}</h2>
    <p>{{ t('A mutation gate fails the build when tests let too many deliberate bugs survive. Each dot is one package at its', 'Мутационный порог роняет сборку, если тесты пропускают слишком много намеренно внесённых багов. Каждая точка — пакет на своём') }} <span class="num">minMsi</span>. {{ t('Point at a dot for its name, click to open it.', 'Наведите на точку, чтобы увидеть имя, кликните, чтобы открыть.') }}</p>
    <figure>
      <div class="toggles" role="group" :aria-label="t('Highlight a group', 'Подсветить группу')">
        <button v-for="c in categories" :key="c" type="button" :aria-pressed="category === c" @click="pickCategory(c)">{{ c === 'All' ? t('All', 'Все') : c }}</button>
      </div>
      <svg ref="fig1" viewBox="0 0 760 300" role="img" :aria-label="t('Mutation gate of every package', 'Мутационный порог каждого пакета')" />
      <div class="readout">{{ readout }}</div>
      <figcaption><b>{{ t('Fig. 1.', 'Рис. 1.') }}</b> {{ t(`Mutation gate of ${gated.length} packages, from their latest tags. ${fullGate} require every mutant to be killed.`, `Мутационный порог ${gated.length} пакетов по последним тегам. ${fullGate} требуют убить каждого мутанта.`) }}</figcaption>
    </figure>

    <h2>{{ t('The metric lied, and this is by how much', 'Метрика врала, и вот насколько') }}</h2>
    <p>{{ t('Testo credits a test only with code named in its', 'Testo засчитывает тесту только код, названный в его') }} <span class="num">#[Covers]</span>{{ t(', and Infection mutates only covered code. Code outside any', ', а Infection мутирует только покрытый код. Код вне любого') }} <span class="num">#[Covers]</span> {{ t('produced no mutants, so reports said', 'не давал мутантов, и в отчётах было') }} <span class="num">Not Covered: 0</span>.</p>
    <figure>
      <div class="toggles" role="group" :aria-label="t('Measurement', 'Замер')">
        <button type="button" :aria-pressed="!after" @click="setFig2(false)">{{ t('what the gate saw', 'что видел гейт') }}</button>
        <button type="button" :aria-pressed="after" @click="setFig2(true)">with --with-uncovered</button>
      </div>
      <svg ref="fig2" viewBox="0 0 760 110" role="img" :aria-label="t('Mutants before and after the flag', 'Мутанты до и после флага')" />
      <figcaption><b>{{ t('Fig. 2.', 'Рис. 2.') }}</b> {{ t(`Mutants across ${AUDIT.packages} packages. In json-ld alone the count went from 1,169 to 2,726 and the score from 97% to 41%. Only ${AUDIT.met} of ${AUDIT.packages} packages met their own threshold. The thresholds were kept, and the tests caught up.`, `Мутанты по ${AUDIT.packages} пакетам. Только в json-ld их стало 2 726 вместо 1 169, а оценка упала с 97% до 41%. Собственный порог выдержали ${AUDIT.met} пакета из ${AUDIT.packages}. Пороги не снизили — тесты догнали.`) }}</figcaption>
    </figure>

    <h2>{{ t('What the rest stands on', 'На чём держится остальное') }}</h2>
    <figure>
      <div class="toggles" role="group" :aria-label="t('Direction', 'Направление')">
        <button type="button" :aria-pressed="depMode === 'required'" @click="setDepMode('required')">{{ t('most required', 'чаще всего требуют') }}</button>
        <button type="button" :aria-pressed="depMode === 'requires'" @click="setDepMode('requires')">{{ t('requires the most', 'сами требуют больше всех') }}</button>
      </div>
      <svg ref="fig3" viewBox="0 0 760 276" role="group" :aria-label="t('Dependencies between packages', 'Зависимости между пакетами')" />
      <p class="readout deps">
        <a :href="href(picked)">{{ picked }}(3)</a>
        {{ depMode === 'required' ? t('is required by', '— от него зависят:') : t('requires', 'требует:') }}
        <template v-for="(s, i) in pickedList" :key="s"><a :href="href(s)">{{ s }}</a><template v-if="i < pickedList.length - 1">, </template></template>
      </p>
      <figcaption><b>{{ t('Fig. 3.', 'Рис. 3.') }}</b> {{ t(`Dependencies between rasuvaeff/* packages at their latest tags. Point at a row to see the packages behind the number. context carries the request budget for ${topDeps[0].dependents} of them.`, `Зависимости между пакетами rasuvaeff/* на последних тегах. Наведите на строку, чтобы увидеть пакеты за числом. context несёт бюджет запроса для ${topDeps[0].dependents} из них.`) }}</figcaption>
    </figure>

    <h2 id="worth">{{ t('Worth opening', 'Что стоит открыть') }}</h2>
    <p>{{ t('Chosen for what is hard to find elsewhere in PHP. Each opens as a manual page: synopsis, examples, see also, and the limits the package states itself under BUGS.', 'Выбраны по тому, чего трудно найти в PHP. Каждый открывается как man-страница: обзор, примеры, «смотрите также» и ограничения, которые пакет называет сам, в разделе ОШИБКИ.') }}</p>
    <table class="worth">
      <template v-for="g in groups" :key="g.title[0]">
        <tr class="grp"><td colspan="3">{{ ru ? g.title[1] : g.title[0] }}</td></tr>
        <tr v-for="it in g.items" :key="it[0]">
          <td><a :href="href(it[0])">{{ it[0] }}</a></td>
          <td>{{ ru ? it[2] : it[1] }}</td>
          <td class="ver">v{{ version(it[0]) }}</td>
        </tr>
      </template>
    </table>

    <h2>apropos</h2>
    <p>{{ t(`All ${active.length} packages, searched the way apropos searches manual pages: by name and description.`, `Все ${active.length} пакетов, поиск как у apropos по man-страницам: по имени и описанию.`) }}</p>
    <div class="apropos">
      <label for="apropos-q"><span>$ apropos</span><input id="apropos-q" v-model="query" type="search" autocomplete="off" spellcheck="false" :aria-label="t('Search packages', 'Поиск пакетов')"></label>
      <ol>
        <li v-for="p in hits.slice(0, 8)" :key="p.slug"><a :href="href(p.slug)">{{ p.slug }}(3)</a><span>— {{ p.description }}</span></li>
        <li v-if="query.trim() && !hits.length" class="none">{{ query.trim() }}: nothing appropriate.</li>
        <li v-if="hits.length > 8" class="none">… {{ t(`${hits.length - 8} more`, `ещё ${hits.length - 8}`) }}</li>
      </ol>
    </div>

    <h2>{{ t('For agents', 'Для агентов') }}</h2>
    <p>{{ t('Every package ships an llms.txt API reference, and 40 ship an agent skill that the llm/skills Composer plugin syncs into .agents/skills/ on install.', 'В каждом пакете есть справочник llms.txt, а в 40 — навык для агента, который Composer-плагин llm/skills кладёт в .agents/skills/ при установке.') }} <a :href="withBase(`${prefix}/agents`)">{{ t('How it works', 'Как это устроено') }}</a>.</p>

    <h2>{{ t('Where they run', 'Где они работают') }}</h2>
    <p><a href="https://cska.in">cska.in</a>{{ t(', a fan community rebuilt from a 20-year-old database, runs on 31 of the packages. ', ' — фанатское сообщество, пересобранное из 20-летней базы, работает на 31 пакете. ') }}<a href="https://github.com/rasuvaeff/ecosystem-sandbox">ecosystem-sandbox</a>{{ t(' puts 56 of them through one checkout. How the work is produced: ', ' прогоняет 56 из них через одно оформление заказа. Как устроена работа: ') }}<a :href="withBase(`${prefix}/workflow`)">{{ t('workflow', 'процесс') }}</a>.</p>
  </div>
</template>
