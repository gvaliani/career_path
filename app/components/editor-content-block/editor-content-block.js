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
			link: link,
			scope: {}
		};


		function link(scope, element, attributes, ctrl){
			element = $(element);

			function init(){
				element.on('replacedElement', setupDropHere);
				var hoverMenuBar = compile($('#viewTemplates .content-block-menu-bar').clone())(scope);
			}

			function setupDropHere(){
				// insert "drop-here" legend after each element
				var dropHere = compile($('#viewTemplates .drop-here').clone())(scope);
				dropHere.insertAfter(element);
				dropHere.data('contentBlock', scope.$id);
				dropHere.droppable(values.droppableOptions);
			}

			init();
		}
	}
}

module.exports = editorContentBlockDirective;
