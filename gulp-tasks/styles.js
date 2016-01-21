function styleTasks(gulp, $){
	
	var path = require('path');
	$.paths.styles = {
		base: 'app/styles/base.less',
		components: 'app/**/*.less',
		tmpComponents: 'tmp/**/*.css',
		resources: ['app/**/*', '!app/styles/**/*.less','!app/**/*.js','!app/**/*.map']
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

	function less(){
		return gulp.src([$.paths.styles.components])
			.pipe($.less())
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
		less:less,
		autoprefixAndMin: autoprefixAndMin,
		moveResourcesToDist: moveResourcesToDist
	};

}

module.exports = styleTasks;