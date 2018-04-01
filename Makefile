# markentier.tech
NETLIFY_DEPLOY_URL ?= https://markentier.tech

# brew install tidy-html5 fd
TIDY_SETTINGS = -q -m -w 0 -i \
	--indent-with-tabs yes \
	--indent-spaces 2 \
	--tab-size 2 \
	--clean yes \
	--join-styles yes

GUTENBERG = gutenberg
GUTENBERG_OUTDIR = --output-dir ../public
GUTENBERG_BUILD = $(GUTENBERG) build --base-url $(NETLIFY_DEPLOY_URL) $(GUTENBERG_OUTDIR)
# GUTENBERG_SERVE = $(GUTENBERG) serve --base-url markentier.local --interface 0.0.0.0 --port 3000 $(GUTENBERG_OUTDIR)
# makes developing service worker stuff much easier:
GUTENBERG_SERVE = $(GUTENBERG) serve --base-url localhost --interface 0.0.0.0 --port 3000 $(GUTENBERG_OUTDIR)

netlify: netlify-build netlify-lambda
	@echo NETLIFY_DEPLOY_URL = $(NETLIFY_DEPLOY_URL)
	@echo DEPLOY_URL = $(DEPLOY_URL)
	@echo DEPLOY_PRIME_URL = $(DEPLOY_PRIME_URL)

build: build-dirty build-tidy-html
netlify-build: build-dirty netlify-build-tidy-html

build-preview: build-dirty
build-dirty: build-site build-feeds

build-site:
	cd site && $(GUTENBERG_BUILD)

build-feeds:
	mv public/atom/index.html public/feed.atom.xml
	mv public/rss/index.html public/feed.rss.xml
	mv public/json/index.html public/feed.json

build-tidy-html:
	fd -IH -p public -e html -x sh -c "echo {} && tidy $(TIDY_SETTINGS) {}" \;
netlify-build-tidy-html:
	tools/fd -IH -p public -e html -x sh -c "echo {} && tools/tidy $(TIDY_SETTINGS) {}" \;

# imagemagick, pngquant, optipng
COVERS = $(shell find site -iname 'cover.png')
THUMBS = $(COVERS:cover.png=thumb.png)
THUMB_SIZE = 320x160
PNG_COLORS = 32
## removed, because it increases the size most of the time:
# 	@echo "=== Size: `wc -c < $@`"
#	pngcrush -q -reduce -brute -ow $@ 2>/dev/null

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

netlify-lambda:
	yarn && yarn build:lambda

clean:
	@rm -rf public

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
