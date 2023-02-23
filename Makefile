deploy:
	git add .
	git commit -am "makefile"
	git push origin main

build:
	docker image rm varenyam/jiva:api-server
	docker build -t varenyam/jiva:api-server .
	docker push varenyam/jiva:api-server