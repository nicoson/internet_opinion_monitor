
Deploy:
	docker build -t wa-demo .
	
	# push to avatest
	docker tag wa-demo reg.qiniu.com/avatest/wa-demo:v1.3
	docker push reg.qiniu.com/avatest/wa-demo:v1.3
