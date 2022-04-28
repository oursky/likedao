GENESIS_URL?=

.PHONY: .checkenv
.checkenv:
	@test $${GENESIS_URL?Please set argument GENESIS_URL}

.PHONY: setup
setup: .checkenv
	mkdir -p ./.bdjuno
	cp config.example.yaml ./.bdjuno/config.yaml
	curl -o ./.bdjuno/genesis.json $(GENESIS_URL)