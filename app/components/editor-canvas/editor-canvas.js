function editorCanvasDirective(angular, app) {
	'use strict';

	'use angular template'; //jshint ignore:line

	app.directive('editorCanvas', editorCanvasDirective);

	editorCanvasDirective.$inject = ['$log', '_','$compile', '$timeout','$window', 'constants','values'];

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
	function editorCanvasDirective($log, _,compile, timeout, $window, constants, values){

		return {
			restrict:'E',
			link: link,
			template: '<div id="editor-canvas" data-ng-class="{dragging : !!dragging}" data-ng-transclude="true"></div>',
			transclude:true,
			replace:true,
			scope: {
				'getMessage':'&',
				'onContentDropped':'&'
			}
		};


		function link(scope, element, attributes, ctrl){

			scope.dragging = false;

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
			        tolerance: 'intersect',
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
				var layoutHtml = compile(response)(scope),
        			dropHere = dropHereTemplate.clone();

        		element.append(layoutHtml);
        		element.find('.' + constants.canvasClass + '> tbody > tr > td').prepend(dropHere);
        		dropHere.droppable(values.droppableOptions);

			}

			function onDropStart(e, ui){
				element.addClass('dragging');
				sortableArea = sortableArea || element.find('.ui-sortable');

            	// disable overlays
	            // scope.disableOverlays = true;
	            // element.addClass('hideOverlays');

	            // if (!ui.item.hasClass(configuration.droppableContentBlockClass)) {
	            //     // if sortable starts with a content block
	            //     scope.dragStartPosition = {
	            //         position: element.find('.' + configuration.contentBlockClass).index(ui.item),
	            //         value: $.fn.outerHTML(ui.item)
	            //     };
	            // }
			}

			function onDropStop(e, ui){
				element.removeClass('dragging');

				// rootScope.safeApply(function () {
				// scope.disableOverlays = false;
				// });

				// element.removeClass('hideOverlays');
			}

			function onDropUpdate(e, ui) {
				element.removeClass('dragging');
	            // this event is triggered in two occasions,
	            // 1) when we sort the content blocks inside the editor (prevent to pub the changed event -this is done on the drop stop event-)
	            // 2) when we drop a layout content block
	            if (ui.item.hasClass(constants.droppableContentBlockClass)) {
	                //drag of a new content block
	                // if (scope.droppedContent.indexOf('data-no-duplicate=') > 0) {
	                //     var noDuplicateType = $(scope.droppedContent).attr("data-no-duplicate");

	                //     if ($('.' + configuration.canvasClass + ' tr[data-no-duplicate="' + noDuplicateType + '"]').length > 0) {
	                //         ui.item.remove();
	                //         scope.validationErrors = 'Only one ' + noDuplicateType.toUpperCase() + ' content block is allowed per email.';
	                //         scope.showValidationMessage = true;
	                //         scope.finishRejectedDrop();
	                //         return;
	                //     }
	                // }

	                // if (scope.droppedContent.indexOf('data-reservation') > 0 && !configuration.hasReservationLink) {
	                //     ui.item.remove();
	                //     scope.validationErrors = "<p>Oops, currently you don't have any Reservation Links set up for your store locations.  Be sure to update the Reservation Links for each of your stores on the Webpage Links page.</p><p style='margin-top:15px;'>Click <a style='text-decoration:underline;' href='SocialMedia.aspx?sk=" + queryString["sk"] + "'>here</a> to go to Webpage Links.</p>";
	                //     scope.showValidationMessage = true;
	                //     scope.finishRejectedDrop();
	                //     return;
	                // }

	                //create the content block
	                var cb = compileContentBlock(ui.item.find('> div').data('droppedHtml'));
	                ui.item.replaceWith(cb);

	                // //notify subscribers                                  
	                // scope.contentChanged(configuration.contentBlockEvents.Created, scope.$id, cb.data('id'), null,
	                // {
	                //     position: element.find('.' + configuration.contentBlockClass).index(cb),
	                //     value: $.fn.outerHTML(cb)
	                // });
	            } else {
	                // sort
	                // $(lastDroppable).replaceWith(ui.item);

	                // scope.contentChanged(configuration.contentBlockEvents.Reordered, scope.$id, ui.item.data('id'), scope.dragStartPosition,
	                // {
	                //     position: element.find('.' + configuration.contentBlockClass).index(ui.item),
	                //     value: $.fn.outerHTML(ui.item)
	                // });
	            }
        	}

        	/**
        	 * @return {[type]}
        	 */
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

		    /**
		     * @return {[type]}
		     */
		    function update() {

		        if (didScroll) {
		            didScroll = false;

		            // contextual editors subscribed to the event can do what they want to
		            editorEvents.canvasScrolling();
		        }
		    }

	        
		    /**
		     * @description compiles the html of a content block to a content block directive
		     * @param  {[type]}
		     * @param  {[type]}
		     * @return {[type]}
		     */
		    function compileContentBlock(contentBlock, attrs) {
		        attrs = attrs || {};
		        var contentBlockElement = $(contentBlock);
		        //contentBlockElement.addClass(constants.contentBlockClass).attr(attrs);

		        return compile(contentBlockElement)(scope);
		    }


		}
	}
}

module.exports = editorCanvasDirective;