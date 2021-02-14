+++
title = "Is Microsoft eating the Software World?"
date = 2020-11-09

[taxonomies]
tags = ["Microsoft", "Windows", "WSL", "WSL2", "software",
        "TypeScript", "JavaScript", "GitHub",
        "VSCode", "Visual Studio", "Visual Studio Code", "code", "Codespaces",
        "Windows 10", "Windows Terminal", "PowerShell", "PowerToys",
        "Azure", "Azure Pipelines", "Azure DevOps",
        ]
categories = ["default"]

[extra]
has_hero = true
image_alt = "Pacman eating earth globe pills"
+++

Usually the answer to such indicative title questions is **No,** but perhaps this time the answer is … **Maybe yes?**

<!-- more -->

<pre>
I host my code on GitHub.
I edit my code with VSCode.
I program in TypeScript sometimes.
I use the Windows operating system.
  And the Windows Terminal.
  And the WSL.
I check sites on Edge every once in a while.*

I have not used Azure yet, though.
           And the many other open source projects
            or all of their paid software.
</pre>

{{smallnote(t="*) That is more a point for Google nowadays, isn't it?", e="🤷🏻‍♂️")}}

-----

Let's have a high-level view on their catalogue of some products. Not an exhaustive list, but showing the most pertinent to the topic of software development.

## GitHub

🔗 <https://github.com/>

To be fair here, GitHub (GH) was only an acquisition, but from Microsoft's (MS) point of view probably a very good one indeed. If you like it or not, but GH is **the** code hosting platform, based on the equally famous version control system called **git.**

And since GitHub also has now Actions (CI workflows), MS didn't even need to buy another competitor separately. Sure, GitHub Actions is not always on par with other CI/CD platforms, but for most people it will do the job.

<small>More about Azure DevOps/Pipelines [further down](#azure-pipelines).</small>

## Visual Studio Code

🔗 <https://code.visualstudio.com/>

While "Visual Studio" is the big brother, a full featured IDE, mainly used for Windows application development (though can be used for other use cases like web as well), **Visual Studio Code** (VSCode or simply Code for short) is only "little" on the surface. It is slimmer and thus very fast. The main focus is probably on web development, since it ships with some extensions targeting this field by default. Like the following …

To be honest, after having used and tried so many editors (Notepad++, vim, Textmate, Sublime Editor, Atom Editor), this one finally stuck. The vast amount of extensions makes it a power tool for your every day coding business.

## Codespaces

🔗 <https://github.com/features/codespaces>

When GitHub and VSCode had a child, then it would be it.

**Codespaces** is basically a full development environment in the cloud. You edit your GitHub hosted project in a browser version of Visual Studio Code and can run compilation or other build steps in a containerized system (using Docker).

Currently still in beta, but I hope it will get widely accessible soon. I got my access pretty quickly (and overall the first time I got into a beta at GitHub anyway). While Codespaces is not necessarily for me (I have a beefy home PC and love to run a lot locally), people working on less powerful machines and/or on the way/remotely will enjoy such environment. Due to its tight integration of components the experience is much smoother than you might know from alternative cloud based IDEs.

Maybe if you work on a [Raspberry Pi 400](/posts/2020/11/raspberry-pi-400/), then Codespaces is probably the perfect environment for you.

## TypeScript

🔗 <https://www.typescriptlang.org/>

If JavaScript (JS) was a strongly typed language it would probably have been TypeScript (TS). There were other attempts like Facebook's Flow in the past, but in the end TS won. _(At least I haven't heard anyone talking about anything else but TS.)_

