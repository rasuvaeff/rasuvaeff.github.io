---
title: property-testing-openapi
description: "Генерация валидных и невалидных запросов OpenAPI по контракту и проверка их в процессе. Работает вместе с openapi-contract."
outline: [2, 2]
---

# property-testing-openapi

Запросы, сгенерированные из документа OpenAPI, материализованные как PSR-7 и проверенные [openapi-contract](https://github.com/rasuvaeff/openapi-contract) до того, как попадут в транспорт. Идея Schemathesis, для PHP.

<PackageMeta slug="property-testing-openapi" :src="60" :tests="47" />

## Задача

Ручные тесты API покрывают только те примеры, о которых кто-то подумал. Документ OpenAPI уже описывает, что такое валидный запрос, поэтому он может породить и валидные запросы, и невалидные по категориям, и показать, согласны ли обработчик и контракт.

## Что умеет

- Генерирует валидные скалярные значения, массивы и объекты из описанного подмножества JSON Schema.
- Материализует стили параметров OpenAPI 3 и тела JSON, form-urlencoded и multipart.
- `ContractSuite` прогоняет PSR-15 обработчик в процессе через `Psr15Transport`.
- Негативные кейсы по категориям: missing-required, type, enum, const, boundary, length, format, pattern.
- Свидетели значений проверяются через `Contract::accepts()` до использования.
- Учётные данные безопасности применяются только при материализации и никогда не хранятся в кейсах или корпусе.
- `OperationProperty` работает без изменений под Testo и PHPUnit.
- `OperationCoverage` показывает, какие из выбранных операций реально выполнили прогон.
- Неподдерживаемые конструкции отказывают закрыто, как `UnsupportedGeneration`.

## Пример

```php
$contract = Contract::fromArray($document);
$operation = $contract->operation('pets.get');
$case = (new RequestCaseArbitrary())->forOperation($operation)->generate(new Random(42))->value;
$request = (new RequestMaterializer(new Psr17Factory(), new Psr17Factory()))->materialize($operation, $case);

$contract->validateRequest($request)->assertValid();
```

## Ещё примеры

Набор по контракту прогоняет валидные запросы через PSR-15 обработчик и проверяет, что невалидные не дают 5xx.

```php
$suite = ContractSuite::fromContract($contract, $factory, $factory)
    ->operations(['pets.get'])
    ->transport(new Psr15Transport($handler, $factory));

foreach ([1, 2, 3] as $seed) {
    $suite->checkValid('pets.get', $suite->validCases('pets.get')->generate(new Random($seed))->value);
}

$negative = $suite->negativeCases('pets.get')->generate(new Random(5))->value;
$suite->checkNegative('pets.get', $negative);
```

Отчёт покрытия показывает, какие операции затронул набор, и падает, если часть осталась без проверки.

```php
$coverage = new OperationCoverage();

$suite = ContractSuite::fromContract($contract, $factory, $factory)
    ->allSafeOperations()
    ->coverage($coverage)
    ->transport(new CallableTransport(static fn(): Response => new Response(204)));

$report = $suite->coverageReport();
echo $report->toJson() . PHP_EOL;

try {
    $report->assertComplete();
} catch (CoverageIncomplete $incomplete) {
    echo $incomplete->getMessage() . PHP_EOL;
}
```

Более строгий оракул: невалидный вход должен получать 4XX, для отдельной операции можно задать исключение.

```php
use Rasuvaeff\PropertyTesting\OpenApi\RejectionPolicy;

$suite = $suite->rejectionPolicy(
    RejectionPolicy::rejectWith('4XX')->forOperation('legacy.get', 200),
);
```

## Валидатор: openapi-contract

`openapi-contract` можно использовать отдельно. Он проверяет PSR-7 запросы и ответы по OpenAPI 3.0 и 3.1.

- `validateRequest`, `validateResponse` и `validateExchange` возвращают списки нарушений со стабильными кодами.
- Нарушения тела содержат `instancePath` и сработавшее ключевое слово схемы.
- `ContractMiddleware` для PSR-15: только наблюдение, строгий режим (400 `problem+json`) или собственное замыкание.
- CLI `bin/openapi-contract` проверяет каталог JSON-фикстур с кодами возврата, удобными для CI.
- Бюджеты ограничивают размер документа, число узлов, число разрешённых узлов и размер тела сообщения.
- `fromFile` разрешает относительные `$ref`, но отвергает выход за пределы пути, URI-схемы и побеги через симлинки.
- `multipleOf` проверяется точно по записанному десятичному числу, с `ext-bcmath` и без него.

```php
$result = $contract->validateExchange($request, $response);
$result->assertValid(); // throws ContractViolation when violations exist
```

## Ещё примеры валидатора

PSR-15 middleware в двух режимах: наблюдающий только фиксирует нарушения, строгий отклоняет запрос.

```php
$contract = Contract::fromFile(__DIR__ . '/openapi/pets.yaml');

$observing = new ContractMiddleware(
    $contract,
    static function (array $violations, ServerRequestInterface $request) use ($formatter): ?ResponseInterface {
        echo 'observed on ', $request->getMethod(), ' ', $request->getUri(), ":\n",
        $formatter->format(new ValidationResult($violations)), "\n\n";

        return null;
    },
);
$strict = ContractMiddleware::strict($contract, new Psr17Factory());
```

CLI проверяет каталог JSON-фикстур по одному контракту и возвращает код выхода для CI.

```bash
vendor/bin/openapi-contract openapi.yaml tests/api-fixtures
```

Лимиты размера задаёт вызывающий код: слишком большое тело по умолчанию отклоняется, лимит можно поднять.

```php
$result = Contract::fromArray($document)->validateExchange($request, $big);
printf("default budget      -> %s\n", $result->violations[0]->code);

$raised = Contract::fromArray($document, new Limits(messageBodyBytes: 8 * 1024 * 1024));
printf("messageBodyBytes 8M -> %s\n", $raised->validateExchange($request, $big)->isValid() ? 'valid' : 'invalid');

try {
    Contract::fromArray($document, new Limits(documentNodes: 5));
} catch (InvalidContract $exception) {
    printf("documentNodes 5     -> %s\n", $exception->getMessage());
}
```

## Семейство

| Package | Role |
|---|---|
| openapi-contract | Валидатор |
| property-testing-core | Движок: генераторы, shrinking, корпус |
| property-testing-testo | Адаптер для Testo |
| property-testing-phpunit | Адаптер для PHPUnit |

## Ограничения

Выбор операций по умолчанию пуст. Операции с небезопасными методами нужно перечислить явно и вызвать `allowUnsafeOperations()`, иначе будет `SuiteConfigurationError`. `openapi-contract` не проверяет объявленную безопасность: запрос без API-ключа проходит валидацию чисто, проверяется только форма обмена. Оба пакета до 1.0.
