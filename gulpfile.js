'use strict';

var gulp = require('gulp'),
    map = require('map-stream'),
    $ = require('gulp-load-plugins')();
    
$.paths = {
        html: {
            all: 'app/**/*.html',
            app:'app/index.html',
            excludeComponents: ['components/**/*template.html'],
            components:['app/components/**/*template.html']
        },
        app: 'app',
        tmp: 'tmp',
        out: 'dist'
    };
$.isDebug = false;


    /* @function
    * @name getTasks
    * @description Get a group of gulp tasks
    * @returns {Object} An object containing functions for gulp tasks*/
    function getTasks(groupName) {
        return require('./gulp-tasks/' + groupName)(gulp, $);
    }


    /* @function
    * @name replaceTemplate
    * @description 
        Creates a vinyl transform than given a file, it searchs for "tokenToMove" and moves that content to another location
        symbolized with "tokenToReplace"

        file1:
            // im a token to replace
            content
            content
            content

            // move from here all the content
            conten1
            content2
            content4

        Calling getReplaceTemplateTransform('// im a token to replace', '// move from here all the content') will produce a vinyltransform
        that when executed will return

        file1:
            // move from here all the content
            conten1
            content2
            content4
            content
            content
            content
     */
    function getReplaceTemplateTransform(tokenToReplace, tokenToMove){

        function replaceTemplate(filename) {
            return map(function(chunk, next) {

                var chunkString = chunk.toString();

                // get template text
                var templateIndex = chunkString.indexOf(tokenToMove);
                
                if(templateIndex < 0){
                    return next(null, chunk.toString());
                }
                
                var templateText = chunkString.substring(templateIndex);
                chunkString = chunkString.replace(templateText, '').replace(tokenToReplace, templateText);

                return next(null, chunkString);
            });
        }

        return replaceTemplate;
    }

    $.getReplaceTemplateTransform = getReplaceTemplateTransform;

// get the different tasks per group
var scriptTasks = getTasks('scripts'),
    styleTasks = getTasks('styles'),
    htmlTasks = getTasks('html'),
    testsTasks =getTasks('tests');


/*
*************************
* Scripts tasks: */
gulp.task('createComponentTemplates', function(){
    return scriptTasks.createComponentTemplates();
});

gulp.task('bundleComponents', ['createComponentTemplates'], function(done){
    return scriptTasks.directiveBundle(done);
});

gulp.task('libsBundle', function(){
    return scriptTasks.libBundle();
});

gulp.task('moveJSToTmp', function(){
    return scriptTasks.moveToTmp();
});

gulp.task('appBundle', ['bundleComponents','moveJSToTmp'], function(){
    return scriptTasks.appBundle();
});

gulp.task('scripts', ['libsBundle','appBundle'], function(){
    return scriptTasks.scripts();
});

/*
*********************
*/

gulp.task('sass', function(){
    return styleTasks.sass();
});

gulp.task('styles', ['sass', 'resources'], function(){
    return styleTasks.autoprefixAndMin();
});

gulp.task('resources', function () {
    return styleTasks.moveResourcesToDist();
});

gulp.task('html:serve', function(){
    return htmlTasks.htmlServe();
});

gulp.task('html:build', function(){
    return htmlTasks.htmlBuild();
});

gulp.task('build', ['spec','html:build','scripts','styles'], function () {
    return { }; // do nothing other than the pre-reqs (DO NOT SERVE!)
});

gulp.task('setupe2e',function(){
    var filePath;
    if(process.argv.length > 3){
        filePath = process.argv[4]
    }

    return testsTasks.setupe2e(filePath);
});

gulp.task('e2e', ['setupe2e'], function(){
    var filePath;
    if(process.argv.length > 3){
        filePath = process.argv[4]
    }

    return testsTasks.e2e(filePath);
});

gulp.task('specWatch', function(done){
    return testsTasks.karmaWatch(done);
});

gulp.task('spec', function(done){
    return testsTasks.spec(done);
});

gulp.task('coverage', function(){
    return testsTasks.copyCoverage();
});

gulp.task('docs', function(){
    return scriptTasks.docs();
});

gulp.task('develop', function(){
    gulp.watch(['index.html'], ['html:serve']);
    gulp.watch(['app/components/**/*.html'], ['scripts']);
    gulp.watch(['app/styles/**/*.scss','app/components/**/*.scss', 'app/routes/**/*.scss','app/styles/*.scss'], ['styles']);
    gulp.watch([$.paths.js.app], ['scripts']);
    gulp.watch(['app/routes/**/*.html'], ['styles']);
});