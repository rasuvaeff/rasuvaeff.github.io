import { createContentLoader } from 'vitepress'

export interface Post {
    url: string
    title: string
    description: string
    date: string
    readingTime: number
    ru: boolean
    figures: [string, string][]
}

declare const data: Post[]
export { data }

const words = (src: string) => src.replace(/^---[\s\S]*?---/, '').split(/\s+/).filter(Boolean).length

export default createContentLoader(['blog/*.md', 'ru/blog/*.md'], {
    includeSrc: true,
    transform(raw): Post[] {
        return raw
            .filter((p) => p.frontmatter.date)
            .map((p) => ({
                url: p.url,
                title: String(p.frontmatter.title),
                description: String(p.frontmatter.description ?? ''),
                date: new Date(p.frontmatter.date).toISOString(),
                readingTime: Math.max(1, Math.round(words(p.src ?? '') / 200)),
                ru: p.url.startsWith('/ru/'),
                figures: ((p.frontmatter.figures ?? []) as [string, string][]).slice(0, 4),
            }))
            .sort((a, b) => b.date.localeCompare(a.date))
    },
})
