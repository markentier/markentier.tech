# markentier.tech

NETLIFY_DEPLOY_URL ?= https://markentier.tech

# COMMIT_REF ?= ffffffffffffffffffffffffffffffffffffffff
COMMIT_REF ?= $(shell git rev-parse HEAD)

export PATH := $(PWD)/zola:$(PATH)
UNAME := $(shell uname -s)
ifeq ($(UNAME), Linux)
	export PATH := tools:$(PATH)
	PLATFORM = x86_64-unknown-linux-gnu
endif
ifeq ($(UNAME), Darwin)
	PLATFORM = x86_64-apple-darwin
endif

ZOLA = zola
ZOLA_VERSION ?= 0.12.2
ZOLA_RELEASE_URL = https://github.com/getzola/zola/releases/download/v$(ZOLA_VERSION)/zola-v$(ZOLA_VERSION)-$(PLATFORM).tar.gz

BUILD_BIN ?= $(ZOLA)
BUILD_PATH = $(BUILD_BIN)/$(BUILD_BIN)
BUILD_OUTDIR = --output-dir ../public
BUILD_CMD = $(BUILD_BIN) build --base-url $(NETLIFY_DEPLOY_URL) $(BUILD_OUTDIR)
# SERVE_CMD = $(BUILD_BIN) serve --base-url markentier.local --interface 0.0.0.0 --port 3000 $(BUILD_OUTDIR)
# makes developing service worker stuff much easier:
SERVE_CMD = $(BUILD_BIN) serve --drafts --base-url localhost --interface 0.0.0.0 --port 3000 $(BUILD_OUTDIR)

NODE_VERSION ?= 14

build: install-zola build-site postprogressing

local:
	$(MAKE) build local-deployment-json NETLIFY_DEPLOY_URL=http://localhost:3000

netlify: install-zola build netlify-deployment
	@echo NETLIFY_DEPLOY_URL = $(NETLIFY_DEPLOY_URL)
	@echo DEPLOY_URL = $(DEPLOY_URL)
	@echo DEPLOY_PRIME_URL = $(DEPLOY_PRIME_URL)

# yarn global add netlify-cli --> netlify
netlify-local-deploy: build
	netlify deploy -s $(SITE_ID) -p public

netlify-local-deploy-draft: build
	netlify deploy -s $(SITE_ID) -p public --draft


rebuild-all: regenerate-thumbs images build

build-site: build-html build-feeds

build-html:
	cd site && $(BUILD_CMD)

TIDY_XML_SETTINGS = -q -m -w 0 -i -utf8 -xml --indent-with-tabs yes --indent-spaces 2 --tab-size 2

build-feeds:
	mv public/atom/index.html public/feed.atom.xml
	mv public/rss/index.html public/feed.rss.xml
	mv public/json/index.html public/feed.json
	command -v tidy >/dev/null 2>&1 && \
		(find public -type f -name '*.xml' -exec tidy $(TIDY_XML_SETTINGS) -o {} {} \;) || \
		echo "No tidy installed."

postprogressing:
	yarn && IMG_BASE_URL=$(NETLIFY_DEPLOY_URL) yarn run gulp

check-html-size:
	@find public -type f -name '*.html' -exec du -h {} \; | sort -r -u -k 1

images:
	$(MAKE) create-pngs
	$(MAKE) create-thumbs
	$(MAKE) create-webp
	$(MAKE) create-avif
	$(MAKE) create-sqip

images-with-recreate:
	$(MAKE) delete-avifs delete-webps delete-thumbs
	$(MAKE) images

COVERS = $(shell find site -iname 'cover.png')
THUMBS = $(COVERS:cover.png=thumb.png)

THUMB_SIZE = 320x160
PNG_COLORS = 32

PNGS = $(shell find site -iname '*.png')
JPGS = $(shell find site -iname '*.jpg')
JPG2PNG = $(JPGS:.jpg=.png)
WEBPS = $(PNGS:.png=.webp)
AVIFS = $(PNGS:.png=.avif)

create-pngs: $(JPG2PNG)

