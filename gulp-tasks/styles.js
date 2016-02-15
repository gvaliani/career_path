function styleTasks(gulp, $){
	
	var path = require('path');
	$.paths.styles = {
		base: 'app/styles/base.scss',
		bootstrapBase: 'bower_components/bootstrap-sass/assets/stylesheets',
		components: 'app/**/*.scss',
		tmpComponents: 'tmp/**/*.css',
		resources: ['app/**/*', '!app/styles/**/*.scss','!app/**/*.js','!app/**/*.map']
	};

	var AUTOPREFIXER_BROWSERS = [
	  'ie >= 10',
	  'ie_mob >= 10',
	  'ff >= 30',
	  'chrome >= 34',
	  'safari >= 7',
	  'opera >= 23',
	  'ios >= 7',
	  'android >= 4.4',
	  'bb >= 10'
	];

	function sass(){
		return gulp.src([$.paths.styles.components])
			.pipe($.sass({
				includePaths: [$.paths.styles.bootstrapBase]
			}))
		 	.on('error', $.util.log)
			.pipe(gulp.dest($.paths.tmp));
	}

	function autoprefixAndMin(){
		return gulp.src($.paths.styles.tmpComponents)
        	.pipe($.sourcemaps.init())
			.pipe($.autoprefixer({ 
				browsers: AUTOPREFIXER_BROWSERS,
            	cascade: false
        	}))
			.pipe($.cssmin())
		 	.on('error', $.util.log)
	        .pipe($.sourcemaps.write('.'))
			.pipe(gulp.dest($.paths.out));
	}

	function moveResourcesToDist() {
	    return gulp.src($.paths.styles.resources)
			.pipe(gulp.dest($.paths.out));
	}


	return {
		sass: sass,
		autoprefixAndMin: autoprefixAndMin,
		moveResourcesToDist: moveResourcesToDist
	};

}

module.exports = styleTasks;