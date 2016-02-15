'use strict';

function scripts(gulp, $){

    var path = require('path'),
		browserify = require('browserify'),
		source = require('vinyl-source-stream'),
		buffer = require('vinyl-buffer'),
	    map = require('map-stream'),
		vinylTransform = require('vinyl-transform'),
		glob = require('globby'),
    	es = require('event-stream'),
    	stylish = require('jshint-stylish'),
		replaceToken = "'use angular template';",
		templateHeader = 'app.value',
		templateBody = '("<%= url %>","<%= contents %>"',
		templateFooter = ');';

	$.paths.js = {
        app: ['app/**/*.js','app/routes/**/*.js','app/components/**/*.js', '!app/test*', '!app/**/*.spec.js','!app/**/*.e2e.js','!e2e.base.js'],
        moveToTmp : ['app/**/*.js','!app/routes/**/*.js','!app/components/**/*.js', '!app/test/*.js', '!app/**/*.spec.js','!app/**/*.e2e.js','!e2e.base.js'],
        lib: [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/angular/angular.min.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/underscore/underscore-min.js',
            'bower_components/loadJS/loadJS.js',
            'bower_components/loadcss/loadCSS.js',
            'bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js',
            'lib/jquery-ui-1.11.0.js',
            'lib/stacktrace.js'
        ],
        components:[
            'app/components/**/*.js',
            '!app/components/**/*.spec.js',
            '!app/components/**/*.e2e.js',
            'app/routes/**/*.js',
            '!app/routes/**/*.spec.js',
            '!app/routes/**/*.e2e.js'
        ],
        tmpApp: 'tmp/app.js',
        tmpAll: ['tmp/**/*.bundle.js'],
        tmpComponents: ['tmp/**/*.js','!tmp/**/*.bundle.js']
    };

    /* @function
    * @name exitOnJshintError
    * @description Produces an error that stops when a file failed jshint validation*/
    function exitOnJshintError() {
	  	return map(function (file, cb) {
			  if (!file.jshint.success) {
			    console.log('JSHINT fail in '+file.path);
			    process.exit(1);
			  }
			  cb(null, file);

		});
	}


	/* @function
	* @name getBrowserifyInstance
	* @description
		Set up the browserify instance on a task basis 	*/
	function getBrowserifyInstance(filePaths){
		var instance = browserify({
			entries: filePaths,
			debug: true
		});

		return instance;
	}

	/* @function
	* @name getBrowserifyBundle
	* @description
		Given a file
		Set up the browserify instance on a task basis 	*/
	function getBrowserifyBundle(filePath, resultName){

		return getBrowserifyInstance(filePath)
		 	.bundle()
		 	.pipe(source(resultName))
		 	.pipe(buffer());
	}


	/* @function
	* @name mergeDirectiveAndTemplate
	* @description Merges directive js with html template in a single JS file
	* @params {stream} stream - gulp stream
	* @params {file} file - io file
	* @returns {stream} A stream with the concatenated file*/
	function mergeDirectiveAndTemplate(stream, file){
		// TODO: Replace double quotes, for singles

	    // using conventions get the template html path
	    var htmlPath = file.path.replace('.js','.template.html'),
	        appsFolder = path.join(process.cwd(), $.paths.app),
	        filename = path.relative(appsFolder, file.path),

        /*Given a js files with the directive js
        and template html in form of angular-template-cache  https://www.npmjs.com/package/gulp-angular-templatecache#example
        it moves the template replacing a string token.
        Example Source:
            'use angular template'
            random content 1
            random content 2
        Result:
            angular.module('application').run('...register html template');
            random content 1
            random content 2*/
	        replaceTemplateTransform = vinylTransform($.getReplaceTemplateTransform(replaceToken, templateHeader));

	    return stream
	    	.pipe($.jshint())
	    	.pipe($.jshint.reporter(stylish))
	    	.pipe(exitOnJshintError())
	        // add the template html file to the stream
	        .pipe($.addSrc(htmlPath))
	        // run minify templte html
	        .pipe($.if('*.html', $.minifyHtml($.minifyHtmlOptions)))
	        // convert html to angular js template
	        .pipe($.if('*.html', $.angularTemplatecache({ module: 'application', templateHeader: templateHeader, templateFooter: templateFooter, templateBody: templateBody })))
	        // concat template js, to directive js
		 	.on('error', $.util.log)
	        .pipe($.concat(filename))
	        // move template js to placeholder
	        .pipe(replaceTemplateTransform)
		 	.on('error', $.util.log)
	        // save on temp
            .pipe(gulp.dest($.paths.tmp));
	}

	/* @function
	* @name createComponentTemplates
	* @description creates a js for each directive that contains template html
	* @returns {stream} The gulp stream*/
	function createComponentTemplates(){

		return gulp.src($.paths.js.components)
		 		.on('error', $.util.log)
				// get templates and merge with directives code
        		.pipe($.foreach(mergeDirectiveAndTemplate));
    }

	/* @function
	* @name directiveBundle
	* @description Creates a browserify bundle per each directive
	* @returns {stream} The gulp stream*/
    function directiveBundle(done){
        // generate a browserify bundle for each one with minification and sourcemaps
        var files = glob.sync(['tmp/**/*.js', '!tmp/**/*.bundle.js']);

        var tasks = files.map(function(entry) {

  			var bundlePath = entry.replace('.js','.bundle.js');

            return getBrowserifyBundle(entry, bundlePath)
				.pipe(gulp.dest('./'));
        });

        es.merge(tasks).on('end', done);
    }


    /*
    */
    function moveToTmp(){
		// move all js to .tmp
		return gulp.src($.paths.js.moveToTmp)
	    	.pipe($.jshint())
	    	.pipe($.jshint.reporter(stylish))
	    	.pipe(exitOnJshintError())
			.pipe(gulp.dest($.paths.tmp));
    }

	/* @function
	* @name appBundle
	* @description Creates a browserify bundle for main app file
	* @returns {stream} The gulp stream*/
	function appBundle(){
		 return getBrowserifyBundle($.paths.js.tmpApp, 'app.bundle.js')
		 	.pipe(gulp.dest($.paths.tmp));
	}

	// TODO: cache, revision number
	function scripts(){
		return gulp.src($.paths.js.tmpAll)
			.pipe($.sourcemaps.init({loadMaps: true}))
		 	//.pipe($.uglify())
		 	.on('error', $.util.log)
		 	.pipe($.sourcemaps.write('./'))
		 	.pipe(gulp.dest($.paths.out));
	}

	// TODO: Add cache, revision number
	function libBundle(){
	    return gulp.src($.paths.js.lib)
	        .pipe($.concat('lib.js'))
		 	.pipe($.sourcemaps.init({loadMaps: true}))
	        .pipe($.uglify())
		 	.on('error', $.util.log)
		 	.pipe($.sourcemaps.write('./'))
	        .pipe(gulp.dest($.paths.out));
	}

	function docs(){
	    return gulp.src($.paths.js.app)
	        .pipe($.ngdocs.process())
	        .pipe(gulp.dest('./docs'));
	}

	return {
		createComponentTemplates: createComponentTemplates,
		directiveBundle: directiveBundle,
		appBundle: appBundle,
		libBundle: libBundle,
		scripts: scripts,
		moveToTmp: moveToTmp,
		docs: docs
	};
}

module.exports = scripts;
