+++
title = "[Tiny Bits] Windows shortcut key symbol ⊞"
date = 2021-04-16

[taxonomies]
tags = ["windows", "shortcut", "key", "win", "symbol", "unicode", "utf8", "U+229E", "command", "documentation", "tiny bits"]
categories = ["default", "tiny bits"]

[extra]
has_hero = true
image_alt = "Examples of »⊞ Win« as a shortcut visualization in documentation"
custom_delimiter = "· · ⊞ · ·"
+++

After reading some documentation of some PowerToys utilities I noticed that Microsoft found a pretty neat trick to use a unicode character as symbol for their Windows shortcut key: <kbd>⊞ Win</kbd>

<!-- more -->

Many people might be familiar with the command key `⌘` found on Apple keyboards, which makes it easy to denote keyboard shortcuts for Macos applications. In Unicode this is actually the "Place of Interest Sign" <sub>(U+2318)</sub>, which is the origin for the symbol at Apple, in case you wondered if Apple had bought itself into the Unicode standard.[^cmd]

So one had to wonder if and when Microsoft would do that for Windows applications. I cannot really tell you anything about the history of the unicode character usage, but I find it remarkable enough that they have found a (quite hacky) way around it by utilizing the unicode character _Squared Plus_ in documentation and help. Some might say it's kind of abuse of it, as it says "squared plus" and not "window" or something similar, it's in the mathematical operators block, so some people might find it even offensive?

But even Wikipedia itself states:

{{quoted(body="Wikipedia uses the Unicode character U+229E ⊞ SQUARED PLUS as a simulation of the logo.", href="https://en.wikipedia.org/wiki/Windows_key")}}

I say hacky, because it's math symbol, but on the other hand, Apple also didn't do really a much better job at it for their key.

Also Microsoft couldn't have used the current <kbd>⊞ Win</kbd> for very long, since their past logos looked different and had no lookalike character in the Unicode standard at all. Only with Windows 10 the logo became so stylized and abstract enough that it could be simulated with the ⊞ character. So it couldn't have been earlier than 2015, but I guess the actual appearance made it even much later.

-----

Since the usage of such symbols is not very common, you also cannot easily type it with your keyboard, unless you have remapped it somehow — people at Microsoft surely have, right?

If you need it quickly right now, here for you to copy it: <kbd>⊞</kbd>

Some more meta data about this symbol:

## ⊞ (U+229E)

| <!-- key --> | <!-- value --> |
| --- | --- |
| Name | Squared Plus |
| Category | Math symbols |
| Since | Unicode Version 1.1 <sub>(1993)</sub> |
| Block | Mathematical Operators <sub>(U+2200 - U+22FF)</sub> |
| Plane | Basic Multilingual Plane <sub>(U+0000 - U+FFFF)</sub> |
| HTML entities | `&#8862;`<br>`&#x229E;`<br>`&plusb;` |
| CSS | `\229E` |
| UTF-8 | `0xE2 0x8A 0x9E` |
| UTF-16 | `0x229E` |

-----

Other nice keyboard shortcut symbolization:

* Arrow keys <kbd>↑</kbd>, <kbd>→</kbd>, <kbd>↓</kbd>, <kbd>←</kbd>
* <kbd>⇧ Shift</kbd> and <kbd>⇪ Caps Lock</kbd>
* <kbd>Tab ↹</kbd> (some keyboards might have only a <kbd>⇥</kbd> label instead of `↹`)
* <kbd>← Backspace</kbd>
* <kbd>⏎</kbd>, <kbd>↵ Enter</kbd>, <kbd>↵ Return</kbd>
  * sometimes also <kbd>⌅ Enter</kbd> or <kbd>⌤</kbd> (mostly Apple)
  * French speaking people might even see <kbd>⎆</kbd>
* <kbd>⎋</kbd> (alternative for <kbd>Esc</kbd>, but plain text label is most common)
* <kbd>⌦</kbd> (alternative for <kbd>Del</kbd>/<kbd>Delete</kbd>)
* <kbd>⇱</kbd> (alternative for <kbd>Home</kbd>, if no text labeling is preferred)
* <kbd>⇲</kbd> (alternative for <kbd>End</kbd>, if no text labeling is preferred)
* <kbd>≣ Menu</kbd> (my hamburger nightmare come true, even with one extra layer)
* <kbd>⌥ Opt</kbd> (or <kbd>⌥ Option</kbd>)
  * mostly used at Apple; sometimes <kbd>⌥ alt</kbd>
  * Windows/Linux users know it simply as the <kbd>Alt</kbd> key)
* <kbd>⎇</kbd> (the true <kbd>Alt</kbd> key, if no text labeling is preferred)
* <kbd>◆ Meta</kbd> (when <kbd>⊞ Win</kbd>/<kbd>⌘ Cmd</kbd> doesn't fit your system, like Linux)
* <kbd>⎈ Control</kbd> (alternative for <kbd>Ctrl</kbd> or <kbd>^Ctrl</kbd>, but I've never seen it in the wild)
* <kbd>❖ Super</kbd> and <kbd>✦ Hyper</kbd> (rarely found; search for »space cadet« keyboard)
* <kbd>F10 🔈</kbd>, <kbd>F11 🔉</kbd>, <kbd>F12 🔊</kbd> (and other media control friends)
* <kbd>         </kbd>
  * sometimes one version of the "any key"[^ak]
  * usually for <kbd>Space bar</kbd>
  * … haha, I made that up! ;-)[^spb]

_Note: the <kbd>F1</kbd> – <kbd>F12</kbd> keys can also be used without (media) symbols, but since some keyboards emphasize the media controls more than the function key names, it might be more usable to add the symbols in your documentation._

It's interesting to see that there are some dedicated ISO keyboard symbols, but I cannot recall to have seen all of them in real life so far. Sometimes a few of them are supplementary to the text labels. <br>Consult standard `ISO/IEC 9995-7` for more details, if you have it at hand.

-----

Funnily enough I'd initially planned to post a very short post about the <kbd>⊞ Win</kbd> only, and then it turned into this slightly more elaborate piece. I could even dig deeper into some of the other examples here. If you're interested in something in particular or know more common or uncommon keyboard symbols, let me know and [send me a message] on Twitter.

[^cmd]: Read a short story at <https://en.wikipedia.org/wiki/Command_key#Origin_of_the_symbol>

[^ak]: See <https://en.wikipedia.org/wiki/Any_key#Cultural_significance>; I refer to the space bar key simply because it allows to put a custom text label on it.

[^spb]: But feel free to use it anyway.

[send me a message]: https://twitter.com/asaaki
