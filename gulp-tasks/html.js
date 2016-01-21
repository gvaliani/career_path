'use strict';


function html(gulp, $){
    $.minifyHtmlOptions = {
        quotes: true,
        empty: true,
        spare: true
    };

    function htmlBuild(){
	    $.isDebug = false;
	    return processHtml()
	        .pipe(gulp.dest($.paths.out));
    }

    function htmlServe(){
	    $.isDebug = true;
	    return processHtml()
	        .pipe(gulp.dest($.paths.out));
    }

	function processHtml(){
	    return gulp.src($.paths.html.app)
	        .pipe($.minifyHtml($.minifyHtmlOptions));
	}

	return {
		htmlServe: htmlServe,
		htmlBuild: htmlBuild,
		processHtml: processHtml
	};
}

module.exports = html;