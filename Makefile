# Docker Compose target
up:
	docker-compose up -d
down:
	docker-compose down

build:
	docker-compose build
# Docker cleanup target
clean:
	docker-compose down --volumes --remove-orphans

fclean:
	docker-compose down --volumes --remove-orphans
	docker system prune -f
