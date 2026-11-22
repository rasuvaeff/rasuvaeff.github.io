---
title: "PHP 8.6 for the whole package line in two days: what the pipelines caught"
description: "Dependency-ordered rollout, an agent running the per-package loop, and the CI jobs that caught psalm 7.15, stale pins and a behavior-breaking fix along the way."
date: 2026-11-22
outline: [2, 3]
figures:
  - ["49", "packages shipped"]
  - ["2", "days"]
  - ["0", "--ignore-platform-req"]
  - ["41", "waiting on yiisoft"]
---

PHP 8.6.0 went GA on November 19. My [monorepo](/blog/ai-agents) holds 90 published Composer packages, and every one of them declares a PHP range as a user-facing contract. By the evening of November 22, 49 of them are released with PHP 8.6 support and a required PHP 8.6 matrix entry in CI; the other 41 are done on the source side and are waiting for a single thing — [yiisoft](https://github.com/yiisoft) releasing the framework packages they depend on. This post is about how the migration ran, and mostly about what the pipelines caught along the way, because that turned out to be the interesting part.

---

## The rule that made it cheap

The obvious way to "support" a new PHP version is to widen the constraint and run CI with `--ignore-platform-req=php+`. I ruled that out on day one, and the previous post explains the general principle; here is the concrete reason. The flag lifts the PHP ceiling on **every** dependency in the resolution, not just yours. If a dependency genuinely breaks on 8.6, the job goes green anyway and the user finds out at runtime.

Instead, the rollout runs in dependency order. Every package has a level: it may start only when everything it depends on — `require` **and** `require-dev` — is already released with the widened range. The levels were computed once from the dependency graph of all 90 packages, and confirmed per-package by `composer prohibits php 8.6.0`.

One wrinkle: the graph had a cycle. [`rector-named-literals`](/packages/rector-named-literals) is a dev dependency of the property-testing family, which [`rector-named-literals`](/packages/rector-named-literals) itself uses in CI. The cycle was broken without any flags: [`rector-named-literals`](/packages/rector-named-literals) shipped first with its 8.6 job still in the old experimental shape, the property-testing packages followed with the real shape, and a final CI-only PR switched [`rector-named-literals`](/packages/rector-named-literals) to it. Three days of graph reading saved by an afternoon of sequencing.

Templates went first. One change to `templates/` — the 8.6 matrix entry, a step that drops `roave/backward-compatibility-check` and `composer-require-checker` (both pin `~8.4.0 || ~8.5.0`, and no version supports 8.6), a separate build script for 8.6 without `cs` (php-cs-fixer cannot parse 8.6 syntax yet), the compatibility job moved to PHP 8.5 — and every later package inherited the whole thing by copying two jobs.

## The loop an agent can run

Once the templates were in place, the per-package change became mechanical, and mechanical means delegable. For every package the agent ran the same loop:

1. an `enhancement` issue (a PHP range is a user-facing contract, so it gets a public trail);
2. a branch off fresh `origin/master`;
3. `composer.json`: `8.3 - 8.5` → `8.3 - 8.6`;
4. the `build` and backward-compatibility jobs ported from the template;
5. the requirements line in `README.md`, `README.ru.md` and `llms.txt`, a `## Unreleased` bullet;
6. a full local build in the `composer:2` container;
7. push, open the PR, stop.

Merging and releasing stayed with me — green CI first, then squash-merge, then a release PR that renames `## Unreleased` into a version, then the tag. That part is judgment: which release gate to re-check, when a failure is the PR's fault versus the world's. The agent's reports came back with issue and PR links, test counts and a deviations list, which made the review a thirty-second read per package.

## What the pipelines caught

This is the part worth the read. The wave was planned around the tools I control, but psalm 7.15.0 landed on Packagist **in the middle of it** — between that day's green runs and the evening ones. Every lock file is gitignored, so the next fresh resolve picked it up. Four different jobs surfaced four different breakages, and none of them were caused by the PHP 8.6 change itself.

**Prefer lowest caught a config schema break.** psalm 7.15 grew a `WeakHash` check, and [circuit-breaker](/packages/circuit-breaker)'s Redis script runners legitimately use `sha1()` — `EVALSHA` matches scripts by their SHA1 digest; the protocol mandates it. The sanctioned fix is a scoped rule in `psalm.xml` issue handlers. But `Prefer lowest` installs the oldest psalm the constraint allows, and that version's config schema has no `WeakHash` element — the job failed to parse the file. The fix that survives both ends: raise the psalm floor to `^7.15` (dev-only dependency, one major), because any future master build would resolve 7.15 anyway.

**Integration tests caught a fix that static analysis loved.** [understudy-psalm](/packages/understudy-psalm) — the Psalm plugin — went red under psalm 7.14. Bisecting releases showed 7.13.2 clean, 7.14.0 broken: that release introduced an "unrequired packages" filter, and the plugin's test fixtures, analyzed with no `composer.json` of their own, lost every global function the fixtures exercise. The first attempted repair removed a "redundant" `?? []` fallback — psalm 7.x demands it, but a `never`/`void` union reaches that code with zero atomic types at runtime, and the removal broke 13 integration tests. The mutation-and-coverage job turned what would have been a silent behavior change into a rewrite: the accumulator now starts empty with a first-iteration flag, which every psalm version can prove and which keeps the old result byte-for-byte. The fixtures got a `composer.json` each, pointing `vendor-dir` at the real vendor so psalm sees the true dependency graph.

**Small strictness changes, each caught by a different gate.** [payments](/packages/payments) failed on a stricter `get_object_vars()` stub — fixed with annotation-only `@var` assertions, runtime untouched. [doc-exec](/packages/doc-exec) hit new taint sources (`$argv`, `Throwable::getMessage()`) — handled at the package's own validation boundaries. [yii3-mcp](/packages/yii3-mcp)'s tests broke on testo 0.10.60's new error-handler plugin — two `#[WithoutErrorHandler]` attributes. [rector-datetime-immutable](/packages/rector-datetime-immutable) carried a pre-existing psalm failure that only a fresh resolve exposed; verified on master before touching the PR.

**Release ordering is part of dependency resolution.** One bridge package's 8.6 job started before the dependency's tag had propagated to Packagist — the lag is about a minute, and the job ran inside it. The failure message pointed straight at the cause; rerunning the failed jobs after the tag was enough. Related: old yiisoft releases that declare no `php` constraint at all "resolve" fine on 8.6 — composer is happy to install a 2023-era cache library on the new interpreter. The rollout rules count only releases whose newest version states an explicit 8.6 range; otherwise the support would be real in composer's eyes and fake in every way that matters.

**Stale pins surface on their own.** Two packages were still on [`context ^0.3`](/packages/context) — a line capped at 0.3.0, which never gets the widened range. They moved to `^0.3 || ^0.5`, keeping the declared compatibility range while letting 8.6 resolve to 0.5.1. yii3-webhooks was pinned to [`pinned-http-client ^0.1`](/packages/pinned-http-client) and needed an actual API port to 1.x (`Resolver` interface instead of a closure). Neither would have been found without the per-package resolution the wave forced.

## The score

Track A — every package blocked only by my own releases, levels L0 through L7 — is **complete**: 46 packages shipped. Two track B packages unlocked early by yiisoft releasing `di 1.5.0` with `8.1 - 8.6` (their only framework dependency), and one more, [`yii3-respect-validation`](/packages/yii3-respect-validation), never needed the migration at all — its constraint was already the open-ended `>=8.5`. **49 total**, each merged and tagged the same day its CI went green.

The remaining **41 packages** form track B: they depend on yiisoft packages whose newest releases still say `8.1 - 8.5` — `db`, `cache`, `db-sqlite`, `db-migration`, `validator`, `router`, `html` and friends cover most of them. yiisoft has started its own wave (`di` 1.5.0 landed the day mine finished); one subtlety worth knowing: older yiisoft releases declare no `php` constraint at all, so composer on 8.6 will happily resolve them — that does not count. When yiisoft publishes a package with an explicit range, its dependents can start the same day: the loop is rehearsed, and the next two in line ([maintenance-mode](/packages/yii3-maintenance-mode), [seo](/packages/yii3-seo)) need exactly one and two framework releases respectively.

## What's next

The 8.6 matrix entry stays required and non-experimental; the `cs` step returns to the 8.6 job when php-cs-fixer learns the syntax, and the dropped dev tools come back when roave and require-checker support the version. Track B resumes automatically as yiisoft releases land; nothing on my side blocks it.

The meta-lesson from the previous post holds: the expensive part of this migration was not writing the change — the agent wrote forty of them before lunch. The expensive part was the discipline around it, and that part was paid down months ago, in rules and gates. When psalm 7.15 landed mid-wave, nobody scrambled; four CI jobs independently pointed at four different root causes, and each fix landed with a trail a reader can follow.
