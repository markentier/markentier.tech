# markentier.tech
NETLIFY_DEPLOY_URL ?= https://markentier.tech

# COMMIT_REF ?= ffffffffffffffffffffffffffffffffffffffff
COMMIT_REF ?= $(shell git rev-parse HEAD)

# brew install tidy-html5 fd
TIDY_SETTINGS = -q -m -i \
	--wrap 0 \
	--indent-with-tabs yes \
	--indent-spaces 2 \
	--tab-size 2 \
	--clean yes \
	--join-styles yes \
	--uppercase-attributes preserve \
	--hide-comments yes \
	--priority-attributes id,class,name,href,src \
	--show-warnings no \
	--tidy-mark no

SED_RULE_ONE = 's/ type=\"text\/css\"//g'
SED_RULE_TWO = 's/<a name=\"[^\"]*\"/<a/g'

GUTENBERG = gutenberg
GUTENBERG_OUTDIR = --output-dir ../public
GUTENBERG_BUILD = $(GUTENBERG) build --base-url $(NETLIFY_DEPLOY_URL) $(GUTENBERG_OUTDIR)
# GUTENBERG_SERVE = $(GUTENBERG) serve --base-url markentier.local --interface 0.0.0.0 --port 3000 $(GUTENBERG_OUTDIR)
# makes developing service worker stuff much easier:
GUTENBERG_SERVE = $(GUTENBERG) serve --base-url localhost --interface 0.0.0.0 --port 3000 $(GUTENBERG_OUTDIR)

SQIP = yarn run sqip
SQIP_SETTINGS = \
	--numberOfPrimitives=5 \
	--mode=0 \
	--blur=12

netlify: netlify-build netlify-deployment netlify-lambda netlify-go
	@echo NETLIFY_DEPLOY_URL = $(NETLIFY_DEPLOY_URL)
	@echo DEPLOY_URL = $(DEPLOY_URL)
	@echo DEPLOY_PRIME_URL = $(DEPLOY_PRIME_URL)

# brew tap netlify/netlifyctl && brew install netlifyctl --> netlifyctl
# or: yarn global add netlify-cli --> netlify
netlify-local-deploy: build
	netlify deploy -s $(SITE_ID) -p public

netlify-local-deploy-draft: build
	netlify deploy -s $(SITE_ID) -p public --draft

build: build-dirty build-tidy-html build-html-postprocessing

netlify-build: build-dirty netlify-build-tidy-html netlify-build-html-postprocessing

build-preview: build-dirty

build-dirty: build-site build-feeds postprogressing

build-site:
	cd site && $(GUTENBERG_BUILD)

build-feeds:
	mv public/atom/index.html public/feed.atom.xml
	mv public/rss/index.html public/feed.rss.xml
	mv public/json/index.html public/feed.json

postprogressing:
	yarn && \
	IMG_BASE_URL=$(NETLIFY_DEPLOY_URL) yarn run posthtml 'public/**/*.html'

build-tidy-html:
	fd -IH -p public -e html -x sh -c "echo {} && tidy $(TIDY_SETTINGS) {}" \;

netlify-build-tidy-html:
	tools/fd -IH -p public -e html -x sh -c "echo {} && tools/tidy $(TIDY_SETTINGS) {}" \;

# macos: https://stackoverflow.com/questions/12696125/sed-edit-file-in-place#comment51611455_12696224
build-html-postprocessing:
	fd -IH -p public -e html -x sh -c "\
		echo {} && \
		sed -i '' $(SED_RULE_ONE) {} && \
		sed -i '' $(SED_RULE_TWO) {}\
	" \;

netlify-build-html-postprocessing:
	tools/fd -IH -p public -e html -x sh -c "\
		echo {} && \
		sed -i $(SED_RULE_ONE) {} && \
		sed -i $(SED_RULE_TWO) {}\
	" \;

# imagemagick, pngquant, optipng
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

serve:
	cd site && $(GUTENBERG_SERVE)

serve-with-theme-reload:
	cd site && watchexec -w themes/mttt -r -s SIGHUP "$(GUTENBERG_SERVE)"

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
