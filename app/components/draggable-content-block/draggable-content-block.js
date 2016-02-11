function draggableContentBlockDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	app.directive('draggableContentBlock', draggableContentBlockDirective);

	draggableContentBlockDirective.$inject = ['$log', '_','constants', '$compile'];

	/**
	* @name app.directive: draggableContentBlock
	*
	* @description
	*  Drag and drop content block
	* 
	* @example
	<div class="draggableContentBlock">
	</div>
	 */
	function draggableContentBlockDirective($log, _, constants, $compile){

		return {
			restrict:'C',
			link: link,
			template: '<div data-dropped-html="{{::block.html}}"><img data-ng-src="{{block.thumbnailUrl}}" alt="{{block.name}}" class="img-polaroid"/></div>',
			controllerAs: 'editorCtrl',
			bindToController: true,
			controller: draggableContentBlockController
		};


		function link(scope, element, attributes, ctrl){

			var draggableHelper = $('#viewTemplates').find('img.draggableContentBlockDrag').clone(),
				editorCanvas = $('#editor-canvas');

            element.draggable({
                helper: 'clone',
                connectToSortable: '.' + constants.canvasClass,
                revert: 'invalid',
                appendTo: '.' + constants.canvasClass + ' > tbody > tr > td',
                start: function(evt, ui) {
                    //drag and drop helper (the contentblock img with the icon on topright)
                    $(ui.helper)
                    	.css({'z-index': 9999, 'position':'relative' })
                    	.find('img').css('cursor', 'url("/images/closedhand.cur"), default')
                    	.end()
                    	.append(draggableHelper); //hover image on layout content block
                },
                stop: function() {
                	editorCanvas.removeClass('dragging');
                    // rootScope.safeApply(function() {
                    //     scope.$parent.disableOverlays = false;
                    // });

                    // $('.' + constants.canvasClass).removeClass('hideOverlays');
                }
            }).disableSelection();

		}

		function draggableContentBlockController(){
			
			var self = this; //jshint ignore:line

			init();

			/**
			 * @name init
			 * @description Initializes the controller
			 * 1) extends the scope
			 * 2) gets needed data for editor to work
			 * 3) setup $watcher in case if needed
			 * 4) set up the $on('$destroy') method
			 */
			function init(){
				_.extend(self, {

				});
			}
		}

	}
}

module.exports = draggableContentBlockDirective;