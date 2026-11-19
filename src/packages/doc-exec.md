---
title: doc-exec
package: doc-exec
section: 1
dev: true
layout: man
description: "Doctest for PHP. Executes README code blocks against the current code and diffs the output."
---

## NAME

doc-exec — run the code blocks of a README against the current code and diff the output

## SYNOPSIS

<ManInstall />

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

## DESCRIPTION

Doctest for PHP: execute the code blocks in your README against the current codebase and diff the result. It does for PHP what `cargo test --doc` does for Rust.

Documentation examples rot. The API changes and the README keeps showing code that no longer runs. Here the sample is a test, so the build fails when it breaks.

- Only blocks with the `php doc-exec` info string run. Plain `php` blocks stay illustrative.
- Per-statement markers: `// => expr`, `// throws FQCN`, `// outputs text`, `// skip`.
- Statements are split by a real PHP parser (`nikic/php-parser`), not by pattern matching.
- Blocks under one Markdown heading share a variable scope, in document order.
- Each document runs in its own child `php` process. No `eval()`.
- A wall-clock `--timeout` per scope group (30 s by default) kills blocks that loop forever.
- Exit code 0 on pass, 1 on failure, 2 on usage error, so it wires into CI.
- Programmatic API: `DocExec::check()` returns a `DocumentResult` with stable block ids.
- Zero config: `vendor/bin/doc-exec` checks `./README.md`.

## EXAMPLES

Trailing marker comments assert a value, an exception, printed output, or skip a statement.

```php
2 + 3; // => 5
intdiv(1, 0); // throws DivisionByZeroError
echo "done"; // outputs done
network_call(); // skip: hits a real API
```

CLI usage: check the README by default, or pass files, a bootstrap and a timeout; exit code 1 on failure.

```bash
vendor/bin/doc-exec                                           # zero-config: checks ./README.md
vendor/bin/doc-exec docs/*.md                                 # explicit file list
vendor/bin/doc-exec --bootstrap=tests/bootstrap.php README.md # explicit autoloader
vendor/bin/doc-exec --timeout=60 docs/slow.md                 # wall-clock budget per scope group
```

The DocExec API returns per-statement results instead of a console report.

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

## SEE ALSO

The `resilience` README sample is executed on every build through it.

## BUGS

Blocks run arbitrary PHP with the caller's permissions. The timeout bounds time only, not memory or filesystem access. It is 0.1.0.

Requires PHP 8.3–8.5, `ext-tokenizer` and `nikic/php-parser` ^5.7.
