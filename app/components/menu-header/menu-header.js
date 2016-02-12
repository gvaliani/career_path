function MenuHeaderDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	app.directive('menuHeader', menuHeader);

	menuHeader.$inject = ['_', 'menu-header.template.html'];

	/**
	* @name app.directive: menu-header
	*
	* @description
	*  Horizontal menu placed on the top.
	* 
	* @example
	<menu-header></menu-header>
	 */
	function menuHeader(_, template){
		return {
			restrict: 'E',
			template: template,
			link: link
		};

		function link(scope, element, attributes, ctrl){
			console.log('Menu header directive.');
		}
	}
}

module.exports = MenuHeaderDirective;