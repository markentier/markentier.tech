+++
title = "Rust Safety and Security"
date = 2021-07-24

[taxonomies]
tags = ["rust", "language", "programming", "safety", "memory", "memory safety", "security", "bugs", "vulnerabilities", "R.E.S.F.", ]
categories = ["default"]

[extra]
has_hero = true
image_alt = "»This is safe.«"

[[extra.suggestions]]
text = "What I want to see from Rust in 2021"
link = "/posts/2020/10/rust-2021/"
[[extra.suggestions]]
text = "Rust can run everywhere, even serverless with AWS Lambda, even far away on the edge"
link = "/posts/2021/01/rust-wasm-on-aws-lambda-edge/"
[[extra.suggestions]]
text = "[Fun] Rust is the most loved language for quite some time"
link = "/posts/2021/01/rust-most-popular-language/"
+++

Lately I see people complaining about "the Rust community" to confuse memory safety with general safety and security. But do "they" really?

<!-- more -->

I'm neither a Rust expert nor a security expert. I am just yet another almost middle-aged white cis male mostly-straight-passing dude-like person in the internet.

But maybe my amateurish view can still help to ease your frustration or reconsider your perception.

First: who are _these Rust folks_ (the community) you talk about? Do you mean the language creators, the language maintainers, the different Rust teams, the crate authors and maintainers, the language and ecosystem users, the random person who just heard something about Rust, the game or the language?

I'm pointing this out, because if you complain about people being vague, fuzzy, and unclear in their communication, you cannot really make the same mistake. The Rust community is not a homogenous mass. It's a growing landscape of very diverse set of folks under the umbrella of Rust, the programming language.

And I am mentioning that, because—as far as my own memory serves me ;-)—I have always tried to emphasize that Rust is not a magic silver bullet for everything, that the language only tries to protect you from a specific subset of problems, but a very prominent and important one nevertheless.

Companies like Microsoft and Google ran some analyses and realized, of all security vulnerabilities they got reported, around 70 % can be attributed to memory safety issues.[^seventy]

This is indeed an important take away and why it should be in the toolbelt of your arguments if you want to nudge people into the Rust direction. In other words, it would be a waste if you don't mention that.

Just to repeat: I still only talk about a subset of problems where Rust can support you.

Even if you do not want to rewrite all the things to Rust (which is totally fine by the way!), as long as you adopt at least the same or similar mindset, take notes, and maybe even copy some approaches to make your language and ecosystem more memory safe, we all win. As far as I can tell the C++ folks do that and try to implement stuff in the language to make it safer. I really love that these two communities even talk and collaborate with each other, as some people believe they have to be sworn enemies.[^dislike]

So my first assumption: On the way so far people simplify, generalize, and cut out important pieces, so that others now see that weird message like »Rust makes everything safe and secure.« Which is of course a lie.

Rust cannot prevent the other very important problem space: logical errors. The compiler and the tools are not a magical being which can look into your mind and guess what you intended to write and tell you the right way. Nope, it will happily accept your hundred lines of bullshit as long as it makes sense to the type system and its rules.

You can write code which compiles and does nothing. Or anything but the thing you want it to. As long as you don't mess up the memory, you're free to mess up everything else. Go, have fun!

To be clear: You are responsible for the business logic of your program!

And you know what helps to write code which does what you expect it to do, now and in the future? Writing tests! Yes, I said it, you still have to write tests, even in Rust.

And the beauty of it is, that you really can focus on testing your (business) logic of your code, because as we learned, for the memory safety issues the compiler already has your back.[^unsafe]

For the security aspect I cannot say much, but I consider that to be part of a bigger test umbrella anyway. I've heard of fuzzing for example, basically robustness testing, where you automatically bombard your program with a lot of random inputs to see if you missed something. The bugs revealed might be of any category, and yes, they can still be memory safety issues, even in Rust land.

Why? Because the Rust compiler and tools are also just programs, code written by people. And we all make mistakes or miss things. And so the compiler can produce faulty code. Most of the time though it does not compile at all if that happens, still very annoying, but probably safer than compiling and crashing.

So given that even the compiler might have flaws, nobody can give a 100 % guarantee that Rust will never have or produce any memory safety issues. At least I wouldn't want to bet on that with my life.

I do not know anyone who actually has this misconception and does miscommunicate in that way, that suddenly "memory safety == (100 %) safety" or "memory safety == (full) security" is a thing. I have to trust the voices brought into my Twitter timeline that they met somebody who did.

As far as I can tell nobody I know and is close to the language would do that mistake. Definitely not intentionally. But also not really by accident.

Also communication is a two-ended thing, it is possible that you misinterpreted something those folks said to you. I cannot tell, because nobody told me their full story so far. So my assessment is solely based on those ranty messages and my own interpretation of what might have gone wrong.

But rest assured, we "the Rust community" are not all the same, some of us do understand the subtle differences between memory safety, safety in general, and security.[^idea]

And since this article was sparked by a specific complain about a "memory safe replacement" (`please`) for a SUID program (`sudo`): Of course, software written specifically for security purposes should definitely have more extra care, no matter if written in Rust or any other language.[^please]

I do not believe that Rust's advertisement of being a more memory safe language is inherently harmful for security. But then again, I try to reason with a common sense, yet also get reminded, that we have warning labels like »contains hot drink« on the lid of a to-go paper cup full of hot coffee. So maybe we need a big warning sign on the Rust language homepage? **»You still need to think for yourself!«**

----

_Depending from where you're coming from Rust does have a great type system which also can help to prevent quite some logical errors as well. But you have to write that stuff, or find somebody who writes it for you. But the idea here is, that if you create good types for your business domain, the compiler can also enforce some rules you would have to write tests for otherwise. No matter what you do, you still have to think and write something for it. Even if you have a Copilot._ 😉

<!-- footnotes -->
[^seventy]: Microsoft: <https://msrc-blog.microsoft.com/2019/07/16/a-proactive-approach-to-more-secure-code/>; Google Chrome, Chromium project report: <https://www.chromium.org/Home/chromium-security/memory-safety>; I find the Chromium report interesting, because half of the memory issues are use-after-free, something safe Rust prevents you from doing, and most of your {% correction(old="fights") %}conversations{% end %} with the borrow checker will be about that. Embrace them!

[^dislike]: This is a simplification, not generalization, there will always be some humanoids hating each other simply for their language choice, and that is just sad. To be fair, I also don't like all languages and ecosystems, but I try to channel that purely into the technical thing, not the people. Sometimes I might fail, but I pride myself to be usually pretty good at separating language and their users.[^yet]

[^yet]: Yet that does not mean, that I'm also always okay with how some language communities act and think and operate.[^good]

[^good]: Some folks close to me try to remind me, that I should assume good intent in all actions. Sounds nice on paper, but I believe this is also a fallacy, sometimes a dangerous one. But I digress already too much in my footnotes. Follow me back to the main thread, would you?

[^unsafe]: As long as you do not remove all the guard rails with too much `unsafe` here and there. And when you do (have/need to) use `unsafe` you might want to consider writing just some more tests. Bam!

[^idea]: Or do have some vague idea about the differences at least.

[^please]: After I followed some trails I also don't really understand the outrage anyway, I cannot see that the `please` author actually claimed that their Rust rewrite is 100 % secure, only that it is a memory safe replacement. There was a security code review, issues were identified, and were or will be addressed in the future. So from a distance it looks all like quite fine open software development to me. Of course, I do not know if and what kind of conversations might have happend behind the scenes. (And therefore I purposefully have not linked to anything in this whole blog post nor named names. I don't want to make it more personal than it needs to be.)
