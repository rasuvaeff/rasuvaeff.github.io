# rasuvaeff.github.io

Source for <https://rasuvaeff.github.io/>: a portfolio of the rasuvaeff/* PHP packages, in English and Russian (`/ru/`). VitePress.

```bash
npm install
npm run docs:dev        # http://127.0.0.1:4179/
```

| Script | What it does |
|---|---|
| `npm run data` | Rebuilds `src/.vitepress/data/packages.json` from Packagist and the tagged sources on GitHub (version, description, `minMsi`, agent skill). No token needed. |
| `npm run lint:php` | Syntax-checks every `php` code block in the pages with `php -l` (`node scripts/lint-php-blocks.mjs php83` to pick a binary). |
| `npm run docs:build` | Builds the site into `src/.vitepress/dist`. |
| `npm run docs:pdf` | After a build, prints `/resume` and `/ru/resume` to `resume-en.pdf` and `resume-ru.pdf` in `dist` (needs Chrome; set `CHROME` if it is not `google-chrome`). |

## Deploy

`.github/workflows/deploy.yml` runs all four steps and publishes to GitHub Pages on a push to `master`, every Monday (to pick up new releases) and on demand. Actions are pinned by commit SHA; check with `zizmor --persona=auditor .github/`.

Before the first deploy the repository has to be public (a user site on the free plan) and Pages has to use GitHub Actions as its source: Settings → Pages → Build and deployment → Source: GitHub Actions.

## Content rules

- Every claim about a package comes from its README or `src/` at the latest tag; every code block comes from the package README or `examples/`.
- `README` changes in the pages are mirrored in `/ru/` in the same commit.
