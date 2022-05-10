BUILD_TAG ?= git-$(shell git rev-parse --short=8 HEAD)
APP_NAME := likedao
NAMESPACE ?=
VALUES ?=
GENESIS_URL ?= 

.PHONY: .checkenv
.checkenv:
	@test $${GENESIS_URL?Please set argument GENESIS_URL}
	@test $${NAMESPACE?Please set argument NAMESPACE}
	@test $${VALUES?Please set argument VALUES}

.PHONY: download-genesis
download-genesis:
	curl -o ./likedao/static/genesis.json ${GENESIS_URL}

.PHONY: install
install: .checkenv download-genesis
	helm install $(APP_NAME) $(APP_NAME) --namespace $(NAMESPACE) --values $(VALUES) --set buildTag=$(BUILD_TAG)

.PHONY: upgrade
install: .checkenv download-genesis
	helm upgrade $(APP_NAME) $(APP_NAME) --namespace $(NAMESPACE) --values $(VALUES) --set buildTag=$(BUILD_TAG)