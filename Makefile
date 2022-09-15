GIT_SHA ?= $(shell git rev-parse --short=8 HEAD)
BUILD_TAG ?= git-$(GIT_SHA)
DOCKER_REGISTRY ?= ghcr.io/oursky

.PHONY: setup
setup:
	make -C react-app setup
	make -C graphql-server setup
	make codegen
	make -C bdjuno setup
	docker-compose build
	docker-compose up -d server-db
	docker-compose up -d bdjuno-db
	sleep 10
	make -C graphql-server migration-init
	make -C graphql-server migration-up

.PHONY: codegen
codegen:
	make -C graphql-server codegen
	make -C react-app codegen

.PHONY: docker-build-react-app
docker-build-react-app:
	docker build \
		-t $(DOCKER_REGISTRY)/likedao-react-app:$(BUILD_TAG) \
		-f react-app/Dockerfile \
		. 

.PHONY: docker-build-graphql-server
docker-build-graphql-server:
	docker build \
		-t $(DOCKER_REGISTRY)/likedao-graphql-server:$(BUILD_TAG) \
		-f graphql-server/Dockerfile \
		.

.PHONY: docker-build-bdjuno
docker-build-bdjuno:
	docker build \
		-t $(DOCKER_REGISTRY)/likedao-bdjuno:$(BUILD_TAG) \
		-f Dockerfile-bdjuno \
		bdjuno/bdjuno

.PHONY: docker-build
docker-build: docker-build-react-app docker-build-graphql-server docker-build-bdjuno

.PHONY: docker-push-react-app
docker-push-react-app:
	docker push $(DOCKER_REGISTRY)/likedao-react-app:$(BUILD_TAG)

.PHONY: docker-push-graphql-server
docker-push-graphql-server:
	docker push $(DOCKER_REGISTRY)/likedao-graphql-server:$(BUILD_TAG)

.PHONY: docker-push-bdjuno
docker-push-bdjuno:
	docker push $(DOCKER_REGISTRY)/likedao-bdjuno:$(BUILD_TAG)

.PHONY: docker-push
docker-push: docker-push-react-app docker-push-graphql-server docker-push-bdjuno

.PHONY: docker-pull
docker-pull:
	docker pull $(DOCKER_REGISTRY)/likedao-react-app:$(BUILD_TAG)
	docker pull $(DOCKER_REGISTRY)/likedao-graphql-server:$(BUILD_TAG)
	docker pull $(DOCKER_REGISTRY)/likedao-bdjuno:$(BUILD_TAG)

