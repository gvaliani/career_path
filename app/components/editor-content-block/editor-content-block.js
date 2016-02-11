function editorContentBlockDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line


	var editorsLoaded = [];
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
			function setupContentBlockElements(){

				// insert "drop-here" legend after each element
				var dropHere = compile($('#viewTemplates .drop-here').clone())(scope);
				dropHere.insertAfter(element);
				dropHere.attr('data-content-block', scope.$id);
				dropHere.droppable(values.droppableOptions);

				var hoverMenuBar = compile($('#viewTemplates .' + constants.overlayMenuBarClass).clone())(scope);
				element.append(hoverMenuBar);

				var overlay = $('#viewTemplates .' + constants.overlayClass).clone();
				element.append(overlay);

				element.on('mouseover',
					function onCbMouseEnter() {
						hoverMenuBar.position({ my: 'center bottom', at: 'center top', of: element });

						overlay.height(element.height()).width(element.width());
						overlay.position({ my: 'center center', at: 'center center', of: element, collision: 'none', within: element });
					}
				);

				// load editors
				
			}

			/**
			 * Load directives for the different kind of editors associated with the content block
			 * @return {[type]} [description]
			 */
			function loadEditors(){

				// regex to parse from camelCase to dash camel-case
				var rmultiDash = /([a-z])([A-Z])/g;

				// get the different editable areas
				editableAreas = element.find('[data-editable]');

				// foreach editable area, loads its editors
				for (var i = 0; i < editableArea.length; i++) {
					
					for(var keys in editableArea[i].data()){

						// check for data-editor attributes on editable area
						if(keys.indexOf('editor') === 0 && !editorsLoaded[keys]){
							window.module = {};
							var parsedName = keys.replace(rmultiDash, "$1-$2" ).toLowerCase();
							loadJS('/components/' + parsedName + '/' + parsedName + '.bundle.js', onEditorLoaded);
						}
					}
				}	
			}

			function onEditorLoaded(){
				console.log(module.exports);
			}

			init();
		}

	}
}

module.exports = editorContentBlockDirective;
