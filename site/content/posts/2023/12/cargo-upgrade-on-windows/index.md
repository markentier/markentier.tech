+++
title = "cargo upgrade on Windows"
date = 2023-12-31

[taxonomies]
tags = ["rust", "cargo", "upgrade", "dependencies", "windows", "powershell"]
categories = ["default"]

[extra]
has_hero = false

[[extra.suggestions]]
text = "Sticky Notes: cargo upgrade"
link = "/posts/2023/12/sticky-notes-cargo-upgrade/"
+++

I use Windows 11 as my main OS on my home PC, so I have to tweak some of my commands for that environment. The previously mentioned [cargo upgrade] is no exception.

## Installation (Windows)

```sh
cargo install cargo-edit `
    --no-default-features `
    -F upgrade,vendored-libgit2 `
    --bin cargo-upgrade
```

Note: Every time you see a `\` somewhere, replace it with `` ` `` to make it work in Powershell. You can also install some other shells like Bash, but making those your default is probably combined with a lot of unnecessary pain.

## Usage

Since `cargo` moved to a new index protocol (`sparse`)[^sparse], some tools like `cargo upgrade` do not really work anymore by default, since they rely on the "old" git protocol.

And since the cargo team promises to support the git indices indefinitely, we can still use them.

The Powershell version looks like this:

```sh
powershell -Command {
  $env:CARGO_REGISTRIES_CRATES_IO_PROTOCOL="git";
  cargo fetch;
  cargo upgrade
}
```

Notes:

* we subshell to set a temporary env var
* if you use Powershell 7 or newer, the command might be `pwsh` instead
* since the commands are wrapped in a block (`{ … }`), no backticks needed anywhere — neat!
* the semicolons are needed as we execute 3 commands in total (setting the env var is a command on its own)

## 2024 and beyond

Considering that most snippets, guides, and tutorials out there assume a Linux(-like) environment I might just go forward and always post the Windows/Powershell variant instead. I'm pretty sure I am not the only Windows+Rust developer in the universe.

_Note: **No OS love or hate here.** I use all three major platforms on a regular/daily basis, I understand the trade-offs I'm making by choosing one over the other for my tasks._

<!-- footnotes -->

[^sparse]: See announcement under <https://blog.rust-lang.org/inside-rust/2023/01/30/cargo-sparse-protocol.html>

<!-- links -->

[cargo upgrade]: @/posts/2023/12/sticky-notes-cargo-upgrade/index.md
