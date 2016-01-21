function FBModalService(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	app.service('modalService', modalService);

	/**
	* @ngdoc service
	* @name app.service: modalService
	*
	* @description
	* This service works as a bridge for amxModal directive. It is decorated by amxModal directive with functionality
	* able to comunicate with the directive. e.g: open/close modal.
	* 
	*/
	function modalService ($q, _) {
		var self = this; //jshint ignore:line
		var callbacks = {};

		// Exposing interface
		return _.extend(self, {
			setModal: setModal
		});

        /** @function
        * @name setModal
        * @description Set modal in hash to be able to handle it from controller.
		* @params {string} modalName - modal name. It must to be unique.
		* @params {Object} functions - plain object with function to be used from controller.
		*/
		function setModal (modalName, functions) {
			self[modalName] = functions;
		}
	}

	modalService.$inject = ['$q', '_'];
}

module.exports = FBModalService;
