var express = require('express'),
	middleware = require('./gulp-tasks/middleware/middleware')(),
	promotionsIntegration = require('./gulp-tasks/middleware/promotions-integration'),
	fs = require('fs'),
	mime = require('mime'),
	app = express();

app.use('/', express.static(__dirname + '/dist'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

// register static routes for json files
for (keys in middleware.routes) {
	if(keys !== '/'){
		registerUrl(keys, __dirname + middleware.routes[keys]);
	}
}

// register dynamic route handlers
for (keys in middleware.routeHandlers) {
	registerUrl(keys, middleware.routeHandlers[keys]);
}


/**
 * Register URL Handlers
 * @param  {string} urlPath     Url to be requested
 * @param  {string, function} - handler response to the request, or filepath to be retrieved
 */
function registerUrl(urlPath, handler){

	function callback(req, res) {				
		if(fs.existsSync(handler)){

			res.setHeader('Content-Type', mime.lookup(handler));

			var filestream = fs.createReadStream(handler);
			filestream.pipe(res);
		}
	}

	app.get(urlPath, typeof handler === 'function' ? handler : callback);
}


app.listen(process.env.PORT, function () {
  console.log('Example app listening on port 5000!');
});