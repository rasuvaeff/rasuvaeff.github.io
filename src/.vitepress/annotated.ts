// Renders a PHP code block at build time as an annotated listing: a trailing `// comment`
// moves into a margin column next to its line, so the code itself stays clean. A block
// without trailing comments is rendered as plain highlighted code in a single column.

const KEYWORDS = new Set([
    'use', 'function', 'fn', 'new', 'return', 'if', 'else', 'elseif', 'foreach', 'for', 'while', 'as',
    'try', 'catch', 'finally', 'throw', 'static', 'final', 'readonly', 'class', 'interface', 'enum',
    'public', 'private', 'protected', 'true', 'false', 'null', 'int', 'string', 'bool', 'float',
    'array', 'mixed', 'void', 'never', 'self', 'match', 'instanceof', 'implements', 'extends',
    'namespace', 'const', 'echo', 'yield', 'abstract', 'declare',
])

const escape = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Splits a line into its code and a trailing `//` comment that is not inside a string. */
function split(line: string): [string, string | null] {
    let quote: string | null = null
    for (let i = 0; i < line.length - 1; i++) {
        const c = line[i]
        if (quote) {
            if (c === '\\') i++
            else if (c === quote) quote = null
            continue
        }
        if (c === "'" || c === '"') quote = c
        else if (c === '/' && line[i + 1] === '/' && !/https?:$/.test(line.slice(0, i))) {
            return [line.slice(0, i).replace(/\s+$/, ''), line.slice(i + 2).trim()]
        }
    }

    return [line, null]
}

function highlight(code: string): string {
    const re = /('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(\$[A-Za-z_]\w*)|(#\[[^\]]*\])|(\b\d[\d_]*(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)|(\?->|=>|->|::)/g
    let out = ''
    let last = 0
    let previous = ''
    let m: RegExpExecArray | null
    while ((m = re.exec(code))) {
        out += escape(code.slice(last, m.index))
        const [token, str, variable, attribute, num, word, op] = m
        if (str) out += `<span class="k-str">${escape(token)}</span>`
        else if (variable) out += `<span class="k-var">${token}</span>`
        else if (attribute) out += `<span class="k-attr">${escape(token)}</span>`
        else if (num) out += `<span class="k-num">${token}</span>`
        else if (word) {
            const next = code.slice(re.lastIndex).trimStart()
            if (KEYWORDS.has(word.toLowerCase())) out += `<span class="k-kw">${token}</span>`
            else if (/^[A-Z]/.test(word)) out += `<span class="k-type">${token}</span>`
            else if (next.startsWith('(') || previous === '->' || previous === '?->' || previous === '::') out += `<span class="k-fn">${token}</span>`
            else out += token
        } else if (op) out += `<span class="k-op">${escape(token)}</span>`
        previous = op ?? ''
        last = re.lastIndex
    }

    return out + escape(code.slice(last))
}

export function renderAnnotatedPhp(source: string): string {
    const lines = source.replace(/\n$/, '').split('\n')
    const parts = lines.map(split)
    // Margin notes need room: a block with a very long code line keeps its comments inline.
    const widest = Math.max(...parts.map(([code]) => code.length))
    const annotated = widest <= 76 && parts.some(([code, note]) => note !== null && code.trim() !== '')

    const rows = parts.map(([code, note], i) => {
        // A comment on a line of its own is part of the code, not a margin note.
        if (note !== null && code.trim() === '') {
            const indent = lines[i].match(/^\s*/)?.[0] ?? ''
            return { code: `${indent}<span class="k-cm">// ${escape(note)}</span>`, note: '' }
        }
        if (!annotated && note !== null) {
            return { code: `${highlight(code)}  <span class="k-cm">// ${escape(note)}</span>`, note: '' }
        }

        return { code: highlight(code), note: note === null ? '' : escape(note) }
    })

    const body = rows
        .map((r) => `<span class="row"><span class="c">${r.code || ' '}</span>${annotated ? `<span class="n">${r.note}</span>` : ''}</span>`)
        .join('')

    return `<div class="listing${annotated ? ' annotated' : ''}"><button class="copy" type="button" aria-label="Copy code">copy</button><pre v-pre class="listing-body">${body}</pre></div>\n`
}
