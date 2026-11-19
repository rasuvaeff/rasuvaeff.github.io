---
title: Workflow
description: How one person ships and maintains 89 packages. An agent writes inside a rulebook that records every past incident, behind gates that cannot be talked down.
outline: [2, 2]
---

# Workflow

An agent writes most of the code in these packages. It works inside a rulebook I own, behind gates it cannot lower, and it does not merge, tag or publish. The rulebook and the tools are open as a snapshot: [php-package-toolkit](https://github.com/rasuvaeff/php-package-toolkit). The same loop built [cska.in](https://teletype.in/@rasuvaeff/cskain). The long form, with the incidents in full: [How I got an AI agent to maintain 90 PHP packages without losing my mind](https://teletype.in/@rasuvaeff/ai-agents) (in Russian).

The premise: an agent does not learn from experience, but it re-reads the rules at the start of every session. So everything that must not happen twice is written down in a form it executes literally.

## Three layers of rules

| Layer | What it holds |
|---|---|
| Root `AGENTS.md` | The constitution, over a thousand lines. Required file set, code style, test structure, naming, CI, release process. Concrete identifiers, not values: `'Invalid operator "foo"'`, not "write clean code". |
| Per-package `AGENTS.md` | Local invariants. Rule 3 of four golden rules is replaced with one package-specific safety rule before the first commit. |
| `docs/evolved-rules.md` | Case law. About fifty entries, each with a source, a self-contained rule and a status. The agent reads one entry by reference, so each must stand alone. |

The agent edits the rulebook only when I ask. Rule 1 of the constitution: never say "done" without a fresh green `composer build`, with the output pasted.

Entries that came from real incidents:

- **`$` in PCRE** matches before a trailing newline. A cookie of 32 hex characters plus `\n` passed validation and reached logs and analytics. Anchor with `\z`.
- **`DEFAULT` on a TEXT column.** MySQL rejects it, SQLite accepts it. Migrations created no tables on MySQL while CI, running SQLite, stayed green.
- **Migrations that silently did nothing.** A PSR-4 prefix match sent namespace discovery to the core package in nine `*-db` packages. Fixed upstream in `yiisoft/db-migration` 2.1.

## Gates

Every package passes the same gate: Psalm level 1 with no suppressions and no baseline, Testo tests (PHPUnit for the PHPUnit adapter), a backward-compatibility check before a major, and a mutation gate. Property tests cover algebraic laws and invariants where they exist.

### The mutation metric lied

Testo credits a test only with code named in its `#[Covers]`, and Infection by default mutates only covered code. Code outside any `#[Covers]` produced no mutants, so the report showed `Not Covered: 0`.

| Measured with `--with-uncovered` | |
|---|---|
| `json-ld` | 1,169 mutants and 97% before; 2,726 mutants and 41% after |
| Whole monorepo | 42,348 mutants, 19% of them previously invisible |
| Packages whose honest MSI met their own `minMsi` | 4 of 75 |

The fix has rules of its own:

- The flag is on for new packages. Published ones get it when a PR touches them, and are brought back to their existing `minMsi`, not below it.
- A threshold is never lowered to legalize the current state. Only the owner can lower it, and not below 85, with the reason written in `infection.json5`. The agent never does it: it would write a convincing justification for anything.
- Mutants that cannot be killed (visibility on a signature line with no opcode, defaults in a constructor signature) are excluded in the shared config, and the PR reports MSI before and after the ignore. The `Ignored` count stays visible.
- The local run must match CI. CI has `zend.assertions` off, so `assert()` mutants are uncovered there. Locally the same run disables assertions first.

### Property tests remember

A random input that breaks a property reproduces by chance. The engine writes each falsified property to a corpus on disk, and CI restores that corpus from cache before the run and saves it after, even when the run failed. A combined cache action skips saving on a red job, which is exactly the run that wrote the counterexample. A review bot found that; restore and save are separate steps now.

## Releases

Packagist blocks a re-tagged version permanently, so a tag is set once, on a verified commit, and never moved.

- The tag goes on the post-merge commit of `master`, after the PR merges. The release workflow checks that the tagged commit is an ancestor of `master` and that its `PHP *` check runs succeeded.
- `CHANGELOG.md` is part of the gate. A breaking PR is legitimate only when the top heading declares a major above the last tag, or a minor while the package is on 0.x.
- A tag is skipped when `src/` did not change, because the Composer dist would be byte-identical.
- CI is hardened: every `uses:` is a 40-character commit SHA, `permissions: contents: read`, `persist-credentials: false`, audited with `zizmor`.
- A new rule reaches published packages lazily, as an addition to the next PR that touches them, not as a wave of ninety mechanical PRs.

## Tools

| Tool | What it does |
|---|---|
| `bin/package-audit` | Deterministic convention audit: required files, `@api` on every type, `#[Covers]` on every test class, no suppressions, one `## Unreleased`. |
| `bin/dev` | Batch operations over many packages: build, git, changelog entries, template replication. |
| `bin/config-merge-harness` | Merges DI and params of core and backend packages the way the real config plugin does, to catch two vendors defining one key. |
| `bin/verify-clean-clone` | Clones a package into a temp directory and runs install and build in Docker. |
| `bin/record-openapi-corpus` | Records generated OpenAPI traffic with its intent, valid or invalid, as the validator's test corpus. |
| `bin/build-digest` | Writes a full build log to a file and returns one PASS or FAIL line, which saves the agent's context. |
| Claude Code hooks | A guard that checks every shell command for dangerous patterns, and a pre-commit audit that runs before every `git commit`. |

## What stays with a person

I design the API and the layer boundaries, decide what a deadline-propagating context or a deterministic A/B engine should look like, review every change and own the release. The agent does not merge, tag or publish without my explicit command.

## Where it breaks

- Rules do not cover ignorance. The `DEFAULT` on TEXT entry appeared only after packages were tested against a real MySQL.
- Context is finite. The rulebook has to be compressed from time to time: mature rules move into the constitution, duplicates merge, stale ones are marked obsolete.
- Trust is one-way. It works because the agent executes the rules and does not rewrite them. That is a property of my setup, not a law.
