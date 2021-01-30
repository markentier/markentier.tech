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
ZOLA_VERSION ?= 0.13.0
ZOLA_RELEASE_URL = https://github.com/getzola/zola/releases/download/v$(ZOLA_VERSION)/zola-v$(ZOLA_VERSION)-$(PLATFORM).$(SUFFIX)
ZOLA_PKG = $(ZOLA).$(SUFFIX)

SITE_ROOT = site
OUTPUT_DIR = public

LOCAL_PROTO ?= https
LOCAL_HOST  ?= markentier.test
LOCAL_BIND  ?= 0.0.0.0
LOCAL_PORT  ?= 3000
LOCAL_ADDR   = $(LOCAL_HOST):$(LOCAL_PORT)

BUILD_PATH = $(ZOLA)/$(ZOLA)

BUILD_CMD = $(ZOLA) --root $(SITE_ROOT) build \
							--base-url $(NETLIFY_DEPLOY_URL) \
							--output-dir $(OUTPUT_DIR)

SERVE_CMD = $(ZOLA) serve \
							--drafts --base-url $(LOCAL_HOST) \
							--interface $(LOCAL_BIND) --port $(LOCAL_PORT) \
							--output-dir ../$(OUTPUT_DIR)

NODE_VERSION ?= 14

TIDY_XML_SETTINGS = -q -m -w 0 -i -utf8 -xml \
										--indent-with-tabs yes \
										--indent-spaces 2 \
										--tab-size 2

COVERS = $(shell find $(SITE_ROOT) -iname 'cover.png')
THUMBS = $(COVERS:cover.png=thumb.png)
ALL_THUMBS = $(shell find $(SITE_ROOT) -iname 'thumb.*')
PNGS = $(shell find $(SITE_ROOT) -iname '*.png')
JPGS = $(shell find $(SITE_ROOT) -iname '*.jpg')
JPG2PNG = $(JPGS:.jpg=.png)
AVIFS = $(PNGS:.png=.avif)
WEBPS = $(PNGS:.png=.webp)
OPNGS = $(PNGS:%=OPTIMIZE_%)

THUMB_SIZE = 320x160
PNG_COLORS = 32


# DEFAULT TARGET

build: install-zola build-site post-processing



# LOCAL DEVELOPMENT

serve:
	cd $(SITE_ROOT) && $(SERVE_CMD)

local:
	zola -V
	$(MAKE) build NETLIFY_DEPLOY_URL=$(LOCAL_PROTO)://$(LOCAL_ADDR)

local.prod:
	time $(MAKE) local
	microserver -p $(LOCAL_PORT) $(OUTPUT_DIR)


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
	mv $(OUTPUT_DIR)/atom/index.html $(OUTPUT_DIR)/feed.atom.xml
	mv $(OUTPUT_DIR)/rss/index.html $(OUTPUT_DIR)/feed.rss.xml
	mv $(OUTPUT_DIR)/json/index.html $(OUTPUT_DIR)/feed.json
	command -v tidy >/dev/null 2>&1 && \
		(find $(OUTPUT_DIR) -type f -name '*.xml' -exec tidy $(TIDY_XML_SETTINGS) -o {} {} \;) || \
		echo "No tidy installed."

post-processing:
	npm install
	IMG_BASE_URL=$(NETLIFY_DEPLOY_URL) npx gulp

rebuild-all: regenerate-thumbs images build


## IMAGE PROCESSING

images:
	$(MAKE) create-pngs -j $(shell expr $(shell nproc) / 2 + 1)
	# DISABLED: $(MAKE) create-thumbs -j $(shell expr $(shell nproc) / 2 + 1)
	$(MAKE) create-avif create-webp -j $(shell expr $(shell nproc) / 2 + 1)

images-from-scratch:
	$(MAKE) delete-avifs delete-webps delete-thumbs
	$(MAKE) create-pngs     -j $(shell expr $(shell nproc) / 2 + 1)
	$(MAKE) optimize-pngs-x -j $(shell expr $(shell nproc) / 2 + 1)
	# DISABLED: $(MAKE) create-thumbs   -j $(shell expr $(shell nproc) / 2 + 1)
	$(MAKE) create-avif     -j $(shell expr $(shell nproc) / 2 + 1)
	$(MAKE) create-webp     -j $(shell expr $(shell nproc) / 2 + 1)

create-pngs: $(JPG2PNG)

$(JPG2PNG): %.png: %.jpg
	convert $< $@

list-pngs:
	@find site -iname '*.png' -exec wc -c {} \;

optimize-pngs:
	$(MAKE) optimize-pngs-x -j $(shell expr $(shell nproc) / 2 + 1)

optimize-pngs-x: $(OPNGS)

$(OPNGS): OPTIMIZE_%: %
	@echo 'Optimizing file: $<'
	@oxipng -q -o max -a -Z -s --fix --force --out $< $< 2>/dev/null
	@optipng -o7 -zm1-9 -strip all -clobber -fix -nb -i0 -nc -np --out $< $< 2>/dev/null
	@pngquant --speed 1 --strip --force --output $< $< 2>/dev/null

### THUMBNAILs

create-thumbs: $(THUMBS)

delete-thumbs:
	rm -rf $(ALL_THUMBS)

regenerate-thumbs: delete-thumbs create-thumbs

$(THUMBS): %thumb.png: %cover.png
	@echo "from\n  $<\nto\n  $@"
	@echo "=== [0] Size: `wc -c < $<`"
	convert -resize $(THUMB_SIZE) $< $@
	@echo "=== [1] Size: `wc -c < $@`"
	pngquant --speed 1 --strip --force --output $@ $(PNG_COLORS) $@ 2>/dev/null
	@echo "=== [2] Size: `wc -c < $@`"
	oxipng -q -o max -a -Z -s --fix --force --out $@ $@
	@echo "=== [3] Size: `wc -c < $@`"
	optipng -o7 -zm1-9 -strip all -clobber -fix -i0 --out $@ $@ 2>/dev/null
	@echo "=== [3] Size: `wc -c < $@`"
	pngquant --speed 1 --strip --force --output $@ $@ 2>/dev/null
	@echo "=== [F] Size: `wc -c < $@`"
	@echo

### AVIFs

create-avif: $(AVIFS)

$(AVIFS): %.avif: %.png
	@echo "from\n  $<\nto\n  $@"
	@cavif --quality=66 --overwrite -o $@ $<

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



# NEW POST

new:
	@tools/new-post/run.sh

draft:
	@tools/new-post/draft.sh



# CLEANING

clean:
	@rm -rf public

clean-npm:
	@rm -rf node_modules



# TOOLS AND DEPENDENCIES

install-mac: install-zola
	brew install -f tidy-html5 imagemagick pngquant webp

# debian/ubuntu based systems only for now.
# NOTE: we ship a prebuilt tidy in the tools folder.
install-debs: install-zola install-tools
	sudo apt-get update
	sudo apt-get install -y imagemagick optipng pngquant webp libjpeg-progs gifsicle

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
	cargo install microserver
	cargo install oxipng
	cargo install cavif
	cargo install svgcleaner
	npm install --global svgo
	npm install --global netlify-cli

clean-installs: clean-zola
