window.alternativeController = function homeController(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	app.controller('alternativeCtrl', alternativeCtrl);

	require('./../../components/alternative-editor/alternative-editor.js')(angular, app);

	function alternativeCtrl(){
		var self = this; //jshint ignore:line
	}
};
