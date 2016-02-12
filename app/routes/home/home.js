window.homeController = function homeController(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	app.controller('homeCtrl', homeCtrl);

	homeCtrl.$inject = ['_'];
	function homeCtrl(_){
		var self = this; //jshint ignore:line

		return _.extend(self, {
			section: 'Home content'
		});
	}
};
