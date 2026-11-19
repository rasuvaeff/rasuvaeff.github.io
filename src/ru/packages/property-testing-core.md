---
title: property-testing-core
package: property-testing-core
section: 3
dev: true
layout: man
description: "Движок property-based тестирования без привязки к фреймворку, со встроенным shrinking."
---

## ИМЯ

property-testing-core — движок property-based тестирования без привязки к фреймворку, со встроенным shrinking

## ОБЗОР

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

## ОПИСАНИЕ

Движок property-based тестирования со встроенным shrinking, без зависимости от тестового фреймворка.

Вручную подобранные входные данные упускают граничные случаи. Движок генерирует сотни случайных входов, находит падающий и сжимает его (shrinking) до минимального читаемого контрпримера.

- Фасад `Gen`: int, float, строки, байты, `naughtyString`, `mixed`, массивы, записи.
- Встроенный shrinking через преобразованные генераторы.
- `PropertyRunner` возвращает структурированные результаты. Он ничего не печатает, не завершает процесс и не бросает исключений, чтобы сообщить об исходе.
- `FilesystemCorpus` воспроизводит записанные падения до случайной фазы.
- Детектор нестабильности повторно выполняет минимизированный вход `flakyReplays` раз.
- Stateful и model-based тестирование, а также rule-based машины (`Gen::rules`).
- `Assume`, гейты распределения `Classify`, целевой поиск, детерминированные прогоны.
- Каждый контрпример несёт seed и путь shrinking для воспроизведения.

## ВЫВОД

<pre class="tape">Property falsified after 0 successful run(s); seed=42
  Original: value=3989
  Shrunk:   value=100 (9 shrink step(s), 39 trial(s))
  <b>Changed:  value=3989 -&gt; 100</b>
  Failure:  100 is not below 100</pre>

## ПРИМЕРЫ

Целевой поиск поднимает заявленную метрику и доходит до угла, который случайная выборка почти не задевает.

```php
static function (int $a, int $b, int $c): void {
    Target::maximize('sum', $a + $b + $c);

    Assert::true($a + $b + $c <= 2_900);   // 0.17% of the space
}
```

Автомат на правилах: правила это шаги, precondition охраняет шаг, invariant проверяется после каждого.

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

Gen::forClass строит генератор по psalm-аннотациям конструктора, с переопределением отдельных параметров.

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

## ЗАПУСКАЕМЫЕ ПРИМЕРЫ

<RunExamples pkg="property-testing-core" />

## СМОТРИТЕ ТАКЖЕ

| Package | Role |
|---|---|
| [property-testing-testo](https://github.com/rasuvaeff/property-testing-testo)(3) | `#[Property]` для Testo |
| [property-testing-phpunit](https://github.com/rasuvaeff/property-testing-phpunit)(3) | Fluent `forAll()->check()` для PHPUnit |
| [property-testing-openapi](https://github.com/rasuvaeff/property-testing-openapi)(3) | Запросы, сгенерированные из документа OpenAPI |
| [property-testing-names](https://github.com/rasuvaeff/property-testing-names)(3) | Генераторы человеческих имён |

## ОШИБКИ

Значения берутся из MT19937 с seed из отчёта: это PRNG, а не CSPRNG. Seed — это способ воспроизвести прогон, а не секрет. Корпус хранит падающие входы как обычный JSON.

Требует PHP 8.3–8.5, `ext-mbstring`, `ext-random`, `ext-tokenizer`.
