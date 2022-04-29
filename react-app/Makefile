.PHONY: ci
ci: vendor check-format check-sort-translations lint typecheck

.PHONY: setup
setup:
	cp -p ./config/config.debug.js ./config/config.debug.js.$$(date +%Y%m%d%H%M%S).bak || true
	cp ./config/config.template.js ./config/config.debug.js

.PHONY: vendor
vendor:
	yarn

.PHONY: build
build:
	yarn build

.PHONY: format
format:
	yarn format

.PHONY: check-format
check-format:
	yarn check-format

.PHONY: lint
lint:
	yarn lint
	yarn stylelint

.PHONY: sort-translations
sort-translations:
	yarn sort-translations

.PHONY: check-sort-translations
check-sort-translations:
	yarn check-sort-translations

.PHONY: typecheck
typecheck:
	yarn typecheck

.PHONY: dev
dev:
	cp ./config/config.debug.js ./public/config.js
	yarn start