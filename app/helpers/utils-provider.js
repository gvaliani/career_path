function utilsProvider(angular, app, $){

	'use strict';
		
    app.factory('utils', [
		function utilsProvider(){

            //cross browser outer html support
            $.fn.outerHTML = function (s) {
                if (!$(s).length) {
                    return false;
                }
                return $(s).clone().wrap('<p>').parent().html();
            };

            // TODO: Deprecate
            $.fn.isIE8 = function () {
                var userAgent = window.navigator.userAgent;
                var isMSIE = (window.navigator.appName == "Microsoft Internet Explorer");
                var isIE8 = isMSIE && (userAgent.indexOf('MSIE 8') >= 0 || userAgent.indexOf('MSIE 7') >= 0);
                return isIE8;
            };

            // TODO: Deprecate
            function preventSubmit(e) {
                var key;
                if (window.event)
                    key = window.event.keyCode; //IE
                else
                    key = e.which; //firefox      

                if (key == 13) {
                    e.returnValue = false;
                    e.cancel = true;

                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                }
            }

			return {
				preventSubmit: preventSubmit	
			};
		}
	]);

}

module.exports = utilsProvider;