+++
title = "Self-signed certificates with mkcert"
date = 2023-12-26

[taxonomies]
tags = ["mkcert", "tls", "ssl", "certificate", "self-signed", "sticky note", "localhost", "domain"]
categories = ["default"]

[extra]
has_hero = false

[[extra.suggestions]]
text = "Get a self-signed certificate with openssl CLI"
link = "/posts/2023/12/sticky-notes-self-signed-certificate/"
+++

In a [previous sticky] I briefly put down how to get a quick'n'dirty self-signed TLS[^tls] certificate, but also mentioned [mkcert.dev], which makes it a bit better for some use cases.

## Install mkcert

```sh
# Windows, with scoop (it's like homebrew)
scoop bucket add extras # skip if you have done this already
scoop install mkcert
```

Non-Windows users find more ways under [mkcert install].

## Prepare

```sh
mkcert -install
```

This creates a CA certificate and puts it into the places to get it trusted; at least it tries to. This needs to be done only once.

Windows users: Run this in a powershell *with administrator privileges,* otherwise some steps might fail!

## Generate some useful certificates

```sh
# powershell (uses ` instead of \ for multiline commands)
mkcert `
  -ecdsa `
  -cert-file mydomains.pem `
  -key-file mydomains-key.pem `
  markentier.test "*.markentier.test" `
  unicorn.test "*.unicorn.test" `
  rainbow.test "*.rainbow.test" `
  localhost `
  127.0.0.1 ::1
```

Notes:

* The PEM files (certificate and key) will be created in the location where you executed this command.
* Remove `-ecdsa` option if you have troubles with this algorithm.
* The certificate will be usable for some fake domains, both with and without a subdomain (only a single level[^many]).
* Those domains shouldn't be public internet stuff, thus `.test` is a nice top-level domain to pick, as it's reserved for—you guessed it—testing.
* The certificate will expire in 2 years and 3 months. Apparently also not configurable at all.
* Yes, you can add many different domains into a single certificate; that's how some interwebz providers do as well.
* Adding `localhost` for good measure …
* … as well as the local loopback IPs in v4 and v6.

## Bonus: Get a .pfx file

For some things you might need a PFX file instead of just the PEM. With the `openssl` tool you can create one.

```sh
# powershell
openssl pkcs12 -export `
  -out mydomains.pfx `
  -inkey mydomains-key.pem `
  -in mydomains.pem
```

While `mkcert` also comes with a `-pkcs12` option, I usually create the regular PEM version first and only get a PFX derived from that if needed.

## Bonus: Custom domains to localhost

Not a mkcert issue, but you want to add some entries to your `/etc/hosts` file if you do web development. For Windows users that's under

```txt
C:\Windows\System32\drivers\etc\hosts
```

### Example

Using some of the domain names from above:

```ini
### markentier.test
127.0.0.1 markentier.test www.markentier.test web.markentier.test
::1 markentier.test www.markentier.test web.markentier.test

### unicorn.test
127.0.0.1 unicorn.test www.unicorn.test web.unicorn.test
::1 unicorn.test www.unicorn.test web.unicorn.test

# insert more as needed
```

Notes:

* if you have [PowerToys] installed, it ships with a hosts file editor; this way it's less likely to mess it up
* Interestingly it also notes that you can only add up to 9 hosts per address (per line I guess). I never tried, but I also chunk my definitions up into multiple address mappings anyway
* As you might have noticed, no wildcards allowed

-----

That's it.

Have fun with your custom testing domains. Now you can build apps expecting TLS, like PWAs (service workers), or using QUIC and gRPC protocols.

<!-- footnotes -->

[^tls]: Reminder, only marketing "needs" to talk about SSL, but as said in the past, you definitely only want to use the **TLS** versions of the protocol, nothing else. (Ideally TLS v1.3, but version 1.2 is still fine.)

[^many]: To create more levels of subdomain, you probably need to specify each level with one wildcard, like `my.domain *.my.domain *.sub1.my.domain *.sub2.my.domain *.subsub.sub1.my.domain` … and so on …

<!-- links -->

[previous sticky]: @/posts/2023/12/sticky-notes-self-signed-certificate/
[mkcert.dev]: https://mkcert.dev/
[mkcert install]: https://github.com/FiloSottile/mkcert?tab=readme-ov-file#installation
[PowerToys]: https://github.com/microsoft/PowerToys
