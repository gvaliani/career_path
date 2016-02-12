function ExampleService(angular, app) {
	'use strict';

	app.factory('exampleService', exampleService);

	exampleService.$inject = ['constants','values', '$q', '$http'];

	function exampleService(constants, values, $q, $http){

		return {
			getAll:getAll
		};

		function getAll(){
			return $http.get('/api/contentblocks').then(function onOk(response){
				return response.data;
			});
		}
	}
}

module.exports = ExampleService;