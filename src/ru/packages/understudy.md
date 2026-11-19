---
title: understudy
description: "Тестовые дублёры, где настраиваемый вызов — это настоящий вызов метода, а не строка с его именем."
outline: [2, 2]
---

# understudy

Тестовые дублёры, где настраиваемый вызов — это настоящий вызов, а не строка с именем метода.

<PackageMeta slug="understudy" docs="https://rasuvaeff.github.io/understudy/" :src="86" :tests="310" />

## Задача

Моки на строках ломаются при рефакторинге и опечатках, а ещё добавляют в дублёр служебные методы (`shouldReceive`, `expects`), которые дублируемый контракт потом никогда не сможет использовать.

## Что умеет

- Описывает вызовы настоящими замыканиями: `when(fn () => $repo->find(123))->returns($book)`.
- `expect()` с `times()`, `verify()`, `never: true` и `nothingElse()`.
- Матчеры аргументов: `Arg::any`, `satisfies`, `rest` и captor с типизированными `last()` / `all()`.
- Дублирует сразу несколько интерфейсов; работает с final-классами и property hooks из PHP 8.4.
- `Understudy::delegate()` передаёт незаглушённые вызовы настоящему объекту и записывает их.
- Один контекст на файбер вместо общего статического состояния.
- Аргументы с `#[\SensitiveParameter]` скрываются в сообщениях об ошибках и в `transcript()`.

## Пример

```php
use Rasuvaeff\Understudy\Understudy;
use function Rasuvaeff\Understudy\expect;
use function Rasuvaeff\Understudy\when;

$repository = Understudy::for(BookRepository::class);

when(fn () => $repository->find(123))->returns($book);

expect(fn () => $repository->save($book))->times(1);
```

Переименуете `find` — тест перестанет компилироваться. `for()` возвращает собственный тип контракта.

## Ещё примеры

Типизированный captor достаёт аргумент, реально переданный тестируемым кодом, без instanceof.

```php
$options = Arg::captor(DeliveryOptions::class);      // Captor<DeliveryOptions>
when(fn () => $store->temporaryUrl(Arg::any(), Arg::any(), $options->capture()))
    ->returns('https://…');

$subject->run();

$options->last()->downloadName;   // typed: DeliveryOptions
$options->all();                  // list<DeliveryOptions>, in call order
```

Условие where() проверяет несколько аргументов сразу; отклонённый вызов получает ответ по умолчанию.

```php
$ledger = Understudy::for(Ledger::class);
Understudy::label($ledger, 'ledger');

when(fn() => $ledger->transfer(Arg::any(), Arg::any()))
    ->where(fn(int $from, int $to) => $from <= $to, description: 'where(from <= to)')
    ->returns(true);

$ledger->transfer(3, 7);   // true: the where() guard accepts it
$ledger->transfer(9, 4);   // false: refused by the guard, falls to the default answer
```

Строгий режим отклоняет любой незаданный вызов, а сообщение называет этот вызов.

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

## Семейство

| Package | Role |
|---|---|
| understudy-testo | Адаптер для Testo |
| understudy-phpunit | Адаптер для PHPUnit и Pest |
| understudy-psalm | Плагин Psalm |
| understudy-phpstan | Расширение PHPStan |

## Ограничения

`when()` — это разрешение, а не утверждение. `expect()` считает только вызовы, подходящие под его собственные аргументы, поэтому для отлова прочих вызовов добавьте `Understudy::nothingElse()`. Только dev-зависимость, не для production.

Требует PHP 8.3–8.5 и `ext-tokenizer`.
