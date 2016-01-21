(function() {
    'use strict';

    var app = angular
        .module('email-editor', ['ui.router'])
        .config([
        	'$stateProvider',
        	'$urlRouterProvider',
			'$controllerProvider',
			'$compileProvider',
			'$filterProvider',
			'$provide',
			function($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
	
				app.controller = $controllerProvider.register;
				app.directive = $compileProvider;
				app.filter = $filterProvider;
				app.factory = $provide.factory;
				app.service = $provide.service;
				app.value = $provide.value;
				app.constant = $provide.constant;

				$urlRouterProvider.otherwise('/home');

				$stateProvider
					.state('home', getStateConfig('/home', 'home.template.html', 'homeCtrl', 'home'))
					.state('ezeclick', getStateConfig('/ezeclick', 'products_landing.template.html', 'products_landingCtrl', 'products_landing'));
		}]);

	// App configuration
	require('./configuration/config.js')(angular, app, {});
	require('./configuration/messages.js')(angular, app);

	// Underscore angular wrapper.
	require('./helpers/underscore-provider.js')(angular, app);

	// Modal directive.
	require('./components/modal/modal.js')(angular, app);
	require('./components/modal/modal.service.js')(angular, app);


    /**
    * @function
    * @name
    * @description
    * @params {String} url
    * @params {String} template
    * @params {String} controller
    * @params {String} controllerAs
    * @returns {Object}
    */
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

})();
