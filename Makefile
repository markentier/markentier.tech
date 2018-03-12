# markentier.tech

COBALT_GH = https://github.com/cobalt-org/cobalt.rs.git
COBALT_DIR = cobalt.rs
COBALT_BIN = $(COBALT_DIR)/target/release/cobalt

build: $(COBALT_BIN)
	$(COBALT_BIN) build
	cp site/_redirects site/_headers public

serve: $(COBALT_BIN)
	$(COBALT_BIN) serve

clean: $(COBALT_BIN)
	$(COBALT_BIN) clean

$(COBALT_BIN): $(COBALT_DIR)
	cd cobalt.rs && cargo build --release --features "syntax-highlight,sass"

build-cobalt: $(COBALT_BIN)

$(COBALT_DIR):
	git clone $(COBALT_GH)
