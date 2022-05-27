BUILD_TAG ?= git-$(shell git rev-parse --short=8 HEAD)
APP_NAME := likedao
NAMESPACE ?=
VALUES ?=
GENESIS_URL ?=
CHAIN_TAG ?=

DEPLOYMENT_NAME := $(APP_NAME)-$(CHAIN_TAG)

.PHONY: .checkenv
.checkenv:
	@test $${GENESIS_URL?Please set argument GENESIS_URL}
	@test $${NAMESPACE?Please set argument NAMESPACE}
	@test $${VALUES?Please set argument VALUES}
	@test $${CHAIN_TAG?Please set argument CHAIN_TAG}

.PHONY: download-genesis
download-genesis:
	curl -o ./likedao/static/genesis.json ${GENESIS_URL}

.PHONY: make-deployment-assets
make-deployment-assets:
	cp -p ./likedao/static/bdjuno.config.yaml ./likedao/static/bdjuno.config.yaml.$$(date +%Y%m%d%H%M%S).bak 2>/dev/null || true
	cp ./likedao/static/bdjuno.config.sample.yaml ./likedao/static/bdjuno.conf.yaml
	cp -p ./likedao/static/react-app.config.js ./likedao/static/react-app.config.js.$$(date +%Y%m%d%H%M%S).bak 2>/dev/null || true
	cp ./likedao/static/react-app.config.sample.js ./likedao/static/react-app.config.js
	cp -p ./likedao/static/react-app.nginx.conf ./likedao/static/react-app.nginx.conf.$$(date +%Y%m%d%H%M%S).bak 2>/dev/null || true
	cp ./likedao/static/react-app.nginx.sample.conf ./likedao/static/react-app.nginx.conf

.PHONY: deploy
deploy: .checkenv download-genesis
	helm upgrade $(DEPLOYMENT_NAME) $(APP_NAME) --namespace $(NAMESPACE) --values $(VALUES) --set buildTag=$(BUILD_TAG) --set deploymentTag=$(CHAIN_TAG) --install