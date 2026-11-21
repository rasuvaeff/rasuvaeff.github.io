---
title: "How I got an AI agent to maintain 90 PHP packages without losing my mind"
description: "The trick is not a smarter model but rules the agent rereads every session: AGENTS.md, evolved rules, honest gates and releases with no room for error."
date: 2026-11-10
origin: https://teletype.in/@rasuvaeff/ai-agents
outline: [2, 3]
figures:
  - ["90", "packages"]
  - ["50", "ER rules"]
  - ["41%", "honest MSI, not 97%"]
  - ["1475", "lines of rules"]
---

My monorepo holds [90 published Composer packages](/packages). It is an ecosystem for [Yii3](https://www.yiiframework.com/) — feature flags, A/B testing, webhooks, outbox, telemetry, metrics, audit log, idempotency, workflow, file storage — plus framework-agnostic libraries of my own: the specification pattern, retry, circuit breaker, bulkhead, schema validation, a property-based testing framework. Every package has its own CI with a PHP 8.3–8.5 matrix, mutation testing and a backward-compatibility check, an MSI threshold, documentation in two languages and its own `AGENTS.md`.

The monorepo itself is a private working copy, but every package lives in a public GitHub repository, and the tools and rules this post is about are published as a snapshot in [php-package-toolkit](https://github.com/rasuvaeff/php-package-toolkit) (state as of November 10, 2026).

Most of the code in this repository is not written by a human. It is written by an AI agent.

Sounds like a nightmare? I see why. "The model generated 5,000 files that don't compile" stories have become a genre. What actually happened is different: CI in this repository stays green more reliably than in many human teams I have worked with. Not because the model got smarter. Because over a few months I figured out the main thing:

**The secret is not a smart model. It is institutional memory, written down in a form the agent physically cannot ignore.**

That is what this long read is about. I will go through the whole system: the rules and how they evolve after every incident; honest quality gates — including mutation testing and how I found out my main metric was lying to me; and a release process with no room for mistakes, because Packagist does not give second chances. At the end, an honest look at what carries over to ordinary development and what is specific to working with an agent.

---

## Part 1. The agent as an intern with amnesia

Diagnosis first. What exactly is wrong with an AI agent as a code author — not an abstract "it's dumb", but concrete symptoms I saw in my own repository.

**Symptom one: the agent "remembers" a two-year-old API.** Ask it to update tests and it reaches for test-framework methods that are long gone, or idioms that changed three minor versions ago. The model was trained on a snapshot, and in that snapshot your library looks the way it once did. It does not go read the changelog unless you make it.

**Symptom two: "done" without checking.** The agent sincerely believes code works if it "looks right". It writes `composer build` into its report without running it. It says "the tests should pass". The dangerous part is how convincing it sounds: a confident narrative, a well-structured answer, code that almost compiles. *Almost* is the key word.

**Symptom three: reinvented wheels.** In every new package the agent invents its own validation approach, its own exception names, its own test layout. Ninety packages, ninety wheels — unless you keep it on a leash.

**Symptom four, the nastiest: the agent does not learn from experience.** This is the important turn. A human who steps on a rake remembers where it lies for life. The agent does not. Tomorrow, in a new session, its memory is blank, and it steps on the same rake with the same enthusiasm. Spent two hours today debugging odd PCRE behaviour? Tomorrow it all repeats byte for byte.

The fourth symptom leads to the insight that shapes the whole system:

> The agent does not learn — but the agent **rereads the rules every session**.

That asymmetry is something to build on. What is not written down does not exist. What is written down will be executed literally, word for word. The only question is *where* and *how* to write it, so the agent finds a rule exactly when it is needed and does not drown in rules the rest of the time.

### Why the usual approaches fail

The first thing everyone tries: "I'll just write careful prompts." It doesn't work: a prompt lives for one session, while an incident you must not repeat lives forever. The second: "I'll write one big instructions file." Better, but it runs into the context window: a 50-page file either doesn't fit or crowds out the very code you need to change. The third: fine-tune the model on your rules. Possible, but that is separate engineering, infrastructure and a loss of control — and I needed a process where every rule is visible, versioned and explainable.

So I ended up with a three-layer system:

1. **The root `AGENTS.md`** — the constitution: principles, conventions and processes for all packages.
2. **Each package's `AGENTS.md`** — local invariants of a specific library.
3. **`docs/evolved-rules.md`** — case law: incidents turned into self-contained rules.

One layer at a time.

---

## Part 2. AGENTS.md as a constitution, evolved rules as case law

The legal metaphor is deliberate: it describes the setup better than a technical one would.

### The constitution: the root AGENTS.md

The monorepo root has an `AGENTS.md` — a rulebook of almost fifteen hundred lines (the [English snapshot in the toolkit](https://github.com/rasuvaeff/php-package-toolkit/blob/master/AGENTS.md) is a bit shorter). The format is a [de facto standard](https://agents.md/): many agents (OpenCode and others) read a file with this name when a session starts in a directory. Claude Code reads `CLAUDE.md`, so next to it sits a one-line `CLAUDE.md` — `@AGENTS.md`, an import of the same file. One source of truth for any agent. It is the entry point, the constitution: principles, conventions, processes. Everything that is always true lives here:

- A mandatory set of 25+ files per package: `composer.json` from the template, `psalm.xml`, `infection.json5`, CI workflows, a bilingual README, `llms.txt`.
- Code style: `declare(strict_types=1)`, `final readonly class`, `#[\Override]`, named arguments, Psalm annotations of a specific kind (`non-empty-string`, `int<0, max>`, `array{...}` shapes).
- Test structure on [Testo](https://php-testo.github.io/) — down to the fact that `Assert::same($actual, $expected)` takes its arguments in the order *opposite* to PHPUnit.
- A naming table: fluent setters `with*`, static factories `equal()`/`in()`, exception messages without a trailing period.

Note the density. The rules don't say "write clean code"; they say `ComparisonSpecification`, `whereEqual`, `'Invalid operator "foo"'`. You can't explain things to an agent at the level of values — it won't derive a concrete identifier from a value. It needs the identifier.

On top of that, every package carries its own `AGENTS.md` with package-specific invariants — and four "golden rules", the third of which is deliberately replaced with the package's first own safety rule. The template:

1. **Verification is mandatory.** Never claim "done" without a fresh green `composer build`. "Should work" does not count.
2. **No suppressions.** No `@psalm-suppress`, no baseline. Root cause only.
3. *(replaced with a package-specific rule)*
4. **Preserve the public contract.** Changed the API — update the README (both, EN and RU) and the tests.

The first rule closes symptom two from Part 1. It reads like the letter of a statute, on purpose: the agent executes the letter. "Never claim done without a fresh green `composer build`. Paste the output" — and the agent pastes the output. If there is no output, an attentive reviewer (that is, me) sees it in a second.

### Case law: docs/evolved-rules.md

The constitution holds principles. Real experience, though, is incidents: rakes someone stepped on, with dates, sources and exact wording. They get their own document — `docs/evolved-rules.md` ([snapshot in the toolkit](https://github.com/rasuvaeff/php-package-toolkit/blob/master/docs/evolved-rules.md)), fifty entries from `ER-001` to `ER-050`. The entry format is strict:

```markdown
### ER-NNN — the lesson as a title

**Source:** which package or incident exposed it
**Rule:** self-contained text — a future agent must understand it
without any other context
**Status:** active / superseded / obsolete
```

Self-containment is not about looks. An agent reading ER-049 while fixing a migration will not read the whole document and its history. Each rule has to stand alone.

An important mechanical detail: `evolved-rules.md` is not loaded into a session by itself — only `AGENTS.md` is. So the constitution points to the case law exactly where a rule is needed: the migrations section has a short "⛔ no literal `DEFAULT` on `TEXT`" and a link, "details — ER-049". An agent working on a migration reads that section and follows the link for the details. That is the answer to "where to write it": the principle and the ban go into the constitution, the context and the analysis into an ER, connected by an explicit link.

Who writes the entries? The agent too — but on my instruction, after an incident has been analysed. On its own, unasked, it does not edit the rulebook.

A few entries, each one a small detective story.

**ER-001: anchor with `\z`, not `$`.** In PCRE, `$` matches not only at the end of the string but also *right before a trailing newline*. In [yii3-ab-testing-web](/packages/yii3-ab-testing-web), an `ab_id` cookie holding "32 hex characters + `\n`" passed validation against `/^[0-9a-f]{32}$/` — and that subject id, stray `\n` included, went into logs and analytics. Silently, without a single error. Fixed in [PR #8](https://github.com/rasuvaeff/yii3-ab-testing-web/pull/8). The rule: validation of untrusted input is anchored with `\z` only, and the test's data provider must include a `"value\n"` case. The rule went straight into the constitution — the Security section, next to the whitelist regexes it protects.

```php
preg_match('/^[0-9a-f]{32}$/', str_repeat('a', 32) . "\n");  // 1 — accepted
preg_match('/^[0-9a-f]{32}\z/', str_repeat('a', 32) . "\n"); // 0
```

**ER-049: `DEFAULT` on a TEXT column.** MySQL and MariaDB reject a literal `DEFAULT` on `TEXT`/`BLOB`/`JSON` with error 1101. The only driver in the monorepo's `require-dev` is SQLite, and it accepts that DDL without complaint. The result: `migrate:up` on MySQL returns without creating a single table, while CI is green, because CI runs SQLite too. The migration had never met the engine it was broken on. CI didn't find it; a deliberate sweep over all `*-db` packages did: the same copied pattern sat in four packages ([yii3-tenancy-db#15](https://github.com/rasuvaeff/yii3-tenancy-db/issues/15), [yii3-feature-flags-db#28](https://github.com/rasuvaeff/yii3-feature-flags-db/issues/28), [yii3-ab-testing-db#22](https://github.com/rasuvaeff/yii3-ab-testing-db/issues/22), [yii3-idempotency-db#18](https://github.com/rasuvaeff/yii3-idempotency-db/issues/18)). The rule: a package with migrations must carry a cross-database integration test and an ungated matrix job with MySQL and PostgreSQL service containers.

**ER-044: migrations that silently did nothing.** All nine `*-db` packages that existed at the time registered migrations via `setSourceNamespaces()` — and `migrate:up` returned 0 without creating any tables. The cause: `yiisoft/db-migration` matched a migration namespace against the PSR-4 map by string prefix, and the match led into the core package. Unit tests built migrations via `Injector::make()` and never touched that path: green CI, empty database. It was fixed by an [upstream PR to `yiisoft/db-migration`](https://github.com/yiisoft/db-migration/pull/350) (shipped in 2.1.0), but before finding it I had to admit that a test that "checks migrations" does not check *the path that runs migrations*.

**ER-003: the metric that reassures.** This one gets its own part below, because it is the biggest lesson in the repository's history.

Fifty entries were enough to turn the repository from "a set of packages" into an organism with immune memory. A recorded incident almost never repeats — and if it does, that is a reason to sharpen the rule's wording, not to shrug. A human colleague can't do this: people leave, forget, get tired. A rule in a file doesn't get tired.

### Lazy rollout: why I don't do waves of PRs

A separate philosophy that grew out of practice. When a new rule appears (say, "the mutation job in CI must have a narrow path filter"), in theory I could go through all 90 packages and apply it at once. A wave of 90 PRs. I do the opposite: the rule goes into `templates/` for all *new* packages, and into published ones lazily, as an add-on to the first PR that touches the package for some other reason.

That is more honest for three reasons. First, a wave of 90 PRs is 90 CI runs, 90 reviews and zero new knowledge: the changes are mechanical. Second, mandatory add-ons turn any substantive PR into a lumbering Frankenstein if you demand *all of them at once*; so I have a strict orthogonality criterion — a docs-only PR does not drag CI changes along. Third, and most important, lazy rollout makes a rule *prove* its worth: if no PR has needed it in six months, maybe it isn't needed.

To keep the agent from forgetting the add-ons, the root rulebook lists them as "when — what to do" tables. An agent opening a PR in a package that has property tests but no regression corpus in CI must add the corpus in the same PR. It can't forget: it's in `AGENTS.md`, and the agent rereads `AGENTS.md`.

---

## Part 3. Honest gates: how I found out my metric was lying

If someone had asked me in summer 2026 to name this repository's strongest side, I would have said mutation testing. Every package has an MSI (Mutation Score Indicator) threshold from 85 to 100 — with one exception at 83, justified right in its config — and [Infection](https://infection.github.io/) runs in CI on every PR. Mutation testing checks not "do the tests execute the code" but "do the tests notice when the code is broken": the tool makes mechanical damage in the source (turns `<` into `<=`, `+` into `-`, removes calls, inverts conditions) and watches whether at least one test fails. A surviving mutant is a hole in the tests.

Then, in autumn 2026, I ran Infection over the repository with the `--with-uncovered` flag — and the picture collapsed.

```bash
infection --threads=max --with-uncovered
```

### A hole in the denominator

Plain Infection mutates only code that is covered by tests *according to the coverage report*. And the Testo framework (a deliberate design decision) credits a test only with the code named in its `#[Covers(...)]` attribute — not with everything the test actually executes. If a test with `#[Covers(Foo::class)]` calls `Bar` through composition, `Bar`'s mutants are never created. Not "not killed" — **not created**. The report simply has no lines for them.

On [json-ld](/packages/json-ld) it looked like this:

| Run | Mutants | Not Covered | MSI |
|---|---|---|---|
| without the flag | 1169 | 0 | 97% |
| with `--with-uncovered` | 2726 | 1557 | 41% |

More than half of the mutants did not exist as far as the gate was concerned. With `minMsi: 92`. The work to get back to the threshold is in [json-ld#3](https://github.com/rasuvaeff/json-ld/pull/3).

The full audit across the monorepo ([full report](https://github.com/rasuvaeff/php-package-toolkit/blob/master/docs/mutation-honest-msi.md)):

| Metric | Value |
|---|---|
| Packages with a result | 75 of 84 |
| Mutants with the flag | 42,348 |
| Previously invisible among them (Not Covered) | 7,874 (19%) |
| Median invisible share per package | 12% |
| Median MSI drop (visible → honest) | 12 pp |
| Packages whose honest MSI is at or above their `minMsi` | 4 of 75 |

Four out of seventy-five. The metric the whole quality gate rested on showed pretty numbers — a median of 97% — and lied by twelve points on average.

The worst part of this story is not the hole itself but that it was *reassuring*. The report said `Not Covered: 0` and `Mutation Code Coverage: 100%`. Zero! Everything covered! There was nothing to report as uncovered — because no mutants were created there, not because they were killed. There is a categorical difference between "checked and works" and "didn't check, see no errors". The metric could not tell them apart.

What follows is the fix, and it is instructive in itself, because it is made of small honesties.

**Step 1: the flag is mandatory.** `--with-uncovered` is now in the mutation command of every new package, and in published ones lazily, on first touch. And the threshold does not go down: the missing mutants are covered by `#[Covers]` on tests that already execute the code, plus new tests.

**Step 2: if it can't be killed, take it out of the denominator — but not silently.** It turned out some mutants are unkillable in principle. Two cases, two mechanisms:

- `PublicVisibility` on the signature line of a method without parameters — there is no executable opcode there, the mutant is always `Not Covered`, and no test will ever kill it. A pilot on [pinned-http-client](/packages/pinned-http-client): 4 of 4 such mutants, 0 killed. These mutators (`PublicVisibility`, `ProtectedVisibility`) are disabled in the template config entirely — with the rationale and the pilot numbers written down.
- Parameter defaults in a signature (`private int $x = 100,`) — mutants on them are ignored by a regex. Here the rule demands *reporting*: a PR states the MSI before and after the ignore separately, the `Ignored` count is not hidden, and every few releases the ignore is lifted for one run to see whether those mutants have become killable.

An ignore is an admission that "this part of the denominator is not about test quality", and it has to be visible, not buried in a config.

**Step 3: a local run must match CI.** I caught a discrepancy: 95% locally, 93% in CI. The cause: CI has `zend.assertions` off, so `\assert()` in the code is not compiled and its mutants are `Not Covered` there, while locally the assertions run and the tests kill those mutants. Now an ini file disabling assertions is written in the container before a mutation run — so the local number matches the gate's number; otherwise the margin over the threshold is computed from the wrong base.

```bash
echo 'zend.assertions=-1' > /usr/local/etc/php/conf.d/zz-ci.ini
```

**Step 4: threshold ethics.** I ran into a temptation: for a couple of packages the honest MSI is so far below the threshold that getting back up is weeks of work. The urge to "just lower `minMsi` to what is actually achieved" led to the rule I consider the most important in this part: the threshold is not lowered to legitimise the current state. Lowering is a last resort by the owner's explicit decision, never below 85, with the reason recorded in the config and in a status file, in plain sight. The agent is forbidden to lower a threshold itself — precisely because an agent will always take the path of least resistance unless explicitly constrained.

### The regression corpus: property tests that remember

The second line of defence is property-based testing. Instead of fixed "input A → output B" cases, a generator builds hundreds of random inputs, and the test checks an *invariant*: `decode(encode(x)) == x` for any `x`; a backoff delay is always within `[0, cap]` and never decreases; hash bucketing is deterministic. The monorepo has its own family of libraries for this — [property-testing-core](/packages/property-testing-core), [-testo](/packages/property-testing-testo) and [-phpunit](/packages/property-testing-phpunit) — but this post is not about them. It is about one piece of infrastructure that solves the main problem of property tests: they are *stochastic*.

A bug caught by a random input reproduces with some probability — say, once in three hundred runs. If CI failed on a generated counterexample and the rerun passed, the bug "disappeared". To keep the counterexample, the property engine writes every falsified property into an on-disk corpus (`build/property-db`), and CI restores the corpus from the GitHub Actions cache before the run and saves it back — even when the run is red.

That corpus is behind my favourite finding from the [CodeRabbit](https://coderabbit.ai/) review bot (in [yii3-ab-testing#29](https://github.com/rasuvaeff/yii3-ab-testing/pull/29)). The combined `actions/cache` saves the cache only on a green job (`post-if: "success()"`). But the corpus is written by exactly the *failing* run: the property is falsified → the job is red → the post step doesn't run → the counterexample is never saved. So the one thing the mechanism existed for was broken: "a bug is recorded and the regression is caught forever" turned into "CI saw the bug once and forgot". The fix is to split it into [`actions/cache/restore`](https://github.com/actions/cache/tree/main/restore) before the step and [`actions/cache/save`](https://github.com/actions/cache/tree/main/save) with <code v-pre>if: ${{ !cancelled() }}</code> after it. Plus `run_attempt` in the cache key — otherwise on a re-run the key is already taken, save quietly ends with a warning, and nothing is saved again.

```yaml
- name: Restore property regression corpus
  uses: actions/cache/restore@<SHA> # vN
  with:
    path: build/property-db
    key: property-db-${{ github.run_id }}-${{ github.run_attempt }}
    restore-keys: property-db-

# ...the Test with coverage step, with env PROPERTY_DB: ${{ github.workspace }}/build/property-db

- name: Save property regression corpus
  if: ${{ !cancelled() }}
  uses: actions/cache/save@<SHA> # vN
  with:
    path: build/property-db
    key: property-db-${{ github.run_id }}-${{ github.run_attempt }}
```

A few lines of YAML, two hidden semantics, zero visible errors. A classic.

---

## Part 4. Releases with no room for mistakes

Now for what happens when the code is written, tested, put through mutations — and it is time to publish. Here the system is built around one hard fact of the outside world:

**Packagist blocks a re-created tag. Forever.**

Delete the tag `v1.2.3` and put it on another commit — that's it, version `1.2.3` is marked `Upstream re-tag blocked` on Packagist until the end of time. The only way out is to release `1.2.4`. This is not my repository's policy, it is a property of the landscape, and it dictates everything else: **a tag is set exactly once, on a verified commit, and never moves.**

Hence a process that looks paranoid at first glance and minimally sufficient at second.

**A tag only on verified history.** Before creating a GitHub Release, the release workflow makes sure the tagged SHA is an ancestor of `master` and that the matrix `PHP …` check runs on that SHA succeeded. Before this check, the workflow published a Release for any tag — including one set on a commit whose CI had never been green: the build workflow runs on PRs and pushes to `master`, nothing runs on a tag, and nobody was there to check.

**A tag after the merge, not before.** A squash merge creates a new SHA. A tag set on the PR branch before the merge points at a commit that never landed in `master`. So the release commit goes through a PR, the tag is set on the post-merge HEAD, and reachability is checked before the push:

```bash
git tag -a vX.Y.Z -m "X.Y.Z"
git merge-base --is-ancestor vX.Y.Z origin/master && echo OK
git push origin vX.Y.Z
```

**The changelog format is part of the gate.** [Roave Backward Compatibility Check](https://github.com/Roave/BackwardCompatibilityCheck) compares the public API with the last tag and goes red on breaking changes. A deliberate major is when a red report is expected. How does CI know whether it is? From `CHANGELOG.md`: if the top heading declares a major above the last tag (or, while the package is on 0.x, a minor), a breaking PR is legitimate; if it says `## Unreleased`, it is red, and *that is correct*: under `Unreleased` a breaking PR should stand guard like a sentry. A consequence that is not obvious until you step on it: a release PR must rename `Unreleased` to a dated version, not add its own heading next to it. Otherwise the release-notes extractor stops at the stray `## Unreleased`, and the release silently loses its description of changes. Two real cases: [openapi-contract v0.7.0](https://github.com/rasuvaeff/openapi-contract/releases/tag/v0.7.0) lost the decision on HTTP headers, [yii3-mcp v2.2.0](https://github.com/rasuvaeff/yii3-mcp/releases/tag/v2.2.0) lost three server parameters; both had to be restored by hand with `gh release edit`. Now "exactly one `## Unreleased`, above all versions" has its own check in the audit script.

**First release without protection; tag and protection after green CI.** A classic trap for a young repository: set the tag and turn on branch protection right with the first push. If the first CI run is red (say, the local PHP 8.5 image doesn't catch what fails on 8.3), the tag already points at a broken commit, and `master` can't be fixed directly — only through a recovery PR, after which the tag has to be deleted. See above for how that ends. So the order is strict: push to unprotected `master` → green CI (a red run is fixed right on `master`) → tag → branch protection.

Against a paranoid reading of this part there is a simple argument: every item appeared *after* a specific incident or a specific review, none of them in advance.

### CI that won't let the supply chain down

Briefly on hardening, because it is also part of "no room for mistakes". Every `uses:` in every workflow is a 40-character commit SHA, no floating `@v4`: a tag in someone else's repository is a moving target that can point anywhere a minute after you referenced it. Updates go only through Dependabot, which can bump a SHA while keeping the `# v4` comment. Every checkout has `persist-credentials: false`, so OAuth credentials don't settle in `.git/config` or leak into artifacts. The audit — [zizmor](https://docs.zizmor.sh/) — is on the release checklist:

```bash
zizmor --persona=auditor .github/
```

This sounds like overkill for libraries downloaded by two and a half people. But two and a half people are a supply chain too. CI is where releases come from: a compromised action in a workflow with repository access can swap the code before the tag, and then `composer require` on the consumer side pulls into `vendor/` not my code but code that will run with their application's privileges. The price of discipline is one evening setting up templates; the price of its absence has no ceiling.

---

## Part 5. What carries over and what doesn't

I promised an honest breakdown. Here it is.

### What works for anyone — with people, without an agent

**Evolved rules as a format.** Keep a file of incidents with self-contained "source → rule → status" entries — and insist on self-containment. It is expensive (an abstract rule is easier to write), but it pays off the first time someone without the context reads the rule. And six months later, "someone without the context" is you.

**An honest denominator.** Not only in Infection. The coverage you count and the coverage the gate is responsible for are often different numbers, and the gap between them is where invisible holes live. Check whether your coverage tool counts what *actually executes* or what is *declared* to execute. A "one command" audit (`infection --with-uncovered` over every package) seemed affordable to me — and paid for itself on the first number.

**Threshold ethics.** A metric whose threshold is lowered to whatever was achieved is not a metric, it's decoration. Lowering a threshold is a public decision with a recorded reason, or nothing.

**Release discipline under external constraints.** Packagist, npm, Docker Hub — irreversible publishing is common to all of them. "One tag, on a verified SHA, after the merge" is the minimal process that respects that irreversibility. The rest goes into scripts and checks.

### What is specific to working with an agent

**The three-layer rule system itself.** For a human colleague a Slack post saying "careful with `$` in PCRE" is enough — they will remember the gist. An agent needs `\z` in a file, with an example and a required data-provider case. `AGENTS.md` exists as a format because there is an agent that reads it every time. No agent reading it — the format is dead, and all the weight falls on code review and CI, as in the good old days.

**Lazy rollout as ethics.** People tolerate waves of identical PRs better (some even find them meditative). An agent tolerates them worse: mechanical PRs with no new knowledge are pure context spend and a drift risk. Add-ons to substantive PRs are a compromise designed precisely for the "a human formulates the rule → the agent spreads it across packages" pairing.

**Forbidding the agent to lower thresholds.** A human can be allowed to lower `minMsi` with an explanation — they know the explanation will be read. An agent will *generate* an explanation — a nice, convincing one, whatever you like. So the rule for the agent is categorical: never. Lowering is the owner's act, full stop.

### Where it breaks

I won't pretend the system is a silver bullet.

**Rules don't cover what you don't know.** ER-049 (`DEFAULT` on `TEXT`) appeared only after the packages were deliberately checked against a real MySQL — before that, no rule knew about it. No amount of internal rules replaces contact with reality: rules are conservative, all they can do is not repeat the past.

**Context is a finite resource.** The more rule files, the more of the session budget the rulebook eats instead of code. I have to *compress* regularly: move polished rules from evolved rules back into the constitution (once they have become principles), merge duplicates, send outdated ones to `obsolete`. That is work, and it doesn't do itself.

**Trust goes one way.** The system assumes the agent follows the rules rather than rewriting them to suit itself. In my setup the agent edits `AGENTS.md` and evolved rules only when explicitly asked — but that is a property of the environment, not a law of nature. In another setup the first clever agent will "optimise" its own constraints.

---

## Instead of a conclusion

Back to the first line: 90 packages, mostly written by an AI agent. After all of the above, I can say in one line why it works:

**I stopped trying to teach the agent to program — and started building a system in which programming badly is very hard.**

The agent doesn't remember ER-001? Fine: it will read it. The agent tends to say "done" without a run? Rule number one of the constitution demands fresh output. The agent didn't see the metric was lying? I did, and now the denominator is honest and the threshold is untouchable — for the agent. The agent would have tagged before the merge? The process won't let it.

Every layer of the system — from the constitution down to a line of YAML — is an answer to a specific mistake made at some point. Fifty answers so far. In a year there will be sixty. That is not a sign of being unfinished, it is a sign of life: the system breathes because every incident leaves a trace in it.

People on a team do the same. Just slower — and forgetting.

---

## Links

- All packages: [catalogue on this site](/packages) · [Packagist](https://packagist.org/packages/rasuvaeff/)
- Snapshot of the rules and tools: [php-package-toolkit](https://github.com/rasuvaeff/php-package-toolkit)
- The AGENTS.md format: [agents.md](https://agents.md/)
- [Testo](https://php-testo.github.io/) · [Infection](https://infection.github.io/)
- [Roave BC Check](https://github.com/Roave/BackwardCompatibilityCheck) · [zizmor](https://docs.zizmor.sh/)
