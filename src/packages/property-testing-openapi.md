---
title: property-testing-openapi
package: property-testing-openapi
section: 3
dev: true
layout: man
description: "Generate valid and invalid OpenAPI requests from a contract and check them in-process. With openapi-contract."
---

## NAME

property-testing-openapi — valid and invalid OpenAPI requests generated from a contract and checked in-process

## SYNOPSIS

<ManInstall />

```php
$contract = Contract::fromArray($document);
$operation = $contract->operation('pets.get');
$case = (new RequestCaseArbitrary())->forOperation($operation)->generate(new Random(42))->value;
$request = (new RequestMaterializer(new Psr17Factory(), new Psr17Factory()))->materialize($operation, $case);

$contract->validateRequest($request)->assertValid();
```

## DESCRIPTION

Request cases generated from an OpenAPI document, materialized as PSR-7 and checked by [openapi-contract](https://github.com/rasuvaeff/openapi-contract) before they reach a transport. The idea behind Schemathesis, for PHP.

Hand-written API tests cover the examples someone thought of. The OpenAPI document already says what a valid request is, so it can also produce the valid ones, and the invalid ones by category, and show whether the handler and the contract agree.

- Generates valid scalar, array and object values from the documented JSON Schema subset.
- Materializes OpenAPI 3 parameter styles and JSON, form-urlencoded and multipart bodies.
- `ContractSuite` drives a PSR-15 handler in process through `Psr15Transport`.
- Negative cases by category: missing-required, type, enum, const, boundary, length, format, pattern.
- Value witnesses are verified through `Contract::accepts()` before they are used.
- Security credentials are applied only at materialization, never stored in cases or the corpus.
- `OperationProperty` runs unchanged under Testo and PHPUnit.
- `OperationCoverage` reports which selected operations actually ran a trial.
- Unsupported constructs fail closed as `UnsupportedGeneration`.

## OPENAPI-CONTRACT

`openapi-contract` is usable on its own. It validates PSR-7 requests and responses against OpenAPI 3.0 and 3.1.

- `validateRequest`, `validateResponse` and `validateExchange` return violation lists with stable codes.
- Body violations carry the `instancePath` and the failed schema keyword.
- `ContractMiddleware` for PSR-15: observe-only, strict (400 `problem+json`) or a custom closure.
- A CLI, `bin/openapi-contract`, validates a directory of JSON fixtures with CI-friendly exit codes.
- Budgets bound document size, node counts, resolved nodes and message body size.
- `fromFile` resolves relative `$ref`s but rejects path traversal, URI schemes and symlink escapes.
- `multipleOf` is judged exactly on the spelled decimal, with or without `ext-bcmath`.

```php
$result = $contract->validateExchange($request, $response);
$result->assertValid(); // throws ContractViolation when violations exist
```

**More examples**

A PSR-15 middleware in two modes: observe-only logs violations, strict refuses the request.

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

A CLI runner validates a directory of JSON fixtures against one contract and returns a CI-friendly exit code.

```bash
vendor/bin/openapi-contract openapi.yaml tests/api-fixtures
```

Size budgets are caller policy: an oversized body is refused by default, raised on request.

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

## EXAMPLES

A contract suite sends generated valid requests through a PSR-15 handler and checks invalid ones never cause a 5xx.

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

A coverage report shows which operations the suite exercised and fails when some were left untested.

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

A stricter oracle: invalid input must be answered with 4XX, with a per-operation exception.

```php
use Rasuvaeff\PropertyTesting\OpenApi\RejectionPolicy;

$suite = $suite->rejectionPolicy(
    RejectionPolicy::rejectWith('4XX')->forOperation('legacy.get', 200),
);
```

## SEE ALSO

| Package | Role |
|---|---|
| [openapi-contract](https://github.com/rasuvaeff/openapi-contract)(3) | The validator |
| [property-testing-core](https://github.com/rasuvaeff/property-testing-core)(3) | The engine: generators, shrinking, corpus |
| [property-testing-testo](https://github.com/rasuvaeff/property-testing-testo)(3) | Testo adapter |
| [property-testing-phpunit](https://github.com/rasuvaeff/property-testing-phpunit)(3) | PHPUnit adapter |

## BUGS

The default operation selection is empty. Unsafe-method operations need explicit listing plus `allowUnsafeOperations()`, otherwise `SuiteConfigurationError`. `openapi-contract` does not enforce declared security: a request missing its API key validates clean, only the exchange shape is checked. Both packages are pre-1.0.
