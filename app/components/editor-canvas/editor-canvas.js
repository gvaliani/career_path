function editorCanvasDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	app.directive('editorCanvas', editorCanvasDirective);

	editorCanvasDirective.$inject = ['$log', '_','$compile', '$timeout','$window', 'constants'];

	/**
	* @name app.directive: editorCanvas
	*
	* @description
	*  Drag and drop email editor
	* 
	* @example
	<editor-canvas>
	</editor-canvas>
	 */
	function editorCanvasDirective($log, _,compile, timeout, $window, constants){

		return {
			restrict:'E',
			link: link,
			scope: {
				'getMessage':'&',
				'onContentDropped':'&'
			}
		};


		function link(scope, element, attributes, ctrl){

			var didScroll = false,
				sortableArea,
				dropHereTemplate = $('#viewTemplates .drop-here');
		    // scope.disableOverlays = false;

			element = $(element);


			init();

    		function init(){
        		element.on('scroll', onScrollEmitEvent);

				scope.getMessage(scope).then(onGetMessage).then(setupDroppableArea);
		        // scope.$watch('disableOverlays', function(newValue, oldValue) {
		        //     if (newValue === oldValue) {
		        //         return;
		        //     }

		        //     if (newValue) {
		        //         element.addClass('hideOverlays');
		        //     } else {
		        //         element.removeClass('hideOverlays');
		        //     }
		        // });
        	}

        	/**
        	 * @name setupDroppableArea
        	 * @description Setups editor canvas as a jQuery sortable area 
        	 * where contenblocks can be dropped
        	 */
        	function setupDroppableArea(){
		        // make the body of the mail able to receive draggable elements
    		    element.find('.' + constants.canvasClass).sortable({
    		        axis: 'y',
			        cursor: 'url("/images/closedhand.cur"), default',
			        items: 'tr > td > .row.' + constants.contentBlockClass,
			        handle: '.drag',
			        containment: '#layoutContainer',
			        revert: false,
			        refreshPositions: true,
			        start: onDropStart,
			        stop: onDropStop,
			        update: onDropUpdate
				});
        	}

		    /**
		     * @description Compiles email html and append it to canvas
		     * @param  {String} response - Html of the message
		     */
			function onGetMessage(response){
				console.log('onGetMessage');
				var layoutHtml = compile(response)(scope);
				element.append(layoutHtml);
        		element.find('.' + constants.canvasClass + '> tbody > tr > td').prepend(dropHereTemplate.clone());
			}

			function onDropStart(e, ui){
				sortableArea = sortableArea || element.find('.ui-sortable');

            	// disable overlays
	            // scope.disableOverlays = true;
	            // element.addClass('hideOverlays');

	            if (!sortableArea.find('.ui-droppable').length) {
	                sortableArea.find('.drop-here').droppable({
	                    tolerance: 'touch',
	                    hoverClass: 'active'
	                });
	            }

	            // if (!ui.item.hasClass(configuration.droppableContentBlockClass)) {
	            //     // if sortable starts with a content block
	            //     scope.dragStartPosition = {
	            //         position: element.find('.' + configuration.contentBlockClass).index(ui.item),
	            //         value: $.fn.outerHTML(ui.item)
	            //     };
	            // }
			}

			function onDropStop(e, ui){
				console.log('stop');

				// rootScope.safeApply(function () {
				// scope.disableOverlays = false;
				// });

				// $('.ui-sortable > tr.dragging').remove();
				// $('.ui-sortable > tr.emptyBlock').remove();
				// element.removeClass('hideOverlays');
			}

			function onDropUpdate(e, ui) {

	            // // this event is triggered in two occasions,
	            // // 1) when we sort the content blocks inside the editor (prevent to pub the changed event -this is done on the drop stop event-)
	            // // 2) when we drop a layout content block
	            // if (ui.item.hasClass(configuration.droppableContentBlockClass)) {
	            //     //drag of a new content block
	            //     if (scope.droppedContent.indexOf('data-no-duplicate=') > 0) {
	            //         var noDuplicateType = $(scope.droppedContent).attr("data-no-duplicate");

	            //         if ($('.' + configuration.canvasClass + ' tr[data-no-duplicate="' + noDuplicateType + '"]').length > 0) {
	            //             ui.item.remove();
	            //             scope.validationErrors = 'Only one ' + noDuplicateType.toUpperCase() + ' content block is allowed per email.';
	            //             scope.showValidationMessage = true;
	            //             scope.finishRejectedDrop();
	            //             return;
	            //         }
	            //     }

	            //     if (scope.droppedContent.indexOf('data-reservation') > 0 && !configuration.hasReservationLink) {
	            //         ui.item.remove();
	            //         scope.validationErrors = "<p>Oops, currently you don't have any Reservation Links set up for your store locations.  Be sure to update the Reservation Links for each of your stores on the Webpage Links page.</p><p style='margin-top:15px;'>Click <a style='text-decoration:underline;' href='SocialMedia.aspx?sk=" + queryString["sk"] + "'>here</a> to go to Webpage Links.</p>";
	            //         scope.showValidationMessage = true;
	            //         scope.finishRejectedDrop();
	            //         return;
	            //     }

	            //     //create the content block
	            //     var cb = scope.compileContentBlock(scope.droppedContent);
	            //     ui.item.remove();
	            //     $(lastDroppable).replaceWith(cb);

	            //     //notify subscribers                                  
	            //     scope.contentChanged(configuration.contentBlockEvents.Created, scope.$id, cb.data('id'), null,
	            //     {
	            //         position: element.find('.' + configuration.contentBlockClass).index(cb),
	            //         value: $.fn.outerHTML(cb)
	            //     });
	            // } else {
	            //     // sort
	            //     $(lastDroppable).replaceWith(ui.item);

	            //     scope.contentChanged(configuration.contentBlockEvents.Reordered, scope.$id, ui.item.data('id'), scope.dragStartPosition,
	            //     {
	            //         position: element.find('.' + configuration.contentBlockClass).index(ui.item),
	            //         value: $.fn.outerHTML(ui.item)
	            //     });
	            // }
        	}

		    function onScrollEmitEvent() {
		        if (!didScroll) {

		            if (!!$window.requestAnimationFrame) {
		                $window.requestAnimationFrame(update);
		            } else {
		                timeout(function() {
		                    update();
		                }, 250);
		            }
		        }
		        didScroll = true;
		    }

		    function update() {

		        if (didScroll) {
		            didScroll = false;

		            // contextual editors subscribed to the event can do what they want to
		            editorEvents.canvasScrolling();
		        }
		    }


		}
	}
}

module.exports = editorCanvasDirective;