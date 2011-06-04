(function() {
  var Step, app, db, express;
  express = require('express');
  Step = require('step');
  app = express.createServer();
  module.exports = app;
  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.logger({
      format: ':method :url'
    }));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
      secret: 'l812jnMa*&!.)23'
    }));
    app.use(require('stylus').middleware({
      src: __dirname + '/public'
    }));
    app.use(require('easy-oauth')(require('./keys_file')));
    app.use(app.router);
    return app.use(express.static(__dirname + '/public'));
  });
  app.configure('development', function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });
  app.configure('production', function() {
    return app.use(express.errorHandler());
  });
  db = (function() {
    var BSON, Connection, Db, Server, host, port;
    Db = require('mongodb').Db;
    Connection = require('mongodb').Connection;
    Server = require('mongodb').Server;
    BSON = require('mongodb').BSONNative;
    host = process.env['MONGO_NODE_DRIVER_HOST'] || "localhost";
    port = process.env['MONGO_NODE_DRIVER_PORT'] || Connection.DEFAULT_PORT;
    return new Db('manoeuvre', new Server(host, port, {}), {
      native_parser: true
    });
  })();
  app.get('/', function(request, response) {
    var users, _ref, _ref2;
    Step(function() {
      return db.collection("users", this);
    }, function(err, collection) {
      console.log("ERR1 " + err);
      console.log("this " + this);
      return collection.count(this);
    }, function(err, count) {
      console.log("ERR2 " + err);
      console.log("this " + this);
      return console.log("DONE: " + count);
    });
    users = db.collection("users");
    return response.render('index', {
      title: 'Hello',
      name: (_ref = request.getAuthDetails()) != null ? (_ref2 = _ref.user) != null ? _ref2.name : void 0 : void 0,
      user: JSON.stringify(request.getAuthDetails().user)
    });
  });
  app.get('/user/:id', function(request, response) {
    return response.send('user' + request.params.id);
  });
  app.listen(3000);
}).call(this);
