# Bionathlon app

The official app for Bionathlon !

## Install


Generate dev certificates via :

```
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```

## Run

```
docker-compose up
```

Go to https://localhost:3000 for the web-app

Api is available at https://localhost:3001/api/*

(to make Chrome accept your self-signed localhost certificate, type "thisisunsafe" blindly on the error page)

To update development database, go to htttp://localhost:8080, username and password are "bionathlon_dev"
