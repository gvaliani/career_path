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

			function init(){

				element = $(element);
				element.attr('data-id', scope.$id);

				if(element.parents('.' + constants.canvasClass).length){
					setupContentBlockElements();
				}
				else{
					element.one('replacedElement', setupContentBlockElements);
				}

			}

			function setupContentBlockElements(){
				
				// insert "drop-here" legend after each element
				var dropHere = compile($('#viewTemplates .drop-here').clone())(scope);
				dropHere.insertAfter(element);
				dropHere.attr('data-content-block', scope.$id);
				dropHere.droppable(values.droppableOptions);


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

			init();
		}
	}
}

module.exports = editorContentBlockDirective;
