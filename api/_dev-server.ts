import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import https from 'https';

dotenv.config();

const PORT = process.env.PORT;

(async () => {
  const privateKey = fs.readFileSync(__dirname + '/../key.pem', 'utf8');
  const certificate = fs.readFileSync(__dirname + '/../cert.pem', 'utf8');
  const credentials = { key: privateKey, cert: certificate };

  const app = express();
  const server = https.createServer(credentials, app);

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, PUT, POST');
    next();
  });

  const files = fs.readdirSync(__dirname);

  await Promise.all(
    files.map(async file => {
      if (file[0] === '_') return;

      const path = file.substr(0, file.length - 3);

      try {
        const handler = await import(`./${file}`);

        app.route(`/api/${path}`).all((request, response) => {
          return handler.default(request, response);
        });

        console.log(`Registered route: /api/${path}`);
      } catch (error) {
        console.error('ERR', error);
      }
    }),
  );

  console.log(`Listening on port ${PORT}`);
  server.listen(PORT);
})();
