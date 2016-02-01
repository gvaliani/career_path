(function() {
    'use strict';

    var constants = $('#constants').data(),
    	values = $('#values').data(),
		app = angular
        .module('email-editor', ['ui.router'])
        .config([
        	'$stateProvider',
        	'$urlRouterProvider',
			'$controllerProvider',
			'$compileProvider',
			'$filterProvider',
			'$provide',
			function appConfig($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
	
				app.controller = $controllerProvider.register;
				app.directive = $compileProvider.directive;
				app.filter = $filterProvider;
				app.factory = $provide.factory;
				app.service = $provide.service;
				app.value = $provide.value;
				app.constant = $provide.constant;

                /* Configure exception handling*/
                $provide.decorator("$exceptionHandler", [
                    '$delegate',
                    function exceptionHandlerDecorator($delegate) {
                        return function exceptionHandler(exception, cause) {

                            $delegate(exception, cause);
                            window.errorHandler(exception, cause, null, null);
                        };
                    }
                ]);


				$urlRouterProvider.otherwise('/home');

				$stateProvider
					.state('home', getStateConfig('/home', 'home.template.html', 'homeCtrl', 'home'));
			}
		])
		.run([
			'$window',
			'$rootScope',
			function appRun(global, $rootScope) {
				$rootScope.safeApply = function (fn) {
					var phase = this.$root.$$phase;
					if (phase == '$apply' || phase == '$digest') {
						if (fn && (typeof (fn) === 'function')) {
							fn();
						}
					} else {
						this.$apply(fn);
					}
				};

                global.onerror = function (errorMsg, url, lineNumber) {

                    var exception = {
                        url: url,
                        lineNumber: lineNumber
                    };

                    global.errorHandler(exception, errorMsg, null, null);
                };

                global.errorHandler = function (exception, cause, callback, errorCallback) {

                    var stack = stackTrace({ e: exception });

                    var exceptionData = {
                        fileName: exception.url,
                        message: cause || exception.message || exception.description,
                        lineNumber: exception.lineNumber,
                        columnNumber: exception.columnNumber,
                        stackTrace: stack.join('\n'),
                        Url: window.location.href
                    };

                    $.ajax({
                        method: 'POST',
                        url: '/api/applications',
                        data: exceptionData,
                        dataType: 'json',
                        success: function (data) {
                            if (angular.isFunction(callback)) {
                                callback(exceptionData);
                            }
                        },
                        error: function (xhr) {
                            if (angular.isFunction(errorCallback)) {
                                errorCallback(exceptionData);
                            }
                        }
                    });
                };
			}
		]);

    /**
    * @function
    * @name
    * @description
    * @params {String} url
    * @params {String} template
    * @params {String} controller
    * @params {String} controllerAs
    * @returns {Object}*/
	function getStateConfig(url, template, controller, controllerAs){

		var stateObject = {
			url: url,
			templateProvider: [template, function(template){
				return template;
			}],
			controllerProvider:[template, function(template){
				return controller;
			}],
			controllerAs: controllerAs,
			resolve: {
				deps: ['$q', function($q){
					var deferred = $q.defer();

			        loadJS('/routes/'+ controllerAs +'/' + controllerAs + '.bundle.js', function() {
			        	var home = new window[controllerAs + 'Controller'](angular, app); //jshint ignore:line
			          	return deferred.resolve();
			        });

			        return deferred.promise;
				}]
			}
		};

		return stateObject;
	}

	// App configuration
	require('./configuration/constants.js')(angular, app, constants, _);
	require('./configuration/values.js')(angular, app, values, _);
	require('./configuration/messages.js')(angular, app);

	// Underscore angular wrapper.
	require('./helpers/underscore-provider.js')(angular, app);
	require('./helpers/utils-provider.js')(angular, app, window.jQuery);

	// Modal directive.
	require('./components/modal/modal.js')(angular, app);
	require('./components/modal/modal.service.js')(angular, app);
})();
