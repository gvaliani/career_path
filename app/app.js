(function() {
	'use strict';

	var constants = $('#constants').data(),
	values = $('#values').data(),
	app = angular
	.module('career-path', ['ui.router'])
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

			$urlRouterProvider.otherwise('/home');

			$stateProvider
			.state('home', {
				url: '/home',
				templateProvider: ['home.template.html', function(template){
					return template;
				}],
				controller: 'homeCtrl',
				controllerAs: 'home',
				resolve: {
					deps: [function(){
						require('./routes/home/home.js');
						window.homeController(angular, app);
					}]
				}
			});
		}
	]);

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
	
	require('./components/menu-header/menu-header.js')(angular, app);
})();