$(JPG2PNG): %.png: %.jpg
	convert $< $@

create-webp: $(WEBPS)

$(WEBPS): %.webp: %.png
	@echo "from\n  $<\nto\n  $@"
	@cwebp -mt -pass 10 -z 9 -lossless -exact $< -o $@

list-webps:
	@find site -iname '*.webp' -exec wc -c {} \;

delete-webps:
	rm -rf $(WEBPS)

create-avif: $(AVIFS)

$(AVIFS): %.avif: %.png
	@echo "from\n  $<\nto\n  $@"
	@cavif --quality=42 --overwrite -o $@ $<

list-avifs:
	@find site -iname '*.avif' -exec wc -c {} \;

delete-avifs:
	rm -rf $(AVIFS)

regenerate-thumbs: delete-thumbs create-thumbs

create-thumbs: $(THUMBS)

delete-thumbs:
	rm -rf $(THUMBS)

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

list-pngs:
	@find site -iname '*.png' -exec wc -c {} \;

optimize-pngs:
	@find site -iname '*.png' -exec sh -c "\
		echo 'Optimizing file: {}' && \
		echo ' -- before size: \c' && wc -c < {} && \
		oxipng -q -o max -a -Z -s --fix --force --out {} {} && \
		echo ' --- after size: \c' && wc -c < {} \
	" \;

SRC_IMAGES = $(shell find site/content -iname '*.png' -o -iname '*.jpg' -o -iname '*.gif')
SQIP_IMAGES = $(SRC_IMAGES:%=%.svg)
SQIP_IMAGES_B64 = $(SQIP_IMAGES:%=%.b64)

SQIP = yarn run sqip
# (m)ode, (n)umberOfPrimitives, (b)lur
SQIP_SETTINGS = -m 0 -n 9 -b 12

create-sqip: $(SQIP_IMAGES)

$(SQIP_IMAGES_B64): %.b64: %
	base64 -i $< -o $@

$(SQIP_IMAGES): %.svg: %
	yarn run sqip $(SQIP_SETTINGS) -i $< -o $@
	yarn run svgo --multipass -p 2 --enable=cleanupListOfValues,sortAttrs,reusePaths -i $@ -o $@
	sed -i 's|<defs/>||g' $@

serve:
	cd site && $(SERVE_CMD)

serve-with-theme-reload:
	cd site && watchexec -w themes/mttt -r -s SIGHUP "$(SERVE_CMD)"

local-deployment-json:
	$(MAKE) netlify-deployment COMMIT_REF=fake-commit-sha

netlify-deployment:
	@echo '{"deployment":{"sha":"$(COMMIT_REF)","ts":$(shell date +%s042)}}' > public/deployment.json

local-deployment:
	@echo '{"deployment":{"sha":"$(shell git rev-parse HEAD)","ts":$(shell date +%s042)}}' > public/deployment.json

clean:
	@rm -rf public

clean-yarn:
	@rm -rf node_modules yarn*

check-cert:
	@echo | \
	openssl s_client \
		-connect markentier.tech:443 \
		-servername markentier.tech \
		-tls1_2 -status
	@echo | \
	openssl s_client \
		-connect markentier.tech:443 \
		-servername markentier.tech \
		2>/dev/null | \
		openssl x509 -text

install-mac: install-zola
	brew install -f tidy-html5 imagemagick pngquant webp

# debian/ubuntu based systems only for now.
# NOTE: we ship a prebuilt tidy in the tools folder.
install-debs: install-zola install-tools
	sudo apt-get update
	sudo apt-get install -y imagemagick pngquant webp

install-zola: $(BUILD_PATH)

$(BUILD_PATH):
	curl -sSL -o $(ZOLA).tar.gz $(ZOLA_RELEASE_URL)
	mkdir -p $(ZOLA) && tar zxf $(ZOLA).tar.gz -C $(ZOLA)
	zola -V

install-tools:
	cargo install oxipng
	cargo install cavif
	cargo install svgcleaner
	yarn global add svgo
	yarn global add netlify-cli

clean-installs:
	rm -rf ./zola*
