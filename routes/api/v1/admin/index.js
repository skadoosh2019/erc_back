var express = require('express')
var Router = express.Router()
let indexController = require(ROOT_FOLDER + '/controllers/admin/index')
let authMiddleWare = require(ROOT_FOLDER + '/middlewares/auth')
Router.post('/login', indexController.login)
// Router.get('/login', ctx => {console.log('hiiii');ctx.body = 'hi';})
// Router.use('/contracts', authMiddleWare.authAsAdmin);
Router.use('/contracts', authMiddleWare.authAsAdmin(),require('./contracts'));
module.exports = Router;