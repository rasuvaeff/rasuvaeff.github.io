// Runs PHP scripts in the browser. Loaded only when a visitor presses Run.
import { PHP } from '@php-wasm/universal'
import { loadWebRuntime } from '@php-wasm/web'
import { unzipSync } from 'fflate'

let phpPromise = null
const mounted = new Map()

export function getPhp() {
    phpPromise ??= loadWebRuntime('8.4', { emscriptenOptions: { processId: 1 } }).then((id) => new PHP(id))

    return phpPromise
}

/** Unpacks a bundle (vendor/ and examples/) into /app/<name> once. */
export async function mount(name, zipUrl) {
    if (!mounted.has(name)) {
        mounted.set(name, (async () => {
            const [php, zip] = await Promise.all([getPhp(), fetch(zipUrl).then((r) => r.arrayBuffer())])
            for (const [path, data] of Object.entries(unzipSync(new Uint8Array(zip)))) {
                if (path.endsWith('/')) continue
                const target = `/app/${name}/${path}`
                php.mkdir(target.slice(0, target.lastIndexOf('/')))
                php.writeFile(target, data)
            }
        })())
    }

    return mounted.get(name)
}

export async function run(name, script) {
    const php = await getPhp()
    const started = performance.now()
    const result = await php.run({ scriptPath: `/app/${name}/${script}` })

    return { text: result.text, errors: result.errors, exitCode: result.exitCode, ms: Math.round(performance.now() - started) }
}
