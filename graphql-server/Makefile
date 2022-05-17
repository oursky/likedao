.PHONY: vendor
vendor:
	go mod download
	curl -sfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $$(go env GOPATH)/bin v1.45.2

.PHONY: test
test:
	go test -v ./pkg/...

.PHONY: build
build:
	go build -o bin/graphql-server cmd/graphql-server/main.go
	go build -o bin/migrator cmd/migration/main.go

.PHONY: lint
lint:
	golangci-lint run -v --timeout 10m ./cmd/... ./pkg/... ./migrations/...

.PHONY: codegen
codegen:
	rm -f pkg/models/*_gen.go
	go generate ./pkg/models/...
	rm -f pkg/dataloaders/*_gen.go
	go generate ./pkg/dataloaders/...
	rm -f pkg/generated/graphql/*.go
	go generate ./pkg/resolvers/...

.PHONY: ci
ci: vendor codegen lint test

RUN_IN_DOCKER := docker-compose --env-file ../.env run --rm graphql-server
.PHONY: migration-new
migration-new:
	$(RUN_IN_DOCKER) go run ./cmd/migration/main.go db create_go "$(NAME)"

.PHONY: migration-up
migration-up:
	$(RUN_IN_DOCKER) go run ./cmd/migration/main.go db migrate

.PHONY: migration-down
migration-down:
	$(RUN_IN_DOCKER) go run ./cmd/migration/main.go db rollback

.PHONY: migration-status
migration-status:
	$(RUN_IN_DOCKER) go run ./cmd/migration/main.go db status

.PHONY: migration-init
migration-init:
	$(RUN_IN_DOCKER) go run ./cmd/migration/main.go db init
