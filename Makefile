# markentier.tech
NETLIFY_DEPLOY_URL ?= https://markentier.tech

# COMMIT_REF ?= ffffffffffffffffffffffffffffffffffffffff
COMMIT_REF ?= $(shell git rev-parse HEAD)

ZOLA = zola
ZOLA_RELEASE_VER ?= 0.5.1
ZOLA_RELEASE_URL_LINUX = https://github.com/getzola/zola/releases/download/v$(ZOLA_RELEASE_VER)/zola-v$(ZOLA_RELEASE_VER)-x86_64-unknown-linux-gnu.tar.gz
ZOLA_RELEASE_URL_MACOS = https://github.com/getzola/zola/releases/download/v$(ZOLA_RELEASE_VER)/zola-v$(ZOLA_RELEASE_VER)-x86_64-apple-darwin.tar.gz

BUILD_BIN ?= $(ZOLA)

BUILD_OUTDIR = --output-dir ../public
BUILD_CMD = $(BUILD_BIN) build --base-url $(NETLIFY_DEPLOY_URL) $(BUILD_OUTDIR)
# SERVE_CMD = $(BUILD_BIN) serve --base-url markentier.local --interface 0.0.0.0 --port 3000 $(BUILD_OUTDIR)
# makes developing service worker stuff much easier:
SERVE_CMD = $(BUILD_BIN) serve --base-url localhost --interface 0.0.0.0 --port 3000 $(BUILD_OUTDIR)

UNAME := $(shell uname)
ifeq ($(UNAME), Linux)
	export PATH := tools:$(PATH)
else
	# do nothing
endif

# disabled: netlify-lambda netlify-go
netlify: netlify-install-zola build netlify-deployment
	@echo NETLIFY_DEPLOY_URL = $(NETLIFY_DEPLOY_URL)
	@echo DEPLOY_URL = $(DEPLOY_URL)
	@echo DEPLOY_PRIME_URL = $(DEPLOY_PRIME_URL)

# yarn global add netlify-cli --> netlify
netlify-local-deploy: build
	netlify deploy -s $(SITE_ID) -p public

netlify-local-deploy-draft: build
	netlify deploy -s $(SITE_ID) -p public --draft

build: build-site build-feeds postprogressing

build-site:
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

images: create-thumbs create-sqip

# imagemagick(convert), pngquant, optipng
COVERS = $(shell find site -iname 'cover.png')
THUMBS = $(COVERS:cover.png=thumb.png)
THUMB_SIZE = 320x160
PNG_COLORS = 32

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
	optipng -quiet -clobber -o7 -zm1-9 -out $@ $@
	@echo "=== [F] Size: `wc -c < $@`"
	@echo

list-pngs:
	@find site -iname '*.png' -exec wc -c {} \;

opimize-pngs:
	@find site -iname '*.png' -exec sh -c "\
		echo 'Optimizing file: {}' && \
		echo ' -- before size: \c' && wc -c < {} && \
		optipng -quiet -clobber -o7 -zm1-9 -out {} {} && \
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
	yarn run sqip \
		$(SQIP_SETTINGS) \
		-o $@ -i $<

serve:
	cd site && $(SERVE_CMD)

serve-with-theme-reload:
	cd site && watchexec -w themes/mttt -r -s SIGHUP "$(SERVE_CMD)"

local-deployment-json:
	$(MAKE) netlify-deployment COMMIT_REF=fake-commit-sha

netlify-lambda: .functions
	yarn && yarn build:lambda

start-lambda:
	yarn && yarn start:lambda

netlify-go:
	$(MAKE) go-functions

GO_FUNCS = $(shell find functions -iname '*.go')
GO_BINS = $(patsubst %,.%,$(GO_FUNCS:.go=))

go-functions: .functions $(GO_BINS)

# GOOS=linux GOARCH=amd64
# go get ???
$(GO_BINS): .%: %.go
	go build -o $@ $<

netlify-deployment:
	@echo '{"deployment":{"sha":"$(COMMIT_REF)","ts":$(shell date +%s042)}}' > public/deployment.json

local-deployment:
	@echo '{"deployment":{"sha":"$(shell git rev-parse HEAD)","ts":$(shell date +%s042)}}' > public/deployment.json

.functions:
	mkdir -p $@

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

install-zola:
	curl -sSL -o $(ZOLA).tar.gz $(ZOLA_RELEASE_URL_MACOS)
	mkdir -p $(ZOLA) && tar zxf $(ZOLA).tar.gz -C $(ZOLA)

netlify-install-zola:
	curl -sSL -o $(ZOLA).tar.gz $(ZOLA_RELEASE_URL_LINUX)
	mkdir -p $(ZOLA) && tar zxf $(ZOLA).tar.gz -C $(ZOLA)

clean-installs:
	rm -rf ./gutenberg* ./zola*
