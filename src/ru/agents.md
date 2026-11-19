---
title: Для агентов
description: "В каждом пакете есть справочник llms.txt, а в сорока ещё и навык для агента, который проект подхватывает при composer install."
outline: [2, 2]
---

# Для агентов

Кодовый агент в проекте с этими пакетами получает от них две вещи, и ни одна не зависит от того, что помнит модель.

| Файл | Где | Что это |
|---|---|---|
| `llms.txt` | в каждом пакете | Компактный самодостаточный справочник по API. Его отдают модели, чтобы она не угадывала имя метода. |
| `SKILL.md` | в 40 пакетах | Навык для агента: когда использовать пакет и какие правила проверять при каждом изменении. |

## Как навык попадает к агенту

Проект с Composer-плагином [llm/skills](https://github.com/roxblnfk/skills) получает навык каждого установленного пакета в `.agents/skills/` при `composer install`. Вручную ничего не копируется, и навык обновляется вместе с пакетом, который он описывает.

## Что внутри навыка

Навыки написаны так же, как свод правил самого монорепо: для читателя, который исполняет правила буквально.

- **Триггер в front matter.** В описании перечислены публичные классы и стоит фраза «Use when writing, reviewing or debugging ... in a project that has this package installed», чтобы агент загружал навык под нужную задачу.
- **Правила безопасности, которые проверяются при каждом изменении.** Ловушки, которые что-то стоили, сформулированные как правила, а не советы.
- **Канонический пример использования.** Одна конструкция, заведомо верная.
- **Ссылка на полный API.** «Прочитай `vendor/rasuvaeff/<package>/llms.txt`, прежде чем угадывать имя метода».

Фрагмент навыка [yii3-idempotency](https://github.com/rasuvaeff/yii3-idempotency):

```markdown
---
name: rasuvaeff-yii3-idempotency
description: >-
  Prevent duplicate processing of POST/PUT/PATCH requests in Yii3 APIs with
  rasuvaeff/yii3-idempotency — IdempotencyMiddleware, IdempotencyKey, ...
  Use when writing, reviewing or debugging idempotency-key handling,
  duplicate-request replay, caller/key scoping, domain-failure caching, or
  409/422 conflict responses in a project that has this package installed.
---

## Safety rules — verify these on every change

2. **Only 2xx responses are cached.** Any non-2xx handler response releases
   the claim so the client can retry under the same key. Never "fix" a
   failing retry by caching an error response.

3. **Conflict semantics are fixed contract.** Same key + different payload
   fingerprint → 422; same key while the first request is still in flight
   → 409; replay → cached response, handler NOT called.
```

Тот же приём в пакете про конкурентность, из [bulkhead](https://github.com/rasuvaeff/bulkhead):

```markdown
2. **`lease` must exceed the longest possible callback runtime** (downstream
   timeout + margin). The lease TTL is what reclaims a dead worker's slot; if
   the callback outlives it, the slot is reclaimed mid-call and real
   concurrency exceeds `maxConcurrent`.
```

## Пакеты с навыком

<SkillList />

Подробный разбор того, как агента удерживают в рамках правил: [Как я заставил AI-агента поддерживать 90 PHP-пакетов и не сойти с ума](https://teletype.in/@rasuvaeff/ai-agents).

Агент, который пишет эти пакеты, следует своду правил монорепо, он описан на [странице про процесс](/ru/workflow). Навыки — парная часть для потребителя: правила, которые нужны агенту проекта, когда он использует пакет.
