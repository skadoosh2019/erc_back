let router = require('koa-router');
let Router = router();

Router.get('/', ctx => ctx.body = 'admin')
module.exports = Router;