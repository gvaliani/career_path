window.homeController = function homeController(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	require('./../../services/example-service.js')(angular, app);

	app.controller('homeCtrl', homeCtrl);

	homeCtrl.$inject = ['_', 'exampleService'];
	function homeCtrl(_, exampleService){
		var self = this; //jshint ignore:line

		init();

		return _.extend(self, {
			content: 'Calling to fake service...'
		});

		/////////

		function init () {
			exampleService.getAll().then(function onSuccess (data) {
				self.content = data;
			});
		}

	}
};
