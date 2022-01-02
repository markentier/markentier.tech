+++
title = "Speedy Rust builds under WSL2"
date = 2022-01-01

[taxonomies]
tags = ["rust", "cargo", "WSL2", "WSL", "windows", "subsystem", "linux", "compile", "build", "time", "slow", "run", "speed", "Windows 10"]
categories = ["default"]

[extra]
has_hero = true
image_alt = "Speed up like a hedgehog … you know they're fast!"

[[extra.suggestions]]
text = "Speedy git status under WSL2"
link = "/posts/2020/10/faster-git-under-wsl2/"
+++

Developing on Windows & Linux? Using WSL2 but repos are on NTFS disk? Having slow build times? Then compile elsewhere!

<!-- more -->

I have been using Windows 10 as my main operating system for quite some time now (~ 3 years). And generally I'm also quite happy with it, even for software development purposes which do not target Windows itself as a platform.

For example I play with and build Rust programs which usually need to run in a non-Windows environment like Linux. The folks in Redmond made it a pretty nice experience with WSL2 (Windows Subsystem for Linux, version 2). But one huge issue remains: speed across file system/VM boundaries.

More specifically: if you have a project on an NTFS partition and use it within a Linux guest via WSL, then you might notice very slow operations when it comes to file handling.

I wrote about this a while ago [for git command related issues.][git] The trick there was to use the correct git from either side (WSL/Linux vs Windows), but that won't help you in all cases.

If you already use your Linux only tools you still get impacted by the file system, … and Microsoft still hasn't made progress on this issue. I guess we will have to wait for a WSL3 probably.

Usually the recommendation is to host your files in a Linux file system within WSL2, but as I mentioned in my git post above I don't really want that. One reason is that using such projects directly under Windows becomes cumbersome again (try find a reliable and affordable tool to mount Linux file systems in Windows, none of the existing solutions really increase my confidence so far).

Recently I participated in the [Advent of Code] (AoC), well at least until day 15, after that the puzzles became a lot of work and I didn't feel like spending further time on them considering I also wanted a bit of a break from work itself.

Anyway I learned still quite a lot:

* I am definitely more confident and comfortable in writing decent Rust code. Some puzzles come with almost no allocations after the input data fetching and parsing.
* Rust performs pretty well under Windows, both in compilation and runtime.
* Rust performs pretty well under Linux for the runtime part.
* Rust compilation under WSL2/Linux was quite poor though.

The last part was actually quite annoying, since the compilation times were significantly higher in the WSL2 environment than in the host. And after a while I got reminded of the git issue I had.

Since I was compiling a lot I definitely wanted to address the issue and I came up with a quite decent solution.

_What if we compile on a Linux file system and therefore just shuffle around files?\*_

<small>*) smartly!</small>

## There and Back Again

The idea is the following:

* copy all necessary project files into a temporary location within WSL on a Linux file system
* compile the project
* copy back the artefacts (executables) — if needed
* run the program(s)

Things to skip on the way are:

* whole `target` folder - we neither want the data from either location copied into the other
* optionally: `.git` folder - unless the build depends on git data, we can skip it; in the future it might be also possible to just set some environment variables if the build script and/or dependency can work with it

While `cp` is okay as a tool I actually went for `rsync`, as it provides a nicer interface when it comes to ignoring paths. And as far as I know it's also smarter about if and what to copy over.

Bonus level: using a RAM disk as a temporary build location. But this is definitely optional.

First as a teaser the compilation time comparison:

```sh
# in WSL2, clean builds (cargo clean before a cargo build)

# - from NTFS location:
Finished dev [unoptimized + debuginfo] target(s) in 1m 30s

# - from "Linux" (ext4) location:
Finished dev [unoptimized + debuginfo] target(s) in 21.39s
# ~ 4 times faster
```

And the results for release builds (opt-level 3, lto, codegen-units 1):

```sh
# - from NTFS location:
Finished release [optimized] target(s) in 2m 00s

# - from "Linux" (ext4) location:
Finished release [optimized] target(s) in 48.27s
# ~ 2.5 times faster
```

I consider that a huge boost. Especially on warmed dev builds that allows for very quick compile+run tests if one desires. A changed `println!` can recompile in roughly one and a half seconds instead of twenty for example.

### So how to replicate such improvement?

First designate a location which is in the realm of your Linux environment, your home folder might be a good start.
Since I use it for temporary builds, I always have a user `tmp` folder, so the full path would be `/home/<username>/tmp`. Under that you might then prefer to have your project folder name repeated to easily find the stuff again.

Second you need to have `rsync` installed. On a Debian or Ubuntu system the following command should help:

```sh
sudo apt install rsync
```

And if you like a tiny bit of automation I still recommend `make`:

```sh
sudo apt install make
```

But you can adapt the following snippets for your build environment as well (maybe you prefer [just] or [cargo-make] for example).

```Makefile
# very minimal setup

STATIC_TMP_DIR  = ~/tmp/my_speedy_build_project

build.wsl: wsl.sync
	cd $(STATIC_TMP_DIR) && cargo build

run.wsl: wsl.sync
	cd $(STATIC_TMP_DIR) && cargo run

wsl.sync:
	mkdir -p $(STATIC_TMP_DIR)
	rsync -av $(SOURCE_DIR)/ $(STATIC_TMP_DIR)/ --exclude .git --exclude target
```

When triggering a `make run.wsl` the project gets copied, compiled, and executed, all in a quick breeze.

Copying the artefacts back to the origin location and adjustments for using different profiles is left as an exercise for the reader.

A slightly more elaborate example can be seen in my AoC repo:
<https://github.com/asaaki/advent-of-code-2021/blob/main/Makefile>

There you also see how I dealt with debug and release profiles and other shenanigans.

_There's a lot more things you can do to improve compile times, but this post was only about showing the easy win in a WSL build environment._

## What about [sccache]?

It is a nice tool, but once I had it installed in both environments and somehow they loved to interfere with each other, especially within WSL I never really got a long-term reliable setup running.

I seem to run into a similar issue as reported here:
<https://github.com/mozilla/sccache/issues/1067>

It's use case is also more about caching and sharing compile artefacts across projects, but you still have to deal with your project files in the "twilight zone" (the NTFS location in WSL). And if you have peeked into the target folder you might have seen a lot of files which cargo/rustc needs and have nothing to do with sccache at all.

## What about Docker?

It's great for creating shippable artefacts, but not so much for quick development cycles. Since I do have WSL and can do further cross compilation within it, I don't depend on a dockerized development environment all the time anymore.

Also creating the build containers alone can take a lot of time already. A nice exercise every once in a while, but not my everyday cake I want.

<!-- links -->

[git]: @/posts/2020/10/faster-git-under-wsl2/index.md
[Advent of Code]: https://adventofcode.com/
[just]: https://just.systems/
[cargo-make]: https://sagiegurari.github.io/cargo-make/
[sccache]: https://github.com/mozilla/sccache
