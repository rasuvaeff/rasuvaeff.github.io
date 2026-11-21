---
title: "Two days, 100 issues, 37 releases: what's new in context, understudy and property-testing"
description: "A code-quality review of three package families on 20–21 November 2026: how the fixes shipped, what is new for the people using the packages, and what tripped us up."
date: 2026-11-21
outline: [2, 3]
figures:
  - ["15", "packages reviewed"]
  - ["100", "issues"]
  - ["37", "releases"]
  - ["2", "days"]
---

On 20 and 21 November I ran a code-quality review of three of my package families: [context](/packages/context) (deadlines and cancellation), [understudy](/packages/understudy) (test doubles) and [property-testing](/packages/property-testing-core) together with [property-testing-openapi](/packages/property-testing-openapi). Two days later every finding was either released or closed with a reason, and the [CSKA.IN](/blog/cska-in) site was updated to the new versions the same day.

As with everything in the monorepo, the work was done by Claude Code agents: they read the code, filed the issues, wrote the fixes and ran the mutation tests. I made the calls where the review came down to a choice, and I checked what went into each tag. This post is not about the agents, though. It is about what changed in the packages and why it matters to the people who use them.

## What was reviewed

| Family | Packages | Issues |
|---|---|---|
| [context](/packages/context) | [`context`](/packages/context), [`context-http`](/packages/context-http), [`context-cli`](/packages/context-cli), [`context-db`](/packages/context-db), [`context-process`](/packages/context-process) | 26 |
| [understudy](/packages/understudy) | core, Testo and PHPUnit bridges, Psalm and PHPStan plugins | 27 |
| [property-testing](/packages/property-testing-core) | [`-core`](/packages/property-testing-core), [`-testo`](/packages/property-testing-testo), [`-phpunit`](/packages/property-testing-phpunit), [`-names`](/packages/property-testing-names) | 26 |
| [property-testing-openapi](/packages/property-testing-openapi) | one package | 21 |

The review meant reading the code. For [property-testing](/packages/property-testing-core) and [property-testing-openapi](/packages/property-testing-openapi) it also meant short probe scripts that reproduced each defect before the fix. Every finding got a grade (A for a defect with visible harm, B for quality, C for a new capability), a file and line, a proposal, and a note on whether the fix breaks compatibility. All of it went into four review documents, and every finding became an issue in the package's repository: exactly 100 of them. I settled the disputed ones on the spot, and each decision went into the issue text.

Result: 96 issues closed by shipped work, 4 closed as not planned with a reason (more on those at the end).

## How it shipped

The order was strict:

1. **Wave 1: bugs and docs.** Anything that does not behave as promised.
2. **Wave 2: new features.**
3. **One PR per package per wave.** A mutation run on a big package takes minutes; on [`property-testing-core`](/packages/property-testing-core) it is about eight. A PR per finding would have meant dozens of runs. Mutation runs go one at a time: once, parallel runs on one machine ate all the memory and took the desktop down with them.
4. **Merge only on green CI.** The PHP 8.3–8.5 matrix, the mutation gate, the backward-compatibility check.
5. **Tag only a verified merge commit.** Before tagging, check that the PR really is MERGED and that HEAD is its merge commit. A tag can never be moved: Packagist permanently blocks a version whose tag was re-pointed, and the only way out is the next patch.

I aimed for one or two tags per package: a bug wave and a feature wave. Five packages got three:

