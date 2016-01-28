function messageServiceWrapper(angular, app) {
	'use strict';


	app.factory('messageService', messageService);

	messageService.$inject = ['constants','values', '$q', '$http'];

	function messageService(constants, values, $q, $http){

		function get(id){

			var endpoint = '/api/messages/';

			if(id){
				endpoint += id;
			}
			else{
				endpoint += 'new';
			}

			return $http.get(endpoint).then(function onOk(response){
				return response.data;
			});
		}

		return {
			get:get
		};
	}
}

module.exports = messageServiceWrapper;