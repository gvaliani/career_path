function utilsProvider(angular, app, $){

	'use strict';

    /**
     * Replacement for jQuery replaceWith method, to trigger a custom element 
     * @type {Object} - jQuery element
     * http://stackoverflow.com/questions/7167085/on-append-do-something
     */
    var originalReplaceWith = $.fn.replaceWith;
    $.fn.replaceWith = function () {
         // Make a list of arguments that are jQuery objects
        var replacements = $.makeArray(arguments).filter(function(arg){
            return arg instanceof $;
        });

         // Call the actual function
        var returnValue = originalReplaceWith.apply(this, arguments);

        for (var i = 0; i < replacements.length; ++i)
        {
            replacements[i].trigger('replacedElement');
        }

        returnValue.trigger('replaceWith');

        return returnValue;
    };
		
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