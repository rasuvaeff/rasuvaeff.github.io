// Prints /resume and /ru/resume of the built site to PDF files in src/public (committed, so the
// dev server serves them too) and copies them into the dist folder. Run after `vitepress build`. Needs Chrome: set CHROME, or google-chrome must be on PATH.
import { execFileSync, spawn } from 'node:child_process'
import { copyFileSync } from 'node:fs'
import { connect } from 'node:net'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const dist = join(root, 'src', '.vitepress', 'dist')
const publicDir = join(root, 'src', 'public')
const chrome = process.env.CHROME ?? 'google-chrome'
const port = 4190
const base = `http://127.0.0.1:${port}`
const vitepress = join(root, 'node_modules', 'vitepress', 'bin', 'vitepress.js')

// A TCP probe, not fetch(): fetch may be routed through HTTP_PROXY from the environment.
const listening = () => new Promise((resolve) => {
    const socket = connect({ host: '127.0.0.1', port }, () => {
        socket.end()
        resolve(true)
    })
    socket.on('error', () => resolve(false))
})

const server = spawn(process.execPath, [vitepress, 'preview', 'src', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: root,
    stdio: ['pipe', 'ignore', 'inherit'],
})

try {
    for (let i = 0; !(await listening()); i++) {
        if (i > 60) throw new Error('preview server did not start')
        await new Promise((r) => setTimeout(r, 500))
    }
    for (const [path, file] of [['/resume', 'resume-en.pdf'], ['/ru/resume', 'resume-ru.pdf']]) {
        execFileSync(chrome, [
            '--headless=new', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer', '--no-proxy-server',
            '--virtual-time-budget=5000', `--print-to-pdf=${join(publicDir, file)}`, `${base}${path}`,
        ], { stdio: 'ignore' })
        copyFileSync(join(publicDir, file), join(dist, file))
        console.log(`${file} written`)
    }
} finally {
    server.kill()
}
