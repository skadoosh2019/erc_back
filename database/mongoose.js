var glob = require('glob')
var util = require('util')
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var middleware = module.exports = () => {
    var options = {};
    options.uri = process.env.MONGODB_URI;
    options.host = process.env.MONGODB_HOST;
    options.port = process.env.MONGODB_PORT;
    options.database = process.env.MONGODB_DATABASE;
    options.user = process.env.MONGODB_USERNAME;
    options.pass = process.env.MONGODB_PASSWORD;
    options.schemas = ROOT_FOLDER + '/' + process.env.SCHEMAS;

    mongoose = options.mongoose ? options.mongoose : mongoose;

    //mode: model
    var db = mongoose.connection
    middleware.models = {}
    middleware.dbs = {}
    if (options.schemas) {
        //mode: schema
        db = mongoose.createConnection()
        var schemas = options.schemas + (options.schemas.lastIndexOf('/') === (options.schemas.length - 1) ? '' : '/')
        var files = glob.sync(schemas + '/**/*.js')
        files.map(file => {
            var model = file
                .replace(schemas, '')
                .replace(/\.js$/g, '')
                .replace(/\//g, '.')
                .toLowerCase()
            var schema = require(file)
            middleware.models[model] = schema;
        })
    }
    middleware.open(db, options);
    return async (req, res, next) => {
        var database = typeof options.database === 'function' ? options.database(req) : options.database || options.uri.match(/\/[^\/]+$/)[0].replace('/', '');
        console.log(database);

        if (!middleware.dbs.hasOwnProperty(database)) {
            middleware.dbs[database] = db.useDb(database)
        }
        req.model = model => {
            try {
                return middleware.model(database, model)
            } catch (err) {
                req.throw(400, err.message)
            }
        }
        req.document = (model, document) => new (req.model(model))(document);
        next();
    }
}

middleware.model = (database, model) => {
    var name = model.toLowerCase()
    if (!middleware.models.hasOwnProperty(name)) {
        throw new Error(util.format('Model not found: %s.%s', database, model))
    }
    return middleware.dbs[database].model(model, middleware.models[name].schema)
}

middleware.document = (database, model, document) => new (middleware.model(database, model))(document);

middleware.mongoose = mongoose;

middleware.open = (db, options) => {
    if (!options && (!options.host || !options.port) && !options.uri) {
        throw new Error('options not found')
    }

    var database = typeof options.database === 'function' ? undefined : options.database

    var uri = options.uri || `mongodb://${options.user ? options.user + ':' + options.pass + '@' : ''}${options.host}:${options.port}${database ? '/' + database : ''}`;

    db.on('error', err => {
        db.close();
    });

    if (options.events) {
        for (var evt in options.events) {
            db.on(evt, options.events[evt])
        }
    }

    db.openUri(uri, options.mongodbOptions);

    return db
}