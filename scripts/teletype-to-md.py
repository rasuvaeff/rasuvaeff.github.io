"""Convert a teletype.in article body to Markdown for src/blog/.

Usage:
    curl -sL https://teletype.in/@rasuvaeff/<slug> -o page.html
    # extract <article class="article__content text" ...>...</article> into body.html
    python3 -I scripts/teletype-to-md.py body.html out.md

The output is a draft: teletype escapes markdown and collapses code into
inline spans, so code blocks, tables and links still need a manual pass
(see how the two November 2026 posts were cleaned up).
"""
import html
import re
import sys
from html.parser import HTMLParser


class Conv(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.stack = []
        self.list = []
        self.pre = False
        self.skip = 0
        self.href = []

    def w(self, s):
        self.out.append(s)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('svg', 'noscript'):
            self.skip += 1
        if self.skip:
            return
        if tag in ('h1', 'h2', 'h3', 'h4'):
            self.w('\n\n' + '#' * int(tag[1]) + ' ')
        elif tag == 'p':
            self.w('\n\n' if not self.list else '')
        elif tag == 'br':
            self.w('\n' if self.pre else '  \n')
        elif tag in ('strong', 'b'):
            self.w('**')
        elif tag in ('em', 'i'):
            self.w('*')
        elif tag == 'code' and not self.pre:
            self.w('`')
        elif tag == 'pre':
            self.pre = True
            self.w('\n\n```\n')
        elif tag == 'a':
            self.href.append(a.get('href', ''))
            self.w('[')
        elif tag in ('ul', 'ol'):
            self.list.append([tag, 0])
            self.w('\n')
        elif tag == 'li':
            self.list[-1][1] += 1
            ind = '   ' * (len(self.list) - 1)
            mark = '-' if self.list[-1][0] == 'ul' else '%d.' % self.list[-1][1]
            self.w('\n' + ind + mark + ' ')
        elif tag == 'blockquote':
            self.w('\n\n> ')
        elif tag == 'hr':
            self.w('\n\n---\n')
        elif tag == 'img':
            self.w('\n\n![%s](%s)\n' % (a.get('alt', ''), a.get('src', '')))

    def handle_endtag(self, tag):
        if tag in ('svg', 'noscript'):
            self.skip -= 1
            return
        if self.skip:
            return
        if tag in ('strong', 'b'):
            self.w('**')
        elif tag in ('em', 'i'):
            self.w('*')
        elif tag == 'code' and not self.pre:
            self.w('`')
        elif tag == 'pre':
            self.pre = False
            self.w('\n```\n')
        elif tag == 'a':
            self.w('](%s)' % self.href.pop())
        elif tag in ('ul', 'ol'):
            self.list.pop()
            self.w('\n')

    def handle_data(self, d):
        if self.skip:
            return
        if not self.pre:
            d = re.sub(r'\s+', ' ', d)
        self.w(d)


c = Conv()
c.feed(open(sys.argv[1]).read())
text = ''.join(c.out)
text = re.sub(r'\n{3,}', '\n\n', text).strip() + '\n'
open(sys.argv[2], 'w').write(text)
