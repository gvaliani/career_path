function ExampleService(angular, app) {
	'use strict';

	app.factory('exampleService', exampleService);

	exampleService.$inject = ['constants','values', '$q', '$http'];

	function exampleService(constants, values, $q, $http){

		return {
			getAll:getAll
		};

		function getAll(){
			// Mock imnplementation
			var defer = $q.defer();
			setTimeout(function fakeDelay() {
				defer.resolve({
					name: 'John'
				});
			}, 2000);
			return defer.promise;



			// Real implementation
			// return $http.get('/api/contentblocks').then(function onOk(response){
			// 	return response.data;
			// });
		}
	}
}

module.exports = ExampleService;