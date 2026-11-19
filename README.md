# rasuvaeff.github.io

Source for the site that will be published at <https://rasuvaeff.github.io/>.

The repository is private. GitHub Pages is not enabled, so that URL does not serve this site.

```bash
npm install
npm run docs:dev
```

Open <http://127.0.0.1:4179/>.

Package versions and mutation gates in `src/.vitepress/data/packages.json` come from the monorepo checkout one level up:

```bash
npm run data
```

Run it before a release of the site, then commit the JSON.
