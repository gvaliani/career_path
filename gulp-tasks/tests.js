'use strict';


function tests(gulp, $){
    var path = require('path'),
		vinylTransform = require('vinyl-transform'),
    	Server = require('karma').Server,
    	replaceToken = "'use e2e base code';";


    $.paths.test = {
    	e2e:{
    		app:'app/**/*.e2e.js',
    		base:'app/e2e.base.js',
    		tmp:'tmp/**/*.e2e.js'
    	},
    	spec:'app/**/*.spec.js',
    	coverageSrc: 'coverage/**/*.*',
    	covergareDest: '../../../../../../Coverage/public/segmentation'
    };


    /*
     * @function setupProtactorTests
     * @description Adds base code common to all e2e tests   */
	function setupProtactorTests(filePath){
		var testPaths = filePath || $.paths.test.e2e.app;

		return	gulp.src($.paths.test.e2e.app)
    		.pipe($.foreach(prepareProtactorTests));
	}

	/* 
	 *@function protractor
	 * @description Runs protractor tests*/
	function protractor(filePath){

		var testPaths = $.paths.test.e2e.tmp;

		if(filePath){
			testPaths = filePath.replace($.paths.app + '/', $.paths.tmp + '/');
		}

		return	gulp.src(testPaths)
		    .pipe($.angularProtractor ({
		        'configFile': 'protractor.config.js',
		        //'args': ['--baseUrl', 'http://127.0.0.1:8000'],
		        'autoStartStopServer': true,
		        'debug': true
		    }));
	}


	/* 
	 * @function karma
	 * @description
	 	Runs all karma unit tests */
	function karma(done){
		 new Server({
		    configFile: __dirname + '/../karma.config.js',
		    singleRun: true
		  }, done).start();
	}


	/* 
	 * @function karma
	 * @description
	 	Runs all karma unit tests and lets open a watcher */
	function karmaWatch(done){
		 new Server({
		    configFile: __dirname + '/../karma.config.js',
		  }, done).start();		
	}


	/* *@function
	 * @name prepareProtactorTests
	 * @description Merges tests js with boilerplate in order to be sure that protractor waits for the app to be ready
	 * @params {stream} stream - gulp stream
	 * @params {file} file - io file
	 * @returns {stream} A stream with the concatenated file*/
	function prepareProtactorTests(stream, file){

	    // using conventions get the template html path
	    var appsFolder = path.join(process.cwd(), $.paths.app),
	        filename = path.relative(appsFolder, file.path),
	        replaceTemplateTransform = vinylTransform($.getReplaceTemplateTransform(replaceToken,'// setup code for protractor'));

	    return stream
	    	// add the template html file to the stream
	        .pipe($.addSrc($.paths.test.e2e.base))
	        // concat base js, to test js
	        .pipe($.concat(filename))
	        // move template js to placeholder
	        .pipe(replaceTemplateTransform)
		 	.on('error', $.util.log)
	        // save on temp
            .pipe(gulp.dest($.paths.tmp));
	}

	function copyCoverage(){
		return gulp.src($.paths.test.coverageSrc)
			.pipe(gulp.dest($.paths.test.covergareDest));		
	}

	return {
		setupe2e: setupProtactorTests,
		e2e: protractor,
		spec: karma,
		karmaWatch: karmaWatch,
		copyCoverage: copyCoverage
	};
}

module.exports = tests;