define('controllers', ['angular', 'configuration']
    , function (angular, configuration) {
        'use strict';

        angular.module('editor.controllers', [])
            .controller('SelectDesignCtrl', ['$scope',
                '$location',
                '$routeParams',
                'messageService',
                'editorEventsChannelService',
                function selectDesignCtrl(scope, location, routeParams, messageService, editorEvents) {

                    scope.pageIndex = 0;
                    scope.pageSize = 20;
                    scope.pageCount = 15;
                    scope.parentId = '';
                    scope.searchText = '';
                    scope.preselectedDesign = parseInt(routeParams.designId);
                    scope.messageHeader = {
                        name: '',
                        design: 0
                    };

                    var saveOptions = {
                        generatePreview: false,
                        forceSave: true,
                        updatesContent: false
                    };

                    function init() {
                        if (!scope.preselectedDesign) {
                            getDesigns();
                        }

                        if (location.path().indexOf('build') >= 0 && parseInt(routeParams.type) && parseInt(routeParams.category)) {
                            messageService.setHeader({ name: routeParams.name, recurringTypeId: routeParams.type, isBuildYourOwn: true });
                            scope.selectedSubFolderId = routeParams.category;

                            messageService.getHeader(function (data) {
                                scope.isBuildYourOwn = data.isBuildYourOwn;
                            });

                            if (scope.isBuildYourOwn) {
                                editorEvents.changeStepText('Make Active', 3);
                            }
                        }

                        $('#searchText').bind('keyup', enter);
                        editorEvents.onUserSaveContent(scope, userSave);
                    };

                    function userSave() {
                        messageService.save(saveOptions, function userSaveCallback() {
                            location.url(configuration.steps[1].url);
                        });
                    };

                    function getDesigns() {
                        messageService.getDesigns({ pageIndex: scope.pageIndex, pageSize: scope.pageSize, parentId: scope.parentId == -2 ? null : scope.parentId, searchText: scope.searchText }, function getDesignsCallback(data) {
                            scope.designs = data.Rows;
                            var pageCount = Math.ceil(data.TotalRowCount / scope.pageSize);

                            if (pageCount == 0) {
                                pageCount = 1;
                            }

                            scope.pageCount = pageCount;
                        });
                    };

                    scope.updateParentId = function updateParentId(selected, searchText) {
                        scope.pageIndex = 0;
                        scope.parentId = selected;
                        scope.searchText = searchText;
                        getDesigns();
                    };

                    scope.updatePageSize = function updatePageSize(pageSize) {
                        scope.pageIndex = 0;
                        scope.pageSize = pageSize;
                        getDesigns();
                    };

                    scope.control = {};

                    function enter(e) {
                        if (e.which == 13) {
                            scope.searchDesigns();
                            scope.$digest();
                        }
                        return true;
                    };

                    scope.searchDesigns = function searchDesigns() {
                        scope.pageIndex = 0;
                        scope.control.getFolders();
                        getDesigns();
                    };

                    scope.nextPage = function nextPage() {
                        scope.pageIndex++;
                        getDesigns();
                    };

                    scope.prevPage = function prevPage() {
                        scope.pageIndex--;
                        getDesigns();
                    };

                    scope.setName = function setName() {
                        if (scope.preselectedDesign) {
                            scope.messageHeader.design = scope.preselectedDesign;
                            messageService.setHeader(scope.messageHeader);
                            messageService.save(saveOptions, function setNameCallback() {
                                location.url(configuration.steps[2].url);
                            });
                        }
                        else {
                            messageService.setHeader(scope.messageHeader);
                        }
                    };

                    scope.selectDesign = function selectDesign(designId) {
                        scope.messageHeader.design = designId;

                        messageService.setHeader(scope.messageHeader);
                        messageService.save(saveOptions, function selectDesignCallback() {
                            location.url(configuration.steps[1].url);
                        });
                    };

                    scope.toggleFavorite = function toggleFavorite(design) {
                        if (design.favorite) {
                            messageService.removeFavoriteDesign({ designId: design.id }, function () {
                                // This needs to be done as a callback because it needs to wait for the call to finish before refreshing
                                scope.searchDesigns();
                            });
                        } else {
                            messageService.addFavoriteDesign({ designId: design.id }, function () {
                                // This needs to be done as a callback because it needs to wait for the call to finish before refreshing
                                scope.searchDesigns();
                            });
                        }
                    };

                    init();
                }
            ])
            .controller('SelectLayoutCtrl', ['$scope',
                'messageService',
                '$location',
                function selectLayoutCtrl(scope, messageService, location) {

                    scope.showSelectLayoutModal = true;
                    scope.layouts = messageService.getLayouts();
                    scope.selectedLayout = null;

                    scope.closeCallback = function closeCallback() {
                        scope.showSelectLayoutModal = false;
                        location.url(configuration.steps[0].url);
                    };

                    scope.confirmationCallback = function confirmationCallback() {
                        for (var layout in scope.layouts) {
                            if (scope.layouts[layout].selected) {
                                scope.selectedLayout = scope.layouts[layout];
                            }
                        }

                        messageService.setHeader({ layout: scope.selectedLayout.id });
                        scope.showSelectLayoutModal = false;

                        messageService.save({ generatePreview: false, forceSave: true, updatesContent: false }, function confirmationSaveCallback() {
                            location.url(configuration.steps[2].url);
                        });
                    };

                    scope.selectLayout = function selectLayout(index) {
                        angular.forEach(scope.layouts, function (value, key) {
                            scope.layouts[key].selected = false;
                        });

                        scope.layouts[index].selected = true;
                        scope.selectedLayout = scope.layouts[index];
                    };
                }
            ])
            .controller('EditContentCtrl', ['$scope',
                'messageService',
                'userChangeService',
                'editorEventsChannelService',
                '$location',
                '$sce',
                '$compile',
                '$routeParams',
                'dataContext',
                function editContentCtrl(scope, messageService, userChangeService, editorEvents, $location, $sce, compile, $routeParams, dc) {

                    editorEvents.resetScopes();

                    var autoSaveInitialized = false;
                    scope.undoEnabled = false;
                    scope.redoEnabled = false;
                    scope.submitted = false;
                    scope.alreadyValidated = false;
                    scope.enableViewOnline = true;
                    scope.showJoinPageText = false;
                    
                    scope.getContentBlockDefaultHtml = function getContentBlockDefaultHtml(attr) {
                        var result = '';
                        for (var i = 0; i < scope.layoutContentBlocks.length; i++) {
                            var elem = scope.layoutContentBlocks[i];
                            if (elem.html.indexOf(attr) > -1) {
                                result = $(elem.html).find('[' + attr + ']').html();
                                break;
                            }
                        }

                        return result;
                    };

                    function init() {

                        var currentPath = $location.path().toLowerCase();
                        var isAutoLoyalty = currentPath.indexOf('canned') >= 0 || currentPath.indexOf('build') >= 0 || currentPath.indexOf('loop') >= 0;

                        // disable View Online Link if AutoLoyalty
                        scope.enableViewOnline = !isAutoLoyalty;


                        // get message data like message name/subject/from
                        scope.messageData = messageService.getHeader(function messageDataCallback(msgData) {
                            /* Cases
                                1. Edit Message by Id
                                2. Create Message with defaults
                                3. Canned Content
                            */

                            // 1. Edit Message by Id
                            if ($location.path().indexOf('editcontent') >= 0 && (parseInt($routeParams.messageId) || msgData.id)) {
                                // the user is coming from step2 or is coming from "emails admin page"

                                // if the user is not coming from edit emails page (or any other page other than editor flow)
                                // then: request the message without details
                                messageService.get({ withDetails: !msgData.id, id: parseInt($routeParams.messageId) }, function getCallback(data) {
                                    if (!msgData.id) {
                                        // we call again for the msg header bc in the first call was empty
                                        scope.messageData = messageService.getHeader(function getHeaderCallback(newMsgData) {
                                            scope.layoutContentBlocks = messageService.getContentBlocks({ designId: newMsgData.design });
                                        });
                                    } else {
                                        scope.layoutContentBlocks = messageService.getContentBlocks({ designId: msgData.design });
                                    }
                                    //we show the Join Page Text lbl so the user can change it.
                                    if (data.RecurringTypeId == 1) {
                                        messageService.getJoinPageText(function (data) {
                                            scope.joinPageText = data.Text;
                                            scope.showJoinPageText = true;
                                        });
                                        
                                    }
                                    
                                    compileMessageHtml(data);
                                });

                                if ($location.path().indexOf('loop') >= 0) {
                                    messageService.setHeader({ isBuildYourOwn: true });
                                    editorEvents.changeStepText('Make Active', 3);
                                }
                            }


                            // 2. Create Message with defaults
                            if ($location.path().indexOf('editcontent') >= 0 && !parseInt($routeParams.messageId) && !msgData.id) {
                                // the user is trying to create a new message with defaults
                                // create message with design/layout selected
                                messageService.add(compileMessageHtml, { generatePreview: true });

                                // set a watcher to update the changes on header
                                scope.$watch('messageData.subject + messageData.from + messageData.name', function headerWatcher(newValue, oldValue) {
                                    if (newValue != oldValue) {
                                        messageService.setHeader(scope.messageData);
                                    }
                                });
                            }

                            // 3. Canned Content
                            if ($location.path().indexOf('canned') >= 0 && parseInt($routeParams.id) && parseInt($routeParams.type)) {
                                messageService.add({ generatePreview: true, cannedContentId: $routeParams.id, recurringTypeId: $routeParams.type }, function (data) {
                                    if (!msgData.id) {
                                        // we call again for the msg header bc in the first call was empty
                                        scope.messageData = messageService.getHeader(function getHeaderCallback(newMsgData) {
                                            scope.layoutContentBlocks = messageService.getContentBlocks({ designId: newMsgData.design });
                                        });
                                    }
                                    else {
                                        scope.layoutContentBlocks = messageService.getContentBlocks({ designId: msgData.design });
                                    }
                                    compileMessageHtml(data);
                                    messageService.getJoinPageText(function(data) {
                                        scope.joinPageText = data.Text;
                                    });
                                });

                                messageService.setHeader({ isBuildYourOwn: true });
                                editorEvents.changeStepText('Make Active', 3);
                                //we show the Join Page Text lbl so the user can change it but just for the Welcome .
                                if ($routeParams.type == 1) {
                                    scope.showJoinPageText = true;
                                }
                            }
                            if (msgData.isBuildYourOwn == true) {
                                scope.enableViewOnline = false;
                            }
                            scope.$watch('messageData.subject + messageData.from + messageData.name', function headerWatcher(newValue, oldValue) {
                                if (newValue != oldValue) {
                                    messageService.setHeader(scope.messageData);
                                }
                            });
                        });
                    };

                    // compiles the html received from backend and placed it on the canvas
                    function compileMessageHtml(backendMessage) {
                        scope.editor = compile(backendMessage.Html)(scope);
                        
                        scope.messageReady = 1;
                        scope.isSuperUser = configuration.isSuperUser;
                        if (!configuration.loaded) {
                            dc.configurationPromise.$promise.then(function (configurationData) {
                                scope.isSuperUser = configurationData.IsSuperUser;
                            });
                        }
                    };

                    scope.updateConfiguration = function updateConfiguration() {
                        messageService.updateConfiguration();
                    };

                    // notifies all subscribers about a content change in editor
                    // called by: 
                    scope.contentChanged = function contentChanged(actionType, target, contentBlockId, oldValue, newValue) {
                        editorEvents.editorContentChanged(actionType, target, contentBlockId, oldValue, newValue);
                    };

                    // saves all the data refered to undo/redo
                    // is executed when the user made a change on message canvas
                    scope.onContentChanged = function onContentChanged(actionType, target, contentBlockId, oldValue, newValue) {

                        // save changes on browser local storage
                        userChangeService.saveChanges(actionType, target, contentBlockId, oldValue, newValue);
                        scope.undoEnabled = true;
                        scope.redoEnabled = false;

                        // init the scheduling for autosave after first modification
                        if (!autoSaveInitialized) {
                            editorEvents.autoSaveContent();
                            autoSaveInitialized = true;
                        }

                        // makes sure angular applies the changes.
                        if (!scope.$$phase) {
                            scope.$digest();
                        }
                    };

                    scope.finishRejectedDrop = function finishRejectedDrop() {
                        scope.undoEnabled = true;
                        scope.redoEnabled = false;

                        if (!scope.$$phase) {
                            scope.$digest();
                        }
                    };

                    function userSave(options) {
                        options.forceSave = true;
                        options.updateInEnterprise = true;
                        scope.save(options);
                    };

                    scope.showEmailOptions = function showEmailOptions() {
                        scope.showEmailOptionsModal = true;
                    };

                    scope.save = function save(options, callback) {

                        options = options || { updateInEnterprise: true, forceSave: true };
                        options.updatesContent = true;

                        var updateData = {
                            editableContent: scope.getUserContent().editableContent,
                            subject: scope.messageData.subject,
                            hasViewOnline: scope.messageData.hasViewOnline,
                            hasLogoAddress: scope.messageData.hasLogoAddress,
                            joinPageText: scope.joinPageText
                        };

                        function updateCallback(data) {
                            editorEvents.successfulSave();

                            if (angular.isFunction(callback)) {
                                callback(data);
                            }
                        };

                        function saveErrorCallback(errorResponse) {
                            editorEvents.failedSave();
                            var errorString = 'ERROR|';
                            if (errorResponse && errorResponse.text && errorResponse.text.indexOf(errorString) == 0) {
                                // Display message
                                var message = errorResponse.text.substring(errorString.length);
                                scope.validationErrors = message.replace(/\s##/g, '<br />##');
                                scope.showValidationMessage = true;
                            }
                        };

                        messageService.update(updateData, options, updateCallback, saveErrorCallback);
                    };
                    
                    scope.undo = function undo() {
                        var actionToUndo = userChangeService.saveUndo();
                        if (actionToUndo) {
                            handleUndoRedo(actionToUndo, true);
                        }
                    };

                    scope.redo = function redo() {
                        var actionToRedo = userChangeService.saveRedo();
                        if (actionToRedo) {
                            handleUndoRedo(actionToRedo, false);
                        }
                    };

                    function handleUndoRedo(actionToPerform, isUndo) {
                        scope.redoEnabled = isUndo ? true : !!actionToPerform.remainingActions;
                        scope.undoEnabled = isUndo ? !!actionToPerform.remainingActions : true;

                        if (actionToPerform.action.Description == configuration.contentBlockEvents.Reordered) {
                            scope.performReorder(actionToPerform.action, isUndo);
                        } else if (actionToPerform.action.Description == configuration.contentBlockEvents.Deleted) {
                            scope.performDeleteOrCreate(actionToPerform.action, isUndo, true);
                        } else if (actionToPerform.action.Description == configuration.contentBlockEvents.Created) {
                            scope.performDeleteOrCreate(actionToPerform.action, isUndo, false);
                        } else {
                            // call editor
                            editorEvents.performUndoRedo(actionToPerform.action, isUndo);
                        }
                    };

                    // send a test
                    scope.showSendATest = function showSendATest() {

                        if (!!scope.messageData.id) {

                            // default store
                            scope.store = { Name: 'Preview with my member profile', Id: 0 };

                            // update in enterprise to have latest preview available for next steps
                            scope.save({ updateInEnterprise: true, forceSave: true, notifyEnterpriseSuccess: true }, function saveCallback() {
                                // show popup
                                scope.showSendATestModal = true;
                            });
                        }
                    };

                    scope.validateStep4 = function validateStep4(event, newRoute) {

                        // Perform validation if the newRoute is for Step3 or Step4
                        var step4Path = configuration.steps[3].url;

                        if (scope.alreadyValidated && newRoute.indexOf(step4Path) > -1) {
                            $location.url(configuration.steps[3].url);
                        }

                        scope.submitted = true;

                        if (newRoute.toLowerCase().indexOf('sendatestvalidationmessage') >= 0) {
                            event.preventDefault();
                        }

                        if (newRoute.indexOf(step4Path) > -1) {

                            var valid = true;
                            var strResult = 'Please fill required fields before moving on: \n';

                            if (!scope.messageData.subject) {
                                strResult += '\n Subject \n';
                                valid = false;
                            }

                            if (!scope.messageData.from) {
                                strResult += '\n From \n';
                                valid = false;
                            }

                            if (!scope.messageData.name) {
                                strResult += '\n Name \n';
                                valid = false;
                            }

                            if (!valid) {
                                event.preventDefault();
                                alert(strResult);
                            } else if (!scope.alreadyValidated) {
                                event.preventDefault();
                                editorEvents.cancelAutoSave();
                                scope.save({ forceSave: true, updateInEnterprise: true, showAlert: true },
                                function saveCallback() {
                                    scope.alreadyValidated = true;
                                    $location.url(configuration.steps[3].url);
                                });
                            }
                        } else if (newRoute.toLowerCase().indexOf('sendatestvalidationmessage') === -1) {
                            // if the user does not go to step 4 or 3 (it goes to step 2 or 1)
                            editorEvents.cancelAutoSave();
                            autoSaveInitialized = false;
                            scope.save({ forceSave: true, updateInEnterprise: true, showAlert: true });
                        }
                    };

                    scope.getContent = function getContent() {
                        // this is done to avoid access from several points to get user content
                        return {
                            html: scope.getUserContent().editableContent
                        };
                    };

                    init();

                    // handlers for editor events
                    editorEvents.onEditorContentChanged(scope, scope.onContentChanged);
                    editorEvents.onUserSaveContent(scope, userSave);
                    editorEvents.onAutoSaveContent(scope, function autoSaveCallback() {
                        scope.save({ updateInEnterprise: true, forceSave: false, isAutosave: true });
                    });
                    editorEvents.onRouteChanged(scope, scope.validateStep4);
                }
            ])
            .controller('SelectMembersCtrl', ['$scope',
                'editorEventsChannelService',
                'messageService',
                'storeService',
                '$filter',
                'dataContext',
                '$location',
                '$window',
                function selectMembersCtrl(scope, editorEvents, messageService, storeService, filter, dc, $location, $window) {
                    scope.saveEnable = true;
                    scope.datepickerClick = function datepickerClick() {
                        if (scope.selectedData.sendNow === 'true') {
                            scope.safeApply(function datepickerClickCallback() {
                                scope.selectedData.sendNow = 'false';
                                scope.sendNowChanged();
                            });
                        }
                    };

                    //scope.messageData.name = messageService.getScheduleData().name;

                    function initMembersPanel() {

                        // DataBind Properties
                        scope.guestCodes = []; //[]
                        scope.recipientLists = []; //[]
                        scope.recipientStores = null; //[]

                        // Selected Models
                        scope.selectedData = { selectedList: {}, selectedGuestCodes: [], guestCodesUpdated: false }; // this needs to be wrapper in an object because of scope issues (using child scope instead of parent)                       

                        // Misc. Model
                        scope.recipientCount = 0;
                        scope.countLookupByList = [];
                        scope.countLookupByGuestCode = [];
                        scope.defaultListId = 0;

                        // setup lists, guest codes and stores
                        messageService.getLists(function getListsCallback(data) {

                            var lists = [];

                            angular.forEach(data, function forEachCallback(value) {
                                value.Name = value.Name + ' (' + (value.MemberCount) + ')';

                                if (value.Default) {
                                    scope.selectedData.selectedList = value;
                                    scope.defaultListId = value.Id;
                                }

                                this.push(value);

                            }, lists);

                            // Guest Codes
                            scope.guestCodes = messageService.getGuestCodes(function guestCodesCallback(guestCodeResponse) {
                                if (guestCodeResponse.length) {
                                    lists.push({
                                        Name: 'Select guest codes:',
                                        Id: 0
                                    });
                                }

                                scope.recipientLists = lists;

                                // get stores
                                scope.recipientStores = storeService.getStores({ listId: scope.selectedData.selectedList.Id, withMemberCount: true }, function getStoresCallback(storeData) {

                                    updateCountLookupArray(storeData);

                                    // update recipients count
                                    scope.$watch('selectedData.selectedList.Id + selectedStores()', function recipientWatcher() {
                                        scope.updateRecipientCount();
                                        scope.scheduleEnabled = !!scope.selectedStores().length;
                                    });

                                });
                            });
                        });
                    };

                    function initSocialMediaPanel() {

                        // databind model
                        scope.accounts = null; //[];

                        // selected model
                        scope.selectedSocialAccounts = [];
                        scope.selectedData.socialMediaIncludePreview = true;
                        scope.socialMediaEnabled = configuration.hasSocialMediaEnabled;
                        scope.learnMoreAboutSocialUrl = '/SocialMedia/Modal_SocialMediaMarketing.aspx?sk=' + configuration.sessionKey + '&page=' + location.absUrl + '&action=Compose New Email - Step 4&type=sm';
                        scope.addAccountModalUrl = '/SocialMedia/Modal_AccountAdd.aspx?fbPagesOnly=0&sk=' + configuration.sessionKey;
                        scope.showLearnMoreSocialModal = false;
                        scope.showAddAccountModal = false;
                        scope.foursquareSocialMediaTypeId = configuration.foursquareSocialMediaTypeId;
                        scope.twitterSocialMediaTypeId = configuration.twitterSocialMediaTypeId;
                        scope.facebookSocialMediaTypeId = configuration.facebookSocialMediaTypeId;
                        scope.socialMediaPostCharactersLeft = configuration.facebookPostMaxLegnth;
                        scope.socialMediaPostMaxLength = configuration.facebookPostMaxLegnth;
                        scope.fullSupportedClient = configuration.isFullSupportedClient;

                        var messageData = messageService.getHeader();
                        scope.selectedData.socialMediaMessage = messageData.subject;

                        if (messageData.hasCoupon) {
                            scope.selectedData.socialMediaMessage += configuration.couponCodeLabelText + messageData.couponCode;
                        }

                        scope.getSocialAccounts();

                        scope.$watch('selectedData.socialMediaMessage + socialMediaPostMaxLength + selectedData.socialMediaIncludePreview', function socialMediaWatcher(newValue, oldValue) {
                            if (newValue !== oldValue) {
                                scope.socialMediaPostCharactersLeft = scope.socialMediaPostMaxLength - (scope.selectedData.socialMediaMessage ? scope.selectedData.socialMediaMessage.length : 0);

                                if (scope.socialMediaPostCharactersLeft < 0) {
                                    scope.selectedData.socialMediaMessage = scope.selectedData.socialMediaMessage.substr(0, scope.socialMediaPostMaxLength);
                                }
                            }
                        });

                    };

                    function initSendTimePanel() {

                        scope.selectedData.selectedHour = null; //'string'

                        scope.timeZone = configuration.timeZone;
                        scope.selectedData.selectedDate = filter('date')(new Date((new Date()).valueOf() + 1000 * 3600), 'shortDate');
                        scope.selectedData.sendNow = 'true';

                        dc.getTimeZoneConfiguration(function getTimeZoneCallback(data) {
                            scope.selectedData.selectedHour = data.hourToSend;
                            scope.populateTime(data.hourToSend);
                        });
                    };

                    function init() {
                        messageService.getHeader(function (data) {
                            scope.isBuildYourOwn = data.isBuildYourOwn;
                            if (data.recurringTypeId && data.recurringTypeId > 0) {
                                scope.loyaltyMessageText = configuration.loyaltyMessageText[data.recurringTypeId];
                            }
                        });

                        initMembersPanel();
                        initSocialMediaPanel();
                        initSendTimePanel();

                        setEditValues();

                        editorEvents.onUserSaveContent(scope, userSave);
                        editorEvents.onAutoSaveContent(scope, autoSave);
                        editorEvents.onRouteChanged(scope, scope.onRouteChanged);

                        $window.onbeforeunload = function onUnloadCallback() {
                            if (scope.selectedData.sendNow !== 'true') {
                                return 'Are you sure?  Your mailing has been Saved and not Scheduled to send.  Click the blue Schedule button to send your mailing at your denoted time.';
                            }
                        };
                    };

                    /******* METHODS *******/

                    function setEditValues() {
                        var removeWatcher = scope.$watch('recipientStores + accounts + selectedData.selectedHour', function sedEditValuesCallback() {
                            if (scope.countLookupByList.length
                                && (!scope.socialMediaEnabled || (scope.socialMediaEnabled && scope.accounts !== null && scope.accounts.$resolved))
                                && scope.selectedData.selectedHour !== null) {

                                removeWatcher();

                                var scheduleData = messageService.getScheduleData();

                                // scheduleData.list is null if the schedule data were never saved
                                if (!scheduleData.list) {
                                    // init autosave
                                    editorEvents.autoSaveContentWithDelay();
                                    return;
                                }

                                if (scheduleData.guestCodes && scheduleData.guestCodes.length) {

                                    scope.selectedData.selectedList = scope.recipientLists[scope.recipientLists.length - 1];

                                    for (var j = 0; j < scheduleData.guestCodes.length; j++) {
                                        scope.selectedData.selectedGuestCodes.push(scheduleData.guestCodes[j]);
                                    }

                                } else {
                                    for (var i = 0; i < scope.recipientLists.length; i++) {
                                        if (scope.recipientLists[i].Id === scheduleData.list.Id) {
                                            scope.selectedData.selectedList = scope.recipientLists[i];
                                            break;
                                        }
                                    }
                                }

                                if (scheduleData.stores && scheduleData.stores.length) {
                                    for (var k = 0; k < scheduleData.stores.length; k++) {
                                        for (var l = 0; l < scope.recipientStores.length; l++) {
                                            if (scope.recipientStores[l].Id === scheduleData.stores[k].Id) {
                                                scope.recipientStores[l].checked = true;
                                                break;
                                            }
                                        }
                                    }
                                }

                                if (scheduleData.socialMediaAccounts) {
                                    for (var m = 0; m < scheduleData.socialMediaAccounts.length; m++) {
                                        for (var n = 0; n < scope.accounts.length; n++) {
                                            if (scheduleData.socialMediaAccounts[m].Id === scope.accounts[n].Id) {
                                                scope.accounts[n].Selected = true;
                                                break;
                                            }
                                        }
                                    }

                                    updateSelectedSocialAccounts();
                                }

                                if (scheduleData.socialMediaMessage != null) {
                                    scope.selectedData.socialMediaMessage = scheduleData.socialMediaMessage;
                                }

                                scope.selectedData.socialMediaIncludePreview = scheduleData.includePreviewInSocialMediaPost;

                                scope.selectedData.sendNow = scheduleData.sendNow ? 'true' : 'false';

                                if (scheduleData.time && !scheduleData.sendNow) {
                                    var hours = parseInt(scheduleData.time);

                                    if (scheduleData.time.toUpperCase().indexOf("PM") > 0) {
                                        hours += 12;
                                    }

                                    var minutes = parseInt(scheduleData.time.substr(scheduleData.time.indexOf(":") + 1, 2));
                                    scheduleData.time = hours + (minutes / 60);

                                    scope.selectedData.selectedHour = scheduleData.time;
                                    scope.populateTime(scope.selectedData.selectedHour);
                                    scope.selectedData.selectedDate = scheduleData.date;
                                }

                                // init autosave after 30 seconds
                                editorEvents.autoSaveContentWithDelay();
                            }
                        });
                    };


                    /* PANEL 1 */
                    scope.selectedStores = function selectedStores() {
                        var filtered = filter('filter')(scope.recipientStores, { checked: true });
                        var result = [];
                        angular.forEach(filtered, function forEachCallback(obj) {
                            result.push(obj.Id);
                        }, result);

                        return result;
                    };

                    scope.checkAll = function checkAll(checked) {
                        angular.forEach(scope.recipientStores, function forEachCallback(obj) {
                            obj.checked = checked;
                        });
                    };

                    scope.updateCount = function updateCount() {
                        if (scope.selectedData.guestCodesUpdated) {
                            scope.selectedData.guestCodesUpdated = false;
                            scope.updateRecipientCount();
                        }
                    };

                    function updateCountLookupArray(storeData) {
                        var tempLookup = { listId: scope.selectedData.selectedList.Id, storeData: storeData };
                        scope.countLookupByList.push(tempLookup);
                        calculateRecipientCountByList(tempLookup);
                    };

                    scope.updateRecipientCount = function updateRecipientCount() {
                        // 1: List is selected & not using guest code
                        if (scope.selectedData.selectedList.Id > 0) {
                            var listLookup = filter('filter')(scope.countLookupByList, { listId: scope.selectedData.selectedList.Id });
                            if (!listLookup.length) {
                                storeService.getStores({ listId: scope.selectedData.selectedList.Id, withMemberCount: true }, updateCountLookupArray);
                            } else {
                                calculateRecipientCountByList(listLookup[0]);
                            }
                        } else {
                            // 2: No list selected & not using guest code
                            if (scope.guestCodes.length == 0 || scope.selectedData.selectedGuestCodes.length == 0 || scope.selectedStores().length == 0) {
                                scope.recipientCount = 0;
                            } else { // 3: Using guest code                                
                                messageService.getRecipientCount(
                                    { selectedStores: scope.selectedStores(), selectedList: scope.defaultListId, selectedGuestCodes: scope.selectedData.selectedGuestCodes },
                                    function getRecipientsCountCallback(data) {
                                        scope.recipientCount = data.recipientCount;
                                    });
                            }
                        }
                    };

                    function calculateRecipientCountByList(listLookup) {
                        var count = 0;
                        if (listLookup) {
                            angular.forEach(scope.selectedStores(), function forEachCallback(obj) {
                                var store = filter('filter')(listLookup.storeData, { Id: obj });
                                if (store != null && store.length) {
                                    count += store[0].MemberCount;
                                }
                            });
                        }
                        scope.recipientCount = count;
                    };

                    /* END PANEL 1*/
                    /* PANEL 2 */

                    function updateSelectedSocialAccounts() {
                        var filtered = filter('filter')(scope.accounts, { Selected: true });
                        var result = [];

                        angular.forEach(filtered, function forEachCallback(obj) {
                            result.push(obj.Id);
                        }, result);

                        scope.selectedSocialAccounts = result;

                        updateSocialMediaPostMaxLength(filtered);

                        return result;
                    };

                    scope.getSocialAccounts = function getSocialAccounts() {
                        if (scope.socialMediaEnabled) {
                            scope.accounts = messageService.getSocialMediaAccounts();
                        }
                    };

                    function updateSocialMediaPostMaxLength(selectedAccounts) {

                        var maxLength = configuration.facebookPostMaxLegnth;

                        for (var i = 0; i < selectedAccounts.length; i++) {

                            if (selectedAccounts[i].SocialMediaTypeId === scope.foursquareSocialMediaTypeId
                                    && maxLength > configuration.foursquarePostMaxLength) {
                                maxLength = configuration.foursquarePostMaxLength;
                                continue;
                            }

                            if (selectedAccounts[i].SocialMediaTypeId === scope.twitterSocialMediaTypeId
                                    && maxLength > configuration.twitterPostMaxLength) {

                                if (scope.selectedData.socialMediaIncludePreview) {
                                    maxLength = configuration.twitterPostMaxLength - configuration.socialMediaPreviewLength;
                                }
                                else {
                                    maxLength = configuration.twitterPostMaxLength;
                                }
                            }
                        }
                        scope.socialMediaPostMaxLength = maxLength;
                    };

                    function getSelectedSocialAccountNickNames() {
                        var filtered = filter('filter')(scope.accounts, { Selected: true });
                        var nickNames = '';

                        angular.forEach(filtered, function forEachCallback(obj) {
                            nickNames += obj.NickName + ', ';
                        });

                        if (filtered && filtered.length) {
                            nickNames = nickNames.substr(0, nickNames.length - 2);
                        }

                        return nickNames;
                    };

                    scope.selectAccount = function selectAccount(index) {
                        scope.accounts[index].Selected = !scope.accounts[index].Selected;
                        updateSelectedSocialAccounts();
                    };

                    scope.selectAllAccounts = function selectAllAccounts(isSelect) {
                        for (var i = 0; i < scope.accounts.length; i++) {
                            scope.accounts[i].Selected = isSelect;
                        }
                        updateSelectedSocialAccounts();
                    };

                    /* PANEL 3 */
                    scope.sendNowChanged = function sendNowChanged() {
                        if (scope.selectedData.sendNow === 'true') {
                            scope.selectedData.selectedDate = filter('date')(new Date(), 'shortDate');
                        }
                        else {
                            scope.selectedData.selectedDate = filter('date')(new Date((new Date()).valueOf() + 1000 * 3600), 'shortDate');
                        }
                        scope.populateTime(new Date().getHours() + 1);
                    };

                    scope.populateTime = function populateTime(hours) {
                        if (hours > 12) {
                            hours = hours - 12;
                            scope.selectedData.selectedAmPmFull = "pm";
                        } else {
                            scope.selectedData.selectedAmPmFull = "am";
                        }

                        if (hours == 0) {
                            hours = 12;
                        }

                        scope.selectedData.selectedHourFull = parseInt(hours);
                        scope.selectedData.selectedMinuteFull = parseFloat(hours) % 1 ? (parseFloat(hours) % 1) * 100 : 0;
                    };

                    scope.selectedHourDouble = function selectedHourDouble() {
                        var time = parseInt(scope.selectedData.selectedHourFull);
                        if (time < 12 && scope.selectedData.selectedAmPmFull == "pm") {
                            time = time + 12;
                        }

                        if (time == 12 && scope.selectedData.selectedAmPmFull == "am") {
                            time = 0;
                        }

                        return parseFloat(time + "." + scope.selectedData.selectedMinuteFull);
                    };

                    /******** User Save For Both *********/

                    function prepareSaveData(finalize) {
                        var saveData = {
                            selectedList: scope.selectedData.selectedList.Id > 0 ? scope.selectedData.selectedList.Id : scope.defaultListId,
                            selectedStores: scope.selectedStores(),
                            selectedGuestCodes: scope.selectedData.selectedList.Id == 0 ? scope.selectedData.selectedGuestCodes : null,
                            selectedSocialMediaAccountIds: scope.selectedSocialAccounts,
                            socialMediaMessage: scope.selectedData.socialMediaMessage,
                            includePreviewInSocialMediaPost: scope.selectedData.socialMediaIncludePreview,
                            selectedDate: scope.selectedData.selectedDate,
                            selectedTime: scope.selectedHourDouble(),
                            sendNow: scope.selectedData.sendNow === 'true',
                            finalize: !!finalize,
                            autoSave: false,

                            //local storage
                            recipientsCount: scope.recipientCount,
                            selectedSocialMediaAccountNickNames: getSelectedSocialAccountNickNames()
                        };
                        return saveData;
                    };

                    function userSave() { autoSave(false); };

                    function autoSave(isAutosave) {
                        var saveData = prepareSaveData(false);

                        if (!!isAutosave) {
                            saveData.autoSave = true;
                            scope.saveEnable = false;
                        }

                        messageService.schedule(saveData,
                            function scheduleCallback() {
                                editorEvents.successfulSave();
                                scope.saveEnable = true;
                            },
                            function scheduleErrorCallback() {
                                scope.saveEnable = true;
                            }
                        );
                    };

                    scope.makeActive = function makeActive() {
                        scope.schedule();
                    };

                    scope.data = { showBillingModal: false };

                    scope.validateAndSchedule = function validateAndSchedule() {
                        if (scope.scheduleEnabled) {
                            scope.invalidLocation = false;
                            scope.schedule();
                        } else {
                            scope.invalidLocation = true;
                        }
                    };

                    scope.schedule = function schedule() {

                        var saveData = prepareSaveData(true);

                        messageService.schedule(
                            saveData,
                            function scheduleCallback() {
                                editorEvents.successfulSave();
                                $location.url(configuration.steps[4].url);
                            },
                            function scheduleErrorCallback(errors) {
                                if (errors) {
                                    var errorString = "ERROR|";
                                    if (errors.indexOf("EXCEEDED") > -1) {
                                        var getTicks = function () {
                                            var sendDate = new Date(saveData.selectedDate);
                                            if (sendDate.getFullYear() < 2000) {
                                                sendDate = sendDate.setFullYear(sendDate.getFullYear() + 100);
                                            }
                                            var dateTicks = sendDate * 10000;
                                            var timeTicks = saveData.selectedTime * 3600 * 1000 * 10000;
                                            return dateTicks + timeTicks + 621355968000000000;
                                        };

                                        var queryStringParams = '?utc=1&sk=' + configuration.sessionKey + '&mc=' + scope.recipientCount + '&s=' + getTicks();

                                        if (errors.indexOf("ONTRACK") > -1) {
                                            scope.modalUrl = '/Billing/MailingOnTrackToExceed.aspx' + queryStringParams;
                                            scope.modalTitle = 'Projected Overage';
                                        } else {
                                            scope.modalUrl = '/Billing/MailingExceedsBalance.aspx' + queryStringParams;
                                            scope.modalTitle = 'Overage';
                                        }

                                        scope.data.showBillingModal = true;
                                    }
                                    else {
                                        // Display message
                                        scope.validationErrors = errors.indexOf(errorString) == 0 ? errors.substring(errorString.length) : errors;
                                        scope.showValidationMessage = true;
                                    }
                                }

                                editorEvents.successfulSave();
                            });
                    };

                    scope.onRouteChanged = function onRouteChanged(event, newRoute) {
                        if (newRoute.indexOf(configuration.steps[4].url) === -1) {
                            // if the user goes backwards save like an autosave
                            editorEvents.cancelAutoSave();
                            autoSave(true);
                        }
                    };

                    init();
                }
            ])
            .controller('ConfirmationCtrl', ['$scope',
                'messageService',
                '$location',
                function confirmationCtrl(scope, messageService, $location) {

                    scope.messageData = messageService.getScheduleData(function getScheduleDataCallback(data) {

                        // generate iframe url for message preview
                        scope.previewUrl = '/api/previews/' + data.id + '?sk=' + configuration.sessionKey + '&storeId=' + (data.stores && data.stores.length ? data.stores[0].Id : 0) + '&mailFormat=2';

                        scope.stores = '';
                        scope.guestCodes = data.guestCodes && data.guestCodes.join(', ');
                        scope.socialMediaAccounts = '';

                        if (data.stores) {
                            for (var i = 0; i < data.stores.length; i++) {
                                if (i === data.stores.length - 1) {
                                    scope.stores += data.stores[i].Name;
                                } else {
                                    scope.stores += data.stores[i].Name + ', ';
                                }
                            }
                        }

                        if (data.socialMediaAccounts) {
                            for (var j = 0; j < data.socialMediaAccounts.length; j++) {
                                if (j === data.socialMediaAccounts.length - 1) {
                                    scope.socialMediaAccounts += data.socialMediaAccounts[j].NickName;
                                }
                                else {
                                    scope.socialMediaAccounts += data.socialMediaAccounts[j].NickName + ', ';
                                }
                            }
                        }
                    });

                    // Default date for loyalty messages = tomorrow (1 day in ms = 86400000)
                    scope.loyaltyDefaultDate = new Date(new Date().getTime() + 86400000).format("MM/dd/yyyy");

                    scope.copy = function copy() {
                        messageService.copy(function copyCallback() {
                            $location.url(configuration.steps[2].url);
                        });
                    };

                    scope.cancelAndEdit = function cancelAndEdit() {
                        scope.showCancelModal = true;
                    };

                    scope.confirmationCallback = function confirmationCallback() {
                        // hide modal
                        scope.showCancelModal = false;

                        // cancel the scheduling
                        messageService.cancel(function cancelCallback() {
                            $location.url(configuration.steps[2].url);
                        }, function cancelErrorCallback(validationErrors) {
                            scope.showValidationMessage = true;
                            scope.validationErrors = validationErrors;
                        });
                    };

                    messageService.getHeader(function (data) {
                        scope.isBuildYourOwn = data.isBuildYourOwn;
                    });
                }
            ]);
    }
);