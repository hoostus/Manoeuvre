express = require('express')

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

app.get '/', (request, response) ->
	response.render 'index',
		title: 'Hello'
		name: request.getAuthDetails()?.user?.name
		user: JSON.stringify(request.getAuthDetails().user)

app.get '/user/:id', (request, response) ->
	response.send 'user' + request.params.id

app.listen 3000
