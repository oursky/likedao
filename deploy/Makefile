BUILD_TAG ?= git-$(shell git rev-parse --short=8 HEAD)
APP_NAME := likedao
NAMESPACE ?=
VALUES ?=
CHAIN_TAG ?=

DEPLOYMENT_NAME := $(APP_NAME)-$(CHAIN_TAG)

.PHONY: .checkenv
.checkenv:
	@test $${NAMESPACE?Please set argument NAMESPACE}
	@test $${VALUES?Please set argument VALUES}
	@test $${CHAIN_TAG?Please set argument CHAIN_TAG}

.PHONY: deploy
deploy: .checkenv
	helm upgrade $(DEPLOYMENT_NAME) $(APP_NAME) --namespace $(NAMESPACE) --values $(VALUES) --set buildTag=$(BUILD_TAG) --set deploymentTag=$(CHAIN_TAG) --install