 deploy:
	git add . 
	git commit -am "makefile" 
	git push origin main	
	
#  build:
# 	docker image rm api-server	
#  	docker build -t api-server .	
 