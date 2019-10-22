const _ = require('lodash');
const axios = require('axios');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const express = require('express');
const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST");
  next();
});

app.use(express.json());

app.get('/api/hello', async (req, res) => {
  return res.end(JSON.stringify({
    'hello': 'world'
  }));
});

app.post('/api/login', async (req, res) => {
  try {
    const response = await axios.get('https://www.googleapis.com/plus/v1/people/me?access_token=' + req.body.data.googleToken);

    console.log(response.data.domain);

    if (response.data.domain !== 'iadvize.com') {
      return res.status(403).end('Not authorized');
    }

    const token = jwt.sign({email: response.data.emails[0].value}, 'BionathlonTokenSecret', {
      expiresIn: 86400
    });

    res.end(JSON.stringify({token}));
  } catch (error) {
    console.log(error);
    res.end('Error');
  }
});

app.listen(3001, function () {
  console.log('App listening on port 3001!');
});
