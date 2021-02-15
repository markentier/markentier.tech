+++
title = "Using git with multiple profiles and GPG+SSH keys"
date = 2021-02-14

[taxonomies]
tags = ["git", ".gitconfig", "include", "includeIf", "GitHub", "account", "key", "GPG", "SSH", "profile", "configuration", "personal", "work", "private", "separation", "development", "VCS", "version", "control", "system"]
categories = ["default"]

[extra]
has_hero = true
image_alt = "Select your git profile, lean back, and push your code. Don't forget your popcorn. 🍿"
+++

I work across 2 computers and 3 OS, all with nearly same development setup. For work I need some special care for my git config, since I want/need access to personal repositories.

<!-- more -->

Recently I helped a coworker during onboarding with his machine setup and he asked me about this very same topic. I provided him with what I have and use. The following blog post is a refined version of it.

The slightly more complex version control system configuration is due to the following requirements and expectations:

- **I want to use my personal (and main) email address for my personal GitHub projects.**
- I want to use my work email address for the workplace stuff.
- I want separate GPG keys for each email address.
- I want to sign my commits with the individual GPG keys for each of the addresses.
- I want separate SSH keys for each context (work, personal; but also for each computer).
- I want to use the individual SSH keys based on the project I work on.
- I want all of it happening as automatically as possible.
- I want to forget that it is there.

I know, I know, this looks like a huge list of requirements. But not only is this my personal preference, partially also my workplace has some strictler rules, especially when it comes to security.

If you do work in an early stage startup you might think that it would be excessive, but I promise you: if that company becomes successfull and grows and turns into a bigger deal like an enterprise, things will change. And part of it will be around security and compliance. You better improve your setup now when it's still easy to do so.

On _Latacora_ you can find [a nice compilation of things][latacora] you need to consider and implement if you want to go big and sell your startup, but a lot of it could and should be done without that goal in mind.

So, if you cannot get rid of the first point and do need also access to your personal persona on GitHub (or any other git based hosting platform for that matter), this article might help you to achieve it.

_»Why would I continue using my personal GitHub account on my work machine anyway?« — You may or may not be an open source contributor, and you may or may not use such open source software at your current employer's projects for example. The reasons are plenty and some will justify the need for what is described here._

By the way, this approach should work for both single and multiple GitHub accounts. Since GitHub makes it easy to keep using a single account while also being a member of an Enterprise organization, I haven't bothered testing it with a true multi-account configuration, but since you will use individual SSH and GPG keys for either way your computer won't really know the difference.

## SSH configuration

While `git` does support the HTTPS transport, in most cases you will use the more preferred way of talking _git+ssh_ instead. So let's tackle this lower level first:

### SSH Keys

If you working with GitHub you want to generate keys with the latest and greatest recommended algorithms:

```sh
ssh-keygen -t ed25519 -C "your_email@example.com"
```

If you work on other platforms, please check first, which algorithms are supported there.

In decreasing order of preference and security:

```sh
# prefer this if possible:
ssh-keygen -t ed25519

# this is still quite okay:
ssh-keygen -t ecdsa -b 521

# this only as a last resort option, should work everywhere:
ssh-keygen -t rsa -b 4096

# avoid this, please;
# also GitHub does not allow new keys with DSA anymore!
ssh-keygen -t dsa
```

More details about key generations at: <https://www.ssh.com/ssh/keygen/>

### `~/.ssh/config`

```conf
### github

### -- PERSONAL/MAIN ACCOUNT --

Host github.com
  Hostname github.com
  User <YOUR GITHUB USERNAME>
  IdentityFile ~/.ssh/<YOUR PERSONAL SSH KEY>

### -- WORK PERSONA/ACCOUNT --

Host github.com-work
  Hostname github.com
  User <YOUR GITHUB USERNAME>
  IdentityFile ~/.ssh/<YOUR WORK SSH KEY>

### general

Host *
  AddKeysToAgent yes
  IdentitiesOnly yes
  PreferredAuthentications publickey
  Compression yes
```

**Important note:** Do not change the order of the configuration.

{% quoted(source="ssh_config(5) manual", href="https://linux.die.net/man/5/ssh_config") %}
<p>For each parameter, the first obtained value will be used. The configuration files contain sections separated by ''Host'' specifications, and that section is only applied for hosts that match one of the patterns given in the specification. The matched host name is the one given on the command line.

<p>Since the first obtained value for each parameter is used, more host-specific declarations should be given near the beginning of the file, and general defaults at the end.
{% end %}

Since we will use two different hosts, we must repeat the `Hostname` line, but also want to specify `User` and `IdentityFile` specifically. If you use your ssh config only for git and also have only a single user name, you could move that config line into the generic section in the bottom. Though I still prefer the explicit repetition for each specific Host block.

At this point you might wonder »How is _github.com-work_ supposed to function?«
Hold that thought, we will come back to it later.

## GPG key management

You want to use GPG for signing commits.
Your workplace might not require it (yet), but if you have any level of trust issues, or just want to be sure that a commit was made by you and be able to prove it, use commit signing.

Interestingly GitHub does not recommend you to use a more modern algorithm and [requires you to pick RSA.][gh-gpg] A bit sad, but RSA with 4096 bits seems to be still fine for this purpose.

After you have created your keys, you should grab the IDs for them:

```sh
gpg --list-secret-keys --keyid-format LONG

# I use shorter IDs and git doesn't seem to struggle
gpg --list-secret-keys --keyid-format SHORT
```

Example output:

```
/home/asaaki/.gnupg/pubring.kbx
-----------------------------​--
sec   rsa4096/D73D7242 2021-02-14 [SC]
      AE93078BDC15BF6A84767DBBA3CBBB61D73D7242
uid         [ultimate] TEST KEY <test-key@example.com>
ssb   rsa4096/57047776 2021-02-14 [E]
```

