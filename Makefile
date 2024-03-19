
dev:
	npx wrangler dev --ip 0.0.0.0

deploy:
	npx wrangler deploy

clean:
	# kill workerd
	pkill -f workerd || true
	

