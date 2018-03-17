# markentier.tech

COBALT_GH = https://github.com/cobalt-org/cobalt.rs.git
COBALT_DIR = cobalt.rs
COBALT_BIN = $(COBALT_DIR)/target/release/cobalt
# brew install tidy-html5

build: $(COBALT_BIN) build-site build-netlify-files build-sitemap build-tidy-html
.PHONY: build

build-site:
	$(COBALT_BIN) build
.PHONY: build-site

build-netlify-files:
	cp site/_redirects site/_headers public
.PHONY: build-netlify-files

build-sitemap:
	mv public/sitemap.xml.html public/sitemap.xml
.PHONY: build-sitemap

build-tidy-html:
	find public -iname '*.html' -exec echo {} \; -exec tidy -q -m -i -w 240 {} \;
.PHONY: build-tidy-html

serve: $(COBALT_BIN)
	$(COBALT_BIN) serve
.PHONY: serve

clean: $(COBALT_BIN)
	$(COBALT_BIN) clean
.PHONY: clean

$(COBALT_BIN): $(COBALT_DIR)
	cd cobalt.rs && cargo build --release --features "syntax-highlight,sass"

build-cobalt: $(COBALT_BIN)
.PHONY: build-cobalt

$(COBALT_DIR):
	git clone $(COBALT_GH)

# netlify - testing

netlify-build: netlify-cobalt-build build-netlify-files build-sitemap
.PHONY: netlify-build

netlify-cobalt-build:
	tools/cobalt -L trace build
.PHONY: netlify-cobalt-build
