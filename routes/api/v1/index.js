var express = require('express')
var Router = express.Router();
Router.use('/admin', require('./admin'));
module.exports = Router;