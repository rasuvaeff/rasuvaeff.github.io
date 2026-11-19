// Builds everything the runnable examples need into src/public/php/:
//   runner.js + assets/   PHP 8.4 compiled to WebAssembly (php-runner/, other PHP versions removed)
//   <package>.zip         vendor/ installed from Packagist at the package's latest tag, plus its examples/ at that tag
//   sources.json          the example scripts as text, shown next to the Run buttons
// Needs Composer: `composer` on PATH, or Docker (the composer:2 image) as a fallback.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { zipSync } from 'fflate'

const root = join(import.meta.dirname, '..')
const out = join(root, 'src', 'public', 'php')
const runnable = JSON.parse(readFileSync(join(root, 'src', '.vitepress', 'data', 'runnable.json'), 'utf8'))
const packages = JSON.parse(readFileSync(join(root, 'src', '.vitepress', 'data', 'packages.json'), 'utf8'))

const hasComposer = (() => {
    try {
        execFileSync('composer', ['--version'], { stdio: 'ignore' })
        return true
    } catch {
        return false
    }
})()
function composerOnce(cwd, args) {
    if (hasComposer) return execFileSync('composer', args, { cwd, stdio: 'inherit' })
    const uid = `${process.getuid()}:${process.getgid()}`

    return execFileSync('docker', ['run', '--rm', '-u', uid, '-e', 'HOME=/tmp', '-e', 'COMPOSER_HOME=/tmp/c', '-v', `${cwd}:/app`, '-w', '/app', 'composer:2', 'composer', ...args], { stdio: 'inherit' })
}
// Downloads from GitHub occasionally time out; a second attempt usually succeeds.
function composer(cwd, args) {
    for (let attempt = 1; ; attempt++) {
        try {
            return composerOnce(cwd, args)
        } catch (e) {
            if (attempt >= 3) throw e
            console.log(`composer failed (attempt ${attempt}), retrying`)
        }
    }
}
async function text(url) {
    for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(url)
        if (res.ok) return res.text()
        if (res.status === 404) throw new Error(`404 ${url}`)
    }
    throw new Error(`could not fetch ${url}`)
}
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]))

// 1. Runtime
const runner = join(root, 'php-runner')
if (!existsSync(join(runner, 'node_modules'))) execFileSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd: runner, stdio: 'inherit' })
execFileSync('npm', ['run', 'build'], { cwd: runner, stdio: 'inherit' })
rmSync(out, { recursive: true, force: true })
cpSync(join(runner, 'dist'), out, { recursive: true })
for (const f of readdirSync(join(out, 'assets'))) {
    const unused = (/^php_\d+_\d+.*\.wasm$/.test(f) && !f.startsWith('php_8_4')) || /\.(so|dat|data)$/.test(f)
    if (unused) rmSync(join(out, 'assets', f))
}

// 2. One bundle per package
const sources = {}
for (const [slug, examples] of Object.entries(runnable)) {
    const pkg = packages.find((p) => p.slug === slug)
    const tag = pkg.releases[0].tag
    const dir = mkdtempSync(join(tmpdir(), `php-${slug}-`))
    writeFileSync(join(dir, 'composer.json'), JSON.stringify({ require: { [`rasuvaeff/${slug}`]: tag.replace(/^v/, '') }, config: { platform: { php: '8.4' } } }))
    composer(dir, ['install', '--no-dev', '--no-interaction', '--no-progress', '--classmap-authoritative', '--ignore-platform-req=ext-*'])
    mkdirSync(join(dir, 'examples'))
    sources[slug] = {}
    const helpers = new Set()
    for (const { file } of examples) {
        const code = await text(`https://raw.githubusercontent.com/rasuvaeff/${slug}/${tag}/examples/${file}`)
        writeFileSync(join(dir, 'examples', file), code)
        sources[slug][file] = code
        // Helpers the example pulls in from its own directory, such as understudy's _check.php.
        for (const m of code.matchAll(/__DIR__\s*\.\s*'\/([\w.-]+\.php)'/g)) helpers.add(m[1])
    }
    for (const helper of helpers) {
        if (existsSync(join(dir, 'examples', helper))) continue
        writeFileSync(join(dir, 'examples', helper), await text(`https://raw.githubusercontent.com/rasuvaeff/${slug}/${tag}/examples/${helper}`))
    }
    if (slug === 'property-testing-core') {
        writeFileSync(join(dir, 'examples', 'readme-sample.php'), readFileSync(join(root, 'scripts', 'php', 'readme-sample.php')))
    }
    const files = {}
    for (const f of walk(dir)) {
        const rel = relative(dir, f)
        if (rel.startsWith('vendor/') || rel.startsWith('examples/')) files[rel] = new Uint8Array(readFileSync(f))
    }
    writeFileSync(join(out, `${slug}.zip`), zipSync(files, { level: 9 }))
    sources[slug].__tag = tag
    rmSync(dir, { recursive: true, force: true })
    console.log(`${slug} ${tag}: ${examples.length} examples, ${Object.keys(files).length} files`)
}
writeFileSync(join(out, 'sources.json'), JSON.stringify(sources))
const size = walk(out).reduce((sum, f) => sum + statSync(f).size, 0)
console.log(`php: ${(size / 1e6).toFixed(1)} MB in ${relative(root, out)}`)
