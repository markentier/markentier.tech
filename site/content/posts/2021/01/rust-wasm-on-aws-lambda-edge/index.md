+++
title = "Rust/Wasm on AWS Lambda@Edge"
date = 2021-01-18

[taxonomies]
tags = ["rust", "wasm", "webassembly", "aws", "lambda", "lambda@edge", "cloudfront", "serverless", "amazon", "trigger", "edge computing", "CDN", "Node.js", "wavelength", "amazon web services", "wasm-bindgen", "wasm-pack"]
categories = ["default"]

[extra]
long_title = "Rust/WebAssembly on AWS Lambda@Edge (CloudFront)"
has_hero = true
image_alt = "Rust/WebAssembly {loves} AWS Lambda@Edge (CloudFront)"

[[extra.suggestions]]
text = "What I want to see from Rust in 2021"
link = "/posts/2020/10/rust-2021/"
[[extra.suggestions]]
text = "Static site generators written in Rust are cool"
link = "/posts/2018/03/from-cobalt-to-zola/"
[[extra.suggestions]]
text = "[Fun] Rust is the most loved language for quite some time"
link = "/posts/2021/01/rust-most-popular-language/"
+++

Ever felt limited by the languages on AWS Lambda@Edge? Wanted to run Rust for your CloudFront triggers, but _re:Invent_ 2020 disappointed you in that matter? Let me show you one way of how you can still get it done.

<!-- more -->