| Package | Third tag | Why |
|---|---|---|
| [`context-db`](/packages/context-db) | 0.3.0 | after the decision that 0.x may break (see below), the [PostgreSQL transaction issue](https://github.com/rasuvaeff/context-db/issues/6) was closed |
| [`property-testing-openapi`](/packages/property-testing-openapi) | 0.22.0 | the same decision: the refactoring that shifted generation was finished |
| [`understudy`](/packages/understudy) | 1.2.1 | [splitting three large classes](https://github.com/rasuvaeff/understudy/pull/187) went out separately so its performance could be measured |
| [`understudy-psalm`](/packages/understudy-psalm) | 1.3.0 | [the `Arg::rest()` suggestion](https://github.com/rasuvaeff/understudy-psalm/issues/72) and a check for the new `whichProperty()` matcher |
| [`understudy-phpstan`](/packages/understudy-phpstan) | 1.2.0 | [the same](https://github.com/rasuvaeff/understudy-phpstan/issues/56) |

I also held the [`property-testing-core`](/packages/property-testing-core) 1.4.0 tag until the PR with the re-recorded corpus was merged into [`openapi-contract`](/packages/openapi-contract).

### All releases

| Family | Releases |
|---|---|
| [context](/packages/context) | [`context`](/packages/context) 0.4.0, 0.5.0 · [`context-http`](/packages/context-http) 0.3.1, 0.4.0 · [`context-cli`](/packages/context-cli) 0.1.1, 0.1.2 · [`context-db`](/packages/context-db) 0.1.1, 0.2.0, 0.3.0 · [`context-process`](/packages/context-process) 0.1.1 |
| [understudy](/packages/understudy) | [`understudy`](/packages/understudy) 1.1.2, 1.2.0, 1.2.1 · [`understudy-testo`](/packages/understudy-testo) 1.1.0, 1.2.0 · [`understudy-phpunit`](/packages/understudy-phpunit) 1.1.0 · [`understudy-psalm`](/packages/understudy-psalm) 1.1.1, 1.2.0, 1.3.0 · [`understudy-phpstan`](/packages/understudy-phpstan) 1.0.2, 1.1.0, 1.2.0 |
| [property-testing](/packages/property-testing-core) | [`-core`](/packages/property-testing-core) 1.4.0, 1.5.0 · [`-testo`](/packages/property-testing-testo) 1.2.1, 1.3.0 · [`-phpunit`](/packages/property-testing-phpunit) 1.2.0 · [`-names`](/packages/property-testing-names) 1.0.1 |
| OpenAPI | [`property-testing-openapi`](/packages/property-testing-openapi) 0.20.0, 0.21.0, 0.22.0 · [`openapi-contract`](/packages/openapi-contract) 0.18.0 |
| follow-ups | [`retry`](/packages/retry) 1.7.1 · [`bulkhead`](/packages/bulkhead) 1.4.1 · [`resilience`](/packages/resilience) 0.3.1 · [`clickhouse-toolkit`](/packages/clickhouse-toolkit) 1.12.1 · [`yii3-clickhouse-toolkit`](/packages/yii3-clickhouse-toolkit) 1.4.3 |

32 releases across 16 packages in the families, plus 5 follow-ups: 37 releases in 21 packages.

## What's new: context

### context-db: `transaction()`, and a refusal on an open transaction

[context-db](/packages/context-db) turns the request's remaining budget into a database timeout. On MySQL and MariaDB that is a per-statement hint or variable; on PostgreSQL it is a `SET statement_timeout` for the [duration](/packages/duration) of a `within()` callback, restored afterwards.

The review found a hole. If the callback opens a transaction and leaves it open, the restore runs inside that transaction. When the transaction is later rolled back, the restore goes with it, and the session keeps the budget timeout. The next query on that connection runs under someone else's limit.

The fix the review proposed, checking `inTransaction()` on the way out, would not have helped: on a live PostgreSQL 17, `ROLLBACK` undoes the restore whichever way you arrange it. PostgreSQL simply has no `SET` that survives a rollback. So 0.1.1 documented the limitation, and 0.3.0 added a new API:

```php fragment
$id = $timeout->transaction($context, static function () use ($pdo): int {
    $pdo->exec("INSERT INTO report (day) VALUES (CURRENT_DATE)");

    return (int) $pdo->lastInsertId();
});
```

`transaction()` opens the transaction itself. On PostgreSQL it uses `SET LOCAL`, which ends with the transaction on commit and on rollback alike, even after a timeout aborted it. Meanwhile `within()` and `run()` on PostgreSQL now throw `LogicException` when the callback returns with a transaction still open. That is a behaviour break, but a silent timeout leak is worse. MySQL and MariaDB are unaffected: their session variables are not transactional.

Also new: `run()` picks between the per-statement hint and `within()` on its own, so dialect-independent code no longer branches. `translate()` accepts any exception and finds the `PDOException` in its chain, so a yiisoft/db exception can be passed as is. And `within()` makes one round trip instead of three when the session already has a stricter limit.

### context: the budget and the termination cause without exceptions

In [context](/packages/context) 0.5.0, the rule "read the remainder before the active check and get at least 1 ms", repeated in six places across the core and the adapters, became a core method:

```php fragment
$ms = $context->budgetMs();   // int|null, at least 1; throws on a terminated context
$cause = $context->cause();   // ?TerminationCause, no exception to catch
```

Also: generics on `withValue()`/`value()` (`class-string<T>` → `T|null`, no hand-written `instanceof`), `ListenerFailuresException::errors()` that shows every listener that failed rather than only the last one, and a fixed `TypeError` on a numeric alias in `WireCodec`.

### context-http, context-cli, context-process

- [context-http](/packages/context-http) 0.4.0: `ContextMiddleware(parent:)` derives request contexts from a long-running server's shutdown [context](/packages/context). `correlationIdResolver:` and `correlationResponseHeader:` take the correlation id from the application, without the wrapper around the middleware that both of my apps had already written by hand. `ContextClient(maxTimeout:)` means a stricter client timeout is no longer widened to the budget.
- [context-cli](/packages/context-cli) 0.1.1: the second signal no longer runs application code inside the signal handler. Before, a listener that threw could prevent the forced exit.
- [context-process](/packages/context-process) 0.1.1: the wait between polls starts at 1 ms and doubles up to `pollInterval`, so a short command no longer costs a full interval (50 ms by default).

## What's new: understudy

### `#[StrictStubs]` on a class or a method

Strict stubs make a stub that was configured but never called fail the test. In Testo they could only be set for the whole suite, in PHPUnit per class. Now the core attribute works in both bridges ([understudy-testo](/packages/understudy-testo) 1.2.0, [understudy-phpunit](/packages/understudy-phpunit) 1.1.0):

```php
use Rasuvaeff\Understudy\StrictStubs;

#[StrictStubs]
final class CheckoutTest
{
    #[StrictStubs(false)]
    public function legacyPath(): void {}
}
```

The method wins over its class, the class over its parent, and the attribute over the bridge setting. Without the attribute nothing changes.

### Value-object matchers and types without a plugin

[understudy](/packages/understudy) 1.2.0 adds matchers for the most common pattern in my tests. 15 of the 24 `Arg::satisfies()` calls in the monorepo looked like `fn (mixed $x) => $x instanceof Foo && …`:

- `Arg::instanceOf(Foo::class, fn (Foo $f): bool => …)` takes a typed predicate; an object of another class is a mismatch, not a `TypeError` inside the code under test;
- `Arg::equalTo($vo)` compares by structure, private properties included;
- `Arg::whichProperty('email', $value)` is `which()` for a public property.

`when()`/`expect()` now carry generics in the core itself, so Psalm and PHPStan catch a `returns()` value the method cannot return, with no plugin installed. Calling a stub got cheaper: 16.3 → 11.4 µs in an A/B run against 1.1.2.

One more thing: [understudy-testo](/packages/understudy-testo) 1.1.0 fails before the test body runs if the [context](/packages/context) already holds doubles created outside any test (in a data provider or `#[BeforeClass]`). Before, the first test silently verified them. The CHANGELOG says it plainly: a suite that passed by accident turns red.

### The `Arg::rest()` suggestion in Psalm and PHPStan

`Arg::rest()` covers all unspelled parameters with one matcher. Nobody in the monorepo used it, yet there were 109 lines with three or more `Arg::any()` in a row. Documentation did not help, so now the plugins suggest it:

```php fragment
when(fn () => $storage->recordOutcome('svc', Arg::any(), Arg::any(), Arg::any()));
// suggested:
when(fn () => $storage->recordOutcome('svc', Arg::rest()));
```

The suggestion appears only where both spellings accept exactly the same calls: no variadics, named arguments or unpacking. How you turn it on is covered in the compatibility section.

Also in the plugins: `wire()` no longer promises a key in `doubles` for a parameter passed through overrides (analysis used to pass while the code failed on the missing key). `Understudy::for(A::class, B::class)` is typed as `A&B`. The plugins understand more matcher kinds. Psalm sees a double held in a field (`$this->repo`), not only one in a local variable.

## What's new: property-testing

Five [core](/packages/property-testing-core) defects reproduced under a probe before the fix and are fixed in 1.4.0. The most visible ones for users:

- `Gen::regex('[[:alpha:]]')` silently generated strings that did not match. All 14 PCRE POSIX classes and `[:^name:]` are now supported.
- A docblock `int|string[]` was read as an array of the union, so a scalar `int` was never generated. This changes what a given seed generates for such signatures, so `SEQUENCE_EPOCH` went from 3 to 4: corpus entries recorded by seed are dropped on recall, and entries recorded by value keep replaying.
- An exception inside `Gen::map()`/`flatMap()` escaped without a seed. It is now a `GenerationErrorException` carrying the seed and the attempt number, and Testo reports it as a test error instead of aborting the pipeline.

1.5.0 covers what people write by hand most often:

```php fragment
Gen::anyOf(Gen::int(), Gen::string());   // equal weights, no frequency([[1, $a], [1, $b]])
Gen::pair(Gen::int(), Gen::string());    // typed array{int, string}
```

Also: `nullable()` with an honest `T|null` type. Size bounds of `0`, so a dependent `flatMap(intBetween(0, 3), fn ($n) => arrayOf($g, 0, $n))` no longer fails at zero. A warning for an example from `<method>Examples()` that `Assume::that()` discarded and that therefore checked nothing. Generator error messages that name the factory and the values.

The reporting code and the `PROPERTY_*` parsing used to live in the Testo and PHPUnit bridges as two copies kept in sync by hand. Both moved into the core. The PHPUnit bridge gained `PropertyCheck::failOn()`, which only Testo had before.

## What's new: property-testing-openapi

[property-testing-openapi](/packages/property-testing-openapi) generates requests and responses from an OpenAPI document. The review ran it on shapes taken from real documents, and many of them produced either a refusal for the whole operation or a "valid" case that [openapi-contract](/packages/openapi-contract) rejects. What works now:

- `allOf` over components with different `description`s, and an OAS 3.0 `nullable` beside `allOf`;
- an empty object under `anyOf`/`oneOf` encodes as `{}`, not `[]`;
- a one-sided bound outside the ±1000 window (`minimum: 1900`);
- numeric OAS 3.1 `exclusiveMinimum`/`exclusiveMaximum`;
- `oneOf` over objects told apart by the `const`/`enum` of a required property;
- the `hostname`, `ipv6`, `time` and [`duration`](/packages/duration) formats. Formats the contract reads as annotations (`phone`, `byte`, your own) are generated as plain strings. The answer comes from `SchemaCheck::assertsFormat()` in [`openapi-contract`](/packages/openapi-contract) 0.18.0, not from a copy of its list;
- `text/plain` and `application/octet-stream` bodies;
- a `minLength`/`minItems` above the generation budget raises the budget instead of refusing.

A refusal now always comes from `forOperation()` and names the operation, never from a random draw. You can also get it up front, without generating anything:

```php fragment
$suite->generationCoverage();
// ['pets.list' => ['supported' => true, 'reason' => null], ...]
```

The package is on 0.x, and both 0.21.0 and 0.22.0 change the draws for some operations. The CHANGELOG says so.

## 0.x and 1.x: where breaking is allowed

The rule I put into words during this work: **a package without a 1.0 may break in a minor release, recorded in the CHANGELOG; a 1.x package may not.** Until then the agents had been deferring anything that changed behaviour on 0.x out of habit. That is how the generator refactoring in [`property-testing-openapi`](/packages/property-testing-openapi) and the transaction issue in [`context-db`](/packages/context-db) got stuck. Once the rule was set, both shipped as third tags.

On 1.x the API stays compatible. Behaviour fixes that expose a false green, such as [`understudy-testo`](/packages/understudy-testo) 1.1.0 or the new epoch in [`property-testing-core`](/packages/property-testing-core) 1.4.0, ship with an explicit warning in the CHANGELOG. New *errors* about definite misuse also arrive in a minor with a warning: after [`understudy`](/packages/understudy) 1.2.0, Psalm and PHPStan catch an impossible `returns()` value on their own, and the plugins know more matcher kinds. A new *suggestion*, on the other hand, is not an error, and it has no business turning someone else's CI red.

The `Arg::rest()` suggestion shows where the line is. Psalm reports it at `info`: visible, never failing the build, and adjustable in `psalm.xml`. PHPStan has no level below an error, so a rule that was on by default would have turned CI red for everyone who updated [`understudy-phpstan`](/packages/understudy-phpstan) by a minor. That is why it is opt-in there:

```yaml
parameters:
    understudy:
        suggestRest: true
```

It is one rule, with one wording and identical code in both plugins (a test checks the copies match), delivered two different ways because the two analysers offer different tools.

## What tripped us up

**understudy's CI had the core version hard-coded.** The adapter compatibility job loads the core as a path repository, and the version it gave it was the string `"1.0.0"`. That held while the adapters required `^1.0`. When the adapters raised their requirement to `^1.2` (they need the `#[StrictStubs]` attribute), the job broke ([PR #187](https://github.com/rasuvaeff/understudy/pull/187)). The version now comes from the top heading of `CHANGELOG.md`, because a fixed number goes stale the moment an adapter raises its constraint.

**The [`openapi-contract`](/packages/openapi-contract) corpus was stale before the wave started.** [`openapi-contract`](/packages/openapi-contract) keeps recorded requests generated by [`property-testing-openapi`](/packages/property-testing-openapi). Before the first re-record, it turned out that on a clean master 321 of 590 cases already differed in bytes. The verdicts held: 11 cases changed their target member, but `valid: false` and the error kind stayed the same. The likely cause is [`property-testing-core`](/packages/property-testing-core) 1.3.0; that is an inference, not bisected. The corpus was re-recorded in a separate commit ([PR #192](https://github.com/rasuvaeff/openapi-contract/pull/192)), and after that each wave only added cases and changed none: 590 → 717 → 840 → 899 ([#193](https://github.com/rasuvaeff/openapi-contract/pull/193), [#196](https://github.com/rasuvaeff/openapi-contract/pull/196)).

**Psalm 7.0.0 against 7.1 on prefer-lowest.** In [`property-testing-openapi`](/packages/property-testing-openapi), the job with the oldest dependencies failed because Psalm 7.0.0 did not narrow the [schema](/packages/schema) type after `array_is_list()`. The floor went up to `^7.1`. You will not see this locally on a fresh Psalm.

**Mockery as the noise floor.** Splitting `Runtime` (about 1,600 lines), the facade and `TargetUnifier` into internal classes touches the hot path, and earlier refactorings there had cost 10–23%. So the measurement ran in pairs, master against the branch on the same machine, and the yardstick was [understudy](/packages/understudy)'s lead over Mockery within the same run, with Mockery serving as the noise floor. The first cut came out 1–4% slower because of extra static hops. Those were removed, and the next measurement showed parity ([PR #187](https://github.com/rasuvaeff/understudy/pull/187)).

**context 0.5 would not install next to retry and bulkhead.** This surfaced while updating CSKA.IN. [`retry`](/packages/retry) 1.7.0 and [`bulkhead`](/packages/bulkhead) 1.4.0 accepted `rasuvaeff/context` only up to `^0.3`. Asked for `^0.5`, Composer did not fail; it quietly picked older releases of those packages. That took five follow-up patches ([`retry`](/packages/retry), [`bulkhead`](/packages/bulkhead), [`resilience`](/packages/resilience), [`clickhouse-toolkit`](/packages/clickhouse-toolkit), [`yii3-clickhouse-toolkit`](/packages/yii3-clickhouse-toolkit)) allowing `^0.4 || ^0.5`. The lesson: on 0.x a caret pins the minor (`^0.3` excludes 0.4), so a minor release of a base package like [`context`](/packages/context) means patch releases for every package that depends on it.

**Testo's error-handler plugin.** The new `testo/error-handler` installs its own handler around every test. In the [`property-testing-testo`](/packages/property-testing-testo) adapter, that made the "no previous handler" branch unreachable and its mutant unkillable. I filed [php-testo/testo#429](https://github.com/php-testo/testo/issues/429), and the Testo maintainer explained both ways to opt out: a `#[WithoutErrorHandler]` attribute on a test, or removing the plugin from a suite. In the adapter, the attribute on one test was enough. In CSKA.IN, 851 integration tests went Risky after the update: the Rapira runner registers Yii's handlers on every in-process request, and they were left in place. I did not disable the plugin. I fixed the cause instead: the test helper now restores the handler stack after each request.

**The app's smokes had rotted.** Seven CSKA.IN smokes were red without a single bug in the code. Most of them checked behaviour the site had changed on purpose: the stand is closed to indexing, the guestbook left the sitemap, `/day` became a calendar. The rest grabbed whatever data came first in the database: a real match, the latest guestbook message. The smokes were rewritten to follow the new behaviour and to create their own data.

## How it reached CSKA.IN

[CSKA.IN](/blog/cska-in) uses some of these packages: [`context`](/packages/context), [`context-http`](/packages/context-http), [`understudy`](/packages/understudy) with its Testo bridge, [`property-testing-testo`](/packages/property-testing-testo), [`bulkhead`](/packages/bulkhead), and [`retry`](/packages/retry) through [`media-converter`](/packages/media-converter). The same day it was updated to the new versions: [`understudy`](/packages/understudy) 1.2.1, [`understudy-testo`](/packages/understudy-testo) 1.2.0, [`property-testing-testo`](/packages/property-testing-testo) 1.3.0 (core 1.5.0), [`context`](/packages/context) 0.5.0, [`context-http`](/packages/context-http) 0.4.0, and the follow-up patches of [`retry`](/packages/retry) and [`bulkhead`](/packages/bulkhead). It needed almost no application code. A new test pins the request budget on all three entry points: 504 on expiry, a client header can only shorten the budget, and a correlation id already on the request is reused. The app's mutation gate passes after the update.

## What is left

No review issues are open. Left undone on purpose:

- 4 issues closed as not planned. Size growth in generators ([property-testing-core#196](https://github.com/rasuvaeff/property-testing-core/issues/196)): on by default it would shift seed→values for everyone, and opt-in needs a change to the `generate()` signature. Issue subclasses in the Psalm plugin ([understudy-psalm#66](https://github.com/rasuvaeff/understudy-psalm/issues/66)) would stop existing `@psalm-suppress` from silencing them. `--with-uncovered` for the plugins' mutation runs ([understudy-psalm#67](https://github.com/rasuvaeff/understudy-psalm/issues/67), [understudy-phpstan#53](https://github.com/rasuvaeff/understudy-phpstan/issues/53)): the decision of 3 November keeps the plugins on the old command;
- three review wishes were not filed because they are already in the [context](/packages/context) 1.0 plan: a ready-made queue loop in [`context-cli`](/packages/context-cli), a yiisoft/db connection decorator, and bounding `gracePeriod` by the budget in [`context-process`](/packages/context-process);
- a side finding from the external review bot: overlapping `within()` calls on one PDO from different Fibers restore the timeout in the wrong order. issue: [context-db#11](https://github.com/rasuvaeff/context-db/issues/11);
- a few documentation changes are merged without a tag and will go out with the next release.
