function droppableContentBlockDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line


	app.directive('droppableContentBlock', droppableContentBlockDirective);

	droppableContentBlockDirective.$inject = ['$log', '_'];

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
	function droppableContentBlockDirective($log, _){

		return {
			restrict:'C',
			link: link,
			template: '<td><img data-ng-src="{{block.thumbnailUrl}}" alt="{{block.name}}" class="img-polaroid"/><td>',
			controllerAs: 'editorCtrl',
			bindToController: true,
			controller: droppableContentBlockController
		};


		function link(scope, element, attributes, ctrl){

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