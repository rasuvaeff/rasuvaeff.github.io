// Syntax-checks every ```php block in src/**/*.md with `php -l`.
// Snippets are fragments of README examples, so some are wrapped before linting:
// class members go into a class, a bare config fragment into `return [...]`.
// Usage: node scripts/lint-php-blocks.mjs [php binary and args...]
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'

const root = join(import.meta.dirname, '..', 'src')
const php = process.argv.slice(2).length ? process.argv.slice(2) : ['php']
const dir = mkdtempSync(join(tmpdir(), 'php-blocks-'))

function* markdown(path) {
    for (const name of readdirSync(path)) {
        if (name.startsWith('.')) continue
        const full = join(path, name)
        if (statSync(full).isDirectory()) yield* markdown(full)
        else if (name.endsWith('.md')) yield full
    }
}

function wrap(code) {
    const body = code.trim()
    if (body.startsWith('<?php')) return body
    const firstLine = body.split('\n').find((l) => l.trim() !== '' && !/^(\/\/|\/\*|\*)/.test(l.trim())) ?? ''
    if (/^(#\[|public |private |protected |static function \w)/.test(firstLine.trim()) && !/^\s*(final |abstract |readonly )*class /m.test(body)) {
        return `<?php\nfinal class LintedSnippet\n{\n${body}\n}\n`
    }
    if (/^'[^']+'\s*=>/.test(firstLine.trim())) return `<?php\nreturn [\n${body}\n];\n`
    if (/^static function\s*\(/.test(firstLine.trim()) && body.endsWith('}')) return `<?php\n$f = ${body};\n`
    return `<?php\n${body}\n`
}

let count = 0
const failures = []
for (const file of markdown(root)) {
    const source = readFileSync(file, 'utf8')
    const fence = /^(`{3,})php[^\n]*\n([\s\S]*?)^\1\s*$/gm
    for (const m of source.matchAll(fence)) {
        count++
        const line = source.slice(0, m.index).split('\n').length
        const path = join(dir, `block-${count}.php`)
        writeFileSync(path, wrap(m[2]))
        try {
            execFileSync(php[0], [...php.slice(1), '-l', path], { stdio: 'pipe' })
        } catch (e) {
            failures.push(`${relative(root, file)}:${line}\n${String(e.stdout || e.stderr).trim()}`)
        }
    }
}

console.log(`${count} php blocks checked, ${failures.length} failed`)
if (failures.length) {
    console.log(failures.join('\n\n'))
    process.exit(1)
}
