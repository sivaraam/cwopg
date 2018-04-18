NPM = $(shell which npm)
NODE = $(shell which node || which nodejs)

ifneq "" "$(NODE_DIR)"
NPM = $(NODE_DIR)/bin/npm
NODE = $(NODE_DIR)/bin/node
else
ifeq "" "$(NPM)"
node_fail:
	@echo "Please install node.js"
	@echo "Visit https://nodejs.org/ for more details"
	@echo "On Ubuntu/Debian try: sudo apt-get install nodejs npm"
	exit 1
endif
endif

.PHONY: all watch

all: node_modules
	$(NPM) run build

node_modules: package.json
	$(NPM) install

watch: all
	$(NPM) run watch:sass
