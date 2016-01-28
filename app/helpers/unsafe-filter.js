function unsafeHtml(angular, app){

	'use strict';
		
    app.filter.register('unsafe', ['$sce', function ($sce) {
	    return function (val) {
	    	console.log(val);
	        return $sce.trustAsHtml(val);
	    };
	}]);

}

module.exports = unsafeHtml;