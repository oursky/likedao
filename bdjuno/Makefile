GENESIS_URL?=https://raw.githubusercontent.com/likecoin/mainnet/master/genesis.json

.PHONY: init
init: 
	git submodule update --init --recursive --remote

.PHONY: setup
setup: init
	mkdir -p ./.bdjuno
	cp config.example.yaml ./.bdjuno/config.yaml
	curl -o ./.bdjuno/genesis.json $(GENESIS_URL)