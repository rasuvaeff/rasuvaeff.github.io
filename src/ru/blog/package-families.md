---
title: "Два дня, 100 issue, 37 релизов: что нового в context, understudy и property-testing"
description: "Ревью качества кода трёх семейств пакетов 20–21 ноября 2026: как выпускали, что появилось для пользователей пакетов и на чём споткнулись."
date: 2026-11-21
outline: [2, 3]
figures:
  - ["15", "пакетов в ревью"]
  - ["100", "issue"]
  - ["37", "релизов"]
  - ["2", "дня"]
---

20 и 21 ноября я провёл ревью качества кода трёх семейств своих пакетов: [context](/ru/packages/context) (дедлайны и отмена), [understudy](/ru/packages/understudy) (тестовые дублёры) и [property-testing](/ru/packages/property-testing-core) вместе с [property-testing-openapi](/ru/packages/property-testing-openapi). Через два дня все находки были либо выпущены, либо закрыты с объяснением, а сайт [ЦСКА.IN](/ru/blog/cska-in) в тот же день обновили до новых версий.

Работу, как и всё в монорепозитории, делали агенты Claude Code: читали код, заводили issue, писали правки, гоняли мутации. Я принимал решения там, где ревью упиралось в выбор, и смотрел, что уходит в тег. Этот пост не про агентов, а про то, что изменилось в пакетах и зачем это тем, кто их использует.

## Что смотрели

| Семейство | Пакеты | Issue |
|---|---|---|
| [context](/ru/packages/context) | [`context`](/ru/packages/context), [`context-http`](/ru/packages/context-http), [`context-cli`](/ru/packages/context-cli), [`context-db`](/ru/packages/context-db), [`context-process`](/ru/packages/context-process) | 26 |
| [understudy](/ru/packages/understudy) | ядро, мосты для Testo и PHPUnit, плагины Psalm и PHPStan | 27 |
| [property-testing](/ru/packages/property-testing-core) | [`-core`](/ru/packages/property-testing-core), [`-testo`](/ru/packages/property-testing-testo), [`-phpunit`](/ru/packages/property-testing-phpunit), [`-names`](/ru/packages/property-testing-names) | 26 |
| [property-testing-openapi](/ru/packages/property-testing-openapi) | один пакет | 21 |

Ревью — это чтение кода, а в [property-testing](/ru/packages/property-testing-core) и [property-testing-openapi](/ru/packages/property-testing-openapi) ещё и короткие скрипты-пробы, которые воспроизводили дефект до правки. Каждая находка получила градацию (A — дефект с видимым вредом, B — качество, C — новая возможность), файл и строку, предложение и оценку того, ломает ли правка совместимость. Всё это лежит в четырёх ревью-документах, а по каждой находке заведён issue в репозитории пакета: ровно 100 штук. Спорные места я решал сразу, решение записывалось в текст issue.

Итог по issue: 96 закрыты сделанной работой, 4 закрыты как not planned с объяснением (почему — ниже).

## Как выпускали

Порядок был жёсткий:

1. **Волна 1 — баги и документация.** Всё, что ведёт себя не так, как обещано.
2. **Волна 2 — новые возможности.**
3. **Один PR на пакет на волну.** Мутационный прогон на крупном пакете идёт минуты, на [`property-testing-core`](/ru/packages/property-testing-core) — около восьми. PR на каждую находку означал бы десятки прогонов. Мутации гоняются по одной: однажды параллельные прогоны на одной машине съели всю память и уронили рабочий стол.
4. **Merge только на зелёном CI.** Матрица PHP 8.3–8.5, мутационный порог, проверка обратной совместимости.
5. **Тег только на проверенном merge-коммите.** Перед тегом — что PR действительно в состоянии MERGED и что HEAD совпадает с его merge-коммитом. Перетегировать нельзя: Packagist навсегда блокирует версию, у которой тег передвинули, и выход только один — следующий патч.