Of course, it is not natively supported by browsers or NodeJs, but it is not too difficult to compile your `.ts` files to JS. And with [Deno][deno] you have the option to run it without this step in between. (And don't worry, while they want to remove the internal TS code, that does not mean, deno will not support TS for your projects; [read this nice summary][deno-ts])

Long story short, if you want to more confidently develop JS based applications and services for either frontend or backend, you should have a look at TypeScript.

## Windows

🔗 <https://www.microsoft.com/windows>

I have to admit, **Windows 10** is probably the most usable version of the Windows operating system since the time I had my first PC with Windows 95 (yeah, I got lucky and skipped the 3.x times). There are still the regular "Oh, here's an update and you have to restart" events, but at least compared to MacOS it is not even that much more anymore.

Windows alone wouldn't do the cut though, so let's also look more into the ecosystem around it.

### WSL (Windows Subsystem for Linux)

🔗 <https://aka.ms/wsl>

I think this one of the most surprising developments driven by Microsoft itself. Sure, we have virtualizations (VirtualBox, VMWare), we have Docker, but actually a much tighter Linux integration into Windows? I never imagined that coming. Yet they did. And I'm very grateful for that. Especially with **WSL 2** most of the things got a bit better and faster, only the filesystem performance across the boundaries needs to be fixed, as you can read in my previous article about [my struggles with git status under WSL 2 and how to fix it][wsl2-git].

Even Docker for Windows itself can piggyback on WSL 2 if present and configured. Which also allows for interesting cross OS workflows, since you can access your containers from Windows and Linux at the same time.

Also the networking is done well, so that you can spawn a webserver in your WSL session and open in your browser of choice on your Windows host. Such smooth experience is not self-evident everywhere.

### Windows Terminal

🔗 <https://aka.ms/terminal>

It's like _iTerm2_ on MacOS or one of the gazillion terminal emulators under Linux. It is not extremely feature rich, but it is fast and slim, looks great, and handles my PowerShell & WSL sessions easily. You should consider that over the standard terminal which looks as ugly as the cmd.exe CLI.

And while Alacritty ([GH][alacritty]; a cross platform terminal emulator) is also an option, it lacks tabs. Since I have multiple sessions open (at least one WSL and one PowerShell) I want and need them grouped into one application window.

### Other honorable mentions

#### PowerShell

🔗 <https://aka.ms/powershell>

Do you remember the good old `cmd.exe` console? Yeah, PowerShell is nothing like that. It's a pretty decent shell. Since I'm still more used to Linux/POSIX like shells I stick to Git Bash for quick "on-Windows" work or open a WSL2 environment instead. On the other hand with pretty nice Rust based tools I can have them on both Windows and Linux environments and thus also call them quickly from a PowerShell, too.

I would have dreamed of such an environment back then in the late 90s/early 2000s!

{% quoted(source="What is PowerShell?", href="https://docs.microsoft.com/en-us/powershell/scripting/overview?view=powershell-7") %}
<p>PowerShell is a cross-platform task automation and configuration management framework, consisting of a command-line shell and scripting language. Unlike most shells, which accept and return text, PowerShell is built on top of the .NET Common Language Runtime (CLR), and accepts and returns .NET objects. This fundamental change brings entirely new tools and methods for automation.
{% end %}

That's a mouthful description. Since I haven't done anything with .NET, I cannot tell if that is a good thing to have.

#### PowerToys

🔗 <https://aka.ms/powertoys>

That is more a convenience toolbelt, but I mention it, because it provides some tiny niceties to the Windows experience, like better application window management (my actual main use case for installing it). Given how obsessed some Linux users are with their tiling window managers, PowerToys might have some good competition in its bag to make a switch at least possible.

If you're a Windows power user and not using PowerTools yet, go check it out now!

## Azure

🔗 <https://azure.microsoft.com/>

I know basically nothing about this cloud computing platform, but it is somehow not surprising that Microsoft runs one, since they also have moved a lot of their software offerings to the cloud in the first place. While many people and companies may work on AWS and GCE, some might want to consider Azure simply to have a one-stop shop for all their MS based development work.

### Azure Pipelines

🔗 <https://azure.microsoft.com/services/devops/pipelines/>

Probably more interesting would be to look at Azure Pipelines, which is interestingly in direct competition to GitHub Actions. I wonder if and when both CI platforms merge into a single solution, but given that it's part of the whole Azure DevOps I doubt that would happen anytime soon.

## Microsoft Edge

🔗 <https://www.microsoft.com/edge>

Since they changed their underlying engine to Blink and V8 (so yet another Chromium based browser like Chrome, Opera, and other derivatives), Edge is not a very special browser at all. I don't use it often, only if I need a Chrome like experience without incognito mode, but still without my Google account attached to it. I still have a Firefox installed as well, for the true cross browser checks.

It's interesting how Microsoft actually finally gave up in the "browser wars", defeated by the overwhelming lead of Google. Older folks might remember that MS were the leader once with Internet Explorer, but lost it due to an extremely flawed browser everyone hated.

-----

## Verdict

I don't know about you, but seeing the impressive list of tools, services, and products Microsoft has released over the last few years, a lot of them even open source, makes me wonder if I could do my professional job fully on a Windows based system, too. <small>(For personal stuff I already do.)</small>

Currently I work on a Macbook with MacOS at my job, and the only difference is the more native look and feel workflow for Linux/Unix based development. On the other hand, we use containerization via Docker a lot, setting both Mac and Win on the same level anyway. For plain work all relevant tools and application exist for all 3 major operating systems.

I'll definitely continue using my Windows based home PC, having the Linux installation purely as an emergency fallback, but not relying on it for my daily tasks.

-----

Of course, I will never convince hardcore Linux users to switch, ever. But I might have given you a brief overview what has happened in recent years in the Microsoft and Windows ecosystem, and not everything is so dire as it was like 10 years ago. I remember the times I tried to do web development with the LAMP stack (the [XAMPP][xampp] project seems to be still alive and kicking), it was a nightmare sometimes, and also one of the reasons I switched to Linux for quite some time, having experienced different distributions and their package managers; I even tried a _Linux from scratch_ setup once.

Also there is still the entry question in the room …

_So will Microsoft eat the software world? Or have they done already?_

It's a **yes and no.**

**Yes,** they have strong stands in some key areas of software development, you can rely on a lot of Microsoft provided apps and services. I haven't even discovered and used all of them.

Not even Apple comes close to that, where almost nothing is for free or open source anyway.
(And they don't build a lot in-house, their [open source page][apple-oss] is a joke.)

But also **No,** because there are also areas where they are not the leading force. When it comes to Web topics I consider Google a much stronger competitor and more influencing than MS. That earlier mentioned browser turf war is probably a hint (which is topic for another day).

Yet being in control of how the web apps are build (TypeScript) and which tools are used for that (VSCode, GitHub) is probably still a good counter move so far.

-----

Furthermore there is the follow-up question: _Would it be really bad if Microsoft ruled the software development world?_

And to that I have not a good answer yet. Right now I welcome the change, as it is also very beneficial to me.

It is also on the same level with Google's dominance in the Web and Mobile development. So both topics might be worth a look on their own.

-----

Fun fact: I haven't used any office suite for years, and it looks like Microsoft went to the cloud without me noticing it.

_What's your opinion about Microsoft's push in the software development field? Do you like it, hate it? Let me know and [send me a message][tw] on Twitter._

<!-- links -->

[deno]: https://deno.land/
[deno-ts]: https://dev.to/buttercubz/why-deno-want-remove-typescript-from-your-internal-code-1hjl
[alacritty]: https://github.com/alacritty/alacritty
[wsl2-git]: /posts/2020/10/faster-git-under-wsl2/
[xampp]: https://www.apachefriends.org/
[apple-oss]: https://opensource.apple.com/
[tw]: https://twitter.com/asaaki
