function editorTextDirective(angular, app) {
	'use strict';

	app.directive('editorText', editorText);

	editorText.$inject = ['$log', '_'];

	/**
	* @name app.directive: editorText
	*
	* @description
	*  Email Text Editor
	* 
	* @example
	<div data-text-editor></div>
	 */
	function editorText($log, _){

		return {
			restrict:'A',
			link: link
		};


		function link(scope, element, attributes, ctrl){

		}
	}
}

module.exports = editorTextDirective;