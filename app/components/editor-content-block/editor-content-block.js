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
			console.log(scope.$id);

			// insert "drop-here" legend after each element
			var dropHere = compile($('#viewTemplates .drop-here').clone())(scope);
			dropHere.insertAfter(element);
			dropHere.droppable(values.droppableOptions);

			dropHere.on('drop', function(e, ui){
				console.log('dropped');
			});

			// insert actions menubar before each element and toggle it on mouseover
			var hoverMenuBar = compile($('#viewTemplates .content-block-menu-bar').clone())(scope);
			hoverMenuBar.insertBefore(element);

			element.hover(
				function onCbMouseEnter() {
					hoverMenuBar.show();
					hoverMenuBar.position({ my: 'center bottom', at: 'center top', of: element });
				},
				function onCbMouseLeave() {
					hoverMenuBar.hide();
				}
			);

	}
}

module.exports = editorContentBlockDirective;
