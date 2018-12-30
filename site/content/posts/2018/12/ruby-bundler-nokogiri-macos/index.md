+++
title = "Notes: Nokogiri installation errors on macos"
date = 2018-12-30
[taxonomies]
tags = ["ruby","bundler","nokogiri","macos","osx","rubygems","gem","error","undefined","symbol",
        "iconv","libxml2","x86_64","clang","鋸","rails"]
categories = ["default","notes"]
[extra]
#origin_url = ""
#long_title = ""
has_image = true
has_hero = true
image_alt = "Solves almost all of your problems: bundle config build.nokogiri --use-system-libraries && bundle install"
+++

Quick answer:<br/>`bundle config build.nokogiri --use-system-libraries && bundle install`

<!-- more -->

Every other year or so I want (or need) to install dependencies for a Ruby application on my Macbook, directly on the host instead of a VM or container. Mostly it's a Rails app.

And every time our most "loved" dependency bails on me: [`nokogiri`][n]. I think it always fails on a Mac. (At least once.)

Because I never go directly to the documentation of whatever refuses to work, I usually google my way to a solution.
In my case this was then harder than it should have been, so I write this down here for me as a reminder.

The next time I google it, I hope to find my own blog post and will make the same expression at the end. Again.

## How does it fail

Try to get and build the dependencies:

```sh
# maybe a fancy Rails application
bundle install
```

And after a while ...

```sh
# snippet
An error occurred while installing nokogiri (1.8.5), and Bundler cannot continue.
Make sure that `gem install nokogiri -v '1.8.5' --source 'https://rubygems.org/'` succeeds before bundling.

In Gemfile:
  rails was resolved to 5.2.1.1, which depends on
    actioncable was resolved to 5.2.1.1, which depends on
      actionpack was resolved to 5.2.1.1, which depends on
        actionview was resolved to 5.2.1.1, which depends on
          rails-dom-testing was resolved to 2.0.3, which depends on
            nokogiri
# /snippet
```

If you run what is suggested:

```sh
gem install nokogiri -v '1.8.5'
```

```txt
Building native extensions. This could take a while...
ERROR:  Error installing nokogiri:
  ERROR: Failed to build gem native extension.

# ... snip ...

Undefined symbols for architecture x86_64:
  "_iconv", referenced from:
      _main in conftest-451598.o
  "_iconv_open", referenced from:
      _main in conftest-451598.o
ld: symbol(s) not found for architecture x86_64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
checked program was:
/* begin */
 1: #include "ruby.h"
 2:
 3: #include <stdlib.h>
 4: #include <iconv.h>
 5:
 6: int main(void)
 7: {
 8:     iconv_t cd = iconv_open("", "");
 9:     iconv(cd, NULL, NULL, NULL, NULL);
10:     return EXIT_SUCCESS;
11: }
/* end */
```

This is a problem that it cannot work with the iconv library currently present.

Alternatively also another library can cause some troubles: `libxml2`

Then the output might look like:

```txt
Running 'compile' for libxml2 2.9.8... ERROR, review '/Users/chris/.rbenv/versions/2.5.3/lib/ruby/gems/2.5.0/gems/nokogiri-1.8.5/ext/nokogiri/tmp/x86_64-apple-darwin17.7.0/ports/libxml2/2.9.8/compile.log' to see what happened. Last lines are:
========================================================================
      _parseAndPrintFile in xmllint.o
  "_xmlXPathEval", referenced from:
      _doXPathQuery in xmllint.o
  "_xmlXPathFreeContext", referenced from:
      _doXPathQuery in xmllint.o
  "_xmlXPathFreeObject", referenced from:
      _doXPathQuery in xmllint.o
  "_xmlXPathIsInf", referenced from:
      _doXPathDump in xmllint.o
  "_xmlXPathIsNaN", referenced from:
      _doXPathDump in xmllint.o
  "_xmlXPathNewContext", referenced from:
      _doXPathQuery in xmllint.o
  "_xmlXPathOrderDocElems", referenced from:
      _parseAndPrintFile in xmllint.o
ld: symbol(s) not found for architecture x86_64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

## How to fix it

Well, if one would pay attention to the output, sometimes the output already tells you what could be done.

_For the libxml case:_

```txt
IMPORTANT NOTICE:

Building Nokogiri with a packaged version of libxml2-2.9.8
with the following patches applied:
	- 0001-Revert-Do-not-URI-escape-in-server-side-includes.patch
	- 0002-Fix-nullptr-deref-with-XPath-logic-ops.patch
	- 0003-Fix-infinite-loop-in-LZMA-decompression.patch

Team Nokogiri will keep on doing their best to provide security
updates in a timely manner, but if this is a concern for you and want
to use the system library instead; abort this installation process and
reinstall nokogiri as follows:

    gem install nokogiri -- --use-system-libraries
        [--with-xml2-config=/path/to/xml2-config]
        [--with-xslt-config=/path/to/xslt-config]

If you are using Bundler, tell it to use the option:

    bundle config build.nokogiri --use-system-libraries
    bundle install

Note, however, that nokogiri is not fully compatible with arbitrary
versions of libxml2 provided by OS/package vendors.
```

So, the last commands are the things you should consider for a bundler based project.

```sh
bundle config build.nokogiri --use-system-libraries
bundle install
```

You can check the config:

```sh
bundle config
```

```txt
Settings are listed in order of priority. The top value will be used.
gem.test
Set for the current user (/Users/chris/.bundle/config): "rspec"

gem.mit
Set for the current user (/Users/chris/.bundle/config): true

gem.coc
Set for the current user (/Users/chris/.bundle/config): true

build.nokogiri
Set for the current user (/Users/chris/.bundle/config): "--use-system-libraries"
```

The file `~/.bundle/config` for completion:

```
---
BUNDLE_GEM__TEST: "rspec"
BUNDLE_GEM__MIT: "true"
BUNDLE_GEM__COC: "true"
BUNDLE_BUILD__NOKOGIRI: "--use-system-libraries"
```

And that's it. Fixed!

## Nokogiri documentation

If I also had consulted [the nokogiri documentation][ndoc] closely, I also would have got the hint earlier:

> Nokogiri will refuse to build against certain versions of libxml2, libxslt supplied with your operating system, and certain versions will cause mysterious problems. The compile scripts will warn you if you try to do this.

It focuses on libxml2, but the steps also help with the **libiconv** issue, too.

🤦

[n]: https://www.nokogiri.org/
[ndoc]: https://www.nokogiri.org/tutorials/installing_nokogiri.html#install-with-system-libraries
