define('directives',
    ['text!partials/directives.html', 'angular', 'jquery', 'jqueryui', 'configuration'],
    function (templates, angular, $, jqueryui, configuration) {
        'use strict';

        // get the collection of templates
        templates = $(templates);

        return angular
            .module('editor.directives', ['editor.services'])
            .directive('mainAppDirective', [
                '$location',
                'messageService',
                'editorEventsChannelService',
                '$window',
                function($location, messageService, editorEvents, $window) {
                    var directiveDefinitionObject = {
                        priority: 0,
                        restrict: 'A',
                        scope: true,
                        link: function (scope) {

                            scope.location = $location;
                            scope.currentStepIndex = 0;
                            scope.nextUrl = configuration.steps[1].url;
                            scope.backUrl = '/';
                            scope.steps = [];

                            scope.showLoading = false;
                            scope.lastSaved = 'nothing saved yet';

                            //get a copy of the array but without step.controller and step.templateUrl
                            angular.forEach(configuration.steps, function(element, index) {
                                if (element.display) {
                                    this.push({ url: element.url, description: element.description, order: index + 1, routeAlias: element.routeAlias });
                                }
                            }, scope.steps);

                            function evaluate(currentUrl) {

                                scope.showNavigation = true;
                                scope.saveEnable = true;
                                scope.saveButtonText = 'SAVE';
                                scope.stepText = null;

                                //route evaluation 
                                for (var i = 0; i < scope.steps.length; i++) {

                                    // gets the path of the url
                                    var path = '';
                                    for (var j = 0; j < currentUrl.split('/').length; j++) {
                                        if (currentUrl.split('/')[j]) {
                                            path = currentUrl.split('/')[j];
                                            break;
                                        }
                                    }

                                    // Check for a match in url or a contains in the path
                                    // But also do the same check with the alias of a step, for the case of /canned that should work as /editcontent
                                    if (currentUrl === scope.steps[i].url || scope.steps[i].url.indexOf(path) >= 0
                                        || (!!scope.steps[i].routeAlias
                                            && (currentUrl === scope.steps[i].routeAlias || scope.steps[i].routeAlias.indexOf(path) >= 0))) {
                                        scope.currentStepIndex = i;

                                        //set active
                                        $.extend(scope.steps[i], { before: false, prev: false, active: true, next: false });

                                        //hasNext
                                        scope.hasNext = scope.currentStepIndex < (scope.steps.length - 1);
                                        scope.hasBack = scope.currentStepIndex > 0;

                                        //set next element to the active
                                        if (scope.hasNext) {
                                            $.extend(scope.steps[i + 1], { before: false, prev: false, active: false, next: true });
                                            scope.nextUrl = scope.steps[i + 1].url;
                                        }

                                        //set the previous element to the active
                                        if (scope.hasBack) {
                                            $.extend(scope.steps[i - 1], { before: false, prev: true, active: false, next: false });
                                            scope.backUrl = scope.steps[i - 1].url;
                                        }

                                        //set elements before active
                                        var j;
                                        for (j = i - 2; j >= 0; j--) {
                                            $.extend(scope.steps[j], { before: true, prev: false, active: false, next: false });
                                        }

                                        //reset elements after next
                                        for (j = i + 2; j <= scope.steps.length; j++) {
                                            $.extend(scope.steps[j], { before: false, prev: false, active: false, next: false });
                                        }

                                        scope.steps[scope.steps.length - 1].last = true;

                                        break;
                                    } //end-if
                                } //end-for
                            }; //end-function

                            // watch the expression, and update the UI on change.
                            scope.$watch('location.path() + location.url()', function(newValue, oldRoute) {

                                var isStep0 = $location.path().toLowerCase().indexOf('selectdesign') >= 0;
                                var isStep3 = ($location.path().toLowerCase().indexOf('editcontent') >= 0) || ($location.path().toLowerCase().indexOf('canned') >= 0);
                                var isStep3WithoutParameters = isStep3 && ($location.path().toLowerCase().indexOf('editcontent/:message') >= 0 || $location.path() === '/editcontent/');
                                var isStep3WithParameters = isStep3 && !isStep3WithoutParameters;
                                var isBuildYourOwn = $location.path().toLowerCase().indexOf('build') >= 0;
                                var isConfirmationStep = $location.path().toLowerCase().indexOf('confirmation') >= 0;

                                // Clear out leave warning if user is not on Step 4.
                                if (!isBuildYourOwn && $location.path() != configuration.steps[3].url) {
                                    $window.onbeforeunload = null;
                                }

                                if ($location.path() === configuration.steps[4].url && messageService.getScheduleData().stores && messageService.getScheduleData().stores.length) {
                                    scope.showNavigation = false;
                                    return;
                                }

                                if (isConfirmationStep) {
                                    scope.showNavigation = false;
                                    return;
                                }

                                // From any step, user can go to step 1, 2, or 3
                                // To go to step 4, message subject must be specified
                                if ($location.path() == configuration.steps[3].url // is step4
                                    && (!messageService.getHeader().subject || !messageService.getHeader().id) // subject is not set or message is not created
                                    && oldRoute.indexOf('editcontent') === -1) { // is not coming from step 3
                                    $location.path(configuration.steps[2].url); // redirect the user to edit content
                                }

                                // isStep3WithParameters, just checking if somebody tries to access using /editcontent/:messageid
                                if (!isBuildYourOwn && !isStep0 && !messageService.getHeader().name && !isStep3WithParameters) {
                                    //validate walking steps forward
                                    if (configuration.debug) {
                                        messageService.setHeader({
                                            name: 'debug',
                                            layout: 1,
                                            design: 3924
                                        });

                                    } else {
                                        $location.path(scope.steps[0].url);
                                    }
                                }

                                evaluate($location.path());
                            });

                            scope.save = function() {
                                scope.showLoading = true;
                                editorEvents.userSaveContent();
                            };

                            scope.onAutoSaveStart = function () {
                                scope.saveEnable = false;
                            };
                            
                            scope.onSavedContent = function() {
                                scope.saveEnable = true;
                                scope.showLoading = false;
                                scope.lastSaved = 'last saved today at ' + (new Date()).format('hh:mm tt');
                            };

                            scope.onFailedSave = function() {
                                scope.saveEnable = true;
                                scope.showLoading = false;
                            };

                            var changeSaveButtonText = function(event, data) {
                                scope.saveButtonText = data.buttonCaption;
                            };

                            var changeSaveEnable = function(event, data) {
                                scope.saveEnable = data.isEnabled;
                            };

                            var changeRouteUrl = function(event, data) {
                                scope.steps[data.Index].url = data.Url;
                            };

                            var changeStepText = function(event, data) {
                                scope.stepText = data.description;
                                scope.steps[data.stepIndex].description = scope.stepText;
                            };

                            editorEvents.onAutoSaveContent(scope, scope.onAutoSaveStart);
                            editorEvents.onSuccessfulSave(scope, scope.onSavedContent);
                            editorEvents.onFailedSave(scope, scope.onFailedSave);
                            editorEvents.onChangeSaveText(scope, changeSaveButtonText);
                            editorEvents.onChangeSaveEnable(scope, changeSaveEnable);
                            editorEvents.onChangeRouteUrl(scope, changeRouteUrl);
                            editorEvents.onChangeStepText(scope, changeStepText);

                        } //end-link-function
                    }; //end-directive-object
                    return directiveDefinitionObject;
                }
            ])
            .directive('messageName', [
                'messageService',
                '$location',
                '$window',
                function(messageService, $location, $window) {
                    var directiveObject = {
                        restrict: 'A',
                        scope: {
                            messageHeader: '=',
                            callback: '&'
                        },
                        replace: false,
                        template: templates.filter('#messageName').html(),
                        //templateUrl: '/memberpages/NewEditor/Partials/Directives/messageName.htm',
                        link: function(scope, element) {

                            var enter = function(e) {
                                if (e.which == 13) {
                                    scope.modalOkCallback();
                                    scope.$digest();
                                }
                                return true;
                            };

                            var init = function() {
                                scope.showInputModal = !messageService.getHeader().name
                                    || $location.path().toLowerCase().indexOf('build') >= 0;

                                if (scope.showInputModal) {
                                    // prevent submit on enter.
                                    $('form').attr('onkeypress', 'javascript:return preventSubmit(event)');
                                    // set message name if available
                                    scope.messageHeader.name = messageService.getHeader().name;
                                }
                            };

                            scope.modalOkCallback = function() {

                                if (!scope.messageHeader.name) {
                                    return;
                                }

                                scope.showInputModal = false;
                                if (angular.isFunction(scope.callback)) {
                                    scope.callback();
                                }
                            };

                            scope.modalCancelCallback = function() {
                                $window.location.href = 'http://' + $location.host() + ':' + $location.port() + '/MemberPages/Emails.aspx?sk=' + configuration.sessionKey;
                            };

                            scope.bindEnterKey = function() {
                                // bind enter to input
                                $('#mailName').bind('keyup', enter);
                            };

                            init();
                        }
                    };
                    return directiveObject;
                }
            ])
            .directive('designFoldersView', [
                'messageService', '$compile', function(messageService, compile) {
                    var directiveObject = {
                        restrict: 'A',
                        scope: {
                            parentId: '@',
                            onItemClicked: '&',
                            searchText: '=',
                            control: '=',
                            activeSubfolderId: '='
                        },
                        template: templates.filter('#designFoldersView').html(),
                        //templateUrl: '/memberpages/NewEditor/Partials/Directives/designFoldersView.htm',
                        link: function(scope, element) {
                            scope.control.getFolders = function(callback) {
                                messageService.getDesignFolders({ parentId: scope.parentId ? scope.parentId : '', searchText: scope.searchText }, function(data) {
                                    scope.folders = data;

                                    if (angular.isFunction(callback)) {
                                        callback(data);
                                    }
                                });
                            };

                            scope.folderClicked = function(folder, isChild) {
                                if (isChild) {
                                    scope.activeSubfolderId = folder.id;
                                } else {
                                    if (folder.id == -2) {
                                        scope.searchText = '';
                                        scope.control.getFolders();
                                    }

                                    scope.activeFolderId = folder.id;
                                }

                                if (!isChild && !folder.children && folder.id != -2) {
                                    messageService.getDesignFolders({ parentId: folder.id, searchText: scope.searchText }, function(data) {
                                        folder.children = data;
                                    });
                                }

                                if (angular.isFunction(scope.onItemClicked)) {
                                    scope.onItemClicked({ selected: folder.id, searchText: scope.searchText });
                                }
                            };

                            function getFolderBySubFolderId(subFolderId) {

                                var onFoldersCallback = function() {
                                    for (var i = 0; i < scope.folders.length; i++) {
                                        if (scope.folders[i].id == scope.activeFolder.Id) {
                                            scope.activeFolderId = scope.activeFolder.Id;
                                            scope.folders[i].children = scope.activeFolder.Children;
                                            break;
                                        }
                                    }
                                }

                                messageService.getDesignFolderBySubfolderId({ subFolderId: subFolderId }, function(folderData) {
                                    scope.activeFolder = folderData;

                                    if (!scope.folders || !scope.folders.length) {
                                        scope.control.getFolders(onFoldersCallback);
                                    }

                                    if (angular.isFunction(scope.onItemClicked)) {
                                        scope.onItemClicked({ selected: subFolderId, searchText: scope.searchText });
                                    }
                                });
                            }

                            function init() {
                                if (scope.activeSubfolderId) {
                                    getFolderBySubFolderId(scope.activeSubfolderId);
                                } else {
                                    scope.control.getFolders();
                                }
                            }

                            init();
                        }
                    };
                    return directiveObject;
                }
            ])
            .directive('editContentView', [
                function() {
                    var directiveObject = {
                        restrict: 'A',
                        scope: false,
                        link: function(scope, element) {

                            //setup templates
                            scope.dropHereTemplate = element.find('> table tr.dragging');
                            scope.emptyBlockTemplate = element.find('> table tr.emptyBlock');
                            scope.layoutBlockHoverTemplate = element.find('>img.droppableContentBlockDrag');
                            scope.contentBlockHoverMenuBar = element.find('.' + configuration.overlayMenuBarClass);
                            scope.overlayLayer = element.find('.' + configuration.overlayClass);
                        }
                    };
                    return directiveObject;
                }
            ])
            .directive(configuration.canvasClass, [
                '$compile',
                '$timeout',
                'editorEventsChannelService',
                '$window',
                '$rootScope',
                function(compile, timeout, editorEvents, $window, rootScope) {
                    var directiveObject = {
                        priority: 0,
                        restrict: 'C',
                        scope: false,
                        link: function(scope, element) {

                            $('#' + configuration.editorHtmlContainerId).on('scroll', onScroll);

                            scope.disableOverlays = false;
                            var didScroll = false;

                            scope.$watch('disableOverlays', function(newValue, oldValue) {
                                if (newValue === oldValue) {
                                    return;
                                }

                                if (newValue) {
                                    element.addClass('hideOverlays');
                                } else {
                                    element.removeClass('hideOverlays');
                                }
                            });

                            function onScroll() {
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

                            function sticky_relocate() {
                                var window_top = $(window).scrollTop();
                                var stickyAnchor = $('#sticky-anchor');
                                if (!stickyAnchor.length) {
                                    return;
                                }
                                var div_top = stickyAnchor.offset().top;
                                if (window_top > div_top) {
                                    $('#sticky').addClass('stick');
                                    $('.main-content').addClass('contentBlockFloat');
                                } else {
                                    $('#sticky').removeClass('stick');
                                    $('.main-content').removeClass('contentBlockFloat');
                                }
                            }

                            /*
                            ************ UNDO / REDO METHODS ************
                            */

                            scope.performReorder = function(actionDescriptor, isUndo) {
                                var currentIndex, destinationIndex;
                                if (isUndo) {
                                    destinationIndex = actionDescriptor.PreviousValue;
                                    currentIndex = actionDescriptor.CurrentValue;
                                } else {
                                    destinationIndex = actionDescriptor.CurrentValue;
                                    currentIndex = actionDescriptor.PreviousValue;
                                }

                                alterContentBlockPosition(currentIndex, destinationIndex);
                            };

                            var alterContentBlockPosition = function(currentIndex, destinationIndex) {
                                var movedContent = element.find('.' + configuration.contentBlockClass + ':eq(' + currentIndex.position + ')');
                                var elementInDestinationIndex = element.find('.' + configuration.contentBlockClass + ':eq(' + destinationIndex.position + ')');

                                if (currentIndex.position > destinationIndex.position) {
                                    movedContent.insertBefore(elementInDestinationIndex);
                                } else {
                                    movedContent.insertAfter(elementInDestinationIndex);
                                }
                            };

                            scope.performDeleteOrCreate = function(actionDescriptor, isUndo, isDelete) {

                                // is Create && Undo => Delete 
                                // is Create && Redo => Create 
                                // is Delete && Undo => Created
                                // is Delete && Redo => Delete 

                                var performCreate = (isDelete && isUndo) || (!isDelete && !isUndo);

                                if (performCreate) {

                                    //append the content block                                    
                                    var newContentBlock = scope.compileContentBlock(actionDescriptor.CurrentValue.value, { 'data-content-block-id': actionDescriptor.ContentBlockId });
                                    element.append(newContentBlock);

                                    //get the initial position
                                    var initialIndex = {
                                        position: element.find('.' + configuration.contentBlockClass).index(newContentBlock),
                                        value: newContentBlock
                                    };

                                    //move the contentblock to the position before delete
                                    alterContentBlockPosition(initialIndex, actionDescriptor.CurrentValue);
                                } else {
                                    //remove the element 
                                    element.find('.' + configuration.contentBlockClass + ':eq(' + actionDescriptor.CurrentValue.position + ')')
                                        .remove();
                                }
                            };

                            scope.dragStartPosition = {};

                            // compiles the html of a content block to a content block directive
                            scope.compileContentBlock = function(contentBlock, attrs) {
                                attrs = attrs || {};
                                var contentBlockElement = $(contentBlock).addClass(configuration.contentBlockClass).attr(attrs);

                                return compile(contentBlockElement)(scope);
                            };

                            scope.duplicateContentBlock = function(contentBlock) {
                                var cleanCopy = cleanContentBlockMarkup(contentBlock, false);

                                addContentBlock(cleanCopy, contentBlock);
                            };

                            scope.getUserContent = function() {
                                var contentWrapper = $('<div></div>');

                                var contentBlocks = $('.' + configuration.canvasClass + ' > tbody .editorContentBlock');

                                for (var i = 0; i < contentBlocks.length; i++) {
                                    // Do not remove default content blocks client-side.
                                    var copy = cleanContentBlockMarkup(contentBlocks.eq(i), false);
                                    contentWrapper.append(copy);
                                }

                                return { editableContent: contentWrapper.html() || '<tr></tr>' }; // use tr so that if user emptied the content, we don't automatically generate all the default content blocks

                            };

                            scope.cleanContentBlockMarkup = function(contentblock, removeUntouchedContent) {
                                return cleanContentBlockMarkup(contentblock, removeUntouchedContent);
                            };

                            var queryString = (function(a) {
                                if (a == "") return {};
                                var b = {};
                                for (var i = 0; i < a.length; ++i) {
                                    var p = a[i].split('=');
                                    if (p.length != 2) continue;
                                    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
                                }
                                return b;
                            })(window.location.search.substr(1).split('&'));

                            var removeGlobalMarkup = function(contentBlock) {
                                contentBlock.removeClass('ng-isolate-scope ng-scope')
                                    .find('.' + configuration.overlayClass + ', .' + configuration.overlayMenuBarClass).remove();

                                return contentBlock;
                            };

                            var cleanContentBlockMarkup = function(contentBlock, removeUntouchedContent) {

                                var editables = [];

                                // get clean html "ONLY OF THE EDITABLE AREAS"
                                contentBlock.find('[editable]').each(function(index, editableBlock) {
                                    if (removeUntouchedContent && $(editableBlock).hasClass(configuration.contentBlockDefaultValue)) {
                                        // not make all the calculations to get a clean html on this one
                                        editables[index] = $(editableBlock).clone().empty();
                                    } else {
                                        editables[index] = angular.element(editableBlock).scope().getContent();
                                    }
                                });

                                var copy = contentBlock.clone();

                                copy.find('[editable]').each(function(index, newBlock) {
                                    $(newBlock).replaceWith(editables[index]);
                                });

                                return removeGlobalMarkup(copy);
                            };

                            var addContentBlock = function(contentBlockDom, insertAfterElement) {

                                var cb = scope.compileContentBlock(contentBlockDom);

                                if (insertAfterElement) {
                                    cb.insertAfter(insertAfterElement);
                                } else {
                                    element.find(' > tbody').append(cb);
                                }

                                //notify subscribers                                  
                                scope.contentChanged(configuration.contentBlockEvents.Created, scope.$id, cb.data('id'), null,
                                {
                                    position: element.find('.' + configuration.contentBlockClass).index(cb),
                                    value: $.fn.outerHTML(cb)
                                });
                            };

                            var lastDroppable;

                            // configure editor to have sortable content blocks
                            element.find('> tbody').sortable({
                                axis: 'y',
                                cursor: 'url("/Images/closedhand.cur"), default',
                                items: ' > tr.' + configuration.contentBlockClass,
                                handle: '.drag',
                                containment: '#editorCanvas',
                                revert: false,
                                refreshPositions: true,
                                start: function (e, ui) {
                                    // disable overlays
                                    scope.disableOverlays = true;
                                    element.addClass('hideOverlays');

                                    // remove place holder
                                    ui.placeholder.hide();

                                    // add drop here only if there is no one present
                                    var tbody = $('.ui-sortable');
                                    if (!tbody.find('tr.dragging').length) {

                                        // We need to do this so the green droppable area has proper width.
                                        scope.dropHereTemplate.find('div').width(tbody.parent().width() - 10);
                                        scope.emptyBlockTemplate.find('div').width(tbody.parent().width() - 10);

                                        //drop here tooltips after/before each row
                                        if ($('.' + configuration.canvasClass + '> tbody > tr.' + configuration.contentBlockClass).length) {
                                            scope.dropHereTemplate.clone().insertAfter(ui.item.siblings(':not(.ui-sortable-placeholder)'));
                                            scope.dropHereTemplate.clone().insertBefore(ui.item.siblings(':not(.ui-sortable-placeholder):eq(0)'));
                                        } else {
                                            tbody.prepend(scope.dropHereTemplate.clone());
                                        }

                                        // The last droppable area have issues if the height is not the same while hovering.
                                        // ending up in an issue that not the entire area is droppable, so for that we're
                                        // making the same height  while on over or not.
                                        tbody.find('tr.dragging:last').height(100);

                                        // We need to add an empty row at last for droppable to work nice with the last droppable area
                                        scope.emptyBlockTemplate.clone().insertAfter(tbody.find('tr.dragging:last'));

                                        tbody.find('tr.dragging').droppable({
                                            tolerance: 'pointer',
                                            hoverClass: 'active',
                                            over: function(evt, ui) {
                                                lastDroppable = evt.target;
                                            }
                                        });
                                    }

                                    if (!ui.item.hasClass(configuration.droppableContentBlockClass)) {
                                        // if sortable starts with a content block
                                        scope.dragStartPosition = {
                                            position: element.find('.' + configuration.contentBlockClass).index(ui.item),
                                            value: $.fn.outerHTML(ui.item)
                                        };
                                    }

                                },
                                stop: function(e, ui) {
                                    rootScope.safeApply(function () {
                                        scope.disableOverlays = false;
                                    });

                                    $('.ui-sortable > tr.dragging').remove();
                                    $('.ui-sortable > tr.emptyBlock').remove();
                                    element.removeClass('hideOverlays');
                                },
                                update: function (e, ui) {
                                    // this event is triggered in two occasions,
                                    // 1) when we sort the content blocks inside the editor (prevent to pub the changed event -this is done on the drop stop event-)
                                    // 2) when we drop a layout content block
                                    if (ui.item.hasClass(configuration.droppableContentBlockClass)) {
                                        //drag of a new content block
                                        if (scope.droppedContent.indexOf('data-no-duplicate=') > 0) {
                                            var noDuplicateType = $(scope.droppedContent).attr("data-no-duplicate");

                                            if ($('.' + configuration.canvasClass + ' tr[data-no-duplicate="' + noDuplicateType + '"]').length > 0) {
                                                ui.item.remove();
                                                scope.validationErrors = 'Only one ' + noDuplicateType.toUpperCase() + ' content block is allowed per email.';
                                                scope.showValidationMessage = true;
                                                scope.finishRejectedDrop();
                                                return;
                                            }
                                        }

                                        if (scope.droppedContent.indexOf('data-reservation') > 0 && !configuration.hasReservationLink) {
                                            ui.item.remove();
                                            scope.validationErrors = "<p>Oops, currently you don't have any Reservation Links set up for your store locations.  Be sure to update the Reservation Links for each of your stores on the Webpage Links page.</p><p style='margin-top:15px;'>Click <a style='text-decoration:underline;' href='SocialMedia.aspx?sk=" + queryString["sk"] + "'>here</a> to go to Webpage Links.</p>";
                                            scope.showValidationMessage = true;
                                            scope.finishRejectedDrop();
                                            return;
                                        }

                                        //create the content block
                                        var cb = scope.compileContentBlock(scope.droppedContent);
                                        ui.item.remove();
                                        $(lastDroppable).replaceWith(cb);

                                        //notify subscribers                                  
                                        scope.contentChanged(configuration.contentBlockEvents.Created, scope.$id, cb.data('id'), null,
                                        {
                                            position: element.find('.' + configuration.contentBlockClass).index(cb),
                                            value: $.fn.outerHTML(cb)
                                        });
                                    } else {
                                        // sort
                                        $(lastDroppable).replaceWith(ui.item);

                                        scope.contentChanged(configuration.contentBlockEvents.Reordered, scope.$id, ui.item.data('id'), scope.dragStartPosition,
                                        {
                                            position: element.find('.' + configuration.contentBlockClass).index(ui.item),
                                            value: $.fn.outerHTML(ui.item)
                                        });
                                    }
                                }
                            });

                            scope.$watch(function() {
                                return element.find('.ui-sortable > tr.' + configuration.contentBlockClass).length;
                            }, function(contentBlockCount) {
                                var cssClass = contentBlockCount == 0 ? 'block' : 'table-row-group';
                                element.find('tbody.ui-sortable').css('display', cssClass);

                                // When the table does not have any content, it does not take the min-height
                                // into consideration making it difficult for user to know where to drag and drop.
                                if (contentBlockCount == 0) {
                                    $('<tr class="emptyBlock"><td></td></tr>').appendTo(element.find('tbody.ui-sortable'));
                                } else {
                                    element.find('tbody.ui-sortable .emptyBlock').remove();
                                }
                            });

                            scope.$watch('messageData.hasViewOnline', function(newValue, oldValue) {
                                if (newValue) {
                                    $('#viewOnlineLink').show();
                                } else {
                                    $('#viewOnlineLink').hide();
                                }
                            });

                            scope.$watch('messageData.hasLogoAddress', function(newValue, oldValue) {
                                if (newValue) {
                                    $('#addressBlock').parent().closest('table').show();
                                } else {
                                    $('#addressBlock').parent().closest('table').hide();
                                }
                            });
                            // sticky content block section
                            $(function() {
                                $(window).scroll(sticky_relocate);
                                sticky_relocate();
                            });

                            timeout(function() {
                                //on editor ready https://github.com/angular/angular.js/issues/734

                                // disable links
                                $('#' + configuration.editorHtmlContainerId)
                                    .find('.outerWrapper table a:not([data-editor-url])')
                                    .each(function() {
                                        if ($(this).parent('.' + configuration.overlayMenuBarClass).length == 0) {
                                            var href = $(this).attr("href");
                                            if (href) {
                                                $(this).attr("data-editor-url", href);
                                            }
                                        }
                                    })
                                    .end()
                                    .find('.outerWrapper table a:not([data-cke-saved-href])') // ignore links inserted by Hyperlink Manager, already disabled
                                    .attr("href", "javascript:;")
                                    .end();

                                // start adding max-height restriction to the content block side-bar
                                // 273 is the height of the content block's section. 15 is the padding-top of the "sticky" div.
                                if ($('#sticky').height() + 273 + 15 > $(window).height()) {
                                    $('.editor-content > div').css('max-height', $(window).height() - 150).css('overflow-y', 'auto').css('overflow-x', 'hidden');
                                    $('.editor-content').css('padding', 0);
                                }
                            }, 0);

                            var cleanup = function() {
                                //TODO: Clean up directive
                            };

                            scope.$on('$destroy', function() {
                                cleanup();
                            });
                        }
                    };
                    return directiveObject;
                }
            ])
            .directive(configuration.droppableContentBlockClass, [
                '$rootScope',
                function(rootScope) {
                    var directiveObject = {
                        priority: 0,
                        restrict: 'C',
                        scope: false,
                        template: '<td><img data-ng-src="{{block.thumbnailUrl}}" alt="{{block.name}}" class="img-polaroid"/><td>',
                        link: function(scope, element) {

                            element.draggable({
                                helper: 'clone',
                                connectToSortable: '.' + configuration.canvasClass + '>tbody',
                                revert: 'invalid',
                                start: function(evt, ui) {
                                    //drag and drop helper (the contentblock img with the icon on topright)
                                    $(ui.helper).css('z-index', 9999);
                                    $(ui.helper).find('img').css('cursor', 'url("/Images/closedhand.cur"), default');
/*
                                    if (ui.originalPosition.top > ui.offset.top) {
                                        $(ui.helper).css('margin-top', (evt.clientY - ui.offset.top) + 'px');
                                    }*/

                                    //hover image on layout content block
                                    scope.layoutBlockHoverTemplate.clone().appendTo(ui.helper);

                                    //html content to be dropped
                                    scope.$parent.droppedContent = scope.block.html;
                                },
                                stop: function() {
                                    rootScope.safeApply(function() {
                                        scope.$parent.disableOverlays = false;
                                    });

                                    $('.ui-sortable > tr.dragging').remove();
                                    $('.ui-sortable > tr.emptyBlock').remove();
                                    $('.' + configuration.canvasClass).removeClass('hideOverlays');
                                }
                            }).disableSelection();

                        }
                    };
                    return directiveObject;
                }
            ])
            .directive(configuration.contentBlockClass, [
                '$compile',
                'editorEventsChannelService',
                '$rootScope',
                function(compile, eventsService, rootScope) {
                    var directiveDefinitionObject = {
                        priority: 0,
                        restrict: 'C',
                        scope: {},
                        link: function(scope, element, iAttrs) {

                            var menubarTemplate, menubar;

                            menubarTemplate = scope.$parent.contentBlockHoverMenuBar.clone();
                            // Remove duplicate button 
                            if (element.data('noDuplicate')) {
                                menubarTemplate.find(".icon-duplicate").parent().hide();
                            }

                            // Remove style button 
                            if (!element.data('styleable')) {
                                menubarTemplate.find(".icon-brush").parent().hide();
                            }

                            // Remove pencil button 
                            if (!element.data('configModalClass')) {
                                menubarTemplate.find(".icon-pencil").parent().hide();
                            }

                            var onContextualEditorFocus = function(event) {
                                if (event.contentBlockId == element.data('id')) {
                                    rootScope.safeApply(function() {
                                        scope.$parent.disableOverlays = true;
                                    });
                                }
                            };

                            var onContextualEditorBlur = function(event) {
                                if (event.contentBlockId == element.data('id')) {
                                    rootScope.safeApply(function() {
                                        scope.$parent.disableOverlays = false;
                                    });
                                }
                            };

                            //Generates a new content block id
                            var generateContentBlockId = function() {
                                //the seed for ids its on body element
                                var id = ($('body').data('lastCBId') || 0) + 1;
                                //update seed
                                $('body').data('lastCBId', id);

                                return id;
                            };

                            var setContentBlockId = function() {
                                // when a content block is recreated because an undo/redo, the id is passed to the constructor in order to generate the cb with the same id
                                // if there is not id on iAttrs, then generate a new.
                                var id = parseInt(iAttrs.contentBlockId || generateContentBlockId());

                                //save a copy of the id in dom.
                                element.data('id', id);
                                return id;
                            };

                            scope.id = setContentBlockId();

                            element.mouseover(function(evt) {

                                // prevent bubbling
                                evt.stopImmediatePropagation();

                                // prevent evaluate mouseover on overlay widget
                                // prevent create overlays on editmode
                                if (scope.$parent.disableOverlays
                                    || $(evt.target).is('.' + configuration.overlayClass)
                                    || $(evt.target).is('.' + configuration.overlayMenuBarClass)
                                    || $(evt.target).parents('.' + configuration.overlayMenuBarClass).length) {
                                    return false;
                                }

                                // if the menubar has been removed from the DOM tree
                                if (!element.find('.' + configuration.contentBlockHoverMenuBar).length) {
                                    menubar.appendTo(element.find('[editable]:eq(0)'));
                                }

                                if (!menubar.children().length) {
                                    menubar = menubarTemplate.clone();
                                }

                                // setup overlay if necessary
                                element.find('[editable]').each(function(i, contentElement) {

                                    contentElement = $(contentElement);

                                    var ovr = contentElement.find('.' + configuration.overlayClass);
                                    if (!ovr.length) {
                                        ovr = scope.$parent.overlayLayer.clone();
                                        ovr.appendTo(contentElement);
                                    }

                                    // The following is used to address image content block
                                    // where spacing around the image will be part of contentElement
                                    // but we do not want the overlay to cover the extra spacing, just over the image
                                    // so size and position must be based off the image
                                    var elementToOverlay = contentElement.find('.ui-wrapper');

                                    if (!elementToOverlay.length) {
                                        elementToOverlay = contentElement;
                                    }

                                    ovr.height(elementToOverlay.height())
                                        .width(elementToOverlay.width());

                                    if (!ovr.is(':visible')) {
                                        // hi old friend IE!!! 
                                        window.setTimeout(function() {
                                            ovr.position({ my: 'center center', at: 'center center', of: elementToOverlay, collision: 'none', within: elementToOverlay });
                                        });
                                    } else {
                                        ovr.position({ my: 'center center', at: 'center center', of: elementToOverlay, collision: 'none', within: elementToOverlay });
                                    }
                                });

                                if (!menubar.is(':visible')) {
                                    // wait for render thread, thanks IE8
                                    window.setTimeout(function() {
                                        menubar.position({ my: 'center bottom', at: 'center top', of: element });
                                    }, 0);
                                } else {
                                    menubar.position({ my: 'center bottom', at: 'center top', of: element });
                                }

                                return true;
                            });

                            element.on('click', '.' + configuration.overlayMenuBarClass + ' .duplicate', function() {
                                scope.$root.safeApply(scope.duplicate);
                            });
                            element.on('click', '.' + configuration.overlayMenuBarClass + ' .edit', function() {
                                scope.$root.safeApply(scope.edit);
                            });
                            element.on('click', '.' + configuration.overlayMenuBarClass + ' .delete', function() {
                                scope.$root.safeApply(scope.destroy);
                            });

                            scope.destroy = function() {
                                var cleanContentBlock = angular.element("." + configuration.canvasClass).scope().cleanContentBlockMarkup(element, false);
                                var currentValue = {
                                    value: $.fn.outerHTML(cleanContentBlock),
                                    position: $('.' + configuration.canvasClass + ' > tbody .' + configuration.contentBlockClass).index(element)
                                };

                                element.remove();
                                scope.$parent.contentChanged(configuration.contentBlockEvents.Deleted, scope.$parent.$id, scope.id, null, currentValue);
                            };

                            scope.duplicate = function() {
                                scope.$parent.duplicateContentBlock(element);
                            };

                            scope.edit = function() {
                                var modalClass = element.data('configModalClass');
                                if (!modalClass) {
                                    return;
                                }
                                var modalScope;
                                if (modalClass === 'urlManagerModal') {
                                    eventsService.contextualEditorClickOnEdit(scope.id);
                                } else {
                                    modalScope = angular.element('.' + modalClass).scope();
                                    modalScope.show();
                                }
                            };

                            menubar = menubarTemplate.clone();
                            menubar.appendTo(element.find('[editable]:eq(0)'));

                            //subscribe to contextual editor events
                            eventsService.onContextualEditorFocus(scope, onContextualEditorFocus);
                            eventsService.onContextualEditorBlur(scope, onContextualEditorBlur);
                        }
                    };
                    return directiveDefinitionObject;
                }
            ])
            .directive('messagePreview', [
                'messageService',
                'storeService',
                'editorEventsChannelService',
                function(messageService, storeService, editorEvents) {
                    var directiveDefinitionObject = {
                        priority: 0,
                        restrict: 'A',
                        template: templates.filter('#messagePreview').html(),
                        //templateUrl: '/memberpages/NewEditor/Partials/Directives/messagePreview.htm',
                        scope: {
                            selectedStore: '=',
                            storeSelectorOnTop: '@',
                            storeSelectorLabel: '@',
                            isDraft: '@',
                            waitForEnterprise: '@'
                        },
                        link: function(scope, element) {

                            var selectedMailFormat,
                                msgHeader;

                            var composeUrl = function() {
                                return '/api/previews/' + msgHeader.id + '?sk=' + configuration.sessionKey + '&storeId=' + scope.selectedStore.Id + '&mailFormat=' + selectedMailFormat.format;
                            };

                            scope.mailFormatChanged = function(mailFormat, forceRefresh) {

                                if (!scope.initialized) {
                                    return;
                                }

                                // set header
                                msgHeader = messageService.getHeader();
                                scope.from = msgHeader.from;
                                scope.subject = msgHeader.subject;

                                // holds the reference.
                                selectedMailFormat = mailFormat || selectedMailFormat;

                                var url = composeUrl();

                                if (url != selectedMailFormat.lastUrl || forceRefresh) {

                                    // used to prevent reloading the iframes
                                    selectedMailFormat.lastUrl = url;
                                    // to avoid cache and force iframe reload
                                    selectedMailFormat.url = url + '&_t=' + new Date().getTime();

                                    if (selectedMailFormat.format == scope.textTab.format) {

                                        // refresh content
                                        scope.textTab.content = messageService.getPreview({
                                            storeId: scope.selectedStore.Id,
                                            mailFormat: scope.textTab.format
                                        }, function(data) {
                                            scope.textTab.content = data.text;
                                        });
                                    }
                                }
                            };

                            var init = function() {

                                if (scope.initialized) {
                                    // the user is opening the send a test modal again
                                    scope.mailFormatChanged(selectedMailFormat, true);
                                    return;
                                }

                                scope.initialized = true;

                                scope.storeSelectorLabel = scope.storeSelectorLabel || 'Use the following store location information:';
                                scope.selectedStore = scope.selectedStore || { Name: 'Preview with my member profile', Id: 0 };
                                scope.htmlTab = { format: 2, url: null, lastUrl: null };
                                scope.textTab = { format: 1, url: null, content: null, lastUrl: null };
                                scope.onlineTab = { format: 4, url: null, lastUrl: null };
                                selectedMailFormat = scope.htmlTab;

                                // get list of stores
                                scope.stores = storeService.getStores({ listId: 0, withMemberCount: false }, function(data) {
                                    data.splice(0, 0, scope.selectedStore);
                                    //refresh the preview when user changes the selected store
                                    scope.$watch('selectedStore.Id', function() {
                                        scope.mailFormatChanged(selectedMailFormat, false);
                                    });
                                });

                                if (scope.storeSelectorOnTop === 'true') {
                                    element.find('.storeSelector').insertBefore(element.find('[tabset]'));
                                }
                            };

                            if (scope.waitForEnterprise === 'true') {
                                editorEvents.onEnterpriseSaveSuccess(scope, init);
                            } else {
                                init();
                            }
                        }
                    };
                    return directiveDefinitionObject;
                }
            ])
            .directive('sendATestModal', [
                'messageService', '$timeout', '$anchorScroll', '$location', function(messageService, timeout, $anchorScroll, $location) {
                    var directiveDefinitionObject = {
                        priority: 0,
                        restrict: 'A',
                        template: templates.filter('#sendATest').html(),
                        //templateUrl: '/memberpages/NewEditor/Partials/Directives/sendATest.htm',
                        scope: {
                            showSendATestModal: '='
                        },
                        link: function(scope, element, attrs) {
                            scope.data = {
                                emailAddress: '',
                                selectedStore: 0,
                                sendATestValidationErrors: ''
                            };

                            scope.sendATest = function() {
                                scope.submitted = true;
                                scope.data.sendATestValidationErrors = '';

                                scope.gotoBottom = function() {
                                    // set the location.hash to the id of
                                    // the element you wish to scroll to.
                                    $location.hash('sendATestValidationMessage');

                                    // call $anchorScroll()
                                    $anchorScroll();
                                };

                                if (scope.data.emailAddress) {
                                    messageService.sendaTest({ emailAddresses: scope.data.emailAddress, storeId: scope.data.selectedStore.Id },
                                        function() {
                                            scope.showSendATestModal = false;
                                        },
                                        function(errorData) {
                                            scope.data.sendATestValidationErrors = errorData.text;
                                            scope.gotoBottom();
                                        }
                                    );
                                } else {
                                    scope.gotoBottom();
                                }
                            };
                        }
                    };
                    return directiveDefinitionObject;
                }
            ])
            .directive('previewIframe', [
                function() {
                    var directiveDefinitionObject = {
                        restrict: 'A',
                        scope: {
                            src: '@',
                            height: '@',
                            width: '@'
                        },
                        replace: true,
                        template: '<iframe class="frame" width="{{width}}" frameborder="0" border="0" marginwidth="0" marginheight="0" data-ng-src="{{src}}"></iframe>',
                        link: function(scope, element) {

                            element.load(function(event) {
                                // deactivate links
                                $(event.target.contentDocument).find('.outerWrapper table a').attr('href', 'javascript:;');
                            });
                        }
                    };
                    return directiveDefinitionObject;
                }
            ])
            .directive('jqueryDatepicker', function() {
                return {
                    restrict: 'A',
                    require: 'ngModel',
                    scope: {
                        showCallback: '&'
                    },
                    link: function(scope, element, attrs, ngModelCtrl) {
                        $(function() {

                            element.datepicker({
                                showOn: "both",
                                buttonImageOnly: true,
                                buttonImage: "NewEditor/img/calendar.gif",
                                defaultDate: new Date(),
                                minDate: new Date(),
                                onSelect: function(date) {
                                    ngModelCtrl.$setViewValue(date);
                                    scope.$root.safeApply();
                                }
                            }).datepicker('setDate', new Date());

                            element.next().on('click', function() {
                                if (angular.isFunction(scope.showCallback)) {
                                    scope.showCallback();
                                }
                            });

                        });
                    }
                };
            })
            .directive('emailOptionsModal', [
                '$timeout',
                '$compile',
                'dataContext',
                '$rootScope',
                'clientService',
                function(timeout, compile, dc, $rootScope, clientService) {
                    var directiveDefinitionObject = {
                        restrict: 'A',
                        scope: {
                            messageData: '=',
                            showEmailOptionsModal: '=',
                            saveCallback: '&',
                            enableViewOnline: '='
                        },
                        template: templates.filter('#emailOptions').html(),
                        //templateUrl: '/memberpages/NewEditor/Partials/Directives/emailOptions.htm',
                        replace: false,
                        link: function(scope, element) {
                            scope.data = {
                                originalHasViewOnline: null,
                                originalHasLogoAddress: null,
                                makeDefault: false
                            };

                            scope.saveEmailOptions = function() {
                                if (scope.data.makeDefault) {
                                    var client = {
                                        IncludeViewOnlineByDefault: scope.messageData.hasViewOnline,
                                        IncludeLogoAddressByDefault: scope.messageData.hasLogoAddress,
                                        ForSettings: false // no need to update ClientEmailSettings table
                                    }

                                    clientService.updateClient(client);
                                }

                                scope.data.makeDefault = false;

                                if (scope.data.originalHasViewOnline != scope.messageData.hasViewOnline || scope.data.originalHasLogoAddress != scope.messageData.hasLogoAddress) {
                                    scope.data.originalHasViewOnline = scope.messageData.hasViewOnline;
                                    scope.data.originalHasLogoAddress = scope.messageData.hasLogoAddress;

                                    if (angular.isFunction(scope.saveCallback)) {
                                        scope.saveCallback();
                                    }
                                }

                                scope.showEmailOptionsModal = false;
                            }

                            scope.restoreEmailOptions = function() {
                                scope.messageData.hasViewOnline = scope.data.originalHasViewOnline;
                                scope.messageData.hasLogoAddress = scope.data.originalHasLogoAddress;
                                scope.data.makeDefault = false;
                            }

                            scope.$watch('messageData.hasViewOnline', function(newValue, oldValue) {
                                if (oldValue == null || scope.data.originalHasViewOnline == null || scope.data.originalHasLogoAddress == null) {
                                    scope.data.originalHasViewOnline = scope.messageData.hasViewOnline;
                                    scope.data.originalHasLogoAddress = scope.messageData.hasLogoAddress;
                                }
                            });

                            var init = function init() {
                                clientService.getClient(function(data) { scope.clientSettings = data; });
                            }

                            scope.$watch('showEmailOptionsModal', function(newValue, oldValue) {
                                if (newValue && !scope.clientSettings) {
                                    init();
                                }
                            });
                        }
                    };

                    return directiveDefinitionObject;
                }
            ])
            .directive('applyValidation', function() {
                return {
                    require: 'ngModel',
                    restrict: 'A',
                    link: function(scope, elm, attrs, formCtrl) {
                        scope.$watch('regex', function(value) {
                            if (formCtrl.$viewValue !== '') {
                                formCtrl.$setViewValue(formCtrl.$viewValue);
                            }
                        });
                    }
                }
            })
            .directive('file', [
                function() {
                    var directiveDefinitionObject = {
                        restrict: 'A',
                        scope: {
                            file: '=',
                            form: '='
                        },
                        link: function(scope, element) {
                            element.bind('change', function(event) {
                                scope.file(event.target.files, event.target.value, $(event.target));
                            });
                        }
                    };
                    return directiveDefinitionObject;
                }
            ])
            .directive('slider', [
                function() {
                    var directiveDefinitionObject = {
                        restrict: 'C',
                        scope: {
                            rangeValue: '=',
                            onSlide: '=',
                            maxRangeValue: '='
                        },
                        link: function(scope, element) {

                            element.slider({
                                min: 10,
                                max: scope.maxRangeValue * 100,
                                value: scope.rangeValue * 100,
                                change: function(event, ui) {
                                    scope.onSlide(ui.value / 100);

                                    // prevent to enter on a double digest cycle 
                                    if (!scope.$root.$$phase) {
                                        scope.$apply();
                                    }
                                }
                            });

                            scope.$watch('maxRangeValue', function (newValue, oldValue) {                                
                                if (newValue !== oldValue) {
                                    var minValue = newValue * 100 > 10 ? 10 : 1; // When uploading a huge image, the scale range ends up being less than 10, so we need to use a new min value for the slider
                                    element.slider({ min: minValue, max: newValue * 100, value: scope.rangeValue * 100 });
                                }
                            });

                            scope.$watch('rangeValue', function(newValue, oldValue) {
                                if (newValue !== oldValue) {                                    
                                    element.slider({ max: scope.maxRangeValue * 100, value: newValue * 100 });
                                }
                            });
                        }
                    };
                    return directiveDefinitionObject;
                }
            ])
            .directive('blurInput', [
                '$parse',
                function($parse) {
                    var directiveDefinitionObject = {
                        restrict: 'AC',
                        require: 'ngModel',
                        link: function(scope, element, attrs) {

                            var onBlur = $parse(attrs.onBlur);

                            if (!angular.isFunction(onBlur)) {
                                throw "The expression on the onblur input directive does not point to a valid function.";
                            }

                            element.blur(function(evt) {
                                scope.$root.safeApply(function() {
                                    onBlur(scope, { event: evt });
                                });
                            });
                        }
                    };
                    return directiveDefinitionObject;
                }
            ])
            .directive('imgmap', [
                '$timeout',
                '$compile',
                function(timeout, compile) {
                    var dir = {
                        restrict: 'AC',
                        template: templates.filter('#imgmap').html(),
                        link: function(scope, element) {

                            var lastShapeId = 0, // last shape added by the plugin on inactive state (undrawn)					
                                mapper, // mapper instance
                                emailRegex = /^(mailto:)?((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
                                urlRegex = /^((https?|s?ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)|\/|\?)*)?$/i,
                                loadingAreas = false,
                                shapeChangedWatcher;

                            scope.shapes = [];
                            scope.hoverArea = -1;                            

                            // /^((emailRegex)|(urlRegex))$/i
                            scope.regex = urlRegex; // /^(((mailto:)?((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))|(((https?|s?ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)|\/|\?)*)?))$/i;
                            scope.emailRegex = emailRegex;
                            scope.urlRegex = urlRegex;

                            var movePencilToNextLastArea = function movePencilToNextLastArea() {
                                mapper.currentid = mapper._getLastArea().aid;
                            };

                            var updateShapeAndRepaint = function updateShapeAndRepaint(resizeWrapper) {
                                // we need to update the area position
                                // bc on drag we only update the container coordinates
                                // and on resize we change the draw of the shape

                                // we will use the _recalculate method who receives coords as second parameter

                                // on circles: coords = {0},{1},{2}
                                // {0} = Absolute Left of the center of the circle
                                // {1} = Absolute Top of the center of the circle 
                                // {2} = Radius Length

                                // on rectangles: coords = top,left, (width+left),(height+top)

                                var coords = '';
                                var areaId = resizeWrapper.data('areaId');

                                // Consider border of shapes and (add +1 to top and left) and (minus -2 to width and height)
                                var areaPos = resizeWrapper.position();
                                areaPos.left += 1;
                                areaPos.top = areaPos.top + 1 + $('.mapper-body').scrollTop(); // We need to consider the scrollbar here as well
                                var height = parseInt(resizeWrapper.height(), 10) - 2;
                                var width = parseInt(resizeWrapper.width(), 10) - 2;

                                var shape = $(mapper.areas[areaId]).prop('shape');
                                if (shape === 'circle') {
                                    var circleCenter = width / 2;
                                    coords = (circleCenter + areaPos.left) + ',' + (circleCenter + areaPos.top) + ',' + circleCenter;
                                } else {
                                    // rectangle
                                    coords = areaPos.left + ',' + areaPos.top + ',' + (areaPos.left + width) + ',' + (areaPos.top + height);
                                }
                                mapper._recalculate(areaId, coords);
                            };

                            /* Called by the plugin when adds a new shape 
                            (usually is when the user finish the drawing on an active shape, 
                            then the plugin adds another unactive shape, that will be drawn in the future) 
                            Is called also by the plugin when loads an existing map to be edited
                            */
                            var onAddArea = function onAddArea(id) {
                                var canvasId = scope.shapes[id] ? id : lastShapeId;

                                // if we saved an area or if we are loading an existent map, we need to apply the resizable and draggable behaivor
                                if (scope.shapes[canvasId]) {
                                    // get the contstraint img
                                    var img = $(mapper.areas[canvasId]).parents('.mapper-body').find('img');

                                    // apply first resizable to the area
                                    $(mapper.areas[canvasId]).resizable({
                                        handles: "all",
                                        containment: img,
                                        create: function(ev, u) {
                                            // We need to wait until resizable is created to apply draggable to its container
                                            $(this)
                                                .data('areaId', canvasId)
                                                .draggable({
                                                    containment: img,
                                                    scroll: true,
                                                    start: function(e, ui) {
                                                        $(this).addClass('closedHandCursor');
                                                        // to continue compatibility with imgmap.js library
                                                        e.cancelBubble = true;
                                                        e.stopPropagation();
                                                    },
                                                    stop: function() {
                                                        $(this).removeClass('closedHandCursor');
                                                        updateShapeAndRepaint($(this));
                                                        movePencilToNextLastArea();
                                                    }
                                                });
                                        },
                                        start: function(ev, ui) {
                                            // trigger area selection
                                            mapper.area_mousedown({}, mapper.areas[$(this).data('areaId')]);
                                        },
                                        resize: function(e, ui) {
                                            updateShapeAndRepaint($(this));
                                        },
                                        stop: function() {
                                            updateShapeAndRepaint($(this));
                                            movePencilToNextLastArea();
                                        },
                                        aspectRatio: mapper.areas[canvasId].shape == 'circle'
                                    });
                                }

                                // on map loading.
                                if (scope.shapes[id]) {
                                    return;
                                }

                                lastShapeId = id;
                            };

                            /*
                            Called by the plugin after the user stops -resizing-moving-drawing- a shape
                            */
                            var onRelaxArea = function onRelaxArea(id) {

                                if (loadingAreas) {
                                    return;
                                }

                                if (!scope.shapes[id]) {
                                    onSelectArea(mapper.areas[id]);
                                } else {

                                    //pass the pointer to an inactive shape
                                    mapper.currentid = lastShapeId;

                                    // update output only on move-resize 
                                    // onCreate is updated when the user press save.
                                    scope.imageData.map = mapper.getMapHTML();
                                }
                            };

                            scope.saveShape = function saveShape(currentShape) {
                                // With the removal of save button it can be that there's no currentShape selected while doing a save
                                if (currentShape) {
                                    if (emailRegex.test(currentShape.href) && currentShape.href.indexOf('mailto:') == -1) {
                                        // add mailto:
                                        currentShape.href = 'mailto:' + $.trim(currentShape.href);

                                    } else if (urlRegex.test(currentShape.href) && currentShape.href.indexOf('http') == -1) {
                                        // add http://
                                        currentShape.href = 'http://' + $.trim(currentShape.href);
                                    }

                                    if (!scope.shapes[currentShape.id]) {

                                        // add it to the collection
                                        scope.shapes[currentShape.id] = {
                                            id: currentShape.id,
                                            alt: currentShape.alt,
                                            href: currentShape.href,
                                            hover: 'Link to: ' + currentShape.href
                                        };

                                        // allow edit mode
                                        mapper.viewmode = 0;

                                        // tooltip on hover setup
                                        $(mapper.areas[currentShape.id]).attr('tooltip', '{{shapes[hoverArea].hover}}');
                                        compile(mapper.areas[currentShape.id])(scope);

                                        // generate a new unactive area and make the cursor operations point there.
                                        mapper.addNewArea();
                                    } else {

                                        // update shape
                                        scope.shapes[currentShape.id].alt = currentShape.alt;
                                        scope.shapes[currentShape.id].href = currentShape.href;
                                        scope.shapes[currentShape.id].hover = 'Link to: ' + currentShape.href;

                                        // points mapper operations to the last unactive shape
                                        mapper.currentid = lastShapeId;
                                    }

                                    // common operations to save and update

                                    // update html map data
                                    mapper.areas[currentShape.id].ahref = currentShape.href;
                                    mapper.areas[currentShape.id].aalt = currentShape.alt;

                                    // update html output
                                    mapper._updatecoords(currentShape.id);
                                }

                                scope.imageData.map = mapper.getMapHTML();
                            };

                            scope.cancelShape = function cancelShape(currentShape) {

                                if (!scope.shapes[currentShape.id]) {

                                    // cancel new shape
                                    scope.removeShape(currentShape.id);
                                }

                            };

                            scope.isReplaceImageEnabled = function () {
                                return scope.mapperMode && mapper && mapper.areas.length > 1 && element.find('input[name=shapehref]').hasClass('ng-valid');
                            };

                            // A shape could be removed from UI on click in "Remove"
                            // Can Also be removed using the delete key.
                            scope.removeShape = function(id) {

                                // cancel new shape
                                if (!scope.shapes[id] && mapper.areas[id]) {

                                    // allow drawing map mode
                                    mapper.viewmode = 0;

                                    // remove shape from canvas
                                    mapper.removeArea(id, false);

                                    // create a new unactive shape
                                    mapper.addNewArea();
                                } else { //Remove an existing shape

                                    if (mapper.areas[id]) {

                                        // get the area resizer container
                                        var resizer = $(mapper.areas[id]).parent();

                                        // remove shape from canvas
                                        mapper.removeArea(id, false);

                                        // remove the resizer
                                        resizer.remove();
                                    }

                                    // remove it from our collection
                                    scope.shapes[id] = null;
                                }

                                scope.currentShape = null;

                                // update output
                                scope.imageData.map = mapper.getMapHTML();
                            };

                            var onSelectArea = function(obj) {

                                // display the edition form
                                scope.$root.safeApply(function() {
                                    scope.currentShape = {
                                        id: obj.aid,
                                        alt: obj.aalt,
                                        href: obj.ahref
                                    };

                                    highlightArea(obj.aid);

                                    if (scope.currentShape && scope.currentShape.href && scope.currentShape.href.indexOf("mailto:") == 0) {
                                        scope.selectedType = 'Email';
                                    } else if (scope.currentShape && scope.currentShape.href && scope.currentShape.href == "##_Profile_##") {
                                        scope.selectedType = 'Update Profile';
                                    } else {
                                        scope.selectedType = 'Website';
                                    }

                                    scope.mapperChangeType();

                                });
                            };

                            scope.mapperChangeType = function mapperChangeType() {
                                var updateProfileMergeCode = '##_Profile_##';

                                if (scope.selectedType == 'Update Profile') {
                                    scope.regex = /.*/;
                                    scope.currentShape.href = updateProfileMergeCode;
                                } else if (scope.selectedType == 'Email') {
                                    scope.regex = scope.emailRegex;
                                } else {
                                    scope.regex = scope.urlRegex;
                                }

                                if (scope.selectedType != 'Update Profile' && scope.currentShape.href == updateProfileMergeCode) {
                                    scope.currentShape.href = '';
                                }
                            };

                            var onShapeChanged = function(newValue, oldValue) {
                                if (newValue != oldValue) {

                                    if (mapper.areas[mapper.currentid] && mapper.areas[mapper.currentid].shape != newValue && mapper.areas[mapper.currentid].shape != 'undefined') {

                                        //shape changed, adjust coords intelligently inside _normCoords
                                        var coords = mapper.areas[mapper.currentid].lastInput || '';
                                        coords = mapper._normCoords(coords, newValue, 'from' + mapper.areas[mapper.currentid].shape);
                                        mapper.areas[mapper.currentid].shape = newValue;

                                        if (mapper.is_drawing != 0) {
                                            mapper.is_drawing = newValue == 'rect' ? mapper.DM_RECTANGLE_DRAW : mapper.DM_SQUARE_DRAW; // circle uses DM_SQUARE_DRAW
                                        }

                                        mapper._recalculate(mapper.currentid, coords);

                                        // update container size
                                        var area = $(mapper.areas[mapper.currentid]);
                                        if (area.parent().is('.ui-wrapper')) {
                                            var resizeWrapper = $(mapper.areas[mapper.currentid]).parent();
                                            resizeWrapper.width(area.width());
                                            resizeWrapper.height(newValue === 'circle' ? area.width() : area.height());
                                            var resizableOptions = area.resizable('option');
                                            resizableOptions.aspectRatio = newValue === 'circle' ? 1 : false;
                                            area.resizable('destroy');
                                            area.resizable(resizableOptions);
                                        }
                                    }

                                    mapper.nextShape = newValue;
                                }
                            };

                            var onFocusArea = function(area) {
                                // not proud of this.
                                scope.hoverArea = area.id.split('area')[1];
                            };

                            function onClose() {

                                var map = scope.imageData.map;
                                clearMapperMode();

                                // prevents map modifications when call the method clearMapperMode();
                                if (scope.mapperMode) {
                                    scope.imageData.map = map;
                                }
                            }

                            scope.removeMap = function() {
                                clearMapperMode();
                                // reset map result 
                                scope.imageData.map = '';

                                scope.editorMode = true;
                                scope.mapperMode = false;
                            };

                            var saveCurrentShape = function () {                                
                                scope.saveShape(scope.currentShape);
                            };

                            function onImageChanged() {                                
                                if (scope.mapperMode) {
                                    // So basically what we are doing here is save a copy of the current mapping
                                    // in a temp variable, clean the mapper mode and setting the mapping again
                                    // before calling show() which is the method called when you open the modal
                                    var map = mapper.getMapHTML();
                                    if (!map || $(map).find('area').length == 0) {
                                        map = '';
                                    }

                                    clearMapperMode();

                                    scope.imageData.map = map;
                                    show();

                                    // For some reason the state of the form isValidForm is false after show, so we set it again
                                    scope.imageData.map = map;                                    
                                }
                            }

                            function clearMapperMode() {
                                // edit mode of map
                                mapper.viewmode = 0;
                                // remove shapes
                                mapper.setMapHTML('');
                                // remove draggable/resize
                                element.find('.ui-wrapper').remove();
                                element.find('.mapper-body img').remove();
                            }

                            var loadArea = function(area) {

                                if (loadingAreas) {
                                    scope.shapes[area.aid] = {
                                        id: area.aid,
                                        alt: area.aalt,
                                        href: area.ahref,
                                        hover: 'Link to: ' + area.ahref
                                    };

                                    // tooltip on hover setup
                                    $(mapper.areas[area.aid]).attr('tooltip', '{{shapes[hoverArea].hover}}');
                                    compile(mapper.areas[area.aid])(scope);

                                    loadingAreas -= 1;

                                    if (loadingAreas == 0) {
                                        // generate a new unactive area and make the cursor operations point there.
                                        mapper.addNewArea();

                                        // unsuscribe from event
                                        mapper.config.custom_callbacks['onAreaChanged'] = null;
                                    }
                                }

                            };

                            var highlightArea = function(areaId) {

                                areaId = parseInt(areaId, 10);
                                for (var i = 0, le = mapper.areas.length; i < le; i++) {
                                    if (mapper.areas[i]) {
                                        if (areaId === mapper.areas[i].aid) {
                                            mapper.highlightArea(areaId);
                                        } else {
                                            mapper.blurArea(mapper.areas[i].aid);
                                        }
                                    }
                                }
                            };

                            var onBlurArea = function(area) {
                                if (scope.currentShape && area.aid === scope.currentShape.id) {
                                    mapper.highlightArea(area.aid);
                                }
                            };

                            var show = function () {
                                // cannot be done during Init() cause if there is lag the confg was not loaded yet
                                scope.replaceEnabled = configuration.isSuperUser;

                                // load plugin config
                                // ReSharper disable InconsistentNaming
                                mapper = new imgmap({
                                    // ReSharper restore InconsistentNaming
                                    mode: "editor",
                                    custom_callbacks: {
                                        //'onStatusMessage' : function(str) {gui_htmlChanged('onStatusMessage',str);},//to display status messages on gui//
                                        //'onHtmlChanged'   : function(str) {gui_htmlChanged('onHtmlChanged',str);},//to display updated html on gui		//							
                                        'onAddArea': onAddArea, //to add new form element on gui
                                        'onRemoveArea': scope.removeShape, //to remove form elements from gui
                                        'onRelaxArea': onRelaxArea, //when onStopDrawingArea/onStopResizeArea
                                        'onSelectArea': onSelectArea, //to select form element when an area is clicked
                                        'onFocusArea': onFocusArea,
                                        'onAreaChanged': loadArea,
                                        'onBlurArea': onBlurArea
                                    },
                                    pic_container: $('.mapper-body')[0],
                                    bounding_box: false,
                                    hint: '%a',
                                    label: '',
                                    CL_HIGHLIGHT_BG: '#ffff00'
                                });

                                // load image
                                mapper.loadImage(scope.previewSrc, scope.imageData.width, scope.imageData.height);

                                // has to be done after load image, because load image remove all previous existing maps
                                if (scope.imageData.map) {
                                    loadingAreas = $(scope.imageData.map).find('area').length;
                                    mapper.setMapHTML(scope.imageData.map);
                                }

                                // set shape mode
                                scope.drawShape = mapper.nextShape;

                                scope.onBeforeSend = saveCurrentShape;
                                scope.onImageChanged = onImageChanged;
                                scope.onClose = onClose;

                                scope.selectedType = 'Website';
                            };

                            var init = function() {
                                scope.$watch('currentShape.href + currentShape.alt + selectedType', function() {
                                    if (!scope.shapeForm.$invalid && scope.currentShape) {
                                        scope.saveShape(scope.currentShape);
                                    }
                                });
                                scope.$watch('mapperMode', function(newValue, oldValue) {
                                    if (newValue !== oldValue && newValue) {
                                        show();
                                    }
                                });

                                shapeChangedWatcher = scope.$watch('drawShape', onShapeChanged);

                                scope.$on('$destroy', function() {
                                    // if the user closes the image mapper then clean the observers
                                    if (shapeChangedWatcher) {
                                        shapeChangedWatcher();
                                    }
                                });                                
                            }

                            init();
                        }
                    };
                    return dir;
                }
            ])
            .directive('imgModal', [
                'editorEventsChannelService',
                'messageService',
                '$compile',
                '$q',
                function(editorEvents, messageService, compile, $q) {
                    var directiveDefinitionObject = {
                        restrict: 'A',
                        template: templates.filter('#imgModal').html(),
                        scope: {},
                        replace: false,
                        link: function(scope, element) {
                            var postPdfUrl = '/api/images/PostToImagePreview?sk=' + configuration.sessionKey,
                                postImageUrl = '/api/images/PostMessageImage?sk=' + configuration.sessionKey,
                                fileExtensionsRegex = /^(?:gif|pdf|png|jpeg|jpg)$/i,
                                emailRegex = /^(mailto:)?((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
                                urlRegex = /^((https?|s?ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)|\/|\?)*)?$/i,
                                uploadedImageChanged = false;

                            scope.emailRegex = emailRegex;
                            scope.urlRegex = urlRegex;
                            scope.imageData = {};
                            scope.progress = 0;
                            scope.savePromise = $q.defer();
                            scope.onClose;
                            // events 
                            scope.onBeforeSend = null;
                            scope.onImageChanged = null;

                            scope.close = function () {
                                if (angular.isFunction(scope.onClose)) {
                                    scope.onClose();
                                }
                                scope.editorMode = true;
                                scope.mapperMode = false;
                            }                            

                            scope.show = function show() {                                
                                scope.showImageModal = true;
                                element.find('form input:file').val('');
                                scope.editorMode = !scope.imageData.map;
                                scope.mapperMode = !scope.editorMode;

                                if (scope.mapperMode) {
                                    scope.previewSrc = scope.imageData.src;
                                }
                            };

                            //ON LOAD FILE
                            scope.onLoadFile = function(fileInfo, fileName, fileInput) {

                                var fileExtension = fileName.split('.')[fileName.split('.').length - 1].toLowerCase();

                                if (fileExtension == 'pdf') {
                                    // upload pdf to get image preview                                    
                                    scope.action = postPdfUrl;
                                    scope.validFile = validateSelectedImg(fileInfo, fileExtension);

                                    if (scope.validFile) {
                                        scope.selectedFile = fileName;
                                        scope.imageData.src = fileName;
                                        uploadedImageChanged = true;

                                        // Remove the name of all file inputs and just set it to the current element
                                        var fileInputs = element.find('.imageInput');
                                        fileInputs.removeAttr('name');
                                        fileInput.attr('name', 'file');

                                        // We need to remove the disabled of the submit button because in this flow the preview generation occurs on the server, and since the current image is the Default one it's considered as invalid form.
                                        element.find('input[type=button].save, input[type=button].saveAndClose').removeAttr('disabled').first().trigger('click'); // Now we have 2 submits buttons, Save and Save and Close
                                    }

                                } else {

                                    scope.validFile = validateSelectedImg(fileInfo, fileExtension);
                                    scope.action = postImageUrl;

                                    if (scope.validFile) {

                                        scope.selectedFile = fileInfo || fileName;
                                        scope.imageData.src = fileName;
                                        uploadedImageChanged = true;

                                        // Remove the name of all file inputs and just set it to the current element
                                        var fileInputs = element.find('.imageInput');
                                        fileInputs.removeAttr('name');
                                        fileInput.attr('name', 'file');

                                        // generate img preview
                                        scope.generatePreview();
                                    }

                                    scope.$root.safeApply();
                                }
                            };

                            //browser specific behaivor to display the image preview without loading
                            scope.generatePreview = (function(contextScope) {
                                if (window.FileReader) {

                                    var fileReader = new window.FileReader();

                                    fileReader.onload = function(event) {
                                        // use a temp img to render the image and get the dimensions
                                        contextScope.$root.safeApply(function() {
                                            element.append('<img class="hiddenPreview" style="visibility:hidden;" src="' + event.target.result + '" />');

                                            // wait until rendering is done
                                            window.requestAnimFrame(function () {
                                                window.setTimeout(function() {
                                                    //get dimensions
                                                    var w = element.find('.hiddenPreview').width();
                                                    var h = element.find('.hiddenPreview').height();
                                                    contextScope.imageData.fileWidth = w;
                                                    contextScope.imageData.fileHeight = h;

                                                    if (w > contextScope.imageData.maxWidth) {
                                                        contextScope.imageData.width = contextScope.imageData.maxWidth;
                                                        contextScope.imageData.height = h * (Number(contextScope.imageData.maxWidth) / Number(w));
                                                    } else {
                                                        contextScope.imageData.width = w;
                                                        contextScope.imageData.height = h;
                                                    }

                                                    //remove temp
                                                    element.find('.hiddenPreview').remove();
                                                    contextScope.previewSrc = event.target.result;

                                                    if (angular.isFunction(scope.onImageChanged)) {
                                                        scope.onImageChanged();
                                                    }
                                                    // reflect the changes in the view
                                                    contextScope.$root.safeApply();
                                                }, 0);
                                            });
                                        });
                                    };

                                    return function() {
                                        fileReader.readAsDataURL(contextScope.selectedFile[0]);
                                    };
                                } else {
                                    return function() {
                                        contextScope.action = postPdfUrl;
                                        contextScope.validFile = true;
                                        element.find('input[type=button].save, input[type=button].saveAndClose').removeAttr('disabled').first().trigger('click'); // Now we have 2 submits buttons, Save and Save and Close
                                    };
                                }
                            })(scope);

                            scope.beforeSend = function() {

                                element.find('form').attr('action', scope.action + '&_t=' + new Date().getTime());
                                element.find('input[name=src]').val(scope.imageData.src);
                                element.find('input[name=id]').val(scope.imageData.id);
                                element.find('input[name=messageId]').val(messageService.getHeader().id);

                                if (scope.imageData.linkto && scope.imageData.linkto.length) {
                                    if (emailRegex.test(scope.imageData.linkto) && scope.imageData.linkto.indexOf('mailto:') == -1) {
                                        // add mailto:
                                        scope.imageData.linkto = 'mailto:' + $.trim(scope.imageData.linkto);
                                    } else if (urlRegex.test(scope.imageData.linkto) && scope.imageData.linkto.indexOf('http') == -1) {
                                        // add http://
                                        scope.imageData.linkto = 'http://' + $.trim(scope.imageData.linkto);
                                    }
                                }

                                if (angular.isFunction(scope.onBeforeSend)) {
                                    scope.onBeforeSend();
                                }

                                // if the image didnt changed trigger save callback and return data to editorSpecification directive
                                if (!uploadedImageChanged) {
                                    scope.savePromise.notify(angular.copy(scope.imageData));
                                }

                                return uploadedImageChanged;
                            };

                            scope.sendFile = function (content, completed, closeModal) {                                
                                if (completed) {

                                    uploadedImageChanged = false;

                                    // remove the action attribute from the form
                                    element.find('form').removeAttr('action');
                                    scope.progress = 0;

                                    // The API got an error
                                    if (content == undefined) {
                                        alert('Upload failed. Please try again or choose a different file');
                                        element.find('form input:file').val('');
                                        return false;
                                    }

                                    // the data received is an image
                                    scope.imageData.src = content.Url;
                                    scope.imageData.id = content.Id;

                                    if (scope.action == postPdfUrl) {

                                        // updates the preview
                                        scope.previewSrc = content.Url;
                                        if (angular.isFunction(scope.onImageChanged)) {
                                            scope.onImageChanged();
                                        }
                                        scope.imageData.fileHeight = content.Height;
                                        scope.imageData.fileWidth = content.Width;

                                        scope.action = postImageUrl;
                                        element.find('form').attr('action', scope.action + '&_t=' + new Date().getTime());

                                    } else if (scope.action == postImageUrl) {
                                        // the data received is the image saved
                                        // everything went well
                                        // do processing

                                        // creates a copy of the data
                                        scope.savePromise.notify(angular.copy(scope.imageData));
                                    }
                                } else {
                                    scope.progress = 50;
                                }
                            };

                            scope.progressBar = function() {
                                return {
                                    width: scope.progress + '%'
                                };
                            };

                            scope.isValidForm = function () {
                                var result = ((scope.editorMode && scope.validFile && element.find('input[name=linkto]').hasClass('ng-valid') && $('#imagePreview img').attr('src') && $('#imagePreview img').attr('src').indexOf('/LayoutPreviews/') === -1)
                                    || (scope.mapperMode && scope.imageData.map && scope.imageData.map.indexOf("<area") > 0 && element.find('input[name=shapehref]').hasClass('ng-valid')));
                                return result;
                            };                            

                            scope.removeNameAttribute = function(oldMode, newMode) {
                                var fUploadOld = element.find('.imageInput.' + oldMode);
                                fUploadOld.removeAttr('name');
                                var fUploadNew = element.find('.imageInput.' + newMode);
                                fUploadNew.attr('name', 'file');
                            };

                            var validateSelectedImg = function(fileInfo, fileExtension) {

                                // nothing selected, when IE fileInfo is undefined. So here we only check for Chrome/Firefox
                                if (fileInfo && !fileInfo.length) {
                                    return false;
                                }

                                // validate file size, when IE fileInfo is undefined. So here we only check for Chrome/Firefox
                                if (fileInfo && fileInfo[0].size > configuration.maxFileSize) {
                                    alert("Your file must be smaller than 5 MB");
                                    return false;
                                }

                                // validate file.extension
                                if (!fileExtensionsRegex.test(fileExtension)) {
                                    alert("You must select a valid image file!");
                                    return false;
                                }

                                return true;
                            };

                            scope.$on('$destroy', function() {
                                element.remove();
                            });

                            function init() {
                                // black nasty magic to avoid having nested forms (why? bc aspnetForm...that's why)
                                // we need a form to perform ajax upload
                                element.appendTo($('body'));
                                var directiveHtml = '<form name="imageEditorForm" data-ng-upload="true" upload-submit="sendFile(content,completed,closeModal)" data-before-submit="beforeSend(form)" data-upload-button-selector=".modal-header > .close, .modal-footer > .btn.save, .modal-footer > .btn.saveAndClose" action="/api/images/PostToImagePreview" method="POST" enctype="multipart/form-data" encoding="multipart/form-data" class="form-horizontal">'
                                    + '<div class="row-fluid" data-img-editor="true" data-ng-show="editorMode">'
                                    + '</div>'
                                    + '<div class="row-fluid" data-imgmap="true" data-ng-show="mapperMode">'
                                    + '</div>'
                                    + '</form>';

                                // compiling editor directives
                                directiveHtml = $(directiveHtml);
                                element.find('.modal-body').append(directiveHtml);
                                compile(directiveHtml)(scope);
                                editorEvents.publicScopeLoaded('IMAGE_MODAL_READY', scope);
                            }

                            init();
                        }
                    };
                    return directiveDefinitionObject;
                }
            ])
            .directive('imgEditor', [
                function() {
                    var directiveDefinition = {
                        restrict: 'A',
                        template: templates.filter('#imgEditor').html(),
                        link: function link(scope, element) {
                            scope.regex = scope.urlRegex;

                            function init() {
                                scope.$watch('imageData.fileWidth', function(fileWidth) {
                                    // recalculate image factor
                                    // if filewidth > maxWidth => factor needs to be appropiate so imageData.width is equal to maxWidth
                                    // if filewidth < maxwidth then factor is equal to 1, so imageData.Width == fileWidth
                                    scope.maxImageScale = Number(scope.imageData.maxWidth) < Number(fileWidth) ? Number(scope.imageData.maxWidth) / Number(fileWidth) : 1;
                                    scope.imageScale = Number(scope.imageData.width) / Number(scope.imageData.fileWidth);
                                });

                                scope.$watch('editorMode', function(newValue, oldValue) {
                                    if (oldValue != newValue) {
                                        if (newValue) {

                                            scope.imageOverlay();

                                            if (scope.imageData.linkto && scope.imageData.linkto.indexOf("mailto:") == 0) {
                                                scope.selectedType = 'Email';
                                            } else if (scope.imageData.linkto && scope.imageData.linkto == "##_Profile_##") {
                                                scope.selectedType = 'Update Profile';
                                            } else {
                                                scope.selectedType = 'Website';
                                            }
                                            scope.ImageEditorChangeType();

                                            scope.onBeforeSend = onBeforeSend;
                                        }
                                    }
                                });

                                scope.$watch('imageScale', scope.onImageScaleChange);
                            }

                            function onBeforeSend() {
                                // This is special case to address scenario as described in TP #16486 
                                // User can hit Enter while in the width/height textbox, and it will submit the form without validating
                                // We will automatically update the dimension to make sure it still falls in the allowed range
                                var lastImgScale = scope.imageScale;
                                var imageScaleByWidth = (Number(scope.imageData.width) / Number(scope.imageData.fileWidth)).toFixed(2);
                                var imageScaleByHeight = (Number(scope.imageData.height) / Number(scope.imageData.fileHeight)).toFixed(2);
                                var minScale = 0.01; // same as slider's min range

                                if (imageScaleByHeight < minScale || imageScaleByWidth < minScale) {
                                    scope.imageScale = minScale;
                                } else if (imageScaleByHeight > scope.maxImageScale || imageScaleByWidth > scope.maxImageScale) {
                                    scope.imageScale = scope.maxImageScale;
                                } else if (imageScaleByWidth != lastImgScale) {
                                    scope.imageScale = imageScaleByWidth;
                                } else if (imageScaleByHeight != lastImgScale) {
                                    scope.imageScale = imageScaleByHeight;
                                }

                                // Enforce change
                                scope.onImageScaleChange(scope.imageScale, 0);
                            };

                            scope.ImageEditorChangeType = function() {
                                var updateProfileMergeCode = '##_Profile_##';

                                if (scope.selectedType == 'Update Profile') {
                                    scope.regex = /.*/;
                                    scope.imageData.linkto = updateProfileMergeCode;
                                } else if (scope.selectedType == 'Email') {
                                    scope.regex = scope.emailRegex;
                                } else {
                                    scope.regex = scope.urlRegex;
                                }

                                if (scope.selectedType != 'Update Profile' && scope.imageData.linkto == updateProfileMergeCode) {
                                    scope.imageData.linkto = '';
                                }
                            };

                            scope.imageOverlay = function() {
                                // Set initial overlay height, width and position
                                var overlay = element.find('.ui-widget-overlay');
                                overlay.height(scope.imageData.height > 250 ? 250 : scope.imageData.height).width(scope.imageData.width);
                                overlay.position({ my: 'left top', at: 'left top', of: element.find('#imagePreview img') });

                                // Set initial overlay buttons position
                                var imageButtons = element.find('#imageButtons');
                                imageButtons.position({ my: 'center center', at: 'center center', of: element.find('#imagePreview') });
                                imageButtons.hide();

                                // Binding of image hover
                                element.find('#imagePreview').hover(function() {
                                    var img = element.find('#imagePreview img');
                                    overlay.show(); // Show first before applying the position to prevent issues with jquery ui position()
                                    overlay.height(img.height() > 250 ? 250 : img.height()).width(img.width());
                                    overlay.position({ my: 'left top', at: 'left top', of: element.find('#imagePreview img') });

                                    imageButtons.show(); // Show first before applying the position to prevent issues with jquery ui position()
                                    imageButtons.position({ my: 'center center', at: 'center center', of: element.find('#imagePreview') });
                                }, function() {
                                    overlay.hide();
                                    imageButtons.hide();
                                });
                            };

                            scope.changeDimension = function(event) {
                                var lastImgScale = scope.imageScale;

                                if (event.target.name == 'width') {
                                    scope.imageScale = scope.imageData.width > scope.imageData.maxWidth ? scope.maxImageScale : scope.imageData.width / scope.imageData.fileWidth;

                                } else {
                                    scope.imageScale = (scope.imageData.height / scope.imageData.fileHeight) > scope.maxImageScale ? scope.maxImageScale : (scope.imageData.height / scope.imageData.fileHeight);
                                }

                                if (lastImgScale == scope.imageScale) {
                                    // even if the image scale doesnt change, update width and height
                                    scope.onImageScaleChange(lastImgScale, 0);
                                }
                            };

                            scope.onImageScaleChange = function(imageScale, oldValue) {
                                if (imageScale != oldValue) { 
                                    // image factor could change because a change on file width
                                    // or because a change on UI (slider, HxW textboxes)
                                    scope.imageData.width = parseInt(Number(imageScale * scope.imageData.fileWidth));
                                    scope.imageData.height = parseInt(Number(imageScale * scope.imageData.fileHeight));
                                }
                            };

                            scope.displayImageMapper = function() {
                                scope.editorMode = false;
                                scope.mapperMode = true;
                            };

                            init();
                        }
                    };
                    return directiveDefinition;
                }
            ])
            .directive('addAnAccountModal', [
                function() {
                    var dir = {
                        restrict: 'AC',
                        scope: {
                            showAccountModal: '@'
                        },
                        link: function(scope, element) {

                            scope.$watch('showAccountModal', function(newValue, oldValue) {
                                if (newValue != oldValue && newValue) {

                                }
                            });
                        }
                    };
                    return dir;
                }
            ])
            .directive('bootstrapModal', [
                function() {
                    var definitionObject = {
                        restrict: 'A',
                        replace: false,
                        transclude: true,
                        scope: {
                            modalTitle: '@',
                            dynamicModalTitle: '=',
                            modalContentType: '@',
                            confirmationButton: '@',
                            saveAndCloseButton: '@',
                            showSaveAndCloseButton: '=',
                            cancelButton: '@',
                            keepOpenOnCancel: '=',
                            keepOpenOnSave: '=',
                            showModal: '=',
                            modalContentUrl: '=',
                            closeCallback: '&',
                            confirmationCallback: '&',
                            cssClass: '@',
                            suppressX: '@',
                            confirmationButtonDisable: '@'
                        },
                        template: templates.filter('#bootstrapModal').html(),
                        link: function(scope, element) {

                            var modal, modalBody, modalBackDrop;

                            var init = function() {

                                modal = element.find('.bootstrap-modal');
                                modalBody = modal.find('.modal-body');

                                // add the modal to the html>body element
                                modalBackDrop = element.find('.modal-backdrop');
                                modalBackDrop.appendTo('body');

                                scope.$watch('dynamicModalTitle', function(newValue, oldValue) {
                                    if (newValue) {
                                        scope.modalTitle = scope.dynamicModalTitle;
                                    }
                                });

                                scope.$watch('showModal', function(newValue, oldValue) {
                                    if (newValue) {

                                        // if the content type is iframe, then set a watch to instantiate the iframe
                                        if (scope.modalContentType === 'iframe') {
                                            // if we have to show the modal, then create the content
                                            modalBody.empty();
                                            var iframe = $('<iframe class="frame" height="400" frameborder="0" border="0" src="' + scope.modalContentUrl + '"></iframe>');
                                            modalBody.html(iframe);
                                        }

                                        $('body').addClass('modal-open');
                                    } else {
                                        $('body').removeClass('modal-open');
                                    }
                                });
                            };

                            scope.resizeModal = function(width, height) {
                                var styleValue = '';
                                var frame = modal.find('.modal-body iframe');
                                if (width) {
                                    if (frame)
                                        frame.attr('width', width);
                                    width += 30;
                                    styleValue += 'width: ' + width + 'px !important;';
                                }

                                if (height) {
                                    if (frame)
                                        frame.attr('height', height + 2);
                                    height += 77;
                                    styleValue += 'height: ' + height + 'px !important;';
                                }

                                modal.find('.modal').attr('style', styleValue);
                            }

                            scope.confirm = function(obj) {
                                // TODO: Fix bug when press save and after save and close
                                // put disabled on save and close + save until confirm is done.
                                obj.target.blur(); // ensure :active state is not retained
                                if (angular.isFunction(scope.confirmationCallback)) {
                                    scope.confirmationCallback();
                                }
                            };

                            scope.cancel = function(obj) {
                                obj.target.blur(); // ensure :active state is not retained
                                scope.showModal = !!scope.keepOpenOnCancel;

                                if (angular.isFunction(scope.closeCallback)) {
                                    scope.closeCallback();
                                }
                            };

                            scope.saveAndClose = function (evt) {                                
                                scope.confirm(evt);

                                if (!scope.keepOpenOnSave) {
                                    scope.cancel(evt);
                                }                                
                            }

                            var cleanup = function() {
                                modalBackDrop.remove();
                                modal.remove();
                            };

                            scope.$on('$destroy', function() {
                                cleanup();
                            });

                            init();
                        }
                    };
                    return definitionObject;
                }
            ])
            .directive('addAnAccountModal', [
                function() {
                    var dir = {
                        restrict: 'AC',
                        scope: {
                            showAccountModal: '@'
                        },
                        link: function(scope, element) {

                            scope.$watch('showAccountModal', function(newValue, oldValue) {
                                if (newValue != oldValue && newValue) {

                                }
                            });
                        }
                    };
                    return dir;
                }
            ])
            .directive('finalizedMessage', [
                '$location',
                '$window',
                function($location, $window) {
                    var directiveObject = {
                        restrict: 'A',
                        scope: {
                            showFinalizedAlert: '='
                        },
                        replace: false,
                        template: templates.filter('#finalizedMessageModal').html(),
                        //templateUrl: '/memberpages/NewEditor/Partials/Directives/finalizedMessageModal.htm',
                        link: function link(scope, element) {
                            scope.exit = function() {
                                $window.location.href = 'http://' + $location.host() + ':' + $location.port() + '/MemberPages/SearchMailings.aspx?Mode=Edit&Type=Postcard&sk=' + configuration.sessionKey;
                            };
                        }
                    };
                    return directiveObject;
                }
            ])
            .directive('alertModal', [
                function() {
                    var definitionObject = {
                        restrict: 'A',
                        replace: false,
                        transclude: true,
                        scope: {
                            alertTitle: '@',
                            confirmationButton: '@',
                            cancelButton: '@',
                            showAlert: '=',
                            closeCallback: '&',
                            confirmationCallback: '&'
                        },
                        template: templates.filter('#alertModal').html(),
                        //templateUrl: '/memberpages/NewEditor/Partials/Directives/alertModal.htm',
                        link: function(scope, element) {

                            var alert;

                            var init = function() {

                                alert = element.find('.alert');

                                // add the modal to the html>body element
                                alert.appendTo('body');
                                element.find('.modal-backdrop').appendTo('body');
                            };

                            scope.confirm = function() {
                                if (angular.isFunction(scope.confirmationCallback)) {
                                    scope.confirmationCallback();
                                }
                            };

                            scope.cancel = function() {
                                scope.showAlert = false;

                                if (angular.isFunction(scope.closeCallback)) {
                                    scope.closeCallback();
                                }
                            };

                            init();
                        }
                    };
                    return definitionObject;
                }
            ])
            .directive('focus', function() {
                return function(scope, element, attrs) {
                    attrs.$observe('focus', function(newValue) {
                        newValue === 'true' && element[0].focus();
                    });
                };
            })
            .directive('enter', [
                function() {
                    var definitionObject = {
                        restrict: 'A',
                        replace: false,
                        link: function(scope, element) {
                            var enter = function(e) {
                                if (e.which == 13) {
                                    return false; // do nothing
                                }
                                return true;
                            };

                            element.bind('keyup', enter);
                        }
                    };
                    return definitionObject;
                }
            ])
            .directive('urlManager', [
                '$timeout',
                '$compile',
                '$rootScope',
                'clientService',
                'storeService',
                '$location',
                'editorEventsChannelService',
                function(timeout, compile, $rootScope, clientService, storeService, $location, editorEvents) {
                    var directiveDefinitionObject = {
                        restrict: 'A',
                        scope: {},
                        template: templates.filter('#urlManager').html(),
                        //templateUrl: '/memberpages/NewEditor/Partials/Directives/urlManager.htm',
                        replace: false,
                        link: function(scope, element) {
                            scope.data = {
                                updateAllLoctions: false,
                                makeDefault: false,
                                hasMultipleStores: true,
                                showMore: false,
                                iframeUrl: 'http://' + $location.host() + ':' + $location.port() + '/MemberPages/WebPagesLinksModal.aspx?sk=' + configuration.sessionKey
                            };

                            var formModes = {
                                formMode: 'formMode',
                                legendMode: 'legendMode',
                                webPagesLink: 'webPagesLink'
                            };

                            scope.urls = [
                                { name: 'Facebook', alias: 'FacebookURL', alwaysShow: true },
                                { name: 'Twitter', alias: 'TwitterURL', alwaysShow: true },
                                { name: 'Website', alias: 'WebsiteURL', alwaysShow: true },
                                { name: 'Instagram', alias: 'InstagramURL', alwaysShow: true },
                                { name: 'Google+', alias: 'GooglePlusURL', alwaysShow: false },
                                { name: 'Yelp', alias: 'YelpURL', alwaysShow: false },
                                { name: 'Foursquare', alias: 'FoursquareURL', alwaysShow: false },
                                { name: 'Trip Advisor', alias: 'TripAdvisorURL', alwaysShow: false },
                                { name: 'Ordering', alias: 'OrderingURL', alwaysShow: false },
                                { name: 'Blog', alias: 'BlogURL', alwaysShow: false },
                                { name: 'Pinterest', alias: 'PinterestURL', alwaysShow: false },
                                { name: 'Custom A', alias: 'CustomAURL', alwaysShow: false },
                                { name: 'Custom B', alias: 'CustomBURL', alwaysShow: false }
                            ];

                            scope.manageWebLinks = function() {
                                scope.formMode = formModes.webPagesLink;
                            };

                            scope.validateLink = function validateLink(link) {
                                link.errorMessage = '';

                                if (link.included && !link.url) {
                                    link.errorMessage = 'Oops, please provide URL.';
                                }

                                if (link.url) {
                                    if (link.url.toLowerCase().indexOf('http') != 0) {
                                        link.url = 'http://' + link.url;
                                    }

                                    var urlRegex = /^((https?|s?ftp):\/\/)(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)|\/|\?)*)?$/i;

                                    if (!urlRegex.test(link.url)) {
                                        link.errorMessage = 'Oops, this URL is not valid.';
                                    } else if (link.url.indexOf('?') != link.url.lastIndexOf('?')) {
                                        if (link.alias == 'FacebookURL') {
                                            link.errorMessage = 'Oops, this Facebook URL is not valid.  Try using the friendly URL of the Facebook page - ex: https://www.facebook.com/mybistrojen';
                                        } else {
                                            link.errorMessage = 'Oops, this URL is not valid.';
                                        }
                                    }
                                }
                            };

                            scope.includedLinkCount = function includedLinkCount() {
                                var count = 0;
                                for (var i = 0; i < scope.urls.length; i++) {
                                    if (scope.urls[i]['included']) {
                                        count++;
                                    }
                                }
                                return count++;
                            };

                            scope.show = function(data) {
                                scope.showUrlManager = true;
                                scope.formMode = formModes.formMode;

                                if (data.length == scope.urls.length) {
                                    for (var i = 0; i < scope.urls.length; i++) {
                                        scope.urls[i]['originalIncluded'] = scope.urls[i]['included'] = data[i]['included'] == 'true';
                                    }
                                }
                            };

                            scope.$watch('formMode', function() {
                                scope.modalTitle = scope.formMode === formModes.formMode ? 'Enter URLs' : scope.formMode === formModes.legendMode ? 'Are You Sure?' : 'Web Pages Link';
                                scope.keepOpenOnCancel = scope.formMode !== formModes.formMode;
                            });

                            scope.isValid = function isValid() {
                                var count = 0;
                                var valid = true;
                                for (var i = 0; i < scope.urls.length; i++) {
                                    scope.validateLink(scope.urls[i]);
                                    if (scope.urls[i]['included']) {
                                        count++;
                                    }
                                    if (scope.urls[i]['errorMessage']) {
                                        valid = false;
                                        if (!scope.urls[i]['alwaysShow']) {
                                            scope.data.showMore = true;
                                        }
                                    }
                                }

                                if (count == 0) {
                                    scope.validationMessage = 'Oops, you must check a box to include at least one URL.';
                                } else {
                                    scope.validationMessage = '';
                                }

                                return valid && count > 0;
                            };

                            scope.saveURLs = function() {

                                if (scope.formMode === formModes.webPagesLink) {
                                    loadStores();
                                    scope.formMode = formModes.formMode;
                                    return;
                                }

                                if (!scope.isValid()) {
                                    return;
                                }

                                if (scope.formMode === formModes.formMode && scope.data.updateAllLocations) {
                                    scope.formMode = formModes.legendMode;
                                } else {

                                    var includeByDefaultData = {};
                                    var storeUrlData = { Id: scope.store.Id };
                                    var storeUrlchanged = false;

                                    // Update originalUrls
                                    for (var i = 0; i < scope.urls.length; i++) {
                                        var link = scope.urls[i];
                                        if (link['originalUrl'] != link['url']) {
                                            storeUrlchanged = true;
                                        }
                                        includeByDefaultData['Include' + link['alias']] = link['included'];

                                        storeUrlData[link['alias']] = link['url'];
                                        link['originalUrl'] = link['url'];
                                        link['originalIncluded'] = link['included'];
                                    }

                                    if (storeUrlchanged || scope.data.updateAllLocations) {
                                        storeService.updateStores(storeUrlData, scope.data.updateAllLocations);
                                    }

                                    if (scope.data.makeDefault) {
                                        includeByDefaultData.ForSettings = true;
                                        clientService.updateClient(includeByDefaultData);
                                    }

                                    $rootScope.$broadcast('SOCIAL_FOLLOW_CHANGED',
                                    {
                                        data: includeByDefaultData
                                    });

                                    configuration.hasWebpageLinks = true;
                                    scope.showUrlManager = false;
                                    scope.data.updateAllLocations = false;
                                    scope.data.makeDefault = false;
                                }
                            }

                            scope.restoreURLs = function() {

                                if (scope.formMode === formModes.formMode) {
                                    for (var i = 0; i < scope.urls.length; i++) {
                                        var link = scope.urls[i];
                                        link['url'] = link['originalUrl'];
                                        link['included'] = link['originalIncluded'];
                                        scope.validateLink(link);
                                    }

                                    scope.data.updateAllLocations = false;
                                    scope.data.makeDefault = false;
                                }
                                scope.formMode = formModes.formMode;
                            }


                            var loadStores = function loadStores(callback) {
                                storeService.getStores({}, function(data) {

                                    scope.store = data[0];
                                    scope.data.hasMultipleStores = data.length > 1;

                                    for (var i = 0; i < scope.urls.length; i++) {
                                        var link = scope.urls[i];
                                        link['originalUrl'] = link['url'] = scope.store[link['alias']];
                                    }

                                    if (angular.isFunction(callback)) {
                                        callback();
                                    }
                                });
                            }

                            var init = function init() {
                                loadStores();
                            }

                            scope.$watch('showUrlManager', function(show) {
                                if (show && !scope.store) {
                                    init();
                                }
                            });

                            editorEvents.publicScopeLoaded('URL_MANAGER_READY', scope);
                        }
                    };

                    return directiveDefinitionObject;
                }
            ])
            .directive('buttonModal', [
                '$rootScope', 'editorEventsChannelService',
                function($rootScope, editorEvents) {
                    var definitionObject = {
                        restrict: 'A',
                        replace: false,
                        transclude: false,
                        scope: {},
                        template: templates.filter('#buttonModal').html(),
                        //templateUrl: '/memberpages/NewEditor/Partials/Directives/buttonModal.htm',
                        link: function(scope, element) {
                            scope.data = {
                                color: '#A72100',
                                buildYourOwn: false,
                                styleSelected: 'red',
                                r: null,
                                g: null,
                                b: null,
                                defaultColors: ['#A72100', '#82868A', '#1E63AB'],
                                makeDefaultColor: false
                            };

                            var init = function() {
                                editorEvents.publicScopeLoaded('BUTTON_EDITOR_INIT', scope);
                            };

                            var convertToHex = function(r, g, b) {
                                try {
                                    var hex = '#';
                                    if (r.toString(16) === '0') {
                                        hex += '00';
                                    } else {
                                        hex += r.toString(16);
                                    }

                                    if (g.toString(16) === '0') {
                                        hex += '00';
                                    } else {
                                        hex += g.toString(16);
                                    }

                                    if (b.toString(16) === '0') {
                                        hex += '00';
                                    } else {
                                        hex += b.toString(16);
                                    }
                                    return hex;
                                } catch (ex) {

                                }
                            };

                            var convertToRGB = function(hex) {
                                try {
                                    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                                    return {
                                        r: parseInt(result[1], 16),
                                        g: parseInt(result[2], 16),
                                        b: parseInt(result[3], 16)
                                    };
                                } catch (ex) {

                                }
                            };

                            scope.modalSaveCallback = function() {
                                scope.showButtonModal = false;

                                if (scope.data.styleSelected !== 'buildYourOwn') {
                                    scope.data.color = scope.data.styleSelected;
                                }

                                if (angular.isFunction(scope.saveCallback)) {
                                    scope.saveCallback(scope.data);
                                }
                            };

                            scope.setup = function(options) {
                                scope.data.color = options.color;
                                scope.saveCallback = options.callback;

                                var isCustomColor = true;
                                for (var i = 0; i < scope.data.defaultColors.length; i++) {
                                    if (scope.data.defaultColors[i] == scope.data.color) {
                                        isCustomColor = false;
                                    }
                                }

                                scope.data.styleSelected = isCustomColor ? 'buildYourOwn' : scope.data.color;
                            };

                            scope.show = function() {
                                scope.showButtonModal = true;
                            };

                            scope.$watch('data.r+data.g+data.b', function() {
                                scope.data.color = convertToHex(parseInt(scope.data.r), parseInt(scope.data.g), parseInt(scope.data.b));
                            });

                            scope.$watch('data.color', function() {
                                var rgb = convertToRGB(scope.data.color);
                                try {
                                    scope.data.r = rgb.r;
                                    scope.data.g = rgb.g;
                                    scope.data.b = rgb.b;
                                } catch (ex) {

                                }
                            });

                            init();
                        }
                    };
                    return definitionObject;
                }
            ])
            .directive('farbtastic', [
                '$rootScope',
                function(rootScope) {
                    return {
                        restrict: 'A',
                        require: '^ngModel',
                        link: function($scope, $element, $attrs, ngModel) {
                            var farbtastic;

                            var init = function init() {
                                ngModel.$render = function() {
                                    if (!farbtastic) {
                                        farbtastic = new Farbtastic($element, function(color) {
                                            rootScope.safeApply(function() {
                                                ngModel.$setViewValue(color);
                                            });
                                        }, {
                                            color: ngModel.$viewValue,
                                            width: 150
                                        });
                                    } else {
                                        farbtastic.setColor(ngModel.$viewValue);
                                    }
                                };
                            };

                            if (!window.Farbtastic) {
                                require(['farbtastic'], function() {
                                    init();
                                });
                            } else {
                                init();
                            }
                        }
                    };
                }
            ])
            .directive('socialFollowStyleModal', [
                'editorEventsChannelService',
                function(editorEvents) {
                    var definitionObject = {
                        restrict: 'A',
                        replace: false,
                        transclude: false,
                        scope: {},
                        template: templates.filter('#socialFollowStyleModal').html(),
                        link: function(scope, element) {
                            var rootUrl = '/Images/ContentBlocks/SocialFollow';

                            scope.data = {
                                defaultIconSets: ['ColorSq', 'ColorCir', 'GreySq', 'GreyCir'],
                                supportedUrls: ['Facebook', 'Twitter', 'Website', 'Instagram', 'GooglePlus', 'Yelp', 'Foursquare', 'TripAdvisor', 'Ordering', 'Blog', 'Pinterest', 'CustomA', 'CustomB'],
                                setSelected: 'ColorSq',
                                makeDefaultIconSet: false
                            };

                            var init = function() {
                                editorEvents.publicScopeLoaded('SOCIAL_STYLE_INIT', scope);
                            };

                            scope.modalSaveCallback = function() {
                                scope.showSocialFollowStyleModal = false;

                                if (angular.isFunction(scope.saveCallback)) {
                                    scope.saveCallback(scope.data);
                                }
                            };

                            scope.setup = function(options) {
                                scope.saveCallback = options.callback;
                                scope.data.setSelected = options.setSelected;
                            };

                            scope.show = function() {
                                scope.showSocialFollowStyleModal = true;
                            };

                            init();
                        }
                    };
                    return definitionObject;
                }
            ])
            .directive('multiColumn', [
                'editorEventsChannelService',
                '$compile',
                function(editorEvents, compile) {
                    var directiveDefinitionObject = {
                        restrict: 'A',
                        scope: '=',
                        replace: false,
                        transclude: false,
                        template: '',
                        link: function(scope, element) {
                            var actionType = 'Multiple Columns Change',
                                parentContentBlock;

                            parentContentBlock = element.parents('.' + configuration.contentBlockClass + ':eq(0)');

                            var performAction = function(actionDescriptor, isUndo) {
                                // This event is fired a lot of times because of the shared scope I think (scope: '=')
                                // so we need to identify if the contentblock is the correct one before doing the undo/redo
                                if (parentContentBlock.data("id") && actionDescriptor.ContentBlockId == parentContentBlock.data("id")) {
                                    if (isUndo) {
                                        parentContentBlock = element.parents('.' + configuration.contentBlockClass + ':eq(0)');
                                        parentContentBlock.replaceWith(compile(actionDescriptor.CurrentValue.value)(scope));
                                    } else {
                                        element.find('td:eq(' + actionDescriptor.CurrentValue.position + ')').remove();
                                    }
                                }
                            };

                            // undo/redo events
                            editorEvents.onPerformUndoRedo(scope, performAction);

                            // We receive the specific contentBlock that triggered the event because of shared scope in this directive.
                            // we can't use element because it references to the last instance of this directive.
                            scope.destroyColumnParent = function(index, parentBlock) {
                                var column = parentBlock.find('[multi-column] td:eq(' + index + ')');
                                var nextColumn = column.next().find('[editable]');
                                scope.editorId = parentBlock.data('id');

                                var cleanContentBlock = angular.element('.' + configuration.canvasClass).scope().cleanContentBlockMarkup(parentBlock, false);

                                var currentValue = {
                                    value: $.fn.outerHTML(cleanContentBlock),
                                    position: index
                                };

                                // Find next column and append menubar so it's not removed from the DOM
                                if (nextColumn.length) {
                                    var menubar = column.find('.' + configuration.overlayMenuBarClass);
                                    menubar.appendTo(nextColumn);
                                }

                                // Trigger destroy of entire content block if only one image remain
                                if (parentBlock.find('img[data-file-width]').length <= 1) {
                                    parentBlock.find('.' + configuration.overlayMenuBarClass + ' .delete').click();
                                } else {
                                    column.remove();
                                    parentBlock.find('[editable]:last').scope().resizeMultiColumn();
                                }

                                editorEvents.editorContentChanged(actionType, scope.editorId, scope.editorId, currentValue, currentValue);
                            };
                        }
                    };
                    return directiveDefinitionObject;
                }
            ])
            .directive('columnDelete', [
                'editorEventsChannelService',
                '$compile',
                function(editorEvents, compile) {
                    var directiveDefinitionObject = {
                        restrict: 'A',
                        scope: {},
                        replace: true,
                        transclude: false,
                        template: '<div class="deleteColumnHoverMenuBar"><a href="javascript:;" title="Delete" data-ng-click="destroyColumn()" class="btn btn-inverse text-center"><i class="icon-trash icon-white"></i></a></div>',
                        link: function(scope, element) {
                            scope.destroyColumn = function() {
                                var parentContentBlock = element.parents("." + configuration.contentBlockClass + ":eq(0)");
                                var parentColumn = element.parents("td:eq(0)");
                                var index = parentContentBlock.find('tbody td').index(parentColumn);

                                // Trigger destroy from multi-column parent directive.
                                // This is dirty because if we make multi-column directive with isolated scope we can't access it
                                parentContentBlock.find('[multi-column]').scope().destroyColumnParent(index, parentContentBlock);
                            };
                        }
                    };
                    return directiveDefinitionObject;
                }
            ])
            .directive('htmlEditorModal', [
                'editorEventsChannelService',
                function(editorEvents) {
                    var definitionObject = {
                        restrict: 'A',
                        replace: false,
                        transclude: true,
                        scope: {},
                        template: templates.filter('#htmlEditorModal').html(),
                        link: function(scope, element) {

                            scope.data = {
                                html: ''
                            };

                            function save() {
                                scope.showHtmlEditorModal = false;
                                scope.data.html = scope.htmlEditor.getData();

                                if (angular.isFunction(scope.saveCallback)) {
                                    scope.saveCallback(scope.data);
                                }
                            }

                            function setup(options) {
                                scope.saveCallback = options.callback;
                                scope.data.html = options.html || '';
                            }

                            function show() {
                                scope.showHtmlEditorModal = true;
                                scope.htmlEditor.show(scope.data.html);
                            }

                            editorEvents.publicScopeLoaded('HTML_EDITOR_INIT', scope);

                            angular.extend(scope, {
                                show: show,
                                setup: setup,
                                modalSaveCallback: save
                            });
                        }
                    };
                    return definitionObject;
                }
            ])
            .directive('htmlEditable', [
                function() {
                    var definitionObject = {
                        restrict: 'A',
                        link: function htmlEditableLink(scope, element) {
                            var instance;
                            var changeCallback;
                         
                            function applyContentFiltering(editor, allowedHtml) {
                                var filter = new CKEDITOR.filter(allowedHtml);
                                var fragment = CKEDITOR.htmlParser.fragment.fromHtml(editor.getData());
                                var writer = new CKEDITOR.htmlParser.basicWriter();

                                filter.applyTo(fragment);
                                fragment.writeHtml(writer);

                                return writer.getHtml();
                            }

                            function getData() {
                                var filteredHtml = applyContentFiltering(instance, configuration.allowedHtml);
                                instance.setData(filteredHtml);
                                return instance.getData();
                            }

                            function show(htmlContent) {
                                instance.setData(htmlContent);
                                window.requestAnimFrame(function () {
                                    instance.setMode("wysiwyg", function () {
                                        instance.setMode("source", function () { });
                                    });
                                });
                            }

                            function setupEditor() {
                                instance = CKEDITOR.replace(element[0], {
                                    customConfig: '../ckeditor/config_he.js',
                                    removePlugins: 'toolbar',
                                    allowedContent: true,
                                    extraAllowedContent: true
                                });

                                instance.on('instanceReady', function(ev) {
                                    instance.on('focus', instance.focus);
                                    instance.focus();
                                });

                                instance.on('change', onContentChanged);
                            }

                            function onContentChanged(evt) {
                                if (angular.isFunction(changeCallback)) {
                                    changeCallback(evt);
                                }
                            }

                            function setCallback(callback) {
                                changeCallback = callback;
                            }

                            function init() {
                                if (!instance) {
                                    setupEditor();
                                } else {
                                    instance.focus();
                                }
                            }

                            if (!window.CKEDITOR) {
                                require(['ckeditor'], function() {
                                    init();
                                });
                            } else {
                                init();
                            }

                            angular.extend(scope.$parent, {
                                htmlEditor: {
                                    show: show,
                                    getData: getData,
                                    setOnChangeCallback: setCallback
                                }
                            });
                        }
                    };
                    return definitionObject;
                }
            ])
            .directive('bootstrapTour', [
                function() {
                    var directiveDefinitionObject = {
                        restrict: 'A',
                        scope: {
                            updateConfiguration: '&',
                            messageReady: '='
                        },
                        replace: false,
                        link: function(scope, element) {
                            var watchToken,
                                editorTour;

                            watchToken = scope.$watch('messageReady', function() {
                                if (scope.messageReady == 1) {
                                    watchToken();
                                    init();
                                }
                            });

                            scope.$on('$destroy', function() {
                                $('.tour').remove();
                            });

                            var init = function init() {
                                if (!configuration.showNewEditorTour) {
                                    return;
                                }

                                editorTour = new Tour({
                                    name: 'editor-tour',
                                    steps: [
                                        {
                                            element: '.layoutTable',
                                            title: '<b>Welcome to the New Drag and Drop Editor!</b>',
                                            content: 'Edit your email by clicking in the text and image content blocks  below.',
                                            placement: 'top'
                                        },
                                        {
                                            element: '.left-sidebar',
                                            title: '<b>Drag and Drop</b>',
                                            content: 'To add more content to your email, drag content blocks from the column on the left and drop them into your email.',
                                            placement: 'top'
                                        },
                                        {
                                            element: '[editable]:first',
                                            title: '<b>Move, Duplicate or Delete</b>',
                                            content: 'Hover over a content block and use the controls to move, duplicate or delete content.',
                                            placement: 'bottom'
                                        }
                                    ],
                                    container: 'body',
                                    template: '<div class="popover tour">' +
                                        '<div class="arrow"></div>' +
                                        '<h3 class="popover-title"></h3>' +
                                        '<div class="popover-content"></div>' +
                                        '<div class="popover-navigation">' +
                                        '<button class="btn btn-default" data-role="prev">« Prev</button>' +
                                        '<button class="btn btn-default" data-role="next">Next »</button>' +
                                        '<button class="btn btn-default" data-role="end">End tour</button>' +
                                        '<label class="pull-right top5"><input id="cbDontShow" type="checkbox"/> Don\'t show again</label>' +
                                        '</div>' +
                                        '</div>',
                                    keyboard: true,
                                    storage: false,
                                    backdrop: false,
                                    onHide: function(tour) {
                                        $('#cbDontShow').prop('checked') == true ? configuration.showNewEditorTour = false : configuration.showNewEditorTour = true;
                                    },
                                    onEnd: function(tour) {
                                        scope.$root.safeApply(function() {
                                            scope.updateConfiguration();
                                        });
                                    }
                                });

                                editorTour.init();
                                editorTour.start();
                            };
                        }
                    };
                    return directiveDefinitionObject;
                }
            ]).
            directive('htmlVersionModal', [
                '$compile',
                function(compile) {
                    var definitionObject = {
                        restrict: 'A',
                        replace: false,
                        transclude: false,
                        scope: {
                            showHtmlVersionModal: '=',
                            getEditableContent: '&',
                            designHtml: '='
                        },
                        template: templates.filter('#htmlVersionModal').html(),
                        link: function (scope, element) {
                            
                            scope.data = {};
                            scope.showHtmlVersionModal = false;

                            function getDesignHtml() {
                                var canvas = $('#editorCanvas').clone();
                                canvas.removeAttr('data-ng-bind-html')
                                    .find('.layoutTable')
                                    .parent()
                                    .append('<div data-ng-bind-html="data.html"></div>')
                                    .end()
                                    .remove();

                                scope.designHtml = compile(canvas)(scope);
                            }

                            function save() {
                                try {

                                    var editionResult = $(scope.htmlEditor.getData());

                                    // searchs for <tr> with no ContentBlock class and convert its content into htmlcontentblock
                                    editionResult.find(' > tbody > tr').each(function htmlVersionRow(i, tr) {
                                        tr = $(tr);
                                        if (!tr.hasClass(configuration.contentBlockClass)) {
                                             var htmlContentBlock = $('<tr class="' + configuration.contentBlockClass + '"><td data-html-editor="true" editable="true"></td></tr>');

                                             tr.find('td').each(function htmlVersionCell(j, rowCell) {
                                                 htmlContentBlock.find('td').append($(rowCell).html());
                                             });

                                             tr.replaceWith(htmlContentBlock);
                                        }
                                    });
                                
                                    var editor = compile(editionResult.find(' > tbody > tr'))(scope.$parent);
                                    $('#editorCanvas').find('.layoutTable > tbody').empty().append(editor);

                                    // to get all the fancy line breaks, and whitespaces :/ 
                                    scope.htmlEditor.show(scope.data.html);

                                } catch (err) {
                                    alert('Oops, there were some errors in the HTML and the latest changes cannot be saved.  Please look for and fix the errors and save again.');
                                }
                            }

                            function getContentHtml() {
                                var data = scope.getEditableContent();
                                data.html = data.html.replace(/href/g, 'href="javascript:;" data-editor-url');
                                scope.data.html = '<table width="95%" align="center" class="htmlVersionLayoutTable"><tbody style="display:table-row-group;">' + data.html + '</tbody></table>';
                            }

                            function init() {
                                scope.$watch('showHtmlVersionModal', function showWatcher(newValue, oldValue) {
                                    if (oldValue !== newValue && newValue) {
                                        getContentHtml();
                                        getDesignHtml();
                                        scope.htmlEditor.show(scope.data.html);
                                    }
                                });

                                scope.htmlEditor.setOnChangeCallback(function (evt) {
                                    scope.$root.safeApply(function() {
                                        scope.data.html = evt.editor.getData();
                                    });
                                });
                            }

                            init();

                            angular.extend(scope, {
                               save:save
                            });
                        }
                    };

                    return definitionObject;
                }
            ]);
    }
);