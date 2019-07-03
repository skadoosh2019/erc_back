ROOT_FOLDER = __dirname;
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}


const express = require('express')
const app = express()
const glob = require('glob');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const connection = mongoose.connect(process.env.MONGODB_URI);
const modelAutoLoad = require('./database/mongoose');
const apiRouter = require('./routes/api');
const rpcServer = require('./lib/rpcserver');
const storeTokens = require('./lib/storeTokens');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const sendResponse = (req, res, next) => {
  res.sendResponse = (body, message, code) => {
    let response = {};
    response['statusCode'] = code || 200;
    response['status'] = 'success';
    response['message'] = message || 'success';
    response['body'] = body;
    res.json(response);
  };
  next();
};
const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  }
  else {
    next();
  }
};
const sendError = (err, req, res, next) => {
  let response = {};
  response['status'] = 'fail';
  response['statusCode'] = 500;
  response['message'] = err.message;
  response['body'] = err;
  res.json(response);
};
app.use(modelAutoLoad());
app.use(allowCrossDomain);
app.use(sendResponse);
app.use('/api', apiRouter);
app.use('/seed', apiRouter);
app.use(sendError);
// Start the server

storeTokens.initializeCntrcts();

rpcServer.start(function (error) {
  // Did server start succeed ?
  if (error) throw error;
  else console.log('Server running ...');
});
app.listen(3000);

console.log()
if (process.argv[2] && process.argv[2] == 'seed') {
  switch (process.argv[3] || null) {
    case 'user':
      const uModel = require('./models/user');
      new uModel({
        first_name: 'admin',
        last_name: 'dashboard',
        password: 123456,
        email: 'admin@email.com',
        phone: 123456789,
        country_code: '+91',
        roles: 'admin',
        is_verifed: true
      }).save().then(console.log);
      break;
    default:
      console.log('No collection found.')
      break;
  }
}
