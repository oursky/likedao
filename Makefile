.PHONY: setup
setup:
	cp -p .env .env.$$(date +%Y%m%d%H%M%S).bak || true
	cp .env.example .env