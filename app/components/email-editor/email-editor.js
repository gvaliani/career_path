function emailEditorDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	//services
	require('./../../services/content-block.js')(angular, app);
	require('./../../services/message-service.js')(angular, app);

	//helpers
	require('./../../helpers/unsafe-filter.js')(angular, app);

	// directives
	require('./../droppable-content-block/droppable-content-block.js')(angular, app);

	app.directive('fbEmailEditor', emailEditorDirective);

	emailEditorDirective.$inject = ['$log', '_', 'email-editor.template.html', 'contentBlockService', 'messageService', '$compile'];

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
	function emailEditorDirective($log, _, template, cbService, messageService, compile){

		return {
			restrict:'E',
			link: link,
			template: template,
			controllerAs: 'editorCtrl',
			bindToController: true,
			controller: emailEditorController
		};


		function link(scope, element, attributes, ctrl){

		}

		function emailEditorController(){
			
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

				});

				cbService.getAll().then(function onAllCb(response){
					self.contentBlocks = response;
				});

				messageService.get().then(function onMessageGot(response){
					compileMessageHtml(response);
				});

			}

           function compileMessageHtml(backendMessage) {
                self.editor = backendMessage;
                //self.editor = compile(backendMessage)(self);
                
                //console.log('htmlEditor', self.editor);
                // scope.messageReady = 1;
                // scope.isSuperUser = configuration.isSuperUser;
                // if (!configuration.loaded) {
                //     dc.configurationPromise.$promise.then(function (configurationData) {
                //         scope.isSuperUser = configurationData.IsSuperUser;
                //     });
                // }
            }

		}

	}
}

module.exports = emailEditorDirective;