function emailEditorDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	require('./../../services/content-block.js')(angular, app);

	app.directive('fbEmailEditor', emailEditorDirective);

	emailEditorDirective.$inject = ['$log', '_', 'email-editor.template.html', 'contentBlockService'];

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
	function emailEditorDirective($log, _, template, cbService){

		return {
			restrict:'E',
			link: link,
			template: template,
			controller: emailEditorController
		};


		function link(scope, element, attributes, ctrl){

		}

		function emailEditorController(){
			
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

				cbService.getAll().then(function onAllCb(response){
					self.contentBlocks = response;
				});
			}
		}

	}
}

module.exports = emailEditorDirective;