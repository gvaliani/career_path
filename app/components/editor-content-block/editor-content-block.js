function editorContentBlockDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	app.directive('editorContentBlock', editorContentBlockDirective);

	editorContentBlockDirective.$inject = ['$log', '_','$compile','constants','values'];

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
	function editorContentBlockDirective($log, _,compile, constants,values){

		return {
			restrict:'C',
			link: link
		};


		function link(scope, element, attributes, ctrl){
			element = $(element);

			// insert "drop-here" legend after each element
			var dropHere = compile($('#viewTemplates .drop-here').clone())(scope);
			dropHere.insertAfter(element);
			dropHere.droppable(values.droppableOptions);

			var hoverMenuBar = compile($('#viewTemplates .content-block-menu-bar').clone())(scope);
			console.log(hoverMenuBar);
			dropHere.insertAfter(element);
		}
	}
}

module.exports = editorContentBlockDirective;
