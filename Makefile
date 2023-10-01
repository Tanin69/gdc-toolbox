docker:
	yarn build
	node .output/server/index.mjs
dev:
	yarn dev

docker:
	docker compose up -d
docker-dev:
	docker compose -f docker-compose.yml -f docker-compose.debug.yml up -d
