.PHONY: ci
ci: vendor check-format check-sort-translations lint typecheck

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
	yarn start
