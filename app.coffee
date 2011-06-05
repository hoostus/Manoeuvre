express = require('express')
Step = require('step')

app = express.createServer()
module.exports = app

app.configure ->
	app.set 'views', __dirname + '/views'
	app.set 'view engine', 'jade'
	app.use express.logger(format: ':method :url')
	app.use express.bodyParser()
	app.use express.methodOverride()
	app.use express.cookieParser()
	app.use express.session({secret: 'l812jnMa*&!.)23'})
	app.use require('stylus').middleware({src: __dirname + '/public'})
	app.use require('easy-oauth')(require('./keys_file'))
	app.use app.router
	app.use express.static(__dirname + '/public')

app.configure 'development', ->
	app.use express.errorHandler({dumpExceptions: true, showStack: true})

app.configure 'production', ->
	app.use express.errorHandler()

db = do ->
	Db = require('mongodb').Db
	Connection = require('mongodb').Connection
	Server = require('mongodb').Server
	BSON = require('mongodb').BSONNative

	host = (process.env['MONGO_NODE_DRIVER_HOST'] || "localhost")
	port = (process.env['MONGO_NODE_DRIVER_PORT'] || Connection.DEFAULT_PORT)
	new Db('manoeuvre', new Server(host, port, {}), {native_parser: true})

app.get '/', (request, response) ->
	if request.getAuthDetails()?.user?
		response.redirect('user')
	else
		response.render 'index',
			title: 'Oh noes'

update_user = (fb_user) ->
	Step ->
		db.open(this)
	, (err) ->
		if err?
			console.log "db open err: " + err
		db.collection("users", this)
	, (err, collection) ->
		if err?
			console.log "collection err: " + err
		fb_user._id = fb_user.id
		console.log JSON.stringify(fb_user)
		collection.save(fb_user, safe: true, this)
	, (err, records) ->
		if err?
			console.log("update_user error " + err)

app.redirect 'user', (request, response) ->
	'/user/' + request.getAuthDetails()?.user?.id

app.get '/user', (request, response) ->
	if request.getAuthDetails()?.user?
		response.redirect('user')
	else
		response.redirect('home')

app.get '/user/:id', (request, response) ->
	if not request.getAuthDetails()?.user?
		response.redirect("home")
		return

	Step ->
		db open this
	, (err) ->
		db.collection "users", this
	, (err, collection) ->
		collection.findOne _id: request.getAuthDetails().user.id, this
	, (err, document) ->
		user = request.getAuthDetails().user
		update_user user
		response.render 'user',
			user: user

app.get '/user/:id/waiting', (request, response) ->
	Step ->
		db.open this
	, (err) ->
		db.collection "games", this
	, (err, collection) ->
		cursor = collection.find active: request.params.id
		cursor.toArray this
	, (err, waiting) ->
		response.send JSON.stringify(waiting)

app.get '/user/:id/playing', (request, response) ->
	Step ->
		db.open this
	, (err) ->
		db.collection "games", this
	, (err, collection) ->
		cursor = collection.find players: request.params.id
		cursor.toArray this
	, (err, playing) ->
		response.send JSON.stringify(playing)

app.get '/user/:id/lobbies', (request, response) ->
	Step ->
		db.open this
	, (err) ->
		db.collection "lobbies", this
	, (err, lobbies) ->
		cursor = lobbies.find creator: request.params.id
		cursor.toArray this
	, (err, lobbies) ->
		response.send JSON.stringify(lobbies)

app.get '/lobby', (request, response) ->
	Step ->
		db.open this
	, (err) ->
		db.collection "lobbies", this
	, (err, lobbies) ->
		cursor = lobbies.find creator: {$ne: request.getAuthDetails()?.user?.id}, { sort: 'created' }
		cursor.toArray this
	, (err, lobbies) ->
		response.render 'all-lobbies', lobbies: lobbies

app.post '/lobby', (request, response) ->
	if not request.getAuthDetails()?.user?
		throw new Error("unauthorized")

	Step ->
		db.open this
	, (err) ->
		db.collection "lobbies", this
	, (err, lobbies) ->
		creator = request.getAuthDetails().user
		lobbies.insert
			creator_id: creator.id
			creator_name: creator.name
			created: new Date()
			started: false
		, safe: true, (err, records) ->
			console.log("Added new lobby as: " + records[0]._id)
			response.redirect("user")

app.post '/lobby/:id', (request, response) ->
	if not request.getAuthDetails()?.user?
		throw new Error("unauthorized")

	Step ->
		db.open this
	, (err) ->
		db.collection "lobbies", this
	, (err, lobbies) ->
		lobbies.findOne _id: request.params.id, this
		this.lobbies = lobbies
	, (err, lobby) ->
		if lobby.creator == request.getAuthDetails().user.id
			throw new Error("cannot join your own game")

app.listen 3000
