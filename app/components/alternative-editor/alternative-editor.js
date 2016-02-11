function alternativeEditorDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	//services
	require('./../../services/content-block.js')(angular, app);
	require('./../../services/message-service.js')(angular, app);

	// directives
	require('./../draggable-content-block/draggable-content-block.js')(angular, app);
	require('./../editor-content-block/editor-content-block.js')(angular, app);
	require('./../editor-canvas/editor-canvas.js')(angular, app);

	app.directive('fbAlternativeEditor', alternativeEditorDirective);

	alternativeEditorDirective.$inject = ['$log', '_', 'alternative-editor.template.html', 'contentBlockService', 'messageService', '$compile'];

	/**
	* @name app.directive: fbEmailEditor
	*
	* @description
	*  Drag and drop email editor
	*
	* @example
	<fb-email-editor data-config="home.modalLoginConfig">
	</fb-email-editor>
	 */
	function alternativeEditorDirective($log, _, template, cbService, messageService, compile){

		return {
			restrict:'E',
			link: link,
			template: template,
			controllerAs: 'editorCtrl',
			bindToController: true,
			controller: alternativeEditorController
		};


		function link(scope, element, attributes, ctrl){
		}

		alternativeEditorController.$inject = ['$scope'];
		function alternativeEditorController($scope){

			var self = this, //jshint ignore:line
				autosaveInitialized = false,
				undoEnabled = false,
				redoEnabled = false;

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
					getMessage:getMessage
				});

				cbService.getAll().then(function onAllCb(response){
					self.contentBlocks = response;
				});
			}

			function getMessage(){
				// TODO: Check if we are trying to edit an email, or creating a new one.
				return messageService.get();
			}
		}

	}
}

module.exports = alternativeEditorDirective;
