// Karma configuration
// Generated on Wed Nov 11 2015 13:33:42 GMT-0300 (Argentina Standard Time)

module.exports = function(config) {
  config.set({
    
    // list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.min.js',
      'dist/lib.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'app/test/app.mock.js',
      'app/**/*.spec.js'
    ],  


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'jasmine'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'app/**/*.spec.js': ['browserify']
    },

    browserify: {
      debug: true
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    plugins: ['karma-bamboo-reporter', 'karma-browserify','karma-chrome-launcher','karma-coverage','karma-jasmine','karma-phantomjs-launcher'],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    
    // DEBUG MODE
    //browsers: ['Chrome'],

    // For Bamboo
    browsers:['PhantomJS'],

    reporters:['progress', 'coverage', 'bamboo'],

    // optionally, configure the reporter
    coverageReporter: {
        "reporters": [
            {"type": "html"},
            {"type": "text-summary"}
        ]
    },

    browserify:{
        debug: true,
        transform: ['browserify-shim','browserify-istanbul']
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity
  })
}
