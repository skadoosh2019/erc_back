var express = require('express')
var Router = express.Router();
Router.use('/v1', require('./v1'));
module.exports = Router;