'use strict';

function serve(gulp, $){

	var browserSync = require('browser-sync'),
    reload = browserSync.reload,
    historyApiFallback = require('connect-history-api-fallback'), // provides fallback for html5 folders on browsersync
	proxyMiddleware = require('http-proxy-middleware'),
    middleware = require('./middleware/middleware')();

    function serve(){

    	browserSync({
    		port:5000,
    		notify:true,
	        server: {
	        	baseDir: './dist',
	            middleware: [middleware.middleware, historyApiFallback()]
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