Целился я в один-два тега на пакет: волна багов и волна фич. У пяти пакетов вышло три:

| Пакет | Третий тег | Почему |
|---|---|---|
| [`context-db`](/ru/packages/context-db) | 0.3.0 | после решения, что 0.x можно ломать (см. ниже), закрыт [issue про PostgreSQL-транзакции](https://github.com/rasuvaeff/context-db/issues/6) |
| [`property-testing-openapi`](/ru/packages/property-testing-openapi) | 0.22.0 | то же решение: доделан рефакторинг, который сдвигал генерацию |
| [`understudy`](/ru/packages/understudy) | 1.2.1 | [разбиение трёх больших классов](https://github.com/rasuvaeff/understudy/pull/187) вынесено отдельно, чтобы замерить производительность |
| [`understudy-psalm`](/ru/packages/understudy-psalm) | 1.3.0 | [подсказка `Arg::rest()`](https://github.com/rasuvaeff/understudy-psalm/issues/72) и проверка нового матчера `whichProperty()` |
| [`understudy-phpstan`](/ru/packages/understudy-phpstan) | 1.2.0 | [то же](https://github.com/rasuvaeff/understudy-phpstan/issues/56) |

Тег [`property-testing-core`](/ru/packages/property-testing-core) 1.4.0 я ещё и придержал, пока в [`openapi-contract`](/ru/packages/openapi-contract) не влился PR с перезаписанным корпусом.

### Все релизы

| Семейство | Релизы |
|---|---|
| [context](/ru/packages/context) | [`context`](/ru/packages/context) 0.4.0, 0.5.0 · [`context-http`](/ru/packages/context-http) 0.3.1, 0.4.0 · [`context-cli`](/ru/packages/context-cli) 0.1.1, 0.1.2 · [`context-db`](/ru/packages/context-db) 0.1.1, 0.2.0, 0.3.0 · [`context-process`](/ru/packages/context-process) 0.1.1 |
| [understudy](/ru/packages/understudy) | [`understudy`](/ru/packages/understudy) 1.1.2, 1.2.0, 1.2.1 · [`understudy-testo`](/ru/packages/understudy-testo) 1.1.0, 1.2.0 · [`understudy-phpunit`](/ru/packages/understudy-phpunit) 1.1.0 · [`understudy-psalm`](/ru/packages/understudy-psalm) 1.1.1, 1.2.0, 1.3.0 · [`understudy-phpstan`](/ru/packages/understudy-phpstan) 1.0.2, 1.1.0, 1.2.0 |
| [property-testing](/ru/packages/property-testing-core) | [`-core`](/ru/packages/property-testing-core) 1.4.0, 1.5.0 · [`-testo`](/ru/packages/property-testing-testo) 1.2.1, 1.3.0 · [`-phpunit`](/ru/packages/property-testing-phpunit) 1.2.0 · [`-names`](/ru/packages/property-testing-names) 1.0.1 |
| OpenAPI | [`property-testing-openapi`](/ru/packages/property-testing-openapi) 0.20.0, 0.21.0, 0.22.0 · [`openapi-contract`](/ru/packages/openapi-contract) 0.18.0 |
| попутные | [`retry`](/ru/packages/retry) 1.7.1 · [`bulkhead`](/ru/packages/bulkhead) 1.4.1 · [`resilience`](/ru/packages/resilience) 0.3.1 · [`clickhouse-toolkit`](/ru/packages/clickhouse-toolkit) 1.12.1 · [`yii3-clickhouse-toolkit`](/ru/packages/yii3-clickhouse-toolkit) 1.4.3 |

32 релиза в 16 пакетах семейств и ещё 5 попутных: всего 37 в 21 пакете.

## Что нового: context

### context-db: `transaction()` и отказ на открытой транзакции

[context-db](/ru/packages/context-db) переводит оставшийся бюджет запроса в таймаут базы. На MySQL и MariaDB это хинт или переменная на один запрос, на PostgreSQL — `SET statement_timeout` на время колбэка `within()` с восстановлением после.

Ревью нашло дыру: если колбэк открыл транзакцию и оставил её открытой, восстановление выполняется внутри неё. Транзакцию потом откатывают, откат забирает с собой и восстановление, и в сессии остаётся бюджетный таймаут. Следующий запрос на этом соединении живёт под чужим лимитом.

Предложенная в ревью проверка `inTransaction()` на выходе ничего бы не дала: на живом PostgreSQL 17 `ROLLBACK` откатывает восстановление при любом раскладе. У PostgreSQL просто нет `SET`, который переживёт откат. Поэтому в 0.1.1 ограничение было описано в документации, а в 0.3.0 появился новый API:

```php fragment
$id = $timeout->transaction($context, static function () use ($pdo): int {
    $pdo->exec("INSERT INTO report (day) VALUES (CURRENT_DATE)");

    return (int) $pdo->lastInsertId();
});
```

`transaction()` сам открывает транзакцию и на PostgreSQL ставит `SET LOCAL`, который заканчивается вместе с ней: и на commit, и на rollback, даже после того, как таймаут транзакцию прервал. А `within()` и `run()` на PostgreSQL теперь бросают `LogicException`, если колбэк вернулся с открытой транзакцией. Это слом поведения, но тихая утечка таймаута хуже. MySQL и MariaDB не затронуты: их переменные сессии не транзакционные.

Там же: `run()` сам выбирает между хинтом на запрос и `within()`, так что код, не зависящий от диалекта, больше не ветвится; `translate()` принимает любое исключение и ищет `PDOException` в цепочке, поэтому исключение yiisoft/db передаётся как есть; `within()` при уже более строгом лимите сессии делает один round trip вместо трёх.

### context: бюджет и причина завершения без исключений

В [context](/ru/packages/context) 0.5.0 правило «прочитай остаток до проверки активности и получи хотя бы 1 мс», повторённое в шести местах ядра и адаптеров, стало методом ядра:

```php fragment
$ms = $context->budgetMs();   // int|null, at least 1; throws on a terminated context
$cause = $context->cause();   // ?TerminationCause, no exception to catch
```

Ещё: generics на `withValue()`/`value()` (`class-string<T>` → `T|null`, без ручного `instanceof`), `ListenerFailuresException::errors()`, где видны все упавшие listener'ы, а не только последний, исправленный `TypeError` на числовом алиасе в `WireCodec`.

### context-http, context-cli, context-process

- [context-http](/ru/packages/context-http) 0.4.0: `ContextMiddleware(parent:)` — контексты запросов от shutdown-контекста долгоживущего сервера; `correlationIdResolver:` и `correlationResponseHeader:` — correlation id из приложения, без обёртки вокруг middleware, которую оба моих приложения уже написали руками; `ContextClient(maxTimeout:)` — более строгий таймаут клиента больше не расширяется до бюджета.
- [context-cli](/ru/packages/context-cli) 0.1.1: второй сигнал больше не запускает код приложения внутри обработчика сигнала. Раньше listener, бросивший исключение, мог помешать принудительному выходу.
- [context-process](/ru/packages/context-process) 0.1.1: ожидание между опросами начинается с 1 мс и удваивается до `pollInterval`, короткая команда больше не стоит полного интервала (по умолчанию 50 мс).

## Что нового: understudy

### `#[StrictStubs]` на классе и методе

Строгие заглушки (настроенная, но ни разу не вызванная заглушка — провал теста) в Testo задавались только на весь suite, в PHPUnit — на класс. Теперь атрибут ядра работает в обоих мостах ([understudy-testo](/ru/packages/understudy-testo) 1.2.0, [understudy-phpunit](/ru/packages/understudy-phpunit) 1.1.0):

```php
use Rasuvaeff\Understudy\StrictStubs;

#[StrictStubs]
final class CheckoutTest
{
    #[StrictStubs(false)]
    public function legacyPath(): void {}
}
```

Метод важнее класса, класс важнее родителя, атрибут важнее настройки моста. Без атрибута ничего не меняется.

### Матчеры для value objects и типы без плагина

В [understudy](/ru/packages/understudy) 1.2.0 появились матчеры под самый частый паттерн в моих тестах — 15 из 24 `Arg::satisfies()` в монорепо были вида `fn (mixed $x) => $x instanceof Foo && …`:

- `Arg::instanceOf(Foo::class, fn (Foo $f): bool => …)` — типизированный предикат; объект чужого класса — несовпадение, а не `TypeError` внутри тестируемого кода;
- `Arg::equalTo($vo)` — сравнение по структуре, включая приватные свойства;
- `Arg::whichProperty('email', $value)` — `which()` для public-свойства.

`when()`/`expect()` теперь типизированы generics в самом ядре: Psalm и PHPStan без плагина ловят `returns()` со значением, которое метод вернуть не может. Вызов заглушки подешевел: 16,3 → 11,4 мкс по замеру A/B против 1.1.2.

Ещё один момент: [understudy-testo](/ru/packages/understudy-testo) 1.1.0 падает до начала теста, если в контексте уже есть дублёры, созданные вне теста (в data provider или `#[BeforeClass]`). Раньше их молча проверял первый тест. CHANGELOG предупреждает прямо: сьют, зелёный по случайности, покраснеет.

### Подсказка `Arg::rest()` в Psalm и PHPStan

`Arg::rest()` закрывает все неуказанные параметры одним матчером. В монорепо им не пользовался никто, зато нашлось 109 строк с тремя и более `Arg::any()` подряд. Документация не помогла, поэтому подсказку дают плагины:

```php fragment
when(fn () => $storage->recordOutcome('svc', Arg::any(), Arg::any(), Arg::any()));
// suggested:
when(fn () => $storage->recordOutcome('svc', Arg::rest()));
```

Подсказка выдаётся только там, где обе записи принимают ровно одни и те же вызовы: без variadic, именованных аргументов и распаковки. Как она включается — в разделе про совместимость.

Также в плагинах: `wire()` больше не обещает ключ в `doubles`, если параметр передан через overrides (раньше анализ проходил, а код падал на отсутствующем ключе); `Understudy::for(A::class, B::class)` типизируется как `A&B`; плагины знают больше видов матчеров; Psalm видит дублёр в поле класса (`$this->repo`), а не только в локальной переменной.

## Что нового: property-testing

Пять дефектов [ядра](/ru/packages/property-testing-core) воспроизвелись пробой до правки и исправлены в 1.4.0. Самые заметные для пользователя:

- `Gen::regex('[[:alpha:]]')` молча генерировал несовпадающие строки. Теперь поддержаны все 14 POSIX-классов PCRE и `[:^name:]`.
- Докблок `int|string[]` читался как массив объединения: скаляр `int` не генерировался никогда. Это меняет то, что генерирует данный seed для таких сигнатур, поэтому `SEQUENCE_EPOCH` поднят с 3 до 4: записи корпуса, сохранённые по seed, при чтении отбрасываются, записи со значениями продолжают проигрываться.
- Исключение внутри `Gen::map()`/`flatMap()` вылетало без seed. Теперь это `GenerationErrorException` с seed и номером попытки, а Testo показывает ошибку теста вместо обрыва пайплайна.

В 1.5.0 — то, что пишут руками чаще всего:

```php fragment
Gen::anyOf(Gen::int(), Gen::string());   // equal weights, no frequency([[1, $a], [1, $b]])
Gen::pair(Gen::int(), Gen::string());    // typed array{int, string}
```

Плюс `nullable()` с честным типом `T|null`, границы размера `0` (зависимый `flatMap(intBetween(0, 3), fn ($n) => arrayOf($g, 0, $n))` больше не падает на нуле), предупреждение о примере из `<method>Examples()`, который `Assume::that()` выбросил и который поэтому ничего не проверял, сообщения генераторов с именем фабрики и значениями.

Код отчётов и разбора `PROPERTY_*`, который мосты Testo и PHPUnit держали двумя копиями в синхронности вручную, переехал в ядро. Мост PHPUnit получил `PropertyCheck::failOn()`, который раньше был только в Testo.

## Что нового: property-testing-openapi

[property-testing-openapi](/ru/packages/property-testing-openapi) генерирует запросы и ответы по OpenAPI-документу. Ревью гоняло его на формах из реальных документов, и многие из них давали либо отказ на всю операцию, либо «валидный» кейс, который [openapi-contract](/ru/packages/openapi-contract) отвергает. Что теперь работает:

- `allOf` из компонентов с разными `description`, OAS 3.0 `nullable` рядом с `allOf`;
- пустой объект в `anyOf`/`oneOf` кодируется как `{}`, а не `[]`;
- односторонняя граница за окном ±1000 (`minimum: 1900`);
- числовые `exclusiveMinimum`/`exclusiveMaximum` из OAS 3.1;
- `oneOf` над объектами, различимыми по `const`/`enum` обязательного свойства;
- форматы `hostname`, `ipv6`, `time`, [`duration`](/ru/packages/duration); форматы, которые контракт читает как аннотацию (`phone`, `byte`, свои), генерируются обычной строкой — ответ берётся из `SchemaCheck::assertsFormat()` в [`openapi-contract`](/ru/packages/openapi-contract) 0.18.0, а не из копии списка;
- тела `text/plain` и `application/octet-stream`;
- `minLength`/`minItems` выше бюджета генерации поднимают бюджет вместо отказа.

Отказ теперь всегда приходит из `forOperation()` с именем операции, а не на случайном draw. А узнать его можно заранее, без генерации:

```php fragment
$suite->generationCoverage();
// ['pets.list' => ['supported' => true, 'reason' => null], ...]
```

Пакет на 0.x, и 0.21.0 и 0.22.0 меняют draws для части операций — об этом сказано в CHANGELOG.

## 0.x и 1.x: где можно ломать

Правило, которое я сформулировал в ходе этой работы: **пакет без 1.0 можно ломать минорным релизом с записью в CHANGELOG, 1.x — нельзя**. До этого агенты по привычке откладывали в 0.x всё, что меняет поведение, — так висели рефакторинг генератора в [`property-testing-openapi`](/ru/packages/property-testing-openapi) и issue про транзакции в [`context-db`](/ru/packages/context-db). После решения обе вещи вышли третьими тегами.

На 1.x API остаётся совместимым. Исправления поведения, которые вскрывают ложный зелёный — как [`understudy-testo`](/ru/packages/understudy-testo) 1.1.0 или новый epoch в [`property-testing-core`](/ru/packages/property-testing-core) 1.4.0, — выходят с явным предупреждением в CHANGELOG. Новые *ошибки* о заведомо неверном использовании тоже приходят минором с предупреждением: после [`understudy`](/ru/packages/understudy) 1.2.0 Psalm и PHPStan сами ловят невозможное значение в `returns()`, а плагины знают больше видов матчеров. А вот новая *подсказка* — не ошибка, и покрасить чужой CI она не имеет права.

Подсказка `Arg::rest()` это хорошо показывает. В Psalm она выдаётся уровнем `info`: видна, но сборку не валит, и переопределяется в `psalm.xml`. У PHPStan уровня ниже ошибки нет. Включённое по умолчанию правило покрасило бы CI каждому, кто обновил [`understudy-phpstan`](/ru/packages/understudy-phpstan) минором. Поэтому в PHPStan оно opt-in:

```yaml
parameters:
    understudy:
        suggestRest: true
```

Одно правило, одна формулировка, одинаковый код в обоих плагинах (совпадение копий проверяет тест) — но разная поставка, потому что у анализаторов разные возможности.

## На чём споткнулись

**В CI understudy была зашита версия ядра.** Тест совместимости адаптеров подключает ядро как path-репозиторий, и версию ему задавала строка `"1.0.0"`. Пока адаптеры требовали `^1.0`, это работало. Когда адаптеры подняли требование до `^1.2` (им нужен атрибут `#[StrictStubs]`), job сломался ([PR #187](https://github.com/rasuvaeff/understudy/pull/187)). Теперь версия берётся из верхнего заголовка `CHANGELOG.md`: фиксированное число устаревает в момент, когда адаптер поднимает требование.

**Корпус [`openapi-contract`](/ru/packages/openapi-contract) устарел ещё до волны.** [`openapi-contract`](/ru/packages/openapi-contract) хранит записанные запросы, сгенерированные [`property-testing-openapi`](/ru/packages/property-testing-openapi). Перед первой перезаписью оказалось, что на чистом master 321 из 590 кейсов уже отличаются байтами. Вердикты при этом на месте: у 11 кейсов поменялось целевое поле, но `valid: false` и вид ошибки те же. Вероятная причина — [`property-testing-core`](/ru/packages/property-testing-core) 1.3.0, это вывод, без bisect. Корпус перезаписали отдельным коммитом ([PR #192](https://github.com/rasuvaeff/openapi-contract/pull/192)), и дальше каждая волна только добавляла кейсы, ничего не меняя: 590 → 717 → 840 → 899 ([#193](https://github.com/rasuvaeff/openapi-contract/pull/193), [#196](https://github.com/rasuvaeff/openapi-contract/pull/196)).

**Psalm 7.0.0 против 7.1 на prefer-lowest.** В [`property-testing-openapi`](/ru/packages/property-testing-openapi) job с самыми старыми зависимостями упал: Psalm 7.0.0 не сужал тип схемы после `array_is_list()`. Нижняя граница поднята до `^7.1`. Локально на свежем Psalm этого не увидеть.

**Шум измерения — Mockery.** Разбиение `Runtime` (около 1600 строк), фасада и `TargetUnifier` на внутренние классы — горячий путь, прошлые рефакторинги там стоили 10–23%. Поэтому замер шёл парами, master против ветки на одной машине, а мерилом было преимущество [understudy](/ru/packages/understudy) над Mockery в том же прогоне: Mockery служит полом шума. Первый вариант оказался на 1–4% медленнее из-за лишних статических переходов. Их убрали, и следующий замер показал паритет ([PR #187](https://github.com/rasuvaeff/understudy/pull/187)).

**context 0.5 не ставился рядом с retry и bulkhead.** Это всплыло при обновлении ЦСКА.IN. [`retry`](/ru/packages/retry) 1.7.0 и [`bulkhead`](/ru/packages/bulkhead) 1.4.0 принимали `rasuvaeff/context` только до `^0.3`. На требование `^0.5` Composer не упал, а молча подобрал старые релизы этих пакетов. Пришлось выпустить пять попутных патчей ([`retry`](/ru/packages/retry), [`bulkhead`](/ru/packages/bulkhead), [`resilience`](/ru/packages/resilience), [`clickhouse-toolkit`](/ru/packages/clickhouse-toolkit), [`yii3-clickhouse-toolkit`](/ru/packages/yii3-clickhouse-toolkit)) с `^0.4 || ^0.5`. Урок: на 0.x каретка держит минор (`^0.3` не пускает 0.4), поэтому минорный релиз базового пакета вроде [`context`](/ru/packages/context) означает патчи для всех пакетов, которые от него зависят.

**Плагин обработчика ошибок в Testo.** Новый `testo/error-handler` ставит свой обработчик вокруг каждого теста. В адаптере [`property-testing-testo`](/ru/packages/property-testing-testo) из-за этого ветка «предыдущего обработчика нет» стала невыполнимой, и её мутант — неубиваемым. Я завёл [php-testo/testo#429](https://github.com/php-testo/testo/issues/429), и мейнтейнер Testo объяснил оба способа отключить плагин: атрибутом `#[WithoutErrorHandler]` на тест или для всего suite. В адаптере помог атрибут на одном тесте. В ЦСКА.IN после обновления 851 интеграционный тест стал Risky: раннер Rapira регистрирует обработчики Yii на каждый in-process запрос, и они оставались висеть. Отключать плагин я не стал, а исправил причину: тестовый хелпер теперь восстанавливает стек обработчиков после каждого запроса.

**Смоки приложения сгнили.** Семь смоков ЦСКА.IN были красными без единого бага в коде. Большинство проверяло поведение, которое сайт поменял намеренно: стенд закрыт от индексации, гостевая ушла из sitemap, `/day` стал календарём. Остальные брали первые попавшиеся данные из базы: настоящий матч, последнее сообщение гостевой. Смоки переписаны: они следуют новому поведению и создают свои данные сами.

## Как это доехало до ЦСКА.IN

[ЦСКА.IN](/ru/blog/cska-in) использует часть этих пакетов: [`context`](/ru/packages/context), [`context-http`](/ru/packages/context-http), [`understudy`](/ru/packages/understudy) с мостом для Testo, [`property-testing-testo`](/ru/packages/property-testing-testo), [`bulkhead`](/ru/packages/bulkhead), а через [`media-converter`](/ru/packages/media-converter) — и [`retry`](/ru/packages/retry). В тот же день его обновили до новых версий: [`understudy`](/ru/packages/understudy) 1.2.1, [`understudy-testo`](/ru/packages/understudy-testo) 1.2.0, [`property-testing-testo`](/ru/packages/property-testing-testo) 1.3.0 (ядро 1.5.0), [`context`](/ru/packages/context) 0.5.0, [`context-http`](/ru/packages/context-http) 0.4.0, а [`retry`](/ru/packages/retry) и [`bulkhead`](/ru/packages/bulkhead) — до попутных патчей. Кода в приложении это почти не потребовало. Новый тест закрепил поведение бюджета запроса на всех трёх входах: 504 по истечении, заголовок клиента бюджет только укорачивает, уже имеющийся correlation id переиспользуется. Мутационный порог приложения после обновления проходит.

## Что осталось

Открытых issue по ревью нет. Не сделано осознанно:

- 4 issue закрыты как not planned: рост размера в генераторах ([property-testing-core#196](https://github.com/rasuvaeff/property-testing-core/issues/196): по умолчанию сдвинул бы seed→values у всех, а opt-in требует менять сигнатуру `generate()`), подклассы issue в Psalm-плагине ([understudy-psalm#66](https://github.com/rasuvaeff/understudy-psalm/issues/66): существующие `@psalm-suppress` перестали бы их глушить), `--with-uncovered` для мутаций плагинов ([understudy-psalm#67](https://github.com/rasuvaeff/understudy-psalm/issues/67), [understudy-phpstan#53](https://github.com/rasuvaeff/understudy-phpstan/issues/53): решение 3 ноября оставить плагины на старой команде);
- три пожелания ревью не заводились, потому что уже записаны в план к 1.0 [context](/ru/packages/context): готовый цикл обработки очереди в [`context-cli`](/ru/packages/context-cli), декоратор соединения yiisoft/db, ограничение `gracePeriod` бюджетом в [`context-process`](/ru/packages/context-process);
- попутная находка внешнего ревью: пересекающиеся `within()` на одном PDO из разных Fiber восстанавливают таймаут не в том порядке — [context-db#11](https://github.com/rasuvaeff/context-db/issues/11);
- несколько правок документации влиты без тега и уйдут со следующим релизом.
