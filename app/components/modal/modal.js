function modalDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	app.directive('fb-modal', modalDirective);

	modalDirective.$inject = ['$log', '_', 'fbModalService', 'modal.template.html'];

	/**
	* @ngdoc directive
	* @name app.directive: amxModal
	*
	* @description
	* Modal bootstrap wrapper. It also decorate the 'modalService' service with open/close
	* function in order to be used in the controller.
	*
	* @example
	<fb-modal id="loginModal" config="home.modalLoginConfig">
		<form>
			<div class="form-group">
				<label for="exampleInputEmail1">User*</label>
				<input type="email" class="form-control" ng-value="home.email" placeholder="Email">
			</div>
			<div class="form-group">
				<label for="exampleInputPassword1">Password*</label>
				<input type="password" class="form-control"  ng-value="home.pass" placeholder="Password">
			</div>
			<button type="submit" class="btn btn-default">Login</button>
			<a href="#" role="button">Forgot Password?</a>
			<a href="#" role="button">Register</a>
		</form>
	</fb-modal>
	 */
	function modalDirective($log, _, modalService, template){
		return {
			restrict: 'E',
			scope: {
				config: "="
			},
			replace: true,
			transclude: true,
			template: template,
			link: link,
			controllerAs: 'modal',
			bindToController: true,
			controller: modalController
		};

		function link (scope, element, attrs, ctrl) {

			init();

			////////

			/** @function
			* @name init
			* @description Runs first configuration and setups when modal is created.
				- Decorate modal service to make functions available from outside.
				- Call init callback.
				- Replycate bootstrap events modal.
			*/
			function init () {
				// Giving to the controller ability to open and close.
				_.extend(ctrl, {
					open: open,
					close: close
				});

				// Setting modal service, and decorating it with modal functions.
				// This is for being able from the controller to open/close the modal.
				modalService.setModal(attrs.id, {
					open: open,
					close: close,
					showMessage: ctrl.showMessage,
					resetMessage: ctrl.resetMessage
				});

				// Run onInit callback. e.g: open modal as soon modal is created.
				if (ctrl.config.callbacks.onInit) {
					ctrl.config.callbacks.onInit();
				}

				// Set callbacks according to bootstrap events.
				if (ctrl.config.callbacks) {
					element.on('show.bs.modal', ctrl.config.callbacks.onShow);
					element.on('shown.bs.modal', ctrl.config.callbacks.onShown);
					element.on('hide.bs.modal', ctrl.config.callbacks.onHide);
					element.on('hidden.bs.modal', ctrl.config.callbacks.onHidden);
				}
			}

			/** @function
			* @name open
			* @description Runs bootstrap modal('show') function to show the modal.
			*/
			function open () {
				element.modal('show');
			}

			/** @function
			* @name close
			* @description Runs bootstrap modal('hide') function to hide the modal.
			*/
			function close () {
				element.modal('hide');
			}
		}

		function modalController() {
			var self = this, // jshint ignore:line
				config = {	// Default values.
					showHeader: true,
					showFooter: false,
					callbacks: {
						onInit: undefined,
						onShow: undefined,
						onShown: undefined,
						onHide: undefined,
						onHidden: undefined,
						onCancel: undefined,
						onAccept: undefined
					},
					labels: {
						title: 'Modal title',
						cancel: 'Cancel button',
						accept: 'Accept button'
					},
	        		cssClass: ''
				},
				message = ''; // General message (any type)

			return _.extend(self, {
		        message: message,
				config: _.extend(config, self.config), // Overwriting default values with those passed to the directive.
				cancel: cancel,
				accept: accept,
		        showMessage: showMessage,
		        resetMessage: resetMessage
			});

			////////////

			/** @function
			* @name cancel
			* @description Runs onCancel() callback.
			*/
			function cancel () {
				if(angular.isFunction(self.config.callbacks.onCancel)) {
					self.config.callbacks.onCancel();
				}
			}

			/** @function
			* @name cancel
			* @description Runs onAccept() callback.
			*/
			function accept () {
				if(angular.isFunction(self.config.callbacks.onAccept)) {
					self.config.callbacks.onAccept();
				}
			}

			/** @function
			* @name showMessage
			* @description Show a message.
			* @param {string} msg - Error to be shown.
			* @param {string} type - Message type. The same that bootstrap (primary, success, info, warning, danger)
			*/
			function showMessage (msg, type) {
				var cssClass = {
					primary: 'bg-primary',
					success: 'bg-success',
					info: 'bg-info',
					warning: 'bg-warning',
					danger: 'bg-danger'
				};

				self.msgCssClass = cssClass[type];
				self.message = msg;
			}

			/** @function
			* @name resetMessage
			* @description Delete and hide message.
			*/
			function resetMessage () {
		        self.message = '';
			}
		}
	}
}

module.exports = modalDirective;
