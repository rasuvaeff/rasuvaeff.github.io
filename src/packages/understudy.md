---
title: understudy
package: understudy
section: 3
dev: true
layout: man
description: "Test doubles where the configured call is a real method call, not a method-name string."
---

## NAME

understudy — test doubles where the configured call is a real method call, not a method-name string

## SYNOPSIS

<ManInstall />

```php
use Rasuvaeff\Understudy\Understudy;
use function Rasuvaeff\Understudy\expect;
use function Rasuvaeff\Understudy\when;

$repository = Understudy::for(BookRepository::class);

when(fn () => $repository->find(123))->returns($book);

expect(fn () => $repository->save($book))->times(1);
```

Rename `find` and the IDE renames the call with it; a stale call is flagged by static analysis. `for()` returns the contract's own type.

## DESCRIPTION

Test doubles where the configured call is a real call, not a method-name string.

String-based mocks break on refactoring and typos, and they add service methods (`shouldReceive`, `expects`) to the double that the doubled contract can then never use.

- Specifies calls as real closures: `when(fn () => $repo->find(123))->returns($book)`.
- `expect()` with `times()`; after-the-fact `verify()` (including `never: true`) and `nothingElse()`.
- Argument matchers: `Arg::any`, `satisfies`, `rest`, and a captor with typed `last()` / `all()`.
- Doubles several interfaces at once; handles final classes and PHP 8.4 property hooks.
- `Understudy::delegate()` forwards unstubbed calls to a real object and records them.
- One context per fiber instead of shared static state.
- `#[\SensitiveParameter]` arguments are redacted in failure messages and `transcript()`.

## EXAMPLES

A typed argument captor reads what the code under test actually passed, with no instanceof checks.

```php
$options = Arg::captor(DeliveryOptions::class);      // Captor<DeliveryOptions>
when(fn () => $store->temporaryUrl(Arg::any(), Arg::any(), $options->capture()))
    ->returns('https://…');

$subject->run();

$options->last()->downloadName;   // typed: DeliveryOptions
$options->all();                  // list<DeliveryOptions>, in call order
```

A where() guard constrains several arguments together; calls it rejects fall back to the default answer.

```php
$ledger = Understudy::for(Ledger::class);
Understudy::label($ledger, 'ledger');

when(fn() => $ledger->transfer(Arg::any(), Arg::any()))
    ->where(fn(int $from, int $to) => $from <= $to, description: 'where(from <= to)')
    ->returns(true);

$ledger->transfer(3, 7);   // true: the where() guard accepts it
$ledger->transfer(9, 4);   // false: refused by the guard, falls to the default answer
```

Strict mode refuses any call nobody described, and the refusal names that call.

```php
$strict = Understudy::for(Clock::class);
Understudy::label($strict, 'clock');
Understudy::strict($strict);

when(fn() => $strict->now())->returns(7);

try {
    $strict->zone();
} catch (StrictModeViolation $violation) {
    $violation->getMessage(); // names the refused call: zone()
}
```

## RUNNABLE EXAMPLES

<RunExamples pkg="understudy" />

## SEE ALSO

| Package | Role |
|---|---|
| [understudy-testo](https://github.com/rasuvaeff/understudy-testo)(3) | Testo adapter |
| [understudy-phpunit](https://github.com/rasuvaeff/understudy-phpunit)(3) | PHPUnit and Pest adapter |
| [understudy-psalm](https://github.com/rasuvaeff/understudy-psalm)(3) | Psalm plugin |
| [understudy-phpstan](https://github.com/rasuvaeff/understudy-phpstan)(3) | PHPStan extension |

## BUGS

A `when()` is permission, not a claim. `expect()` counts only calls matching its own arguments, so add `Understudy::nothingElse()` to catch other calls. Dev dependency only, not for production.

Requires PHP 8.3–8.5 and `ext-tokenizer`.
