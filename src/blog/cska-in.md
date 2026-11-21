---
title: "How CSKA.IN works: an inside look"
description: "A CSKA fan site rebuilt on Yii3 and PHP 8.5: the stack, code rules, reliable delivery, live updates, in-house packages and working with Claude Code."
date: 2026-11-08
origin: https://teletype.in/@rasuvaeff/cskain
outline: [2, 3]
figures:
  - ["20+", "years online"]
  - ["36", "own packages"]
  - ["5346", "tests"]
  - ["96%", "MSI"]
---

[ЦСКА.IN](https://cska.in/) is a fan site for CSKA, the Moscow army sports club, with football, hockey and basketball teams. The site is more than twenty years old: it has been running since 2003. Until the current version it ran on CodeIgniter. I built the next version on Yii2, but it never shipped. The site you see today was rebuilt from scratch on Yii3 and PHP 8.5, and most of its infrastructure lives in my own Composer packages.

A few numbers, to give a sense of scale:

| What | How much |
|---|---|
| Tests | 5346: 3869 unit and 1477 integration |
| Mutation testing | 95% threshold, 96% actual, out of roughly 16,800 mutants |
| [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview), mobile profile | performance 93–98, accessibility 100, SEO 100 |

Every one of these is checked by the build, not taken on faith.

I wrote all of the code for this site and its packages together with Claude Code, which works right in the terminal and in the repository. There is a separate section on that near the end: how to set up this kind of work so the result can be checked rather than simply trusted.

> The site is public: [cska.in](https://cska.in/). Packages and profile: [github.com/rasuvaeff](https://github.com/rasuvaeff).

This is a long tour of what is inside. I tried to write not a list of buzzwords but what was actually built and why: which technologies run it, which rules the code follows, how the site updates without going down, how live updates work, how quality is checked, and why I moved so much code into packages. There are pieces of real project code in the middle. At the end there is a separate part about the packages that help with testing: those are my favourite.

## What the site does

To show what actually had to be built:

- Matches in three sports (football, hockey, basketball) for every team of the club: the men's football, hockey and basketball clubs, the women's football club, and the hockey farm and junior teams Krasnaya Armiya and Zvezda. A calendar with filters, match reports, line-ups, events, score by period.
- Statistics: league tables, totals for players and for head-to-heads with every opponent, referees, top scorers against the club.
- A guestbook (the site's main forum) with ratings, quotes, photos and videos, link cards, and a live feed.
- Kumir ("idol"): voting for the best players of a match.
- Fan creative work, stories, "on this day in history".
- Private messages and friends, a personal account with settings (which teams to show, how to show the guestbook).
- An admin panel for the editors: reference data, matches, match reports, stories, an action log.
- A Telegram mini app, announcements to the channel, fans' personal agents.

All of this had to be fast, stay up during a match when everyone arrives at once, and never lose a word of what people write.

## Tech stack

**PHP 8.5 and Yii3.** Yii3 is not a monolithic framework but a set of independent components: router, DI container, validator, access control, migrations, views. I use what I need and replace what doesn't fit. For example, most of the plumbing (reliable delivery, form replays, settings, audit log) comes from my packages rather than from Yii.

**[Rapira](https://rapira.rs/).** An application server for PHP. Code is loaded once, and workers live across requests, one per CPU core. The upside: the application is not booted again for every request. The downside: you cannot keep request state in static fields, or it leaks into the next request. So everything that holds request state is registered in the container with a reset callback that runs between requests. A dedicated check makes sure the reset actually works: the test keeps sending pairs of requests until both land on the same worker.

**Three entry points, one codebase.** The site, the admin panel and the "door" for fans' personal agents run as three separate workers on different ports and subdomains, but from one Docker image and one codebase. The admin panel does not open on the public domain, and the agents' door has no cookies and no CSRF: the only identity is a key in a header.

**PostgreSQL.** The main database. A key idea: the database itself enforces the data rules. `CHECK` constraints, composite keys and other constraints refuse a bad row even when the code is wrong. Scores, match status, whether a player belongs to a side of the match, and a tournament's sport are all checked by constraints. For each such constraint a check script holds a "rejected" row and verifies that the database refused it because of that exact constraint, not some other one by accident.

**Statistics are views, not stored numbers.** Goals, assists, cards and minutes are computed from match events. Head-to-head totals, season tables and team records are views over played matches. Fix a match score, and every number on the site is right again by itself. This guards against the eternal problem of stats sites: "the table says one thing, the player card says another".

**Redis.** The read cache (with groups: matches, reference data, polls, creative work and stories are flushed as whole groups on change), rate limiters, replay protection, view counters. A cache miss is rebuilt under a lock: twenty parallel requests to a cold match page cause one rebuild, and the rest wait for its result.

**[Temporal](https://temporal.io/).** Everything that has to run reliably and with retries: email, video transcoding, voice-overs of creative work, link cards, sitemap preparation, schedules (refreshing tables from league sites, match-of-the-day stories, closing Kumir votes). The Temporal workers run on [RoadRunner](https://roadrunner.dev/). Video has its own queue and its own process: heavy transcoding must not delay sign-in code emails.

**[Centrifugo](https://centrifugal.dev/).** Live updates: the guestbook, the score of a match in progress and private messages arrive without a page reload. More on them below; there is an interesting idea about what actually travels over the channel.

**[Angie](https://angie.software/).** The web server in front of the application (an nginx fork): HTTP/3, brotli compression, automatic certificates. It serves static files with a one-year cache and compresses PHP responses itself (Rapira does not compress responses).

**Docker Compose.** Both on the developer's machine and in production. One image, different start commands. Locally, the whole stack comes up with one command.

**OpenTelemetry, Jaeger, Prometheus, Grafana.** Request traces, worker metrics (Rapira itself reports worker states, requests, errors, queue and memory), a shared dashboard. The dashboard is described by a script rather than clicked together in the UI: an edit made in the panel would not survive.

**Our own speech synthesis and ffmpeg.** Voice-overs for the "Creative" section are generated locally ([Vosk](https://github.com/alphacep/vosk-tts)), and video is transcoded by our own ffmpeg. None of the users' material goes to external services.

**A frontend without a heavy framework.** Pages are rendered on the server. Styles and scripts are published as assets with a hash in the URL (the file changes, the URL changes, so they can be cached forever). No inline code in the markup, self-hosted fonts, no CDN. Scripts are light and deferred. In Lighthouse's mobile profile the site scores 93–98 for performance, 100 for accessibility and 100 for SEO.

## Code principles

This is why I rewrote the site: the code has to be something you can change without fear.

### Layers and boundaries

The code is split into layers: domain, application, infrastructure, with entry points on top (HTTP, admin, console, agents). Each part of the site (matches, guestbook, Kumir, accounts, statistics) is its own vertical slice. [deptrac](https://github.com/deptrac/deptrac) checks the boundaries between layers and slices: if someone pulls an infrastructure class into the application layer, the build fails. It is not "an agreement in the README", it is a failing test.

There are subtler rules that deptrac cannot see, and they are written as ordinary architecture tests. For example:

- every handler has exactly one public method, `handle()`;
- commands and queries are values with no behaviour;
- nobody takes hold of the DI container and fetches services themselves;
- time is never read directly, only through a clock interface;
- there is no raw SQL in the application.

### One handler per operation, expected refusals as values

Here is a real handler from the project: an author deletes their own guestbook message.

```php
<?php

declare(strict_types=1);

namespace App\Application\Guestbook\Write;

use App\Application\Guestbook\Live\GuestEvent;
use App\Application\Guestbook\Live\GuestEventKind;
use App\Application\Shared\Events\EventBus;
use App\Domain\Guestbook\ChangeDenied;
use App\Domain\Guestbook\GuestMessage;
use Psr\Clock\ClockInterface;
use Rasuvaeff\Result\Result;

/**
 * The author soft-deletes their own message (the row stays, marked as deleted),
 * and only while nobody has answered it: an answer would be left hanging.
 *
 * @api
 */
final readonly class DeleteMessageHandler
{
    public function __construct(
        private GuestMessages $messages,
        private ClockInterface $clock,
        private SanctionLookup $sanctions,
        private EventBus $events,
    ) {}

    /**
     * @return Result<null, DeleteRefusal>
     */
    public function handle(DeleteMessageCommand $command): Result
    {
        $message = $this->messages->find($command->messageId);
        $denied = $message instanceof GuestMessage
            ? $message->denyChange(
                $command->userId,
                $this->clock->now(),
                sanctioned: $this->sanctions->of($command->userId) instanceof Sanction,
            )
            : ChangeDenied::NotFound;
        if ($denied instanceof ChangeDenied) {
            return Result::err(match ($denied) {
                ChangeDenied::NotFound => DeleteRefusal::NotFound,
                ChangeDenied::NotYours => DeleteRefusal::NotYours,
                ChangeDenied::Sanctioned => DeleteRefusal::Sanctioned,
                ChangeDenied::TooLate => DeleteRefusal::TooLate,
                ChangeDenied::HasAnswers => DeleteRefusal::HasAnswers,
            });
        }

        if (!$this->messages->close($command->messageId, 'deleted', $command->userId)) {
            return Result::err(DeleteRefusal::HasAnswers);
        }

        $this->events->dispatch(new GuestEvent(GuestEventKind::Gone, $command->messageId));

        return Result::ok(value: null);
    }
}
```

What matters here:

1. The rule "you can delete your own message during the first five minutes and while nobody has answered it" lives in the domain (`denyChange`) instead of being smeared across controllers. If an answer arrives between the check and the delete, `close()` does nothing in the database and the author gets the same `HasAnswers` refusal.
2. A refusal is a value with a specific reason (`TooLate`, `HasAnswers`), not an exception and not a faceless `false`. The page uses the reason to tell the person exactly what went wrong, and the tests check each reason separately.
3. Time comes from the clock. A test sets the clock to the right moment and checks the five-minute boundary to the second.

### Query conditions as values (specifications)

There is no raw SQL in the application code. Conditions are built from specifications. The same specification is applied both to a database query and to an object in memory. That is how the calendar works: the rule "which matches to show" is written once, and a dedicated check against real data makes sure SQL and memory return the same thing. Here is how "upcoming matches of the selected teams" is built (simplified):

```php fragment
CalendarSpecifications::upcoming(
    sportId: null,
    now: $now,
    limit: 5,
    teams: [2 => [1, 314, 409]],   // hockey: CSKA, Krasnaya Armiya, Zvezda
);
```

This call produces the condition: not finished, not in progress, kickoff no earlier than now, ordered by time, at most five. The calendar rule can be changed in one place.

### Events after the transaction

A handler announces what happened (a match changed, a message appeared, a vote closed) only after the transaction has committed. Listeners flush the cache, publish a hint to the channel, queue an email. If a listener fails, that goes to the log but does not roll back the user's write.

### No suppressions, clear rules

[Psalm](https://psalm.dev/) runs at its strictest level, level 1. Suppressing warnings (`@psalm-suppress`) is not allowed, neither in code nor through a baseline file: the cause has to be fixed. Before any task is closed, the full set of checks runs: code style, Psalm, deptrac, Rector, class-reference and dependency checks. Every unit test names its class in `#[Covers]`: that is how the mutation testing tool knows which tests are responsible for which code.

## Reliability: nothing lost, nothing duplicated

### Outbox: the job is written in the same transaction as the data

A typical mistake: save an email to the database, then separately push it to a queue. If something fails between the two steps, the email is lost or goes out without a record. I use the outbox pattern. Here is how an email is sent:

```php fragment
public function send(string $to, Letter $letter): void
{
    $job = $this->transactions->run(function () use ($to, $letter): string {
        $now = $this->clock->now();
        $id = $this->outbox->add(
            $to,
            $letter->subject,
            $this->renderer->text($letter),
            $this->renderer->html($letter),
            $now,
            $letter->expiresAt($now),
            $letter->bulk,
        );

        return $this->jobs->enqueue(JobType::MailDeliver, (string) $id, ['mail' => $id]);
    });
    $this->jobs->deliver($job);   // try to hand it to Temporal right away
}
```

The email and the job that sends it are written together or not at all. After the commit the application immediately tries to start the workflow. If Temporal is unavailable, the job stays in the table and a background daemon picks it up within a second. The workflow ID is deterministic (`mail.deliver:42`), so starting the same job twice is harmless. The email body (it may contain sign-in codes) is wiped from the database as soon as the email is sent, and a code that has sat past its expiry is not sent at all. Link cards, video transcoding and Telegram notifications work the same way.

### Idempotent forms

Admin forms and invitation forms in the personal account carry a hidden one-time key. A double click or resubmitting the same page will not create a second record or send a second email. Without this, a double click on an email invitation would send two emails. The response to a replay comes from Redis (kept for fifteen minutes), and a rejected form (a validation error) does not consume the key, so the person can fix it and submit again.

### Limiters and a circuit breaker

- No more than three concurrent ffmpeg runs for building thumbnails (a burst of image uploads). The limit is shared by all workers and is kept in Redis. Video transcoding is a separate story: it lives in its own queue and process and does not delay sign-in code emails.
- Calls to the language model go through a circuit breaker: after a series of failures (network, key, balance, 5xx) calls fail immediately for a couple of minutes instead of piling up and slowing pages down. Every model call is also written to a log: prompt, response, tokens, latency.

### Deploys without downtime

A deploy used to replace all instances at once and show visitors a maintenance page. Now one script does the update, in this order:

1. Pull the code and build a new image (old instances keep running on the old one).
2. Apply migrations as a single step in a separate container: two new instances must not race to run them.
3. For the site, the admin panel and the agents' door, one at a time: start new instances next to the old ones and wait until the health check says "ready".
4. Let Angie notice the new addresses (a pause of a few seconds).
5. Stop the old instances, leaving thirty seconds for requests already in flight.
6. Update the Temporal workers and re-register the schedules (repeating is safe).
7. Gracefully reload Angie's configuration and check the home page.

If a new instance does not become ready in time, it is removed, the site keeps running on the previous version, and the deploy exits with an error. This scheme implies a rule for migrations: they must work with the old code too while the swap is in progress. Add a column first, use it in the next release, and delete or rename only a release after that. Anything incompatible ships separately, behind the maintenance page.

## One guestbook post: what happens behind the scenes

A good way to see how it all fits together is to follow a single message. For scale: the guestbook is twenty years old and holds 479 thousand messages across twenty-two thousand pages; word search in that pile is backed by a `pg_trgm` index — 35 milliseconds instead of 283 without it.

1. Someone writes a message with a link to an article. The form carries a one-time key, so a double click duplicates nothing.
2. The handler checks the rules (red card, pause between messages, repeats, length) and stores the message. The text is parsed by our own markup: only an allowed set of tags is accepted, everything else is escaped.
3. After the transaction commits, the handler emits a "message appeared" event.
4. Listeners flush the cache for that message, publish a hint to Centrifugo, notify agents, and request link cards.
5. **A hint, not the text.** The channel carries only `{type: message, id: 123}`. After a random pause (from three tenths of a second to just over three seconds, hints batched, at most ten messages at a time) open pages fetch that message from the server themselves. So the server gives every reader exactly what they are allowed to see. Text hidden by a red card never leaves the server for someone who may not read it. The random pause exists so that thousands of pages don't come for the update in the same second after a goal.
6. In parallel, the link goes into the outbox and then into a Temporal workflow that visits the page, extracts the title, description and image, and stores the card.
7. When the card is ready, another "changed" event goes out for the message. Open pages fetch it again, and the card appears in place without a reload.

The guestbook, comments, private messages, match scores and stories all use this same scheme: a separate event, a hint, a fetch for fresh data.

### How link cards are protected from tricks

The URL for a card comes from a stranger, so they may try to make the server reach into the internal network. Therefore:

- only http and https are allowed, and only ports 80 and 443;
- only public addresses are allowed (internal networks, loopback and the cloud metadata address are rejected);
- the client resolves the host name itself, checks every address against the same policy, and pins the connection to the checked address, so DNS rebinding gets nowhere;
- every redirect is checked again, and there are at most three;
- response size and time are capped, and only pages (HTML) are accepted;
- the image is downloaded to us, optimised and served from our own address: the reader never goes to the foreign site.

The text of a foreign card is always escaped on output: other people's words never become our markup.

## Data: where matches come from

**Migration from the old site.** Data is read from the old site's database and moved idempotently: running it again duplicates nothing, and a row that had to be skipped goes into a report with the reason. The old database is dirty (orphans, duplicates, zero dates), so the rules for its quirks are written into the tasks, and the totals after migration are reconciled with the old database's totals. Fans kept their IDs: the profile `/user/profile/832` is where it always was. Old URLs answer with a 301 redirect to the new ones.

**Match reports.** There are several sources: API-Football for football (line-ups with shirt numbers, formation, events, substitutions), league and club sites for hockey and basketball (the KHL, MHL and VHL hockey leagues, basketball box scores), manual entry by an editor, and parsing a pasted report text with a language model. Each source has a check on the response shape: if an API changes its format, it shows up immediately, not a week later as strange data.

**Models are not trusted.** This is an important rule: parsing a report from text with a language model produces only a draft. Nothing is saved automatically; an editor saves it with an ordinary button. Names are matched to the reference data by code, not by the model. The score is computed by code (goals from events against the match score, periods against the total), and any mismatch is shown as a warning. When, on a real report, the model recorded our players' goals as the visitors', the side of an event started being determined by the line-up instead of by the model's answer. The report text is treated as foreign data: in the prompt it sits inside delimiters, and the instructions say outright not to follow any requests found in it.

**Auto-updates and manual edits live together.** During a match a schedule writes the report from the API once a minute. Meanwhile an editor may fix a player or an event. So that the automation does not overwrite manual edits, it remembers which report it wrote itself, computes the difference with what is there after the edit, and applies those edits on top of every new API response. The editor resolves conflicts. The report page shows the number of manual edits and has a "hand back to automation" button.

**The "match of the day" story.** A flagged match gets a story by itself: an announcement first, then the result. A day after the match ends the story goes back to drafts (the period is configurable).

## Security and privacy

- Registration is by invitation only (one invitation brings one person) and is confirmed with a code from an email. The code lives thirty minutes, a code from any of the last three emails works, and a request gets three attempts. The sign-in code lives ten minutes, also with three attempts, and failed sign-ins are counted per email address and per visitor.
- Roles are stored as access-control assignments, not in a column. A person has one role, and the code checks permissions for specific actions, not the role.
- Every staff action is written to a log: who changed what and when.
- All HTML output is encoded by a function that also escapes quotes.
- Uploaded photos are stripped of metadata (which can include coordinates and the phone model), and rotation is applied to the pixels themselves.
- Uploaded files are stored by content (the same picture from different places is one file), and old URLs redirect to the new ones.
- A personal agent's key is stored in the database only as a hash, is issued under conditions (the account is older than seven days and has no red card), expires after ninety days, and there can be at most three active keys.

## For people and for robots

**Personal agents (MCP).** A fan can give a key to their own AI agent, which then reads the guestbook and, if the owner wants, writes to it. An agent is the same fan with the same rules. It has no moderation tools at all, and a dedicated test makes sure no tool name mentions cards or bans. Writing happens in one of several modes: ask in the client, leave a draft, or post immediately (the last one can be turned off in settings). Texts from the feed are treated as data, not commands: the agent is told outright not to follow requests found in other people's messages.

**A site that is friendly to robots.** The sitemap is assembled in parts (ten thousand URLs each) and warmed up in advance so the crawler doesn't wait for it. Every page has a Markdown version (via the `Accept` header or a `.md` suffix), there is an `llms.txt`, and the JSON-LD markup is built from the same data as the page. For browsers with WebMCP the site enables page-reading tools.

**Telegram.** The bot is linked to an account with a code, sends notifications about replies and mentions (by subscription) and accepts guestbook posts via a command. The mini app opens the site right inside Telegram: sign-in uses Telegram's signed data (signature and freshness are checked) for accounts that are already linked. Channel announcements go out when an editor presses a button; the only thing that can go out on a schedule is "on this day in history", and only if it is turned on in settings. Telegram's Bot API host, `api.telegram.org`, can be unreachable from servers in Russia, where the authorities restrict Telegram at times, so Bot API calls can go through a relay abroad.

## My packages

Everything that is not specific to CSKA lives in separate `rasuvaeff/*` Composer packages. Each has its own repository, tests, versions and build. I work on them in a monorepo workspace, and they are published separately. The project uses 36 of them: 31 the site needs at runtime and 5 more only for tests. Here are the main ones, with examples of how they are used.

### Data and queries

- **[specification](/packages/specification).** Query conditions as values. The calendar and statistics are built on them: a rule is written once and works both in SQL and on an object in memory.
- **[result](/packages/result).** A "success or reason for refusal" type. Write handlers return it instead of throwing for expected situations.
- **[schema](/packages/schema).** Checking the shape of incoming data: external API responses (if the format changed, the message names the path to the broken field), language model responses, Telegram's signed data.
- **[duration](/packages/duration).** Readable intervals instead of bare numbers: the language model circuit breaker's pause is written as `cooldown: Duration::seconds(120)`, not just `120`, and nobody has to guess whether it is seconds or milliseconds.

### Reliability

- **[yii3-outbox](/packages/yii3-outbox) and [yii3-outbox-db](/packages/yii3-outbox-db).** Delivering important jobs without loss (covered above).
- **[yii3-idempotency](/packages/yii3-idempotency) and [yii3-idempotency-redis](/packages/yii3-idempotency-redis).** Resubmitting a form does not create a duplicate; the replay responses are kept in Redis.
- **[circuit-breaker](/packages/circuit-breaker).** The circuit breaker around the language model.
- **[bulkhead](/packages/bulkhead).** A limiter for concurrent calls (ffmpeg for thumbnails).
- **[yii3-health-check](/packages/yii3-health-check) and [yii3-maintenance-mode](/packages/yii3-maintenance-mode).** Health checks for deploys and a maintenance page for planned work.

### Settings and control

- **[yii3-settings](/packages/yii3-settings) and [yii3-settings-db](/packages/yii3-settings-db).** Settings that editors change in the admin panel without a deploy: the pause between messages, page size, limits, how long the match-of-the-day story lives. Each setting declares its type, default and allowed range.
- **[yii3-feature-flags](/packages/yii3-feature-flags) and [yii3-feature-flags-db](/packages/yii3-feature-flags-db).** Flags for staff: turn a feature on selectively without a deploy.
- **[yii3-audit-log](/packages/yii3-audit-log) and [yii3-audit-log-db](/packages/yii3-audit-log-db).** The "who changed what" log. Secrets in it are masked.
- **[yii3-api-problem](/packages/yii3-api-problem) and [yii3-correlation-id](/packages/yii3-correlation-id).** A single error format and a request ID that runs through all the logs.

### Media and the outside world

- **[link-preview](/packages/link-preview) and [pinned-http-client](/packages/pinned-http-client).** Link cards (adapters for YouTube, VK, Telegram, Rutube and others, plus generic page parsing) with the address-spoofing protection described above.
- **[media-converter](/packages/media-converter).** ffmpeg from PHP: operations are described as values (transcode, trim, grab a frame, prepare for streaming), and the command is built strictly, with retries and time limits.
- **[yii3-centrifugo](/packages/yii3-centrifugo).** Live updates.
- **[yii3-seo](/packages/yii3-seo).** Page metadata, sitemap, `robots.txt`.
- **[yii3-mcp](/packages/yii3-mcp) and [yii3-mcp-audit-log-bridge](/packages/yii3-mcp-audit-log-bridge).** The door for personal agents and the log of their calls.
- **[yii3-telemetry](/packages/yii3-telemetry) and [yii3-telemetry-otel](/packages/yii3-telemetry-otel).** Request traces.
- **[context](/packages/context) and [context-http](/packages/context-http).** Request deadlines and cancellation. Every request to the site, the admin panel and the agents' door has a time budget (when it runs out, the answer is 504); for now only the diagnostic probe route passes that deadline further down the call chain.

### What this approach gives

- An improvement or fix is made once and reaches every project that uses the package.
- Each package has its own tests, versions and an automatic backward-compatibility check: a breaking change cannot slip into a minor version.
- The site itself stays a thin layer: CSKA's domain logic and glue. The project doesn't need to think about how the outbox or idempotency work: the package has solved that.
- A package can be read and checked apart from the whole site, so the boundaries are clear even to a newcomer.

There is a price: packages need maintenance, releases and compatibility tracking. I accepted that price deliberately: it pays off where the same mechanism is needed in several projects.

## Packages that help with testing

A separate word about four tools from `require-dev` (five packages: understudy has a separate bridge to Testo, [understudy-testo](/packages/understudy-testo)). They make tests stronger than "writing checks by hand". Alongside them work the [Testo](https://php-testo.github.io/) test framework and [Infection](https://infection.github.io/) for mutation testing (those are not mine).

### [property-testing](/packages/property-testing-testo): property-based tests

An ordinary test checks a few examples someone came up with. A property test states a rule that must always hold, and a generator comes up with thousands of inputs, finds a counterexample and shrinks it to the shortest one. The project uses the Testo adapter; the engine is [property-testing-core](/packages/property-testing-core). Here is a real test from the project about resolving a visitor's address behind a proxy:

```php fragment
/**
 * The visitor writes the left side of the header:
 * they cannot override the address our proxy appended on the right
 */
#[Property(runs: 300)]
public function whatTheVisitorWroteOnTheLeftNeverWins(string $forged, int $last): void
{
    $real = '203.0.113.' . $last;

    Assert::same(
        ClientIp::resolve(peer: '10.0.0.2', forwarded: $forged . ', ' . $real, proxies: '10.0.0.0/8'),
        $real,
    );
}
```

Whatever the visitor puts in the header (three hundred random strings per run), the real address wins. And here is a test for the guestbook markup: whatever the author types, the resulting page may contain only our own tags:

```php fragment
#[Property(runs: 800)]
public function onlyOurOwnMarkupSurvives(string $source): void
{
    $html = GuestText::html(source: $source, mentions: ['kran' => 832]);
    $allowed = [
        '~^</?(?:b|i|blockquote|summary|details|a)>$~',
        '~^<br>$~',
        '~^<b class="mention">$~',
        '~^<details class="spoiler">$~',
        '~^<a class="mention" href="/(?:guest|user/profile)/\d+">$~',
        '~^<a href="https?://[^"<>\s]*" rel="nofollow noopener ugc" target="_blank">$~',
    ];
    preg_match_all(pattern: '~<[^>]*>~', subject: $html, matches: $tags);
    foreach ($tags[0] as $tag) {
        Assert::true(array_reduce(
            $allowed,
            static fn (bool $ok, string $pattern): bool => $ok || preg_match($pattern, $tag) === 1,
            initial: false,
        ));
    }
    Assert::false(str_contains(
        preg_replace(pattern: '~<[^>]*>~', replacement: '', subject: $html) ?? '',
        needle: '<',
    ));
}
```

The generator for this test builds its input from dangerous pieces: `<script>`, unclosed markup tags, quotes, `javascript:`, mentions, line breaks.

What this approach found:

- A link in the guestbook could inject a foreign event handler (`onmouseover`) into the page: quotes were not escaped on output. Now it is output through a function that also escapes quotes, and a separate architecture test forbids the old one.
- Transliteration of names is ambiguous: the same letters ("zh", "ia") map to different words, and no "improvement" could fix that. The finding stayed in the test as an example.
- The language model sometimes answers with an empty object, `{}`. Such an answer must be rejected rather than turned into an empty match report.

Two more important traits. A counterexample, once found, is remembered and checked first on later runs, so a regression is not lost even if the run that found it was "lucky". And for branching properties you can require that each branch is actually reached in at least a few percent of runs.

### understudy: test doubles without magic

Classic mocking frameworks often turn a test into a retelling of the implementation. [Understudy](/packages/understudy) is simpler: a call is specified with a closure, and the double has nothing beyond the contract.

```php fragment
$search = Understudy::for(NicknameSearch::class);
expect(fn () => $search->startingWith('KR', 8))
    ->returns([new NicknameHint(id: 1, nickname: 'KR1')]);

$found = (new FindNicknamesHandler($search))->handle(prefix: ' KR ');

Assert::same($found[0]->nickname, expected: 'KR1');
Understudy::nothingElse($search);   // and nothing else was asked
```

First you describe the expected call with its arguments, then you check that it happened and nothing extra did. We only double the outer boundaries: network, email, Temporal, Centrifugo. **We never fake the database in tests.** Repository tests and whole-application tests run against a real PostgreSQL (a separate database whose name must end in `_test`, so a test physically cannot reach the working database), and every test runs inside a transaction that is rolled back. For integration tests the whole application runs in a single process: a real PSR request goes in, real responses come out.

### mutation-history: so test quality doesn't drop silently

Mutation testing deliberately breaks the code (flips a condition, removes a call, swaps a constant) and watches whether any test notices. The share of caught breakages is called MSI. If no test noticed that a condition was flipped, the tests are checking the wrong thing. The project's threshold is 95%; the latest full run scored 96% out of roughly 16,800 mutants (domain, application, and the parsers for league sites and API-Football). The [mutation-history](/packages/mutation-history) package keeps the history of runs, and each new run is compared with the previous one: a mutant that used to be caught is not allowed to survive. Quality cannot drop silently: a new class without a test lowers the score immediately.

From practice: a data provider (`#[DataProvider]`) runs while the tests are being collected, that is, outside the measured run. Code that executes only inside a provider is invisible to coverage, and its mutants count as not covered no matter how many tests use it. So tests meant to kill mutants build their inputs in their own body. And a mutant that changes nothing in observable behaviour stays in the report as it is rather than being silenced in the configuration.

### [rector-named-literals](/packages/rector-named-literals)

Adds argument names automatically (`format(format: 'H:i')`). A small thing, but all the code reads without looking up signatures, and the rule needs no discipline from a human: Rector suggests the fix itself, and the build fails until it is applied.

### Tests in summary

| Suite | Tests |
|---|---|
| Unit | 3869 |
| Integration (real PostgreSQL, the whole application) | 1477 |
| Total | 5346 |

- Property tests for rules with a large input space: the Kumir standings, the visitor's address behind a proxy, upload paths, guestbook markup, daily sign-in caps, and much more.
- Smoke scenarios: they bring up the whole stack and check the site end to end (live updates, emails from the worker, link cards against a fake "foreign site", deploys).
- A separate load-testing rig, and it has already paid for itself: once it showed that planning the calendar query with ten joins cost more than executing it (20–50 ms against under a millisecond). Fixing the join order at the database level brought the pages' p95 down from 234 to 104 ms and halved the database's CPU.
- Line coverage is 80% (88% without migrations and the legacy import, which have their own checks against a real database). We don't chase 100%: line coverage is easy to game, so the project's threshold is a mutation one — it checks that the tests notice breakage at all.

## How it was written: together with Claude Code

In short: I make the decisions, Claude Code writes the code, tests, migrations and documentation, and the checks — not the confidence of an answer — keep the result honest.

**Who is responsible for what.** What we build, which rules apply, in what order, how it should look, what we ship and when: I decide that. Claude Code handles the craft: it writes handlers, tests and migrations, fixes layouts, investigates failures, keeps the documentation and reviews changes. Any decision that changes how the site behaves for people, I make myself. Deploys and publishing happen only on my explicit command.

**The rules live in the repository, not in my head.** The project and every package have an `AGENTS.md`: what this code is, which commands to run, which traps are already known. That is where the "golden rules" go. For example: you can't say "done" without a fresh green run of the checks, you can't suppress analyser warnings, and any interface change updates the documentation and examples. When the agent or I step on a rake, a rule is added along with the date and a description of the case. That way a mistake stops being "knowledge from one conversation" and becomes a project rule.

**Skills.** The repository holds instruction sets for specific areas: architecture and layers, database rules, the guestbook, working with API-Football, testing, checking the UI in a real browser. The agent loads the right one when it takes on such a task. My packages ship with their own skills and an `llms.txt` (a short API reference for AI), so the assistant uses a package correctly instead of guessing.

**Checks as the guarantor.** AI makes mistakes, and that is fine. So trust comes not from how confident an answer sounds but from what is green in the checks: unit and integration tests, property tests, Psalm at level 1, deptrac, Rector, mutation testing. If the agent breaks something, the build says so before a human does. The agent checks the UI in a real browser: it opens the page, clicks, takes a screenshot and looks for console errors, creating a temporary account when needed and cleaning up after itself.

**Guardrails.** Dangerous commands (a hard git reset, for example) are blocked by a hook and won't run without my go-ahead. Secrets and keys that flash by in a conversation are not saved in files or in memory. Production deploys and package publishing happen only on an explicit command, and if something looks risky, the agent names the risk first and then asks.

**What it gives in practice.** The speed went into creative work and quality: routine work (data migration, tests for every branch, bilingual package documentation, a review of every change) no longer costs hours. But the cost is different: you have to be able to formulate rules, read someone else's code quickly, and not mistake green for correct until you understand what exactly is being checked. That is why half of this project is not code but the rules and checks around it.

## What isn't there yet

So as not to create an illusion of perfection. Not finished yet: players for some social networks in link cards, writing through WebMCP (the spec has no action confirmation yet), the application's own per-route metrics (there are traces, no metrics), and cards for the oldest guestbook messages, which are being processed gradually.

## Wrapping up

A site that is more than twenty years old, with an unreleased Yii2 version already behind it, has been rebuilt together with Claude Code so it can keep evolving without fear of breaking something. Layers that are checked automatically. A database that won't accept a bad row. Deploys without downtime. Reliable delivery and replay protection, moved into packages. And a lot of tests, some of which test the tests themselves.

If you'd like to see it working live, the site is public: [cska.in](https://cska.in/).
