+++
title = "From cobalt.rs to gutenberg"
date = 2018-03-23
tags = ["gutenberg", "cobalt", "cobalt.rs", "rust", "static site", "generator", "migration", "conversion", "switch"]
category = "default"
[extra]
has_image = true
has_hero = true
image_alt = "Why I moved to gutenberg, a static site generator written in Rust"
+++
I wish I could have the features of both tools, but for now I will use gutenberg over cobalt. A tiny migration story.

<!-- more -->

While [cobalt][cobalt] is a pretty nice and easy static site generator written in Rust (in the vein of [Jekyll][jekyll], the famous tool used for GitHub pages), I struggled a bit.
Especially that the stylesheet compilation is not enabled by default yet. I still want to stick with [Rust][rust] and the only other active option here is gutenberg. But to be honest, this one also comes with its complications.

Cobalt is your tool for a quick blog-like setup, because it supports the usual two different article types of (static) pages and blog posts. Gutenberg doesn't really have such distinction, and therefore you need to be more elaborate if you want to achieve the same.

### Not all perfect, but we're getting there

Since both projects are pretty young, they share similar shortcomings: the template libraries are usually not feature complete yet or behave a slightly bit different than their spiritual role models. Mostly one can work around those issues, but it's a bit painful still.

Gutenberg shines here a bit brighter, since it supports macros and shortcodes. Especially the latter is something nice, because I can quickly enrich my pages with snippets, which are usually weird or hard to be done purely in Markdown. Embedded HTML is not the nicest thing and if I can abstract them away, I'm all in for that.

Another tiny plus: Gutenberg is supported by [Netlify][netlify], therefore I do not need to install the binary somehow on their side. Now I can let it build the final site on deployment and skip committing a prebuilt project. Pretty sure I could have done it with cobalt as well, but this way it worked out of the box.

### Tools, tools, tools

Speaking of tooling: I was a bit adventurous and bundled two tiny binaries anyway and it worked.

#### `fd` - the simpler find, written in Rust

[fd][fd] advertises itself as _A simple, fast and user-friendly alternative to 'find'._

And according to their benchmarks it is incredibly fast. But I also like the easier command-line options. The interface is designed for the common cases. And it is written in Rust. Have I mentioned that I love Rust? No? ;-)

#### `tidy-html5` - getting rid of awkward whitespaces and indentation

> The granddaddy of HTML tools.

_The granddaddy of HTML tools._ — well, yes, [tidy][tidy] is a pretty old tool, I probably used it already 10+ years ago.

I recommend this helper to anyone who gets slightly shitty HTML generated from their CMS, static site generator or whatevery is producing such files automatically.

Usually there is no harm in leaving the HTML pages as they are, as long as they render in most browsers. I like my pages nice and clean. And I wish most programs would come with tidy builtin. I know, I know, I'm such a dreamer.

Here a snippet how I use `fd` and `tidy` for my post processing:

```mk
# from my Makefile:

TIDY_SETTINGS = -q -m -w 0 -i \
                --indent-with-tabs yes \
                --indent-spaces 2 \
                --tab-size 2 \
                --clean yes \
                --join-styles yes

build-tidy-html:
  fd -p public -e html -x sh -c "echo {} && tidy $(TIDY_SETTINGS) {}" \;
```

* find all files with extension `.html` in the `public` folder
* apply command with `-x` option;  \
  since I want to do multiple things I have to wrap it with `sh -c "…"`
* `tidy` removes all superfluous whitespaces and empty lines, properly indents the tags, and cleans up the inline styles, which is quite handy for the code snippes, because gutenberg (and cobalt) do not use a global/external stylesheet for the syntax highlighting

If you want to learn more about all the possible flags and options, check out the [tidy reference][tidyref] for details and explanations.

This step helps me a lot getting a consistent output for my whole site, also I will get warnings/errors in case I messed up something in my templates and markup.

### More about `gutenberg`

…

gutenberg
gutenberg
gutenberg
gutenberg
gutenberg

### Functions, lambdas, and "serverless"

Recently Netlify [opened up their previous beta features][netlify-blogpost]: **Forms, Identity, and Functions (Lambdas).**

I have no immediate use for the forms and identity service (yet), but the functions are probably a nice feature to check out first.

As with most of their tools and support they promise that it will be easy or easier than the underlying solution. And while I haven't even actively played around with AWS Lambda yet, I tested it via Netlify's Functions feature. The free tier is quite limited, of course, but I cannot image a simpler way to get started with functions and lambdas and the whole serverless universe. Although I don't really like this marketing term, since in the end everything is running on some server somewhere. I'd rather think of the evolution after [Heroku][heroku], which never claimed to be serverless, but a platform where most of the painful infrastructure administration is abstracted away. Functions and Lambdas just further narrow down the scope and surface, but still: they are really tiny applications running on managed servers and services, and a little bit more on demand.

And I have to admit, there is great appeal in such services. Especially for single person projects (like this site), where you want a little bit more than just pure static, but also do not want to invest too much time and effort in setting things up.

Because in the end what you want is: **getting things done.**

[cobalt]: https://cobalt-org.github.io/
[jekyll]: https://jekyllrb.com/
[gutenberg]: https://www.getgutenberg.io/
[rust]: https://www.rust-lang.org/
[netlify]: https://www.netlify.com/
[netlify-blogpost]: https://www.netlify.com/blog/2018/03/20/netlifys-aws-lambda-functions-bring-the-backend-to-your-frontend-workflow/
[fd]: https://github.com/sharkdp/fd
[tidy]: http://www.html-tidy.org/
[tidyref]: http://api.html-tidy.org/tidy/quickref_5.6.0.html
[heroku]: https://www.heroku.com/