---
title: property-testing-core
package: property-testing-core
section: 3
dev: true
layout: man
description: "Framework-agnostic property-based testing engine with integrated shrinking."
---

## NAME

property-testing-core — framework-agnostic property-based testing engine with integrated shrinking

## SYNOPSIS

<ManInstall />

```php
$definition = new PropertyDefinition(
    id: 'demo::everyIntStaysBelowHundred',
    name: 'everyIntStaysBelowHundred',
    generators: ['value' => Gen::intBetween(0, 10_000)],
    parameterNames: ['value'],
    config: new PropertyConfig(runs: 200, seed: 42),
);

$result = (new PropertyRunner())->run($definition, new CallableTrialExecutor(
    static function (int $value): void {
        if ($value >= 100) {
            throw new RuntimeException(sprintf('%d is not below 100', $value));
        }
    },
));
```

## DESCRIPTION

A property-based testing engine with integrated shrinking, no test-framework dependency.

Hand-picked example inputs miss edge cases. The engine generates hundreds of random inputs, finds a failing one and shrinks it to a minimal, readable counterexample.

- `Gen` facade: ints, floats, strings, bytes, `naughtyString`, `mixed`, arrays, records.
- Integrated shrinking through transformed generators.
- `PropertyRunner` returns structured results. It never prints, exits or throws to report an outcome.
- `FilesystemCorpus` replays recorded failures before the random phase.
- Flaky detection re-executes the minimised input `flakyReplays` times.
- Stateful and model-based testing, plus rule-based machines (`Gen::rules`).
- `Assume`, `Classify` distribution gates, targeted search, derandomized runs.
- Every counterexample carries a replayable seed and shrink path.

## OUTPUT

<pre class="tape">Property falsified after 0 successful run(s); seed=42
  Original: value=3989
  Shrunk:   value=100 (9 shrink step(s), 39 trial(s))
  <b>Changed:  value=3989 -&gt; 100</b>
  Failure:  100 is not below 100</pre>

## EXAMPLES

Targeted search climbs a reported score to reach a corner that uniform sampling rarely hits.

```php
static function (int $a, int $b, int $c): void {
    Target::maximize('sum', $a + $b + $c);

    Assert::true($a + $b + $c <= 2_900);   // 0.17% of the space
}
```

A rule-based state machine: rules are steps, a precondition guards one, an invariant holds after each.

```php
final class QueueMachine
{
    private array $model = [];

    public function __construct(private readonly Queue $sut) {}

    #[Rule]
    public function enqueue(int $value): void
    {
        $this->sut->push($value);
        $this->model[] = $value;
    }

    #[Rule]
    #[Precondition('notEmpty')]
    public function dequeue(): void
    {
        Assert::same($this->sut->pop(), array_shift($this->model));
    }

    public function notEmpty(): bool { return $this->model !== []; }

    #[Invariant]
    public function sizeMatches(): void
    {
        Assert::same($this->sut->size(), count($this->model));
    }
}
```

Gen::forClass builds a generator from the constructor's psalm annotations, with per-parameter overrides.

```php
final readonly class Money
{
    /**
     * @param int<0, 1000> $amount
     * @param non-empty-string $label
     * @param list<int> $tags
     */
    public function __construct(
        public int $amount,
        public string $label,
        public array $tags,
        public Currency $currency,
    ) {}
}

foreach (Gen::sample(Gen::forClass(Money::class), 3, 7) as $money) {
    printf("  amount=%d currency=%s\n", $money->amount, $money->currency->name);
}
$fixed = Gen::forClass(Money::class, ['amount' => Gen::intBetween(500, 510)]);
```

## RUNNABLE EXAMPLES

<RunExamples pkg="property-testing-core" />

## SEE ALSO

| Package | Role |
|---|---|
| [property-testing-testo](https://github.com/rasuvaeff/property-testing-testo)(3) | `#[Property]` for Testo |
| [property-testing-phpunit](https://github.com/rasuvaeff/property-testing-phpunit)(3) | Fluent `forAll()->check()` for PHPUnit |
| [property-testing-openapi](https://github.com/rasuvaeff/property-testing-openapi)(3) | Requests generated from an OpenAPI document |
| [property-testing-names](https://github.com/rasuvaeff/property-testing-names)(3) | Human-name generators |

## BUGS

Values come from MT19937 seeded by the reported seed: a PRNG, not a CSPRNG. Seeds are reproducibility handles, not secrets. The corpus persists failing inputs as plain JSON.

Requires PHP 8.3–8.5, `ext-mbstring`, `ext-random`, `ext-tokenizer`.
