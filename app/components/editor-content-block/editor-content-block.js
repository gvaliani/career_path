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

				// if the content block comes on the email from the beginning (editing emails)
				// then, add the extra-html needed for that content block
				if(element.parents('.' + constants.canvasClass).length){
					setupContentBlockElements();
				}
				else{
					// set a listener to add extra-html once the content block is dropped on a email
					element.one('replacedElement', setupContentBlockElements);
				}

			}

			/**
			 * @name setupContentBlockElements
			 * @description Adds extra html needed for the content block:
			 *              drop-here placeholders
			 *              hover menu
			 * @return {[type]} [description]
			 */
			function setupContentBlockElements() {

				// insert "drop-here" legend after each element
				var dropHere = compile($('#viewTemplates .drop-here').clone())(scope);
				dropHere.insertAfter(element);
				dropHere.attr('data-content-block', scope.$id);
				dropHere.droppable(values.droppableOptions);

				var hoverMenuBar = compile($('#viewTemplates .' + constants.overlayMenuBarClass).clone())(scope);
				element.append(hoverMenuBar);

				hoverMenuBar.find('.duplicate').on('click', function duplicateContentBlock(){
					var duplicate = getCleanHtml(element.clone());
					duplicate.insertAfter(element);

					compile(duplicate)(scope);
				});

				hoverMenuBar.find('.delete').on('click', function deleteContentBlock(){
					element.remove();
				});

				var overlay = $('#viewTemplates .' + constants.overlayClass).clone();
				element.append(overlay);

				element.on('mouseover', function onContentBlockMouseOver() {
					hoverMenuBar.position({ my: 'center bottom', at: 'center top', of: element });

					overlay.height(element.height()).width(element.width());
					overlay.position({ my: 'center center', at: 'center center', of: element, collision: 'none', within: element });
				});
			}

			/**
			 * @name getCleanHtml
			 * @description Removes content block extra elements from cloned content block
			 * @return {[type]} [description]
			 */
			function getCleanHtml(contentBlockHtml) {
				contentBlockHtml
					.removeClass('ng-isolate-scope ng-scope')
					.find('.' + constants.overlayClass + ', .' + constants.overlayMenuBarClass)
					.remove();

				return contentBlockHtml;
			}

			init();
		}
	}
}

module.exports = editorContentBlockDirective;
