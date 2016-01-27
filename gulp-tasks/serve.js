'use strict';

function serve(gulp, $){

	var browserSync = require('browser-sync'),
    reload = browserSync.reload,
    fs = require("fs"),
    path = require("path"),
    url = require("url"),
    http = require("https"),
    querystring = require('querystring'),
    historyApiFallback = require('connect-history-api-fallback'), // provides fallback for html5 folders on browsersync
	proxyMiddleware = require('http-proxy-middleware');

    function serve(){

		var distFolder = path.resolve(__dirname, "../dist/"),
			bowerFolder = path.resolve(__dirname, "../"),
			routes = {
				'/': '/dist/index.html'
        	},
            routeHandlers = {
                '/api/contentblocks': promotionsApi
            }

        function promotionsApi(){
            var username = "APITest",
                password = "APITest1234",
                key = "yDEaxRuvuDFvGBCAv1byA",
                secret = "dshOkJwn8rImGPK3PpCCV0vL3UD3IPJ2J5EWn7cow",
                host = "promotionsmanagerapiqa.fishbowl.com",
                grantAccessPath = "/oauth/access_token",
                promotionsPath = "/promotion/",
                accessToken;


            // get access token
            function getAccessToken(callback){
                var postData = querystring.stringify({
                    'grant_type':'password',
                    'username' : username,
                    'password': password
                });


                var options = {
                  hostname: host,
                  path: grantAccessPath,
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization':  "Basic " + new Buffer(key + ":" + secret).toString("base64"),
                    'Content-Length': postData.length
                  }
                };

                var req = http.request(options, (res) => {
                  res.setEncoding('utf8');
                  res.on('data', (chunk) => {
                    accessToken = JSON.parse(chunk)['access_token'];
                    if(callback && typeof callback === 'function'){
                        callback();
                    }
                  });
                  res.on('end', () => {
                    console.log('No more data in response.')
                  })
                });

                req.on('error', (e) => {
                  console.log('problem with request: ${e.message}', e.message);
                });

                // write data to request body
                req.write(postData);
                req.end();
            }

            function getPromotions(){
                var postData = querystring.stringify({
                    'brandid':'1173'
                });


                var options = {
                  hostname: host,
                  path: promotionsPath,
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization':  "Bearer " + accessToken,
                    'Content-Length': postData.length
                  }
                };

                var promotions;

                var req = http.request(options, (res) => {
                  res.setEncoding('utf8');
                  res.on('data', (chunk) => {
                    //var response = JSON.parse(chunk);
                    console.log(chunk);
                  });
                  res.on('end', () => {
                  })
                });

                req.on('error', (e) => {
                  console.log('problem with request: ${e.message}', e.message);
                });

                // write data to request body
                req.write(postData);
                req.end();
            }

            getAccessToken(getPromotions);
 
        }

		function middleware(req, res, next){

			var folder = distFolder,
            fileName = url.parse(req.url),
            custom = false;

            fileName = fileName.href.split(fileName.search).join("");

            if(fileName.indexOf('/bower_components') === 0 || routes[fileName]){
            	folder = bowerFolder;
            	custom = true;
            }

            if(routes[fileName]){
            	fileName =  routes[fileName];
            	custom = true;
            }

        	var fileExists = fs.existsSync(folder + fileName);  
            if(custom && fileExists){
            	return fs.readFile(folder + fileName, function(error, content) {
	                res.end(content, 'utf-8');
            	});
            }

            if(routeHandlers[fileName]){
                return routeHandlers[fileName]();
            }

			return next();
		}

    	browserSync({
    		port:5000,
    		notify:true,
	        server: {
	        	baseDir: './dist',
	            middleware: [middleware, historyApiFallback()]
	        }
	    });

	    gulp.watch(['app/index.html'], ['html:serve', reload]);
	    gulp.watch(['app/components/**/*.html'], ['scripts', reload]);
	    gulp.watch(['app/{styles, components}/**/*.less', 'app/routes/**/*.less'], ['styles', reload]);
	    gulp.watch([$.paths.js.app], ['scripts', reload]);
	    gulp.watch(['app/routes/**/*.html'], ['styles', reload]);

	    //gulp.watch(['app/images/*#1#*'], reload);
    }

    return {
    	serve: serve
    };
}

module.exports = serve;
