deploy:
	git add .
	git commit -am "makefile"
	git push origin main

build:
	docker image rm varenyam/jiva:api-server
	docker build --no-cache -t varenyam/jiva:api-server .
	docker image push varenyam/jiva:api-server