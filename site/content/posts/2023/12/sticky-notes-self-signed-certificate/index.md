+++
title = "Sticky Notes: Self-signed Certificate"
date = 2023-12-25

[taxonomies]
tags = ["tls", "ssl", "certificate", "self-signed", "sticky note"]
categories = ["sticky-notes"]

[extra]
has_hero = false
+++

Sometimes I need a TLS[^tls] certificate, for some *local* HTTPS or other services/protocols with some level of security to play nicely.

Make sure you have `openssl` installed on your computer. Then run:

```sh
openssl req -nodes -new -x509 \
  -keyout server.key -out server.crt \
  -subj '/C=EU/L=Berlin/O=MarkentierTech/CN=myservice'
```

Notes:

* replace values for the parameters (`C`, `L`, `O`, `CN`) to your needs
* a self-signed certificate is usually not considered secure by browsers; you might need to add them manually to the necessary certificate stores
* use [mkcert.dev] if you need something slightly more sophisticated

-----

Similar name, but different use case: [mkcert.org] — to get a PEM file of certificates you want to trust. For example if you want to build/use apps with custom certificate trust store.

<!-- footnotes -->

[^tls]: Yep, I will only talk about TLS, we should really forget about SSL, because despite marketing those protocol versions shall never be used again.

<!-- links -->

[mkcert.dev]: https://mkcert.dev/
[mkcert.org]: https://mkcert.org/
