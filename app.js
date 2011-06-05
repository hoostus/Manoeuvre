(function() {
  var Step, app, db, express, update_user;
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
    var _ref;
    if (((_ref = request.getAuthDetails()) != null ? _ref.user : void 0) != null) {
      return response.redirect('user');
    } else {
      return response.render('index', {
        title: 'Oh noes'
      });
    }
  });
  update_user = function(fb_user) {
    return Step(function() {
      return db.open(this);
    }, function(err) {
      if (err != null) {
        console.log("db open err: " + err);
      }
      return db.collection("users", this);
    }, function(err, collection) {
      if (err != null) {
        console.log("collection err: " + err);
      }
      fb_user._id = fb_user.id;
      console.log(JSON.stringify(fb_user));
      return collection.save(fb_user, {
        safe: true
      }, this);
    }, function(err, records) {
      if (err != null) {
        return console.log("update_user error " + err);
      }
    });
  };
  app.redirect('user', function(request, response) {
    var _ref, _ref2;
    return '/user/' + ((_ref = request.getAuthDetails()) != null ? (_ref2 = _ref.user) != null ? _ref2.id : void 0 : void 0);
  });
  app.get('/user', function(request, response) {
    var _ref;
    if (((_ref = request.getAuthDetails()) != null ? _ref.user : void 0) != null) {
      return response.redirect('user');
    } else {
      return response.redirect('home');
    }
  });
  app.get('/user/:id', function(request, response) {
    var _ref;
    if (((_ref = request.getAuthDetails()) != null ? _ref.user : void 0) == null) {
      response.redirect('home');
    }
    return Step(function() {
      return db(open(this));
    }, function(err) {
      return db.collection("users", this);
    }, function(err, collection) {
      return collection.findOne({
        _id: request.getAuthDetails().user.id
      }, this);
    }, function(err, document) {
      var user;
      user = request.getAuthDetails().user;
      update_user(user);
      return response.render('user', {
        user: user
      });
    });
  });
  app.get('/user/:id/waiting', function(request, response) {
    return Step(function() {
      return db.open(this);
    }, function(err) {
      return db.collection("games", this);
    }, function(err, collection) {
      var cursor;
      cursor = collection.find({
        active: request.params.id
      });
      return cursor.toArray(this);
    }, function(err, waiting) {
      return response.send(JSON.stringify(waiting));
    });
  });
  app.get('/user/:id/playing', function(request, response) {
    return Step(function() {
      return db.open(this);
    }, function(err) {
      return db.collection("games", this);
    }, function(err, collection) {
      var cursor;
      cursor = collection.find({
        players: request.params.id
      });
      return cursor.toArray(this);
    }, function(err, playing) {
      return response.send(JSON.stringify(playing));
    });
  });
  app.get('/user/:id/lobbies', function(request, response) {
    return Step(function() {
      return db.open(this);
    }, function(err) {
      return db.collection("lobbies", this);
    }, function(err, lobbies) {
      var cursor;
      cursor = lobbies.find({
        creator: request.params.id
      });
      return cursor.toArray(this);
    }, function(err, lobbies) {
      return response.send(JSON.stringify(lobbies));
    });
  });
  app.get('/lobby', function(request, response) {
    return Step(function() {
      return db.open(this);
    }, function(err) {
      return db.collection("lobbies", this);
    }, function(err, lobbies) {
      var cursor, _ref, _ref2;
      cursor = lobbies.find({
        creator: {
          $ne: (_ref = request.getAuthDetails()) != null ? (_ref2 = _ref.user) != null ? _ref2.id : void 0 : void 0
        }
      }, {
        sort: 'created'
      });
      return cursor.toArray(this);
    }, function(err, lobbies) {
      return response.render('all-lobbies', {
        lobbies: lobbies
      });
    });
  });
  app.post('/lobby', function(request, response) {
    var _ref;
    if (!(((_ref = request.getAuthDetails()) != null ? _ref.user : void 0) != null)) {
      throw new Error("unauthorized");
    }
    return Step(function() {
      return db.open(this);
    }, function(err) {
      return db.collection("lobbies", this);
    }, function(err, lobbies) {
      var creator;
      creator = request.getAuthDetails().user;
      return lobbies.insert({
        creator_id: creator.id,
        creator_name: creator.name,
        created: new Date(),
        started: false
      }, {
        safe: true
      }, function(err, records) {
        console.log("Added new lobby as: " + records[0]._id);
        return response.redirect("user");
      });
    });
  });
  app.post('/lobby/:id', function(request, response) {
    var _ref;
    if (!(((_ref = request.getAuthDetails()) != null ? _ref.user : void 0) != null)) {
      throw new Error("unauthorized");
    }
    return Step(function() {
      return db.open(this);
    }, function(err) {
      return db.collection("lobbies", this);
    }, function(err, lobbies) {
      lobbies.findOne({
        _id: request.params.id
      }, this);
      return this.lobbies = lobbies;
    }, function(err, lobby) {
      if (lobby.creator === request.getAuthDetails().user.id) {
        throw new Error("cannot join your own game");
      }
    });
  });
  app.listen(3000);
}).call(this);
