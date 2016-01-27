window.homeController = function homeController(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	app.controller('homeCtrl', homeCtrl);

	require('./../../components/email-editor/email-editor.js')(angular, app);

	function homeCtrl(){
		var self = this; //jshint ignore:line
	}
};
