function froalaDirective(angular, app) {
	'use strict';

	app.directive('froala', froala);

	froala.$inject = ['$log', '_'];

	/**
	* @name app.directive: froala
	*
	* @description
	*  WYSIWYG HTML Editor
	* 
	* @example
	<froala></froala>
	 */
	function froala($log, _){

		loadCSS('/bower_components/froala-wysiwyg-editor/css/froala_editor.min.css');
		loadCSS('/bower_components/froala-wysiwyg-editor/css/froala_style.min.css');

		return {
			restrict:'E',
			link: link
		};


		function link(scope, element, attributes, ctrl){

		}
	}
}

module.exports = froalaDirective;