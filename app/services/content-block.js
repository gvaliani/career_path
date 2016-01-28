function contentBlockServiceWrapper(angular, app) {
	'use strict';


	app.factory('contentBlockService', contentBlockService);

	contentBlockService.$inject = ['constants','values', '$q', '$http'];

	function contentBlockService(constants, values, $q, $http){
		function getAll(){
			return $http.get('/api/contentblocks').then(function onOk(response){
				return response.data;
			});
		}

		return {
			getAll:getAll
		};
	}
}

module.exports = contentBlockServiceWrapper;