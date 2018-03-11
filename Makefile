# markentier.tech

COBALT_BIN = cobalt.rs/target/release/cobalt

build: $(COBALT_BIN)
	$(COBALT_BIN) build
	cp site/_redirects public

serve: $(COBALT_BIN)
	$(COBALT_BIN) serve

clean: $(COBALT_BIN)
	$(COBALT_BIN) clean

$(COBALT_BIN):
	cd cobalt.rs && cargo build --release --features "syntax-highlight,sass"

build-cobalt: $(COBALT_BIN)
