---
title: pinned-http-client
description: PSR-18 client for untrusted URLs that pins the connection to checked addresses.
outline: [2, 2]
---

# pinned-http-client

A PSR-18 client for untrusted URLs. It resolves the host once, checks every address and pins cURL to them.

<PackageMeta slug="pinned-http-client" :src="14" :tests="6" />

## The problem

DNS can answer a public address to the check and `127.0.0.1` or `169.254.169.254` (cloud metadata) to the later request. Checking the host name is not an SSRF defence.

## What it does

- Resolves the host once (IPv4 and IPv6) and checks every address.
- Passes exactly the checked addresses to cURL. TLS still verifies the host name.
- `PublicAddresses` default policy refuses private, loopback, link-local, CGNAT and multicast ranges.
- Custom `AddressPolicy` and `Resolver` interfaces.
- The body limit counts decompressed bytes, so gzip bombs are cut at the limit.
- `RedirectFollower` re-resolves, re-checks and re-pins every hop.
- Ignores `HTTP_PROXY` / `HTTPS_PROXY` from the environment; a proxy is opt-in via `proxy:`.
- Typed failures: `RequestRefused`, `ResolutionFailed`, `ResponseTooLarge`, `TransferFailed`, `TooManyRedirects`.

## Example

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

## Used by

`link-preview` recommends it as the PSR-18 client for its `Fetcher`.

## More examples

The default policy allows only public addresses; private, loopback and link-local ones are refused, and an IPv4-mapped address is judged as the IPv4 it carries.

```php
$policy = new PublicAddresses();

foreach (['93.184.216.34', '::ffff:8.8.8.8', '127.0.0.1', '10.0.0.5', '169.254.169.254', '::ffff:10.0.0.1', 'fd12::1', '100.64.0.1'] as $address) {
    echo str_pad($address, 24), $policy->allows($address) ? 'allowed' : 'refused', "\n";
}
```

A custom AddressPolicy relaxes or tightens the rule, for instance to let a development host through.

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

## Limits

`timeoutSeconds` does not bound DNS resolution, and a hostile system resolver is out of scope. With an explicit proxy, the proxy becomes your SSRF boundary.

Requires `ext-curl`, `ext-filter`, Guzzle 7.9 and PSR HTTP interfaces.
