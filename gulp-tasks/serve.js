'use strict';

function serve(gulp, $){

	var browserSync = require('browser-sync'),
    reload = browserSync.reload,
    fs = require("fs"),
    path = require("path"),
    url = require("url"),
    mime = require("mime"),
    querystring = require('querystring'),
    historyApiFallback = require('connect-history-api-fallback'), // provides fallback for html5 folders on browsersync
	proxyMiddleware = require('http-proxy-middleware'),
    promotionsIntegration = require('./promotions-integration')(querystring, fs, path);

    function serve(){

		var distFolder = path.resolve(__dirname, "../dist/"),
			bowerFolder = path.resolve(__dirname, "../"),
            routes = {
                '/': '/dist/index.html',
                '/api/messages/new':'/app/test/get-layout.html',
                '/api/messages/1':'/app/test/get-message.json'
            },
            routeHandlers = {
                '/api/contentblocks': promotionsIntegration.getPromotions
            };

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
	                res.setHeader("Content-Type", mime.lookup(fileName));
                    res.end(content, 'utf-8');
            	});
            }

            if(routeHandlers[fileName]){
                return routeHandlers[fileName](req, res);
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
	    gulp.watch(['app/{styles, components}/**/*.less', 'app/routes/**/*.less','app/styles/*.less'], ['styles', reload]);
	    gulp.watch([$.paths.js.app], ['scripts', reload]);
	    gulp.watch(['app/routes/**/*.html'], ['styles', reload]);

	    //gulp.watch(['app/images/*#1#*'], reload);
    }

    return {
    	serve: serve
    };
}

module.exports = serve;
