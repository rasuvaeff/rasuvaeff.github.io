---
title: doc-exec
description: "Doctest для PHP. Выполняет блоки кода из README на текущем коде и сверяет вывод."
outline: [2, 2]
---

# doc-exec

Doctest для PHP: выполняет блоки кода из README на текущей кодовой базе и сверяет результат. Делает для PHP то же, что `cargo test --doc` для Rust.

<PackageMeta slug="doc-exec" :src="25" :tests="11" />

## Задача

Примеры в документации устаревают. API меняется, а README продолжает показывать код, который уже не работает. Здесь пример — это тест, поэтому сборка падает, когда он ломается.

## Что умеет

- Выполняются только блоки со строкой info `php doc-exec`. Обычные блоки `php` остаются иллюстрациями.
- Маркеры на уровне выражений: `// => expr`, `// throws FQCN`, `// outputs text`, `// skip`.
- Выражения разбиваются настоящим PHP-парсером (`nikic/php-parser`), а не поиском по шаблону.
- Блоки под одним заголовком Markdown делят область переменных, в порядке документа.
- Каждый документ выполняется в отдельном дочернем процессе `php`. Без `eval()`.
- Ограничение по реальному времени `--timeout` на группу блоков (по умолчанию 30 с) убивает блоки, зациклившиеся навсегда.
- Код возврата 0 при успехе, 1 при падении, 2 при ошибке использования, поэтому подключается к CI.
- Программный API: `DocExec::check()` возвращает `DocumentResult` со стабильными идентификаторами блоков.
- Без конфигурации: `vendor/bin/doc-exec` проверяет `./README.md`.

## Пример

````markdown
```php doc-exec
2 + 3; // => 5
intdiv(1, 0); // throws DivisionByZeroError
echo "done"; // outputs done
network_call(); // skip: hits a real API
```
````

```bash
vendor/bin/doc-exec docs/*.md
vendor/bin/doc-exec --bootstrap=tests/bootstrap.php README.md
```

## Где используется

Пример из README пакета `resilience` выполняется через него при каждой сборке.

## Ещё примеры

Маркеры в комментариях проверяют значение, исключение, вывод или пропускают выражение.

```php
2 + 3; // => 5
intdiv(1, 0); // throws DivisionByZeroError
echo "done"; // outputs done
network_call(); // skip: hits a real API
```

Запуск из CLI: по умолчанию проверяется README, можно указать файлы, bootstrap и таймаут; при ошибке код выхода 1.

```bash
vendor/bin/doc-exec                                           # zero-config: checks ./README.md
vendor/bin/doc-exec docs/*.md                                 # explicit file list
vendor/bin/doc-exec --bootstrap=tests/bootstrap.php README.md # explicit autoloader
vendor/bin/doc-exec --timeout=60 docs/slow.md                 # wall-clock budget per scope group
```

API DocExec возвращает результат по каждому выражению вместо консольного отчёта.

```php
$result = (new DocExec(timeoutSeconds: 15))->check($document);

printf("%s: %s\n", basename($document), $result->passed() ? 'all blocks passed' : 'some blocks failed');

foreach ($result->blocks as $block) {
    foreach ($block->statements as $statement) {
        printf(
            "    %-4s line %d  %s\n",
            match ($statement->outcome) {
                StatementOutcome::Pass => 'pass',
                StatementOutcome::Skip => 'skip',
                StatementOutcome::Fail => 'FAIL',
            },
            $statement->statement->line,
            strtok($statement->statement->code, "\n"),
        );
    }
}
```

## Ограничения

Блоки выполняют произвольный PHP с правами вызывающего. Таймаут ограничивает только время, но не память и не доступ к файловой системе. Версия 0.1.0.

Требует PHP 8.3–8.5, `ext-tokenizer` и `nikic/php-parser` ^5.7.
