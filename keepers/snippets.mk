# some Makefile snippets

default:
	@echo Not for active use. Please take a look into the file.

SERVE_CMD = $(BUILD_BIN) serve --base-url markentier.local --interface 0.0.0.0 --port 3000 $(BUILD_OUTDIR)

node_modules:
	ln -s $(shell mktemp -d -t node_modules.mtt.XXXXXXX) node_modules

# Netlify

# yarn global add netlify-cli --> netlify
netlify-local-deploy: build
	netlify deploy -s $(SITE_ID) -p public

netlify-local-deploy-draft: build
	netlify deploy -s $(SITE_ID) -p public --draft


# SQIP

SRC_IMAGES = $(shell find site/content -iname '*.png' -o -iname '*.jpg' -o -iname '*.gif')
SQIP_IMAGES = $(SRC_IMAGES:%=%.svg)

SQIP = yarn run sqip
# (m)ode, (n)umberOfPrimitives, (b)lur
SQIP_SETTINGS = -p primitive -p blur -p svgo -m 0 -n 7 -b 36
SVGO_SETTINGS = --multipass -p 2 --enable=cleanupListOfValues,sortAttrs,reusePaths

create-sqip: $(SQIP_IMAGES)

delete-sqip:
	rm -rf $(SQIP_IMAGES)

$(SQIP_IMAGES): %.svg: %
	yarn run sqip $(SQIP_SETTINGS) -i $< -o $@
	yarn run svgo $(SVGO_SETTINGS) -i $@ -o $@
	sed -i 's|<defs/>||g' $@

# deployment.json

# COMMIT_REF ?= ffffffffffffffffffffffffffffffffffffffff
COMMIT_REF ?= $(shell git rev-parse HEAD)

local-deployment-json:
	$(MAKE) netlify-deployment COMMIT_REF=fake-commit-sha

netlify-deployment:
	@echo '{"deployment":{"sha":"$(COMMIT_REF)","ts":$(shell date +%s042)}}' > public/deployment.json

local-deployment:
	@echo '{"deployment":{"sha":"$(shell git rev-parse HEAD)","ts":$(shell date +%s042)}}' > public/deployment.json

# TLS

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

check-html-size:
	@find public -type f -name '*.html' -exec du -h {} \; | sort -r -u -k 1
