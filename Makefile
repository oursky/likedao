.PHONY: setup
setup:
	cp -p .env .env.$$(date +%Y%m%d%H%M%S).bak || true
	cp .env.example .env
	make -C react-app setup
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
