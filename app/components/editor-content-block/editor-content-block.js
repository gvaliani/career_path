function editorContentBlockDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	app.directive('editorContentBlock', editorContentBlockDirective);

	editorContentBlockDirective.$inject = ['$log', '_','$compile','constants'];

	/**
	* @name app.directive: editorContentBlock
	*
	* @description
	*  block of content with editor associated
	* 
	* @example
	<table class="editor-content-block">
	</table>
	 */
	function editorContentBlockDirective($log, _,compile, constants){

		return {
			restrict:'C',
			link: link
		};


		function link(scope, element, attributes, ctrl){
			// insert "drop-here" legend after each element
			$('#viewTemplates .drop-here').clone().insertAfter(element);

			element = $(element);
		}
	}
}

module.exports = editorContentBlockDirective;