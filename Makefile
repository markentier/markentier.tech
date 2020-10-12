# markentier.tech

NETLIFY_DEPLOY_URL ?= https://markentier.tech

export PATH := $(PWD)/zola:$(PATH)
UNAME := $(shell uname -s)
SUFFIX ?= tar.gz
ifeq ($(UNAME), Linux)
	export PATH := tools:$(PATH)
	PLATFORM = x86_64-unknown-linux-gnu
endif
ifeq ($(UNAME), Darwin)
	PLATFORM = x86_64-apple-darwin
endif
ifeq ($(findstring NT-10,$(UNAME)),NT-10)
	PLATFORM = x86_64-pc-windows-msvc
	SUFFIX = zip
endif

ZOLA = zola
ZOLA_VERSION ?= 0.12.2
ZOLA_RELEASE_URL = https://github.com/getzola/zola/releases/download/v$(ZOLA_VERSION)/zola-v$(ZOLA_VERSION)-$(PLATFORM).$(SUFFIX)
ZOLA_PKG = $(ZOLA).$(SUFFIX)

SITE_ROOT = site
OUTPUT_DIR = public

LOCAL_PROTO ?= http
LOCAL_HOST  ?= localhost
LOCAL_BIND  ?= 0.0.0.0
LOCAL_PORT  ?= 3000
LOCAL_ADDR   = $(LOCAL_HOST):$(LOCAL_PORT)

BUILD_PATH = $(ZOLA)/$(ZOLA)

BUILD_CMD = $(ZOLA) --root $(SITE_ROOT) build \
							--base-url $(NETLIFY_DEPLOY_URL) \
							--output-dir $(OUTPUT_DIR)

SERVE_CMD = $(ZOLA) --root $(SITE_ROOT) serve \
							--drafts --base-url $(LOCAL_HOST) \
							--interface $(LOCAL_BIND) --port $(LOCAL_PORT) \
							--output-dir $(OUTPUT_DIR)

NODE_VERSION ?= 14

TIDY_XML_SETTINGS = -q -m -w 0 -i -utf8 -xml \
										--indent-with-tabs yes \
										--indent-spaces 2 \
										--tab-size 2

COVERS = $(shell find site -iname 'cover.png')
THUMBS = $(COVERS:cover.png=thumb.png)

THUMB_SIZE = 320x160
PNG_COLORS = 32

PNGS = $(shell find site -iname '*.png')
JPGS = $(shell find site -iname '*.jpg')
JPG2PNG = $(JPGS:.jpg=.png)
WEBPS = $(PNGS:.png=.webp)
AVIFS = $(PNGS:.png=.avif)



# DEFAULT TARGET

build: install-zola build-site post-processing



# LOCAL DEVELOPMENT

serve:
	$(SERVE_CMD)

serve-with-theme-reload:
	watchexec -w site/themes/mttt -r -s SIGHUP "$(SERVE_CMD)"

local:
	$(MAKE) build NETLIFY_DEPLOY_URL=$(LOCAL_PROTO)://$(LOCAL_ADDR)



# DEPLOYMENT TO NETLIFY

netlify: install-zola build
	@echo NETLIFY_DEPLOY_URL = $(NETLIFY_DEPLOY_URL)
	@echo DEPLOY_URL = $(DEPLOY_URL)
	@echo DEPLOY_PRIME_URL = $(DEPLOY_PRIME_URL)



# BUILD STEPS

build-site: build-html build-feeds

build-html:
	$(BUILD_CMD)

build-feeds:
	mv public/atom/index.html public/feed.atom.xml
	mv public/rss/index.html public/feed.rss.xml
	mv public/json/index.html public/feed.json
	command -v tidy >/dev/null 2>&1 && \
		(find public -type f -name '*.xml' -exec tidy $(TIDY_XML_SETTINGS) -o {} {} \;) || \
		echo "No tidy installed."

post-processing:
	yarn
	IMG_BASE_URL=$(NETLIFY_DEPLOY_URL) yarn run gulp

rebuild-all: regenerate-thumbs images build


## IMAGE PROCESSING

images:
	$(MAKE) create-pngs
	$(MAKE) create-thumbs
	$(MAKE) create-avif
	$(MAKE) create-webp

images-with-recreate:
	$(MAKE) delete-avifs delete-webps delete-thumbs
	$(MAKE) images

create-pngs: $(JPG2PNG)

$(JPG2PNG): %.png: %.jpg
	convert $< $@

list-pngs:
	@find site -iname '*.png' -exec wc -c {} \;

optimize-pngs:
	@find site -iname '*.png' -exec sh -c "\
		echo 'Optimizing file: {}' && \
		echo ' -- before size: \c' && wc -c < {} && \
		oxipng -q -o max -a -Z -s --fix --force --out {} {} && \
		echo ' --- after size: \c' && wc -c < {} \
	" \;

### THUMBNAILs

create-thumbs: $(THUMBS)

delete-thumbs:
	rm -rf $(THUMBS)

regenerate-thumbs: delete-thumbs create-thumbs

$(THUMBS): %thumb.png: %cover.png
	@echo "from\n  $<\nto\n  $@"
	@echo "=== [0] Size: `wc -c < $<`"
	convert -resize $(THUMB_SIZE) $< $@
	@echo "=== [1] Size: `wc -c < $@`"
	pngquant --speed 1 --strip --force --output $@ $(PNG_COLORS) $@ 2>/dev/null
	@echo "=== [2] Size: `wc -c < $@`"
	oxipng -q -o max -a -Z -s --fix --force --out $@ $@
	@echo "=== [F] Size: `wc -c < $@`"
	@echo

### AVIFs

create-avif: $(AVIFS)

$(AVIFS): %.avif: %.png
	@echo "from\n  $<\nto\n  $@"
	@cavif --quality=42 --overwrite -o $@ $<

list-avifs:
	@find site -iname '*.avif' -exec wc -c {} \;

delete-avifs:
	rm -rf $(AVIFS)

### WEBPs

create-webp: $(WEBPS)

$(WEBPS): %.webp: %.png
	@echo "from\n  $<\nto\n  $@"
	@cwebp -mt -pass 10 -z 9 -lossless -exact $< -o $@

list-webps:
	@find site -iname '*.webp' -exec wc -c {} \;

delete-webps:
	rm -rf $(WEBPS)



# CLEANING

clean:
	@rm -rf public

clean-yarn:
	@rm -rf node_modules yarn*



# TOOLS AND DEPENDENCIES

install-mac: install-zola
	brew install -f tidy-html5 imagemagick pngquant webp

# debian/ubuntu based systems only for now.
# NOTE: we ship a prebuilt tidy in the tools folder.
install-debs: install-zola install-tools
	sudo apt-get update
	sudo apt-get install -y imagemagick pngquant webp

install-zola: $(BUILD_PATH)

$(BUILD_PATH):
ifeq ($(SUFFIX),tar.gz)
	curl -sSL -o $(ZOLA_PKG) $(ZOLA_RELEASE_URL)
	mkdir -p $(ZOLA) && tar zxf $(ZOLA_PKG) -C $(ZOLA)
else
	curl -sSL -o $(ZOLA_PKG) $(ZOLA_RELEASE_URL)
	mkdir -p $(ZOLA) && unzip $(ZOLA_PKG) -d $(ZOLA)
endif
	@echo "Full path: "; which zola
	@zola -V

clean-zola:
	@rm -rf zola*

install-tools:
	cargo install watchexec
	cargo install oxipng
	cargo install cavif
	cargo install svgcleaner
	yarn global add svgo
	yarn global add netlify-cli

clean-installs: clean-zola