The ID is the part after the `rsa4096/` from the `sec` line: `D73D7242`

_In the LONG variant it just used more characters from the whole fingerprint (which you can completely see in the line between sec and uid)._

## git shenanigans

The `git` command line interface (CLI) improved a lot over the years. I remember that I used a custom `GI_SSH=…` wrapper in my shell environments to make this whole host/key mapping possible, but thanks to the power of git configs this is a thing of the past.

### `~/.gitconfig`

```gitconfig
[init]
  defaultBranch = main

[commit]
  gpgsign = true

# other sections cut for brevity; add the following to the bottom:

[user]
  name = Your Name
  useConfigOnly = true

# optional (if you sometimes work outside of your regular directories)
[include]
  path = ~/.gitconfig.personal

[includeIf "gitdir:~/Development/Personal/"]
  path = ~/.gitconfig.personal

[includeIf "gitdir:~/Development/Work/"]
  path = ~/.gitconfig.contentful
```

### `~/.gitconfig.personal`

```gitconfig
[user]
  email = your.personal@email.here
  signingKey = <PERSONAL GPG SIGNING KEY ID>
```

### `~/.gitconfig.work`

```gitconfig
[user]
  email = your.work@email.here
  signingKey = <WORK GPG SIGNING KEY ID>

[url "git@github.com-work"]
  insteadOf = git@github.com
```

### Explanation

`include` and `includeIf` are the key components to separate out specific configurations based on where you are on your system.

`include` is always pulled in, this is useful if you really want to separate out parts of your main `.gitconfig`.

If you only work in specific directories like `~/Development/Personal/` and `~/Development/Work/` — and this means where you also need to commit and push — then you could remove the general `[include]` section entirely. I keep it around, because I might have checked out a repository somewhere else and don't want to move it for a commit.

There's probably a better way to organize this, but the above has served me well for quite some time now.

I recently added the global `[user]` section for setting `useConfigOnly = true` and the name, since I only have one. `useConfigOnly` prevents git from guessing name and email and forces it to read it from the configuration files. If the email would be missing, git will complain the next time you try to commit or push. And you will know that something is broken in the configuration.

**Important note:** The trailing slashes (`/`) on the `[includeIf …]` lines are very important. If you forget them, then git would try to match only this very specific folder and ignore it for any folder within it. More details about **conditional includes** in the [git documentation][git-docs]. _(I totally missed that you can use them even for branches, too.)_

The `signingKey` values should be set appropriately based on the IDs you have noted from the [previous section](#gpg-key-management) of this article. Now when you commit anything git will use the correct key based on where the repository directory lives.

To automatically enforce the commit signing, use `commit.gpgsign` set to `true`.

Remember the question you had earlier about the weird looking Host configuration in SSH? The `[url "git@github.com-work"]` section is the counterpart making it work, because git will do the translation when you are in your company's repos.

What will happen is the following:

- You are in a **work** related repository.
- You want to _fetch/pull_ the latest changes or _push_ your local state to the origin.
- Since git will load the **work** config, it replaces the regular URLs having `git@github.com` in it with the value of the `[url …]`, here `git@github.com-work`.
- git reaches one level down and uses ssh for the communication.
- SSH sees a `github.com-work` host and tries to find all matching configurations for that, including the exact one we have [defined above](#ssh-config).
- SSH will ignore our personal configuration, because the regular `github.com` does not match anymore.
- SSH picks up your **work** identity file for authentication with GitHub's server.
- SSH will also use the actual `Hostname` instead of `Host` (translating it back again).
- Everyone is happy. \o/

-----

_What's with this `[init]` block you haven't mentioned before?_

Since Git 2.28 you can set a name for the default branch when creating a new repository. Be a good citizen and avoid offensive and negatively connotated terms. The wider developer community seems to like "main" as a good replacement for the previous default name. You can read more about [renaming existing default brances][gh-renaming] on GitHub.

## Security considerations

You might want to use passwords for both the GPG and SSH keys, your employer might even have a rule for this. To avoid annoyances in your workflows make sure your system has some sort of keychain manager and can keep the passwords for a period of time.

Since the setups vary for each operating system and this part is also out of scope for this post, I leave it to you to figure it out.

## Who's pushing?

In total 2 files to change and 2 files to add (excluding all the keys), and you have a nice setup for using multiple accounts, emails, GPG keys, and/or SSH keys on your computer.

And from here you can expand it even further if you like or need.

Last but not least: this now works for existing repositories, locally created, or freshly cloned ones. As long as the repos are somewhere nested in the right parent directory, you're set and done.

### Bonus

To quickly check which config is used execute the following command in a repository:

```sh
git remote -v
```

The URL should provide you a quick hint if the correct profile is used.

Alternatively you can also run:

```sh
git config --show-origin --get user.email
```

This will also print where the final value was retrieved from.

-----

Git came a long way and I'm very glad and happy that we can have such setup without a lot of manual tinkering and workarounds. Gone are all my custom scripts, snippets, and `.envrc`'s for that purpose, which were also not completely platform agnostic.

_Have you tried it yourself? Is something not working as expected? Let me know and [send me a message][tw] on Twitter._

<!-- links -->

[latacora]: https://latacora.micro.blog/2020/03/12/the-soc-starting.html
[gh-gpg]: https://docs.github.com/en/github/authenticating-to-github/generating-a-new-gpg-key
[git-docs]: https://git-scm.com/docs/git-config#_conditional_includes
[gh-renaming]: https://github.com/github/renaming
[tw]: https://twitter.com/asaaki
