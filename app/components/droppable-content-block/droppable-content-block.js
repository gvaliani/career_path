function droppableContentBlockDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line


	app.directive('droppableContentBlock', droppableContentBlockDirective);

	droppableContentBlockDirective.$inject = ['$log', '_','constants'];

	/**
	* @name app.directive: droppableContentBlock
	*
	* @description
	*  Drag and drop content block
	* 
	* @example
	<div class="droppableContentBlock">
	</div>
	 */
	function droppableContentBlockDirective($log, _, constants){

		return {
			restrict:'C',
			link: link,
			template: '<td><img data-ng-src="{{block.thumbnailUrl}}" alt="{{block.name}}" class="img-polaroid"/><td>',
			controllerAs: 'editorCtrl',
			bindToController: true,
			controller: droppableContentBlockController
		};


		function link(scope, element, attributes, ctrl){

			var viewTemplate = $('#viewTemplate');

            element.draggable({
                helper: 'clone',
                connectToSortable: '.' + constants.canvasClass + '>tbody',
                revert: 'invalid',
                start: function(evt, ui) {
                    //drag and drop helper (the contentblock img with the icon on topright)
                    $(ui.helper).css('z-index', 9999);
                    $(ui.helper).find('img').css('cursor', 'url("/images/closedhand.cur"), default');

                    //hover image on layout content block
                    viewTemplate.find('img.droppableContentBlockDrag').clone().appendTo(ui.helper);

                    //html content to be dropped
                    scope.$parent.droppedContent = scope.block.html;
                },
                stop: function() {
                    rootScope.safeApply(function() {
                        scope.$parent.disableOverlays = false;
                    });

                    $('.ui-sortable > tr.dragging').remove();
                    $('.ui-sortable > tr.emptyBlock').remove();
                    $('.' + constants.canvasClass).removeClass('hideOverlays');
                }
            }).disableSelection();

		}

		function droppableContentBlockController(){
			
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

module.exports = droppableContentBlockDirective;