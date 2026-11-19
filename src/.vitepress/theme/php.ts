// Lazy access to the in-browser PHP runner (public/php/runner.js), loaded on the first Run.
import { withBase } from 'vitepress'

export interface Runner {
    getPhp(): Promise<unknown>
    mount(name: string, zipUrl: string): Promise<void>
    run(name: string, script: string): Promise<{ text: string; errors: string; exitCode: number; ms: number }>
}

let runner: Promise<Runner> | null = null
let phpReady = false

export function loadRunner(): Promise<Runner> {
    // A plain dynamic import: the dev server would rewrite it with "?import" and refuse a file from public/.
    const url = new URL(withBase('/php/runner.js'), window.location.href).href
    const load = new Function('url', 'return import(url)') as (url: string) => Promise<Runner>
    runner ??= load(url)

    return runner
}

export const isPhpLoaded = () => phpReady

/** Runs one example, reporting each stage: "php" (download the runtime), "unpack" (the package bundle), "run". */
export async function runExample(pkg: string, script: string, onStage: (stage: 'php' | 'unpack' | 'run') => void = () => {}) {
    onStage('php')
    const r = await loadRunner()
    await r.getPhp()
    phpReady = true
    onStage('unpack')
    await r.mount(pkg, withBase(`/php/${pkg}.zip`))
    onStage('run')

    return r.run(pkg, script)
}
