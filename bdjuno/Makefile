GENESIS_URL?=

.PHONY: .checkenv
.checkenv:
	@test $${GENESIS_URL?Please set argument GENESIS_URL}

.PHONY: init
init: 
	git submodule update --init --recursive

.PHONY: setup
setup: init .checkenv
	mkdir -p ./.bdjuno
	cp config.example.yaml ./.bdjuno/config.yaml
	curl -o ./.bdjuno/genesis.json $(GENESIS_URL)