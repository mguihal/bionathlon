# Bionathlon app

The official app for Bionathlon !

## Install

```
yarn
cp .env.dist .env
```

Replace .env file content with correct values

Generate dev certificates via :

```
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```

## Run

```
yarn dev
```

Go to http://localhost:3000
