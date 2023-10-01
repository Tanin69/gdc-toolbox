somethingelse:
	yarn build
	node .output/server/index.mjs

help:
	@egrep "^#" Makefile

dev:
	yarn dev

# target: docker-build|db                             - Start docker containers and install deps
db: docker-build
docker-build:
	docker-compose -f docker-compose.yml -f docker-compose.debug.yml run --rm gdctoolbox sh -c "yarn"

# target: docker-up|du                                - Start docker containers and run dev 
du: docker-up
docker-up:
	docker compose -f docker-compose.yml -f docker-compose.debug.yml up -d
