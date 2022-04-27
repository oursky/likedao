.PHONY: vendor
vendor:
	go mod download
	curl -sfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $$(go env GOPATH)/bin v1.43.0

.PHONY: test
test:
	go test -v ./pkg/...

.PHONY: build
build:
	go build -o bin/graphql-server cmd/graphql-server/main.go

.PHONY: codegen
codegen:
	rm -f pkg/models/*_gen.go
	go generate ./pkg/models/...
	rm -f pkg/dataloaders/*_gen.go
	go generate ./pkg/dataloaders/...
	rm -f pkg/generated/graphql/*.go
	go generate ./pkg/resolvers/... 