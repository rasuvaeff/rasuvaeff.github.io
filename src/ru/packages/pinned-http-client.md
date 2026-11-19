---
title: pinned-http-client
package: pinned-http-client
section: 3
layout: man
description: "PSR-18 клиент для недоверенных URL, который привязывает соединение к проверенным адресам."
---

## ИМЯ

pinned-http-client — PSR-18 клиент для недоверенных URL, который привязывает соединение к проверенным адресам

## ОБЗОР

<ManInstall />

```php
$client = new PinnedClient(); // public addresses only, IPv4 + IPv6, 8 s / 4 s, body <= 10 MiB, no proxy

try {
    $response = (new RedirectFollower($client))->sendRequest(new Request('GET', $untrustedUrl));
} catch (RequestRefused $refused) {
    $refused->reason; // Refusal::UnsupportedScheme | MissingHost | AddressNotAllowed
} catch (ResponseTooLarge $tooLarge) {
    // the body (decompressed) passed maxBodyBytes; the transfer was cut
} catch (ClientException $failed) {
    // TransferFailed (connection, TLS, timeout), ResolutionFailed (DNS) or TooManyRedirects
}
```

## ОПИСАНИЕ

PSR-18 клиент для недоверенных URL. Он резолвит хост один раз, проверяет каждый адрес и привязывает к ним cURL.

DNS может ответить проверке публичным адресом, а последующему запросу — `127.0.0.1` или `169.254.169.254` (метаданные облака). Проверка имени хоста не защищает от SSRF.

- Резолвит хост один раз (IPv4 и IPv6) и проверяет каждый адрес.
- Передаёт cURL ровно проверенные адреса. TLS по-прежнему проверяет имя хоста.
- Политика по умолчанию `PublicAddresses` отклоняет приватные, loopback, link-local, CGNAT и multicast диапазоны.
- Собственные интерфейсы `AddressPolicy` и `Resolver`.
- Лимит тела считает распакованные байты, поэтому gzip-бомбы обрываются на лимите.
- `RedirectFollower` заново резолвит, проверяет и привязывает каждый hop.
- Игнорирует `HTTP_PROXY` / `HTTPS_PROXY` из окружения; прокси включается явно через `proxy:`.
- Типизированные ошибки: `RequestRefused`, `ResolutionFailed`, `ResponseTooLarge`, `TransferFailed`, `TooManyRedirects`.

## ПРИМЕРЫ

Политика по умолчанию пропускает только публичные адреса; частные, loopback и link-local отклоняются, а IPv4-mapped адрес оценивается как вложенный в него IPv4.

```php
$policy = new PublicAddresses();

foreach (['93.184.216.34', '::ffff:8.8.8.8', '127.0.0.1', '10.0.0.5', '169.254.169.254', '::ffff:10.0.0.1', 'fd12::1', '100.64.0.1'] as $address) {
    echo str_pad($address, 24), $policy->allows($address) ? 'allowed' : 'refused', "\n";
}
```

Собственный AddressPolicy ослабляет или ужесточает правило, например пропускает хост разработки.

```php
final readonly class PublicOrLoopback implements AddressPolicy
{
    public function __construct(private AddressPolicy $inner) {}

    public function allows(string $address): bool
    {
        return $address === '127.0.0.1' || $this->inner->allows($address);
    }
}

$client = new PinnedClient(policy: new PublicOrLoopback(new PublicAddresses()));
```

## СМОТРИТЕ ТАКЖЕ

`link-preview` рекомендует его как PSR-18 клиент для своего `Fetcher`.

## ОШИБКИ

`timeoutSeconds` не ограничивает DNS-резолвинг, а враждебный системный резолвер вне области защиты. С явным прокси граница SSRF переходит к прокси.

Требует `ext-curl`, `ext-filter`, Guzzle 7.9 и интерфейсы PSR HTTP.
