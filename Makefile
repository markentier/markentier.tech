# markentier.tech
DEPLOY_URL ?= https://markentier.tech

# brew install tidy-html5 fd
TIDY_SETTINGS = -q -m -w 0 -i \
	--indent-with-tabs yes \
	--indent-spaces 2 \
	--tab-size 2 \
	--clean yes \
	--join-styles yes

GUTENBERG = gutenberg
GUTENBERG_OUTDIR = --output-dir ../public
GUTENBERG_BUILD = $(GUTENBERG) build --base-url $(DEPLOY_URL) $(GUTENBERG_OUTDIR)
GUTENBERG_SERVE = $(GUTENBERG) serve --base-url markentier.local --interface 0.0.0.0 --port 3000 $(GUTENBERG_OUTDIR)

netlify: netlify-build netlify-lambda

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
	cd public && \
		fd -e html -x sh -c "echo {} && tidy $(TIDY_SETTINGS) {}" \;
netlify-build-tidy-html:
	cd public && \
		../tools/fd -e html -x sh -c "echo {} && ../tools/tidy $(TIDY_SETTINGS) {}" \;

serve:
	cd site && $(GUTENBERG_SERVE)

serve-with-theme-reload:
	cd site && watchexec -w themes/mttt -r -s SIGHUP "$(GUTENBERG_SERVE)"

netlify-lambda:
	yarn && yarn build:lambda

clean:
	@rm -rf public

# ---

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
