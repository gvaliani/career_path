function underscoreProvider(angular, app){

	'use strict';
		
    app.factory('_', [
		function undersocreprovider(){
			return _;
		}
	]);

}

module.exports = underscoreProvider;