_`tl;dr:` Check out the [repo] and give it a spin for yourself. You can also [jump ahead to the code part](#code-part) and skip the story section._

At the last AWS re:Invent 2020 the company with a smile did announce quite some changes, improvement, and new products/services. Notably also a lot of interesting stuff in the AWS Lambda space. Yet one area—one very dear to me—was left out completely, total radio silence, nothing, nada: no improvements or new features for Lambda@Edge (L@E). This made me very sad. 😢

I tinkered with a custom solution in the past and also got some experiments running, but it was a pretty hand-rolled approach and nothing I could give to others if they wanted to do the very same.

I sat down yet again and took some of my learnings into a repository, so we have a starting point for some Wasm based serverless apps on the edge.

As of today (January 2021) AWS only offers two languages for Lambda@Edge: `Python` and `Node.js`. Both are available in relatively decent versions, too.

Since I have never bothered with Python too much in my life, but have my fair share of experience with JavaScript (JS) and node, I stuck to the latter as the trampoline environment for the setup. Also I know that it comes with WebAssembly support out of the box, which wouldn't be the case for Python anyway.

## So what is it gonna be anyway?

As you've maybe guessed the project will be some Rust, which gets compiled down to WebAssembly. This artefact then can be loaded and executed in the node environment.

A word about performance: I have not evaluated a "JS vs Wasm" comparison, and it's also not part of this exercise. There have been people and article in the past vouching for one side or another, all with their own benchmarks. So I won't bother you with that and advise you to take your own measurements.

WebAssembly will not beat all JavaScript code, especially very fine-tuned one. V8 (the underlying JavaScript engine for both Chrome and Node.js) is a very performant beast and comes with _just in time_ (optimizing) compilation for further boosts.

The _Rust code in Wasm clothing_ can give you probably certain garantuees you miss from JavaScript, but again you have to evaluate if the benefits are worth the effort.

Potentially you might also consider to switch to Python as your runtime instead. At least that language should have real integers as far as I know. 😉

No doubt you can build and deliver very fast and also safe programs with Rust/WebAssembly. Especially if you need some specific algorithms and computations where JS/node might not be the best and you would resort to some (probably C-based) native libraries anyway.

There are only a few issues with that:

- You have not full control of the execution environment of your edge functions. Sure, you can introspect with a test function what you're dealing with, but how sure will you really be, that the environment on CloudFront does provide the exact same system and system dependencies as your local development environment (or the non-edge Lambda environment for that matter)? AWS has a track record of not providing you with reproducible local environments. In fact, it looks like they get away with it even further, since the announcement for containerization support for regular AWS Lambda. _People, who know me, also know that I'm not a big fan of big docker images, but I'm afraid that's what we will see now happening there. I hope AWS promotes good containerization guidelines to prevent that waste-of-storage mess. Furthermore I really don't want to see docker on the edge for that reason. One can just hope, right?_

- You work in a very constrained environment. Check the [current limits][aws-le-limits] for Lambda@Edge: the zipped code can use up to 50MB on the origin side and **only 1MB max** if it shall be deployed for the viewer side. Of course, this is usually still plenty of spaces for most use cases, packaging up plain JS results in very small archives. But once you take the first issue into consideration, then this could actually become another problem for you.

The size restriction can be mitigated for JS-only code pretty easily by bundling the code with [WebPack][webpack], [Parcel][parcel], or [Rollup][rollup]. General advise is anyway to never deploy the unoptimized package especially when you want to push it to the edge. The `node_modules` folder grows very big, can still have quite some bloat even after an [`npm prune --production`][npm-prune], because it only looks at packages, but not the content of them. _Yep, my minimalism brain kicked in again._

The system dependency problem can only be solved by using solely pure JavaScript libraries and packages. That might work for a while, but eventually some use case might demand a non-JS solution (either a native library or some executable).

For example let's say you want to build an image transformation function and want to use `sharp`, a very well-known package in the JS ecosystem, then you already end up with around 37 MiB of data in your node_modules folder alone. Zipped up it's still around 13 MiB. That might be enough for you to run it as a trigger on the origin side of your CloudFront distribution; it's just about showing you how quickly a node project can grow.

## If size and dependency management are not an issue

* Maybe you love Rust (or any frontend language capable of being compiled to WebAssembly).
* Maybe you love WebAssembly.
* Maybe you do not have good JavaScript/Node.js expertise in-house.
* Maybe you want to build your product with better safety.
* Maybe it should be more robust, too.
* Maybe you want to show AWS, that we need more than just Python and Node.js on the edge.
* Maybe you have some other valid reason to escape that limiting cage.

Whatever your reasons are, I hear you.

AWS is improving on one side, but also losing it on another.
When it comes to CDNs (Content Delivery Networks) and Edge Computing, the competition is now sprinting ahead of AWS.

I cannot say a lot about Fastly's offering, it's mostly behind some beta doors, and mere mortals like myself are not allowed to peek. They have their fastlylabs, but that's for experimentation, not the final offering. So I don't even bother to check it out.

I can tell a bit more about **Cloudflare** though, because their edge computing offering is available and affordable to small businesses and individuals (even free in most cases). Check out [Workers][cfworkers], really do! I have already played around with Workers and KV storage, it's a quite pleasant experience. I might write about a setup for them in the future as well.

## Let's get started {#code-part}

GitHub repository to follow along:

<https://github.com/asaaki/rust-wasm-on-lambda-edge>

```
$ tree -L 1 -a -I .git # output truncated for brevity

.
├── .github        - GitHub Actions workflow and dependabot
├── .gitignore
├── Makefile       - very convenient make targets
├── README.md
├── fixtures       - simple test fixtures and script
├── node           - Node.js wrapper
├── rust           - Big Business Here!
└── <and some more …>
```

### Ingredients

- Makefile for project level management
- [TypeScript][ts] (TS) for the Node.js part
- [Type definitions][ts-al] for AWS Lambda
- [Rollup][rollup] as the bundler
- Rust for the, well, Rust part
- [wasm-pack][wp] for WebAssembly building
- `zip` to package up the function for upload
- Example fixtures and code to have a very quick and dirty request test
- GitHub Actions workflow for continuous integration (CI) purposes

On your machine you need to install Rust, node, wasm-pack, and zip, if not present yet. The workflow for GitHub Actions has that already sorted out for you.

This article won't give you steps to get your local development environment set up, please use a search engine of your choice and look up how to do it.

## Node.js wrapper

I adopted a rollup based approach, since it's quite easy to get configured and also something we use at work. I always found webpack a little bit too cumbersome, and parcel is just yet another new kid on the block. I'm pretty sure you can adjust the project to your needs. All we need here is: compile TS to JS and bundle up everything into a single JS file. In the past I found the WebAssembly dependency management very tricky, in the end I used a plain "move the .wasm file into the final bundle" approach, which just works fine, because I did not want to inline the WebAssembly code (as most plugins try).
Maybe you have a smarter solution for that, please open a pull-request in the [repo][repo]. Just keep in mind: wasm-bindgen creates already a pretty decent module loader, so there is no need to work around that, but I fail to get any of these bundlers to move the wasm files along with it into the bundle output directory.

I use TypeScript here, because it gives you some nice support during development. Also the [aws-lambda type definitions][ts-al] were useful to create the Rust structs and adjust the serialization. (AWS is actually very strict about the JSON you pass around, `"something": null` for absent data does not work, either it is a completely required field with a strict type like a string, or it should not be in the JSON at all).

In general for any bigger frontend or node backend project I would recommend to use TS nowadays. While not every of your dependencies might come with type definitions, at least within your own codebase you can enforce strict rules and type checks.

To make the node wrapper as slim as possible, we pass the event and context data directly into the WebAssembly and return whatever it returns.

Btw if you do return a specific struct instead of a generic `JsValue`, then TS checks will also kick in and use the auto-generated type definitions from the wasm-bindgen process.

For a quick baseline test and project I did not go down that road yet, as it would require to replicate all the TS specific stuff in the Rust code (wasm-bindgen cannot do everything fully automated yet). This is a great opportunity to create a utility crate for that, basically like [rs2ts][rs2ts] but in reverse direction. I wish [aws-lambda-events][ale] already had those CloudFront events in it, but sadly they don't.

Yet also be aware of certain type limitations, read on to learn more about them.

## Rust business logic

The Rust code is also nothing special so far.

```rust
// src/lib.rs

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

mod types;

use std::panic;
use types::cloudfront as cf;
use wasm_bindgen::{intern, prelude::*};
use web_sys::console;

type JsValueResult = Result<JsValue, JsValue>;

#[wasm_bindgen(start, final)]
pub fn start() {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    console::log_1(&intern("(wasm module start)").into());
}

#[wasm_bindgen(final)]
pub async fn handler(event: JsValue, _context: JsValue) -> JsValueResult {
    console::log_1(&intern("(wasm handler request call)").into());
    let request = cf::Event::request_from_event(event)?;

    // TODO: Fancy biz logic here ...

    request.to_js()
}
```

<small>_Note: The displayed code might not be up-to-date with the repository version._</small>

There is one function (`start`) which is triggered when the Wasm module gets loaded. You can use it to set up some internal state if needed. We only used it here for configuring the panic handler; whenever an unrecoverable error happens, it gets logged via `console.error`, helps immensely with debugging. And as we do console logging anyway, there shouldn't be any significant overhead for that part. The compilation output will probably a bit bigger because it needs to store more information for the better panic output.

The other—probably way more interesting—function is `handler`, which takes the inputs from the JS side, does … a lot of nothing, and returns a request JSON blob for CloudFront to deal with.

Currently the machinery reads the arbitrary `JsValue` and tries to deserialize it into a struct, so we can deal with it in code. This is definitely not the most efficient way of doing it, but the conversions in and out really avoid some current existing pain points.

For example wasm-bindgen has not a great story around Rust enums, for now only very simple C-style enums are allowed. Meaning: for our CloudFront (CF) event data, which can be more strictly typed into either a CF request or response event, this does not play well with Rust's richer enums, as we cannot convince wasm-bindgen to use them. There is an [open issue][wb-2407] around this topic, but it was created just recently and thus no work has been done yet. Similarly Rust's `Vec` is also not fully supported yet (see [issue 111][wb-111]), which might be the even bigger issue for some of us.

Workarounds can be a lot of Options and serialization skips, as I do internally anyway.

Some transformation overhead can be addressed by using [serde-wasm-bindgen][swb], but in my example repo I'll use it only for the input side (deserialization). On serialization a collection like HashMap or BTreeMap gets turned into an ES2015 Map, which is unfortunate as well, because they cannot be JSON stringified.

As you can see, currently there are trade-offs to be made in all corners, but that shouldn't stop us to explore further.

_In the current state of the project I have provided pretty strict structs and enum for the CloudFront event data, it even surpasses now the TypeScript interfaces, which makes my point from the previous section pretty obsolete now. I still wish it was easier to autogenerate Rust types from TS definitions. The only good thing about CloudFront related data is, that it won't change that much … if at all. Some APIs in AWS have been stable for years now, so a "write once, use forever" approach might be sufficient._

## Performance

I tested against a simple CloudFront distribution with S3 origin, within that bucket a small static HTML file to be served.

I live in Berlin, Germany, my closest AWS region is `eu-central-1` (Frankfurt), and the CloudFront POP is usually `FRA2-C1` as well.

I have pretty stable and fast connection, 100Mbit/s or more in download speed with a ping around 20 to 30ms are common for me.

Keep in mind: the following numbers are only true for me. You might observe completely different performance. Therefore I also recommend to measure the different baselines.

All tests will use the following command:

```sh
wrk -d 30 -c 5 -t 5 -R 5 -L https://<MY_DISTRIBUTION_DOMAIN>/
```

- `-d 30` - run it for 30 seconds
- `-c 5` - only 5 connections, it's not supposed to be a heavy load test
- `-t 5` - just aligning it to the connection count
- `-R 5` - rate (throughput) of 5 (requests/s), also to avoid unnecessary contention
- `-L` - latency statistics; I will only use the shorter summary

The numbers are fairly low because I don't want to test the overall performance of CloudFront in my area, but want to get consistent and repeatable numbers for L@E in general. Under high load the performance is impacted by many other factors, which we cannot really control.

To ignore the cache, all functions will be **deployed as Viewer Request triggers**, "Include body" enabled to give it a full round picture (no body payload will be sent and used though).

Furthermore after deployment I will run a warm-up round to eliminate the cold-start period, I'm not interested in those bad numbers. I know they are horrible, but we cannot do anything about it really; eventually a function will tear down and a new one needs to be spawned. So each `wrk` will be run twice, but only the second run will be used here.



### "No trigger" baseline

#### What's in it?

Bare CloudFront distribution with S3 origin, small HTML file as index (~1.4 kB filesize).

#### Results

```
Running 30s test @ https://<MY_DISTRIBUTION_DOMAIN>/
  5 threads and 5 connections
  Thread calibration: mean lat.: 29.903ms, rate sampling interval: 56ms
  Thread calibration: mean lat.: 29.821ms, rate sampling interval: 53ms
  Thread calibration: mean lat.: 29.696ms, rate sampling interval: 51ms
  Thread calibration: mean lat.: 30.232ms, rate sampling interval: 65ms
  Thread calibration: mean lat.: 30.708ms, rate sampling interval: 66ms
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    23.39ms    1.30ms  29.10ms   84.00%
    Req/Sec     0.98      4.00    20.00     94.23%
  Latency Distribution (HdrHistogram - Recorded Latency)
 50.000%   23.09ms
 75.000%   23.73ms
 90.000%   24.64ms
 99.000%   29.04ms
 99.900%   29.12ms
 99.990%   29.12ms
 99.999%   29.12ms
100.000%   29.12ms
```

Let's remember a **p99** of around **30ms**.
Depending on internet weather it varies a bit, ±5ms are not uncommon.

### "Empty Node.js handler" baseline as Viewer Request trigger

#### What's in it?

Empty here means only that the handler is not doing anything.

```js
'use strict';

exports.handler = async (event) => {
   return event.Records[0].cf.request;
};
```

Yep, that's all: take the request object out of the event and pass it down. It's the smallest possible function you could write. It would also be the most useless, too.

#### Results

```
Running 30s test @ https://<MY_DISTRIBUTION_DOMAIN>/
  5 threads and 5 connections
  Thread calibration: mean lat.: 43.793ms, rate sampling interval: 81ms
  Thread calibration: mean lat.: 47.265ms, rate sampling interval: 106ms
  Thread calibration: mean lat.: 44.360ms, rate sampling interval: 90ms
  Thread calibration: mean lat.: 44.558ms, rate sampling interval: 84ms
  Thread calibration: mean lat.: 44.164ms, rate sampling interval: 81ms
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    37.21ms    3.76ms  56.29ms   87.00%
    Req/Sec     0.97      3.15    12.00     91.21%
  Latency Distribution (HdrHistogram - Recorded Latency)
 50.000%   36.32ms
 75.000%   37.95ms
 90.000%   40.19ms
 99.000%   49.98ms
 99.900%   56.32ms
 99.990%   56.32ms
 99.999%   56.32ms
100.000%   56.32ms
```

So the baseline with Lambda@Edge being active for the **p99** is now **50ms**. On rainy days basically twice as slow as without any triggers. Again, account for some variance around ±5ms.

The reported duration in the Cloudwatch logs for the function is between **0.84ms** and **1.53ms**, so on average around 1ms simplified. This begs the question, where the other overhead went. There are roughly 20ms unaccounted for and missing. A tribute to the performance gods? I don't know. 🤷

Just keep that gap in mind. I guess this is the overhead between the Cloudfront request handling and call out to the L@E execution environment, somehow all this stuff needs to be orchestrated behind the scenes. It's just sad that I cannot find those timings anywhere. The pure CloudFront logs are also not conclusive.

The maximum memory used is 67 to 68 MB.

### The simple Rust/WebAssembly module as Viewer Request trigger

#### What's in it?

See the [code in the repo][repo], I used the exact same version of it.

#### Results

```
Running 30s test @ https://<MY_DISTRIBUTION_DOMAIN>/
  5 threads and 5 connections
  Thread calibration: mean lat.: 44.980ms, rate sampling interval: 90ms
  Thread calibration: mean lat.: 50.256ms, rate sampling interval: 167ms
  Thread calibration: mean lat.: 44.296ms, rate sampling interval: 92ms
  Thread calibration: mean lat.: 45.668ms, rate sampling interval: 87ms
  Thread calibration: mean lat.: 49.321ms, rate sampling interval: 154ms
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    36.71ms    2.23ms  47.78ms   82.00%
    Req/Sec     0.95      2.82    11.00     89.07%
  Latency Distribution (HdrHistogram - Recorded Latency)
 50.000%   36.38ms
 75.000%   37.34ms
 90.000%   38.62ms
 99.000%   44.32ms
 99.900%   47.81ms
 99.990%   47.81ms
 99.999%   47.81ms
100.000%   47.81ms
```

No, the Wasm function didn't get magically faster than the "no-op" node version. With a **p99** around **45ms** it is just in the same ±5ms corridor.

We can conclude from this, that the module has no significant performance hit.

Reported duration is usually somewhere between **1.25ms** and **1.50ms.** I haven't seen it dropping further below, so let's say there is a 250µs on top of the average node baseline.

The maximum memory used is between 75 to 77 MB. I guess this is the additional allocation for the WebAssembly module, yet I'm not too worried about that. I assume the overhead can be amortized by running more memory efficient code within the module instead of the node environment. I'm pretty sure that a plain old JavaScript object needs more memory than a Rust struct.

## Conclusion

This is all great news: you can run WebAssembly on AWS Lambda@Edge without a noticeable performance penalty. Now write your Rust code and run it on the edge.

Of course I do hope that in the future this will become more native. There's a lot of development happening in the WebAssembly space.

But maybe I've also convinced AWS to not move any faster, because we can solve the problem ourselves. And for a behemoth organization like them it can take many years to deliver even the smallest improvements which we consider to be no-brainers, … and then we wonder why it took them so long in the first place.

Yet I stay optimistic in general. I know that they know that Edge Computing is some hot stuff right now. They even launched a very specialized offering called [AWS Wavelength][awl]. I'm looking forward to test this once it's more widely available.



[repo]: https://github.com/asaaki/rust-wasm-on-lambda-edge
[wp]: https://rustwasm.github.io/wasm-pack/
[wbg]: https://rustwasm.github.io/docs/wasm-bindgen/
[webpack]: https://webpack.js.org/
[parcel]: https://parceljs.org/
[rollup]: https://rollupjs.org/
[npm-prune]: https://docs.npmjs.com/cli/v6/commands/npm-prune
[ts]: https://www.typescriptlang.org/
[ts-al]: https://www.npmjs.com/package/@types/aws-lambda
[aws-le-limits]: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-requirements-limits.html#lambda-requirements-see-limits
[cfworkers]: https://workers.cloudflare.com/
[rs2ts]: https://github.com/tzaeru/rs2ts
[ale]: https://github.com/LegNeato/aws-lambda-events
[wb-2407]: https://github.com/rustwasm/wasm-bindgen/issues/2407
[wb-111]: https://github.com/rustwasm/wasm-bindgen/issues/111
[swb]: https://github.com/cloudflare/serde-wasm-bindgen
[awl]: https://aws.amazon.com/wavelength/
