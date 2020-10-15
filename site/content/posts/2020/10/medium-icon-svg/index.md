+++
title = "Medium Icon SVG"
date = 2020-10-15

[taxonomies]
tags = ["svg", "symbol", "icon", "logo", "brand", "medium", "2020", "unfinished", "ellipses", "logomark", ]
# cannot use "…" or "..." as tag, slugs would be empty
categories = ["default"]

[extra]
#origin_url = ""
long_title = "Medium Icon SVG … Not Small Enough!"
has_hero = true
image_alt = "Would you have guessed what this icon should represent?"
custom_delimiter = "•••"
+++

So, Medium [got a new logo.][m-new] I took a look at their icon's SVG source. It's pretty small, but you know, it can be shrunken further.

<!-- more -->

While I don't particularly like their redesign—I haven't really recognized that icon as an (typographic) ellipsis—the bigger issue for me was that for such a simple symbol they used a too complicated approach. I don't know their internal design process, but I suspect there was not an SVG aficionado involved. Especially not one with a strong urge to opimize the last bit out of such assets.

My first impression in a tweet:

> Not that I really care much about them anyway, but my first reaction was "is something broken?" I checked even the source code to see a simple SVG icon. (And why they went for a full path instead of 3 circles …? 🤷🏻‍♂️)

— <https://twitter.com/asaaki/status/1316526183387889664>

So let's take a look at the beauty.

<div class="w50 box-center">

![Medium's new symbol icon](./medium.icon.sanitized.svg)

</div>

The code is not horribly big, too. So I have to give them that.

```xml
<svg viewBox="0 0 1043.63 592.71" class="aa bb">
  <g data-name="Layer 2"><g data-name="Layer 1">
    <path d="M588.67 296.36c0 163.67-131.78 296.35-294.33 296.35S0 460 0
    296.36 131.78 0 294.34 0s294.33 132.69 294.33 296.36M911.56 296.36c0
    154.06-65.89 279-147.17 279s-147.17-124.94-147.17-279 65.88-279
    147.16-279 147.17 124.9 147.17 279M1043.63 296.36c0 138-23.17 249.94-51.76
    249.94s-51.75-111.91-51.75-249.94 23.17-249.94 51.75-249.94 51.76 111.9
    51.76 249.94"></path>
  </g></g>
</svg>
```

_With linebreaks and whitespaces removed the file still weighs in at **479 bytes.** <small>(I did not count the xmlns, since they embed it directly in HTML page without it. Otherwise the file size would go up to 514 bytes.)</small>_

It's still a mouthful of path data if you ask me. Also a lot of decimal numbers, even for the viewBox. Why?

I mean, what do you really see when you look at it?

There are 3 (geometrical) ellipses there, right? Can we agree on it? Good.

Guess what, within the SVG specs there are more ways to draw things on your screen than just complex paths.

For example there happens to exist elements like [`<circle>`][circle] and [`<ellipse>`][ellipse]. What a surprise! Such primitives are quite easy to use, and probably also easier to understand when you look at SVG source code.

For comparison my very _quick & dirty_ optimized version of the Medium icon:

<div class="w50 box-center">

![Medium's new icon made out of primitive elements](./medium.icon.ellipses.svg)

</div>

And the corresponding source for it:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1770 1000">
  <circle cx="500" cy="500" r="500"/>
  <ellipse ry="475" rx="250" cy="501" cx="1296"/>
  <ellipse cx="1682" cy="502" rx="88" ry="424"/>
</svg>
```

_With linebreaks and whitespaces removed the file only consumes **199 bytes.** That's only **~42 %** of the original size. <small>(I added the xmlns only here; unless you embed the SVG in your HTML, most browsers do **not** like it without it. Remove 35 more characters for a 1:1 comparison, ergo 164 bytes, ~34 %.)</small>_

Some things to note here:

I removed unnecessary elements like the `<g>` groups, which do not carry any useful properties. I'm pretty sure the `class="aa bb"` stuff does not really need to be there.

I tried to match the radii as close as possible. Given that the source used a path and I had to eye-ball it, there could be tiny teeny bit of mismatch when overlaying both versions. It's a very quick replica, done in a few minutes. Right now I'm not sure if the source has perfect circle and ellipses.

I scaled the image up to a box with a round big integer number (using the height as reference and set to 1000). The reason is to avoid decimal numbers. Even if you try to round to only a single fractional digit, you still waste 2 bytes (including the point). And if you do that for basically all your values, you have quite some overhead which might not really add any value.

_Learning:_ If you have primitives, do not convert them to paths!

Isolated example from my circle shape above:

```xml
<!-- simple shape -->
<circle cx="500" cy="500" r="500"/>

<!-- converted to path -->
<path d="M1000 500a500 500 0 01-500 500A500 500 0 010 500 500 500 0 01500 0a500
         500 0 01500 500z"/>
```

Yes, sometimes a path could lead to less, like in this snippet for a line:

```xml
<!-- line primitive: -->
<line x1="0" y1="80" x2="100" y2="20" />
<!-- path equivalent: -->
<path  d="M0 80l100-60"/>
```

But this was not the case with Medium's new symbol icon. Round shapes have to be represented by arcs and curves, and as you can see from the code above that always means more instructions for the drawing.

For learning more about SVG, especially the `path` element, I highly recommend to visit the [compact tutorial at MDN][mdn].

-----

Why do I even care? Sure the current symbol data is already pretty small and will not significantly add to the total payload size of a common Medium page, no matter if the article is long or short. It's not so much about the specific amount here, though it will add up to several gigabytes on their bandwidth bill eventually. I argue here only on a very high level and out of principle.<a title="Also I have too much free time at hand right now. 😅">*</a>

Of course, the icon will be used in different places, different formats, different presentations. Not all of them will be SVG by default. I can imagine that the master file is some Adobe Illustrator format or worse a Photoshop file. Probably I'm the very first who actually looked at the generated source code for the data in the HTML, as for many there is no real need to tamper with the bits and bytes besides running it through some kind of optimizer maybe. And for most parts in life that's okay.

There is no need for over-/micro-optimizations unless you work in a field where this is a hard requirement.

But here I thought it was not only a missed opportunity, but such a plain sloppiness. We're talking here about a company, not just a hobbyist's side project. There are people getting paid to do their job. Using simple shapes was so obvious after looking at the new logo. Am I the only one thinking that?

-----

_Hey, **Medium,** if you want to use it, you are invited to copy my shorter version and apply it on your site! <a title="Of course, I do not expect any response nor appreciation for what I've done. In another world I could have asked for quite some money here. That's why I'm not a consultant, I would fail in that kind of job.">Free of charge, though some credit would be nice.</a>_

<!--  _Sincerely yours,\ -->
 _To your continued success,\
  SVG Wrangler 🙵 Byte Counter_

[m-new]: https://blog.medium.com/a-more-expressive-medium-starting-with-medium-63b562206d8f
[circle]: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
[ellipse]: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse
[mdn]: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
