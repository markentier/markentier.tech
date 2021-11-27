+++
title = "Multi-arch container images for Docker and Kubernetes"
date = 2021-11-27

[taxonomies]
tags = ["docker", "kubernetes", "container", "image", "multi-arch", "multi-platform","platform", "architecture", "amd64", "arm64", "processor", "dockerfile", "dockerfile:1-labs"]
categories = ["default"]

[extra]
has_hero = true
image_alt = "Containers, containers everywhere!"
+++

You run clusters on Raspberry Pis and Intel NUCs? You love ARM, but also need to provide images for your PC friends? Fret no more, learn about manifest lists and how BuildKit makes your life easier.

<!-- more -->

Most of us will probably use Docker and Kubernetes with one platform only.
The predominant platform being `"linux/amd64"`.[^platform] But due to the rise of ARM based devices and cloud services, `"linux/arm64"` is seing some traction as well. And if you're into embedded/<abbr title="Internet of Things">IoT</abbr>/microcontrollers you might come across `"linux/arm/v7"` or `"linux/arm/v6"`.

Depending on your environment you either build your Docker images already on the target platform or utilize cross building/compilation. Commonly you then push your platform specific images with distinct image names or tags.

Yet Docker also supports creating multi-platform manifests, so you can consolidate some efforts, mainly around handling different image names and tags for your diverse runtime needs.[^diverse]

_Wait, what? Why do you say "manifests" and not "images"?_

Well spotted, dear reader.

Without going into much further detail, the docker registry doesn't only store your images, but also some metadata around it. In reality an image is composed of different layers (at least one) and since such layers can be used by many different images, they are also separate entities. The manifest is the file that stores all the information around the image and layers, so when you run `docker pull` the program knows what to fetch. That's also why you see the multiple lines during the download phase, unless you're "lucky" and fetch a docker image consisting only of a single layer.[^lucky]

_So, what is a multi-arch docker image?_

First, I'll use multi-arch over multi-platform, as we will only focus on "linux" platforms. So both terms are used interchangeably by many people, for the better or worse. I believe it's okay, because you might be concerned about different processor architectures only, less so about running container workloads over different operating system families. (I guess game developers might be a good exception from this rule though.)

Second, the answer is quite simple. One of the supported types of the docker registry is manifest lists. And the content is also very boring, basically only a list of actual manifest including which platform they target. Yep, that's it.

```sh
# using buildx's inspection, as it provides the information from the registry
docker buildx imagetools inspect --raw nginx:alpine | jq
```

_The `buildx` command comes from the BuildKit plugin, which should be included in recent versions of the docker engine/desktop application._

```json
{
  "manifests": [
    {
      "digest": "sha256:f51b557cbb5e8dfd8c5e416ae74b58fe823efe52d9f9fed3f229521844a509e2",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "amd64",
        "os": "linux"
      },
      "size": 1568
    },
    {
      "digest": "sha256:02216f2fc478aa25afebef2e9f39507cc04445ce092ed96adb90983006bf5286",
      "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "arm",
        "os": "linux",
        "variant": "v6"
      },
      "size": 1568
    },
    // cut for brevity; more platforms in original output
  ],
  "mediaType": "application/vnd.docker.distribution.manifest.list.v2+json",
  "schemaVersion": 2
}
```

A single manifest looks like this:

```sh
docker buildx imagetools inspect --raw nginx:alpine@sha256:f51b557cbb5e8dfd8c5e416ae74b58fe823efe52d9f9fed3f229521844a509e2 | jq
```

```json
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
  "config": {
    "mediaType": "application/vnd.docker.container.image.v1+json",
    "size": 8892,
    "digest": "sha256:b46db85084b80a87b94cc930a74105b74763d0175e14f5913ea5b07c312870f8"
  },
  "layers": [
    {
      "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
      "size": 2822981,
      "digest": "sha256:97518928ae5f3d52d4164b314a7e73654eb686ecd8aafa0b79acd980773a740d"
    },
    {
      "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
      "size": 7251533,
      "digest": "sha256:a4e1564120377c57f6c7d13778f0b12977f485196ea2785ab2a71352cd7dd95d"
    },
    // cut for brevity, original output has more layers
  ]
}
```

