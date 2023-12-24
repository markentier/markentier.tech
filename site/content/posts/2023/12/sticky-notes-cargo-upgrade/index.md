+++
title = "Sticky Notes: cargo upgrade"
date = 2023-12-24

[taxonomies]
tags = ["rust", "cargo", "upgrade", "dependencies", "sticky note"]
categories = ["sticky-notes"]

[extra]
has_hero = false
+++

While cargo already has most common commands integrated, one I miss from [cargo-edit] is `cargo upgrade`. It's super convenient if you want to bump all dependencies at once to the latest (in)compatible version.

This is how to install just this single executable:

```sh
cargo install cargo-edit \
    --no-default-features \
    -F upgrade,vendored-libgit2 \
    --bin cargo-upgrade
```

Notes:

* `--no-default-features` to avoid building all commands from a compilation perspective
* `-F upgrade` to opt-in for the upgrade command (it's a required feature for the binary)
* `--bin cargo-upgrade` to actually say, we want just this binary from the project, not all of them
* `-F vendored-libgit2`: readding from the default features

<!-- links -->

[cargo-edit]: https://crates.io/crates/cargo-edit
