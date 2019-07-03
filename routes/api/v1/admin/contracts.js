var express = require('express')
var Router = express.Router();
let contractController = require(ROOT_FOLDER + '/controllers/admin/contracts');
let authMiddleWare = require(ROOT_FOLDER + '/middlewares/auth')
Router.post('/', contractController.add);
Router.get('/',contractController.getAll);
Router.get('/delete/:id',contractController.remove);
Router.get('/:id',contractController.getSingle);
Router.put('/:id',contractController.update);
module.exports = Router;