It's also documented and explained on Docker's site:
<https://docs.docker.com/registry/spec/manifest-v2-2/>

By the way if you're interested what's in the container image config (since the media type is JSON, so we might wanna take a peek), you can run the following command and get a glimpse:

```sh
docker image inspect nginx:alpine --format '{{ json . }}' | jq
```

I leave the exercise for you, this post has too much JSON already. Also the output is what you would expect: it contains all the meta information and default values specified during the build of the image (environment variables, entrypoint and command, labels, …). More details under <https://github.com/moby/moby/blob/master/image/spec/v1.2.md>.

Since we learned, that multi-arch images are not really magic, let's build our own. There are two ways of doing it. Also both require a registry to push the data to. Other articles out there fall back to the public Docker Hub, but you can also do everything on your machine as shown here.

## Preparation

Since the local docker environment doesn't really play nicely with multi-arch images, a registry is needed for storage. You will also notice when you pull an image, you can only have one platform version at a time with the same image tag. The last pulled one keeps the tag, all previous ones become untagged (unless you re-tag them before pulling another one, of course). In practise only a minor inconvenience though.

### Docker Registry

For both approaches we need a local registry.

```sh
docker run \
  -d -p 5000:5000 \
  -v registry_data:/var/lib/registry \
  --restart=always \
  --name registry \
  registry:2
```

You can leave it running in the background.

If you need to clean up, don't forget to stop the container and remove both container and volume.

```sh
docker stop registry
docker rm registry
docker volume rm registry_data
```

### A pet project

In a folder create the following file:

#### Dockerfile

```dockerfile-labs
# syntax=docker/dockerfile:1-labs
FROM alpine:3.15

COPY <<-"SCRIPT" /info.sh
		#!/bin/sh
		echo "I am running under machine type (architecture):"
		uname -m
SCRIPT
RUN chmod +x /info.sh

CMD ["/info.sh"]
```

More information about `# syntax=docker/dockerfile:1-labs` and also what's currently in the labs channel can be found at <https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/syntax.md>. Here it's used for the multiline [heredoc] on the `COPY` command.

_Note: the script is indented with tabs (`\t`) not spaces. The latter won't work, the heredoc syntax only supports tab stripping._

For this you need a recent docker version, ideally 20.10 or better for native BuildKit support without fiddling around with configs and settings and env vars.

So all this application will do is to print a bit of text. `uname -m` returns the machine name (which is usually the same as processor (`-p`) and hardware name (`-i`)). For amd64 based images that should be `x86_64`, and for the arm64 version a value of `aarch64` instead. You could also change it to `uname -a` if you want all the information availabe, like which Linux kernel it is running on.

## Old-school multi-arch docker image creation<br><small>without BuildKit (buildx)</small>

Following steps will create two individual images (and manifests) and then combine them into a new one.

```sh
# run in the folder of Dockerfile and info.sh

# first let's build the multiple architectures and tag them appropriately:
docker build --platform linux/amd64 --tag localhost:5000/myapp:amd64 .
docker build --platform linux/arm64 --tag localhost:5000/myapp:arm64 .

# second push the images
docker push localhost:5000/myapp:amd64
docker push localhost:5000/myapp:arm64

# now let's combine the manifests into a single list and push it
docker manifest create localhost:5000/myapp:latest \
  --amend localhost:5000/myapp:amd64 \
  --amend localhost:5000/myapp:arm64 \
  --insecure
docker manifest push localhost:5000/myapp

# check the image manifest list from the registry:
docker buildx imagetools inspect localhost:5000/myapp
```

As you can see, this is very tedious and includes many steps.
On the plus side: you can parallelise that when using a CI/CD pipeline. And depending on the architecture support of your environment or provider you even need to do such fanout anyway.

_(The reason for the `--insecure` flag is explained in the following section.)_

## Modern multi-arch docker image build process<br><small>with BuildKit (buildx)</small>

**Note: BuildKit only supports Linux as a target.**

First let's prepare a dedicated builder instance for this. You might have already a default builder (check with `docker buildx ls`), but it uses the `docker` driver and that doesn't work particularly well for creating multi-platform images; if you try you will see the following message:

