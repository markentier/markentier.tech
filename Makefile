# markentier.tech

# cobalt.rs/
COBALT_GH = https://github.com/cobalt-org/cobalt.rs.git
COBALT_DIR = cobalt.rs
COBALT_BIN = $(COBALT_DIR)/target/release/cobalt
# brew install tidy-html5 fd
TIDY_SETTINGS = -q -m -w 0 -i \
	--indent-with-tabs yes \
	--indent-spaces 2 \
	--tab-size 2 \
	--clean yes \
	--join-styles yes

build: $(COBALT_BIN) build-site build-netlify-files build-sitemap build-tidy-html

build-site:
	$(COBALT_BIN) build

build-netlify-files:
	cp site/_redirects site/_headers public

build-sitemap:
	mv public/sitemap.xml.html public/sitemap.xml

build-tidy-html:
	cd public && \
		fd -e html -x tidy $(TIDY_SETTINGS) {} \;

serve: $(COBALT_BIN)
	$(COBALT_BIN) serve

clean: $(COBALT_BIN)
	$(COBALT_BIN) clean

$(COBALT_BIN): $(COBALT_DIR)
	cd cobalt.rs && cargo build --release --features "syntax-highlight,sass"

build-cobalt: $(COBALT_BIN)

$(COBALT_DIR):
	git clone $(COBALT_GH)