> error: multiple platforms feature is currently not supported for docker driver. Please switch to a different driver (eg. "docker buildx create --use")

That's exactly what we will do (just with some more arguments):

```sh
docker buildx create --name mybuilder --driver-opt network=host --use
docker buildx inspect --bootstrap
```

You could also add `--driver docker-container`, but BuildKit defaults to this when creating a new builder. The `network=host` option is there to allow pushing from the build container into the registry directly, otherwise that part would fail.

_Note: You will need to export your images in some way anyway, otherwise the image artefacts stay in the builder container, which is not very useful. So pushing to a registry is recommended._

The second step starts up the build container and displays information about the builder. If you remove the bootstrap flag, the container will be created the first time you need it.

The inspect subcommand should return something like this:

```
Name:   mybuilder
Driver: docker-container

Nodes:
Name:      mybuilder0
Endpoint:  unix:///var/run/docker.sock
Status:    running
Platforms: linux/amd64, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/mips64le, linux/mips64, linux/arm/v7, linux/arm/v6
```

Important is the "Platforms" line. For our experiment it must include `linux/amd64` and `linux/arm64`.

In case you can build all your desired architectures on a single machine, the following steps are needed:

```sh
# run in the folder of Dockerfile and info.sh

# create all the images and push all the manifests
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag localhost:5000/myappx:latest \
  --output=type=registry,registry.insecure=true .

# check the image manifest list from the registry:
docker buildx imagetools inspect localhost:5000/myappx
```

For a localhost registry you can also replace `--output=type=registry,registry.insecure=true` with the shorthand `--push`; since I play with `k3d`[^k3d] which also has an option to create registries, but with different host names, so the longer option is needed, as I don't want to switch to TLS and authentication for local testing.

There are alternative output options, but most of them are around storing artefacts locally.

You can keep the builder around, but if you want to clean up, run the following:

```sh
docker buildx rm mybuilder
```

## Final test

Since you managed to create the images for the different processor architectures you can also run the containers.

```sh
docker run --platform linux/amd64 --rm localhost:5000/myappx
docker run --platform linux/arm64 --rm localhost:5000/myappx
```

If everything works well you should see two different outputs, each telling you under which architecture they run.

## Summary

Now you know that multi-arch docker images are no magic. They are just a bundle of manifests, each pointing to an image specifically created for a platform.

Unless manually specified your docker engine or kubernetes cluster will pick the platform suited for its environment.

Have fun building a more diverse world!

<!-- footnotes -->

[^platform]: The "platform" is a tuple of operating system (OS) and processor architecture values. "linux" is the major OS, but you could also build "windows" images if you work with Docker Desktop under Window. For architectures you have a much wider variety of options, "amd64" and "arm64" being only two of many.[^amd64]

[^diverse]: Maybe you run heterogenous Kubernetes clusters like a mix of amd64 and arm64 based worker nodes. Or take Apple's new Macbooks into consideration, where the M1 family are ARM based, so for many years you'll have to deal with a potpourri of processor architectures in your company. The reasons are manifold.

[^lucky]: If you're lucky or not depends on why the image has only a single layer and how that also plays into the rest of your container environment. If you usually build most of your images from the same base layers and somebody decided to squash their image, then you might see yourself unlucky, because now you have to download the whole image and cannot skip the duplicated pieces anymore, and if such images are huge a lot of wasted time and space is what you get. But if you're dealing with let's say a bunch of single binaries wrapped in "FROM scratch" docker images, each of them very small, then there's no win in having shared layers, as there are none. Lucky you! 😉

[^k3d]: [k3d] is a tool to run [k3s] within Docker. `k3s` is a nice and compact Kubernetes distribution.

[^amd64]: Let's not get into the weeds of why it's commonly called `amd64` even though it means "all 64-bit x86 processors" also known as `x86_64`. The very short answer is that AMD was the first creating the 64 bit instruction set for the x86 architecture. But your Intel based processors will just work fine.<br>_So the rule seems to be: if you're the first, you name the baby, or something along the line I guess._

<!-- links -->

[heredoc]: https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/syntax.md#here-documents "dockerfile syntax; labs feature: heredocs"
[k3d]: https://k3d.io/
[k3s]: https://k3s.io/
