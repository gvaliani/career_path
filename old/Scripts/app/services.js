define('services',
    ['angular', 'ngResource', 'configuration', 'amplifyStore', 'pace'],
    function (angular, ngResource, configuration, amplifyStore, pace) {
        'use strict';

        angular.module('editor.services', ['ngResource'])
            .factory('dataContext',
            [
                '$resource',
                function(resource) {

                    var rs = resource('/api/:controller/:action', { sk: configuration.sessionKey }, {
                        getDesigns: { method: 'GET', params: { controller: 'designs', pageIndex: '@pageIndex', pageSize: '@pageSize', parentId: '@parentId', searchText: '@searchText' }, isArray: false },
                        getDesignFolders: { method: 'GET', params: { controller: 'designFolders', action: 'Get', searchText: '@searchText', parentId: '@parentId' }, isArray: true },
                        getDesignFolderBySubfolderId: { method: 'GET', params: { controller: 'designFolders', action: 'GetDesignFolderBySubfolderId', subFolderId: '@subFolderId' }, isArray: false },
                        addFavoriteDesign: { method: 'POST', params: { controller: 'favoriteDesigns', designId: '@designId' }, isArray: false, showAlert: true },
                        removeFavoriteDesign: { method: 'POST', params: { controller: 'favoriteDesigns', designId: '@designId' }, headers: { 'X-HTTP-Method-Override': 'DELETE' }, isArray: false, showAlert: true },
                        getLayouts: { method: 'GET', params: { controller: 'layouts' }, isArray: true },
                        getContentBlocks: { method: 'GET', params: { controller: 'contentblocks', action: 'GetByDesign', designId: '@designId' }, isArray: true },
                        addMessage: { method: 'POST', params: { controller: 'messages', performCopy: '@Copy', generatePreview: '@GeneratePreview' }, isArray: false, showAlert: true },
                        updateMessage: { method: 'POST', params: { controller: 'messages', id: '@Id', updateInEnterprise: '@UpdateInEnterprise', isScheduleData: '@Schedule', updatesContent: '@UpdatesContent' }, headers: { 'X-HTTP-Method-Override': 'PUT' }, isArray: false },
                        getMessage: { method: 'GET', params: { controller: 'messages', id: '@id', withDetails: '@withDetails' }, isArray: false },
                        getConfiguration: { method: 'GET', params: { controller: 'applications' }, isArray: false },
                        updateConfiguration: { method: 'POST', params: { controller: 'applications'}, headers: { 'X-HTTP-Method-Override': 'PUT' }, isArray: false },
                        getStores: { method: 'GET', params: { controller: 'stores', listId: '@listId', withMemberCount: '@withMemberCount' }, isArray: true },
                        updateStores: { method: 'POST', params: { controller: 'stores', applyToAllLocations: '@applyToAllLocations' }, isArray: false },
                        getGuestCodes: { method: 'GET', params: { controller: 'guestcodes' }, isArray: true },
                        sendPreview: { method: 'POST', params: { controller: 'previews' }, isArray: false },
                        createPreview: { method: 'POST', params: { controller: 'previews', messageId: '@messageId' }, headers: { 'X-HTTP-Method-Override': 'PUT' }, isArray: false },
                        getRecipientCount: { method: 'GET', params: { controller: 'recipients' }, isArray: false },
                        getLists: { method: 'GET', params: { controller: 'lists' }, isArray: true },
                        getPreviewMessage: { method: 'GET', params: { controller: 'previews', storeId: '@storeId', mailFormat: '@mailFormat' }, isArray: false },
                        getTimeZoneConfiguration: { method: 'GET', params: { controller: 'schedules' }, isArray: false },
                        getSocialMediaAccounts: { method: 'GET', params: { controller: 'socialMediaAccounts' }, isArray: true },
                        cancelMessage: { method: 'POST', params: { controller: 'messages', id: '@Id' }, headers: { 'X-HTTP-Method-Override': 'DELETE' }, isArray: false, showAlert: true },
                        getClient: { method: 'GET', params: { controller: 'clients' }, isArray: false },
                        updateClient: { method: 'POST', params: { controller: 'clients', forSettings: '@ForSettings' }, isArray: false },
                        setJoinPageText: { method: 'POST', params: { controller: 'joinPages' }, isArray: false },
                        getJoinPageText: { method: 'GET', params: { controller: 'joinPages' }, isArray: false }
                    });

                    var loadConfiguration = function () {

                        var promise = rs.getConfiguration();
                        promise.$promise
                            .then(function (data) {
                                configuration.autoSaveFrecuency = data.AutoSaveFrecuency;
                                configuration.isSuperUser = data.IsSuperUser;
                                configuration.timeZone = data.TimeZone;
                                configuration.hasSocialMediaEnabled = data.HasSocialMediaEnabled;
                                configuration.defaultDesignId = data.DefaultDesignId;
                                // social media
                                configuration.twitterPostMaxLength = data.TwitterPostMaxLength;
                                configuration.twitterSocialMediaTypeId = data.TwitterSocialMediaTypeId;
                                configuration.facebookPostMaxLegnth = data.FacebookPostMaxLegnth;
                                configuration.facebookSocialMediaTypeId = data.FacebookSocialMediaTypeId;
                                configuration.foursquarePostMaxLength = data.FoursquarePostMaxLength;
                                configuration.foursquareSocialMediaTypeId = data.FoursquareSocialMediaTypeId;
                                configuration.socialMediaPreviewLength = data.SocialMediaPreviewLength;

                                configuration.isFullSupportedClient = data.IsFullSupportedClient;
                                configuration.autoSpellCheck = data.AutoSpellCheck;

                                configuration.couponCodeLabelText = data.CouponCodeLabelText;
                                configuration.defaultLayoutId = 1; // TODO: must be pulled from somewhere depending on requirement
                                configuration.hasReservationLink = data.HasReservationLink;
                                configuration.hasWebpageLinks = data.HasWebpageLinks;

                                // new editor tour
                                configuration.showNewEditorTour = data.ShowNewEditorTour;

                                configuration.allowedHtml = data.AllowedHtml;
                                configuration.loaded = true;
                            });

                        return promise;
                    };

                    var configurationPromise = loadConfiguration();

                    return {
                        getDesigns: rs.getDesigns,
                        getDesignFolders: rs.getDesignFolders,
                        addFavoriteDesign: rs.addFavoriteDesign,
                        removeFavoriteDesign: rs.removeFavoriteDesign,
                        getLayouts: rs.getLayouts,
                        getContentBlocks: rs.getContentBlocks,
                        addMessage: rs.addMessage,
                        updateMessage: rs.updateMessage,
                        getMessage: rs.getMessage,
                        getConfiguration: rs.getConfiguration,
                        updateConfiguration: rs.updateConfiguration,
                        getStores: rs.getStores,
                        updateStores: rs.updateStores,
                        getGuestCodes: rs.getGuestCodes,
                        sendPreview: rs.sendPreview,
                        createPreview: rs.createPreview,
                        getRecipientCount: rs.getRecipientCount,
                        getLists: rs.getLists,
                        getPreviewMessage: rs.getPreviewMessage,
                        getTimeZoneConfiguration: rs.getTimeZoneConfiguration,
                        scheduleMessage: rs.scheduleMessage,
                        sendError: rs.sendError,
                        getSocialMediaAccounts: rs.getSocialMediaAccounts,
                        cancelMessage: rs.cancelMessage,
                        getClient: rs.getClient,
                        updateClient: rs.updateClient,
                        getDesignFolderBySubfolderId: rs.getDesignFolderBySubfolderId,
                        setJoinPageText: rs.setJoinPageText,
                        getJoinPageText: rs.getJoinPageText,
                        configurationPromise: configurationPromise
                    };
                }
            ])
            .factory('messageService', [
                'dataContext',
                'editorEventsChannelService',
                '$rootScope',
                function(dc, editorEvents, scope) {
                    //private
                    var lockTaken = false;

                    var internalData = {
                        id: null,
                        name: null,
                        design: null,
                        layout: null,
                        from: null,
                        subject: null,
                        couponCode: null,
                        hasCoupon: null,
                        hasViewOnline: null,
                        hasLogoAddress: null,
                        isDirty: false,
                        isFinalized: null,
                        isBuildYourOwn: false,
                        recurringTypeId: null
                    };

                    var scheduleData = {
                        // extended object
                        date: null,
                        time: null,
                        list: null,
                        guestCodes: null,
                        stores: null,
                        sendNow: false,
                        socialMediaAccounts: null,
                        socialMediaIncludePreview: null,
                        socialMediaMessage: null,
                        cancelAvailable: false,
                        recipientsCount: 0
                    };

                    // Designs
                    var getDesigns = function(pagingData, callback) {

                        var successCallback = function(data) {
                            if (angular.isFunction(callback)) {
                                callback(data);
                            }
                        };

                        return dc.getDesigns(pagingData, successCallback);
                    };

                    var addFavoriteDesign = function(data, callback) {
                        var successCallback = function (data) {
                            if (angular.isFunction(callback)) {
                                callback(data);
                            }
                        };

                        return dc.addFavoriteDesign(data, successCallback);
                    }

                    var removeFavoriteDesign = function (data, callback) {
                        var successCallback = function (data) {
                            if (angular.isFunction(callback)) {
                                callback(data);
                            }
                        };

                        return dc.removeFavoriteDesign(data, successCallback);
                    }

                    var updateConfiguration = function updateConfiguration() {
                        return dc.updateConfiguration({ showNewEditorTour: configuration.showNewEditorTour });
                    };

                    // Layouts
                    var getLayouts = function(callback) {

                        var successCallback = function(data) {
                            var selectedId = !!internalData.id ? internalData.layout : configuration.defaultLayoutId;

                            for (var layout in data) {
                                if (data[layout].id == selectedId) {
                                    data[layout].selected = true;
                                }
                            }

                            if (angular.isFunction(callback)) {
                                callback(data);
                            }
                        };

                        return dc.getLayouts(successCallback);
                    };

                    var getDesignFolders = function(data, callback) {
                        var successCallback = function(responseData) {
                            if (angular.isFunction(callback)) {
                                callback(responseData);
                            }
                        };

                        return dc.getDesignFolders(data, successCallback);
                    };

                    function getDesignFolderBySubfolderId(data, callback) {
                        var successCallback = function(responseData) {
                            if (angular.isFunction(callback)) {
                                callback(responseData);
                            }
                        };

                        return dc.getDesignFolderBySubfolderId(data, successCallback);
                    };

                    // Methods                                                  
                    var getHeader = function(callback) {
                        var result = angular.copy(internalData);

                        if (angular.isFunction(callback)) {
                            callback(result);
                        }

                        return result;
                    };

                    var getPreview = function(data, callback, errorCallback) {

                        var getPreviewData = {
                            id: internalData.id,
                            storeId: data.storeId,
                            mailFormat: data.mailFormat
                        };

                        dc.getPreviewMessage(getPreviewData, callback, errorCallback);
                    };

                    var setInternalData = function(messageBackendModel) {
                        //set the current Message Data
                        internalData.id = messageBackendModel.Id;
                        internalData.from = messageBackendModel.From;
                        internalData.subject = messageBackendModel.Subject;
                        internalData.name = messageBackendModel.Name;
                        internalData.design = messageBackendModel.DesignId;
                        internalData.layout = messageBackendModel.LayoutId;
                        internalData.hasViewOnline = messageBackendModel.IncludeViewOnline;
                        internalData.hasLogoAddress = messageBackendModel.IncludeLogoAndAddress;
                        internalData.couponCode = messageBackendModel.ReusableCouponCode;
                        internalData.hasCoupon = messageBackendModel.HasRedeemContentBlock;
                        internalData.isFinalized = messageBackendModel.IsFinalized;
                        internalData.cannedContentId = messageBackendModel.CannedContentId;
                        internalData.recurringTypeId = messageBackendModel.RecurringTypeId;
                    };

                    var setScheduleData = function(backendModel) {

                        internalData.id = backendModel.Id;
                        internalData.from = backendModel.From;
                        internalData.subject = backendModel.Subject;
                        internalData.name = backendModel.Name;
                        internalData.design = backendModel.DesignId;
                        internalData.layout = backendModel.LayoutId;
                        internalData.hasViewOnline = backendModel.IncludeViewOnline;
                        internalData.hasLogoAddress = backendModel.IncludeLogoAndAddress;
                        internalData.couponCode = backendModel.ReusableCouponCode;
                        internalData.hasCoupon = backendModel.HasRedeemContentBlock;
                        internalData.isFinalized = backendModel.IsFinalized;

                        scheduleData.date = backendModel.Date;
                        scheduleData.time = backendModel.Time;
                        scheduleData.list = backendModel.List;
                        scheduleData.guestCodes = backendModel.GuestCodes;
                        scheduleData.stores = backendModel.Stores;
                        scheduleData.sendNow = backendModel.SendNow;
                        scheduleData.socialMediaAccounts = backendModel.SocialMediaAccounts;
                        scheduleData.includePreviewInSocialMediaPost = backendModel.IncludePreviewInSocialMediaPost;
                        scheduleData.socialMediaMessage = backendModel.SocialMediaMessage;
                        scheduleData.cancelAvailable = backendModel.CancelAvailable;

                        //confirmationData.recipientsCount = backendModel.RecipientsCount;
                    };

                    var setStep3UrlId = function(id) {
                        var editContentUrl = configuration.steps[2].url.split('/');
                        editContentUrl[editContentUrl.length - 1] = id;
                        configuration.steps[2].url = editContentUrl.join('/');
                    };

                    var create = function(options, callback) {

                        //create a wrapper of the callback to set internal context data (messageId)
                        var createCallback = function(data) {

                            setStep3UrlId(data.Id);

                            setInternalData(data);

                            //execute calback
                            callback(data);
                        };

                        var designId = internalData.design || configuration.defaultDesignId;
                        var layoutId = internalData.layout || configuration.defaultLayoutId;

                        var cannedContentId = internalData.cannedContentId || options.cannedContentId;
                        var recurringTypeId = internalData.recurringTypeId || options.recurringTypeId;

                        dc.addMessage({
                            Name: internalData.name,
                            Id: options.copy ? internalData.id : 0,
                            DesignId: designId,
                            LayoutId: layoutId,
                            Copy: !!options.copy,
                            GeneratePreview: !!options.generatePreview,
                            CannedContentId: cannedContentId,
                            RecurringTypeId: recurringTypeId
                        }, createCallback);
                    };

                    // join page text
                    var setJoinPageText = function(requestData, callback, errorCallback) {

                        var successCallback = function(data) {
                            if (angular.isFunction(callback)) {
                                callback(data);
                            }
                        };
                        var errCallback = function(data) {
                            if (angular.isFunction(errorCallback)) {
                                errorCallback(data);
                            }
                        };

                        return dc.setJoinPageText(requestData, successCallback, errCallback);
                    };

                    var getJoinPageText = function (callback) {

                        var successCallback = function (data) {
                            if (angular.isFunction(callback)) {
                                callback(data);
                            }
                        };

                        return dc.getJoinPageText(successCallback);
                        }

                    var update = function (entity, options, callback, errorCallback) {
                        var message = {
                            // regular update
                            Id: internalData.id,
                            Name: internalData.name,
                            From: internalData.from,
                            Subject: (entity.subject) ? entity.subject : internalData.subject,
                            DesignId: internalData.design,
                            LayoutId: internalData.layout,
                            IncludeViewOnline: (entity.hasViewOnline == null) ? internalData.hasViewOnline : entity.hasViewOnline,
                            IncludeLogoAndAddress: (entity.hasLogoAddress == null) ? internalData.hasLogoAddress : entity.hasLogoAddress,
                            EditableContent: entity.editableContent,

                            // schedule
                            SelectedList: entity.selectedList,
                            SelectedStores: entity.selectedStores,
                            SelectedGuestCodes: entity.selectedGuestCodes,
                            SelectedSocialMediaAccountIds: entity.selectedSocialMediaAccountIds,
                            SocialMediaMessage: entity.socialMediaMessage,
                            IncludePreviewInSocialMediaPost: entity.includePreviewInSocialMediaPost,
                            SelectedDate: entity.selectedDate,
                            SelectedTime: entity.selectedTime,
                            SendNow: !!entity.sendNow,
                            Finalize: !!entity.finalize,

                            // query string options
                            UpdateInEnterprise: !!options.updateInEnterprise,
                            Schedule: !!options.schedule,
                            UpdatesContent: !!options.updatesContent //if true will NOT CHANGE user provided content on backend
                        };

                        // if the message is Welcome Auto Loyalty, we update the Join Page text.
                        if (internalData.recurringTypeId == 1) {
                            setJoinPageText({
                                text: entity.joinPageText
                            });
                        }

                        var updateCallback = function (responseData) {
                            lockTaken = false;

                            setInternalData(responseData);

                            if (responseData.List) {
                                setScheduleData(responseData);
                            }

                            // create/update preview thumbnail after saving loyalty message
                            if (responseData.RecurringTypeId > 0) {
                                dc.createPreview({ messageId: responseData.Id });
                            }

                            if (!options.isAutosave) {
                                pace.stop();
                                scope.showAlert = false;
                            }

                            internalData.isDirty = false;

                            if (options.updateInEnterprise || !!options.notifyEnterpriseSuccess) {
                                editorEvents.enterpriseSaveSuccess();
                            }

                            if (angular.isFunction(callback)) {
                                callback(responseData);
                            }
                        };

                        var updateErrorCallback = function (errorResponse) {
                            lockTaken = false;

                            if (errorResponse && errorResponse.text && errorResponse.text.indexOf('FINALIZED') >= 0) {
                                scope.showFinalizedAlert = true;
                            }

                            if (!options.isAutosave) {
                                pace.stop();
                            }

                            scope.showAlert = false;

                            if (angular.isFunction(errorCallback)) {
                                errorCallback(errorResponse);
                            }

                            if (errorResponse.text.indexOf('date') == -1 &&
                                errorResponse.text.indexOf('Too long') == -1) {
                                alert('Oops, there were some errors in the HTML and the latest changes cannot be saved.  Please look for and fix the errors and save again.');
                            }
                        };

                        if (!options.isAutosave) {
                            pace.trackPost();
                            scope.showAlert = true;
                            scope.alertMessage = 'Saving';
                        }

                        if ((options.forceSave || internalData.isDirty) && !lockTaken) {
                                lockTaken = true;
                                dc.updateMessage(message, updateCallback, updateErrorCallback);                            
                        } else {

                            // callbacks for update are not taking response data as parameters
                            // update loading/saving indicator
                            if (!options.isAutosave) {
                                pace.stop();
                                scope.showAlert = false;
                            }

                            callback();
                        }
                    };

                    var schedule = function (data, callback, errorCallback) {

                        scheduleData.recipientsCount = data.recipientsCount;

                        var scheduleCallback = function (responseData) {

                            setScheduleData(responseData);

                            if (angular.isFunction(callback)) {
                                callback(responseData);
                            }
                        };

                        var scheduleErrorCallback = function (response) {
                            if (angular.isFunction(errorCallback)) {
                                errorCallback(response.text);
                            }
                        };

                        var updateOptions = {
                            forceSave: true,
                            schedule: true,
                            updateInEnterprise: true,
                            isAutosave: data.autoSave,
                            updateOnlySettings: true
                        };

                        update(data, updateOptions, scheduleCallback, scheduleErrorCallback);
                    };

                    var sendaTest = function (previewData, callback, errorCallBack) {

                        var sendATestData = {
                            messageId: internalData.id,
                            emailAddresses: previewData.emailAddresses && previewData.emailAddresses.split(','),
                            storeId: previewData.storeId
                        };

                        var sendCallback = function (data) {
                            if (callback) {
                                callback(data);
                            }
                        };

                        dc.sendPreview(sendATestData, sendCallback, errorCallBack);
                    };

                    var setHeader = function (data) {
                        if (data &&
                        (!!data.name ||
                            !!data.design ||
                            !!data.layout ||
                            !!data.from ||
                            !!data.subject ||
                            !!data.isBuildYourOwn ||
                            !!data.recurringTypeId)) {

                            internalData.name = data.name || internalData.name;
                            internalData.design = data.design || internalData.design;
                            internalData.layout = data.layout || internalData.layout;

                            internalData.from = data.from || internalData.from;
                            internalData.subject = data.subject || internalData.subject;

                            if (internalData.from && data.from // is a change on the from value
                                || internalData.subject && data.subject) { // is a change on the subject value
                                internalData.isDirty = true;
                            }

                            internalData.isBuildYourOwn = data.isBuildYourOwn || internalData.isBuildYourOwn;
                            internalData.recurringTypeId = data.recurringTypeId || internalData.recurringTypeId;
                        } else {
                            throw "messageService.setHeader(data) => data is invalid";
                        }
                    };

                    var getRecipientCount = function (data, callback, errorCallback) {
                        var recipientData = {
                            messageId: 0,
                            selectedList: data.selectedList,
                            selectedStores: data.selectedStores,
                            selectedGuestCodes: data.selectedGuestCodes
                        };

                        var updateCallback = function (returnData) {
                            if (callback) {
                                callback(returnData);
                            }
                        };

                        dc.getRecipientCount(recipientData, updateCallback, errorCallback);
                    };

                    var markAsDirty = function () {
                        internalData.isDirty = true;
                    };

                    var getMessage = function (data, callback) {

                        pace.trackPost();
                        scope.showAlert = true;
                        scope.alertMessage = 'Loading';

                        var requestData = {
                            id: internalData.id || data.id,
                            withDetails: data.withDetails || false
                        };

                        if (!requestData.id) {
                            throw "Invalid Message Id";
                        }

                        var success = function (responseData) {

                            // If message is already finalized, we should not let user work with it
                            if (responseData.IsFinalized) {
                                scope.showAlert = false;
                                scope.showFinalizedAlert = true;
                                return;
                            }

                            if (!internalData.id) {
                                // if the user comes from email admin pages (searchmails,editmails)
                                setStep3UrlId(responseData.Id);
                            }

                            setInternalData(responseData);

                            if (responseData.List) {
                                setScheduleData(responseData);
                            }

                            if (angular.isFunction(callback)) {
                                callback(responseData);
                            }

                            pace.stop();
                            scope.showAlert = false;
                        };

                        return dc.getMessage(requestData, success);
                    };

                    var cancelMessage = function (callback, errorCallback) {
                        var cancelData = {
                            Id: internalData.id
                        };

                        var cancelCallback = function (responseData) {
                            if (angular.isFunction(callback)) {
                                callback(responseData);
                            }
                        };

                        var cancelErrorCallback = function (response) {
                            if (angular.isFunction(errorCallback)) {
                                errorCallback(response.text);
                            }
                        };

                        dc.cancelMessage(cancelData, cancelCallback, cancelErrorCallback);
                    };

                    var copy = function (callback) {
                        create({ copy: true }, callback);
                    };

                    var add = function (options, callback) {
                        create({ copy: false, generatePreview: !!options.generatePreview, cannedContentId: options.cannedContentId, recurringTypeId: options.recurringTypeId }, callback);
                    };

                    var getSocialMediaAccounts = function (callback) {

                        var callbackWrapper = function (data) {
                            if (angular.isFunction(callback)) {
                                callback(data);
                            }
                        };

                        return dc.getSocialMediaAccounts(callbackWrapper);
                    };

                    var getScheduleData = function (callback) {

                        var internalCopy = angular.copy(internalData);
                        var data = angular.extend(internalCopy, scheduleData);

                        if (angular.isFunction(callback)) {
                            callback(data);
                        }

                        return data;
                    };

                    var save = function (options, callback, errorCallback) {
                        if (internalData.id) {
                            // update
                            var requestOptions = {
                                updateInEnterprise: !!options.generatePreview,
                                schedule: false,
                                forceSave: !!options.forceSave,
                                updatesContent: !!options.updatesContent // if true WILL NOT CHANGE user provided content on backend
                            };

                            update({}, requestOptions, callback, errorCallback);
                        } else {
                            // create
                            add(options, callback);
                        }
                    };

                    return {
                        getDesigns: getDesigns,
                        getDesignFolders: getDesignFolders,
                        getDesignFolderBySubfolderId: getDesignFolderBySubfolderId,
                        addFavoriteDesign: addFavoriteDesign,
                        removeFavoriteDesign: removeFavoriteDesign,
                        getLayouts: getLayouts,
                        getContentBlocks: dc.getContentBlocks,
                        getHeader: getHeader,
                        getGuestCodes: dc.getGuestCodes,
                        getLists: dc.getLists,
                        getPreview: getPreview,
                        getRecipientCount: getRecipientCount,
                        getSocialMediaAccounts: getSocialMediaAccounts,
                        get: getMessage,
                        add: add,
                        schedule: schedule,
                        sendaTest: sendaTest,
                        setHeader: setHeader,
                        markAsDirty: markAsDirty,
                        update: update,
                        save: save,
                        copy: copy,
                        cancel: cancelMessage,
                        getScheduleData: getScheduleData,
                        setJoinPageText: setJoinPageText,
                        getJoinPageText: getJoinPageText,
                        updateConfiguration: updateConfiguration
                    };
                }
            ])
            .factory('userChangeService', [
                'dataContext',
                'messageService',
                function (dc, messageService) {

                    /****** OBJECT STRUCTURE ******
                    { 
                    MessageId: xxx,
                    CurrentIndex: 2,
                    History:[
                    {
                    Description: 'ContentBlock Inserted',
                    EditorInstanceId:'draggable01',
                    ContentBlockId:'cb_01',
                    CurrentValue:'<tr><td><span>Test Data</span></td></tr>',
                    PreviousValue:'<tr><td><span></span></td></tr>'
                    }
                    ]
                    }
                    ******************************/

                    /*********** PRIVATE METHODS ***************/
                    var getMessageBrowserCollection = function (messageId) {
                        return amplifyStore.store(configuration.storageEditorContentKey + messageId);
                    };

                    var saveMessageBrowserCollection = function (collection, messageId) {
                        //mark the message as dirty
                        messageService.markAsDirty();

                        amplifyStore.store(configuration.storageEditorContentKey + messageId, collection);
                    };

                    /********************************************/

                    var saveChanges = function (actionType, target, contentBlockId, previousValue, currentValue) {

                        // get current message data
                        var messageData = messageService.getHeader();

                        // default message collection data
                        var messageCollectionStructure = {
                            MessageId: messageData.id,
                            CurrentIndex: -1,
                            History: []
                        };

                        // modification to save
                        var actionDescriptor = { Description: actionType, EditorInstanceId: target, ContentBlockId: contentBlockId, PreviousValue: previousValue, CurrentValue: currentValue };

                        // get collection
                        var collection = getMessageBrowserCollection(messageData.id) || messageCollectionStructure;

                        // remove "redoable" (actions that are placed on the right of the current index) actions if some new change is made
                        if (collection.CurrentIndex < (collection.History.length - 1)) {
                            for (var i = collection.CurrentIndex; i < collection.History.length; i++) {
                                collection.History.pop();
                            }
                        }

                        // append to collection
                        collection.History.push(actionDescriptor);
                        collection.CurrentIndex = collection.History.length - 1;

                        // save
                        saveMessageBrowserCollection(collection, messageData.id);
                    };

                    var saveUndo = function () {

                        // get current message data
                        var messageData = messageService.getHeader();

                        var collection = getMessageBrowserCollection(messageData.id);

                        //prevent undesirable undo. defensive code, from ui when undo action its not enabled, clicking the button does not fire the action.
                        if (collection.CurrentIndex > -1) {

                            var actionDescriptor = collection.History[collection.CurrentIndex];

                            collection.CurrentIndex = collection.CurrentIndex - 1;

                            saveMessageBrowserCollection(collection, messageData.id);

                            return { action: actionDescriptor, historyLength: collection.History.length, remainingActions: collection.CurrentIndex + 1 };
                        }

                        return null;
                    };

                    var saveRedo = function () {

                        // get current message data
                        var messageData = messageService.getHeader();

                        var collection = getMessageBrowserCollection(messageData.id);

                        //prevent undesirable redo. defensive code, from ui when redo action its not enabled, clicking the button does not fire the action.
                        if ((collection.CurrentIndex + 1) < collection.History.length) {

                            collection.CurrentIndex = collection.CurrentIndex + 1;

                            var actionDescriptor = collection.History[collection.CurrentIndex];

                            saveMessageBrowserCollection(collection, messageData.id);

                            return { action: actionDescriptor, historyLength: collection.History.length, remainingActions: collection.History.length - (collection.CurrentIndex + 1) };
                        }
                        return null;
                    };

                    return {
                        saveChanges: saveChanges,
                        saveRedo: saveRedo,
                        saveUndo: saveUndo
                    };
                }
            ])
            .factory('editorEventsChannelService', [
                '$rootScope', '$timeout', '$interval',
                // a channel service that lets consumers
                // subscribe and publish for events on the editor content
                function ($rootScope, timeout, interval) {

                    //private properties
                    var intervalId;

                    // local constants for the message ids.  
                    // these are private implementation detail
                    // ReSharper disable InconsistentNaming
                    var EDITOR_CONTENT_CHANGED = 'onEditorContentChanged';
                    var AUTO_SAVE_CONTENT = 'onEditorAutosave';
                    var USER_SAVE_CONTENT = 'onUserSaveContent';
                    var SUCCESSFULLY_SAVE = 'onSuccessfullySave';
                    var FAILED_SAVE = 'onFailedSave';
                    var CONTEXTUAL_EDITOR_FOCUS = 'onContextualEditorFocus';
                    var CONTEXTUAL_EDITOR_EDIT_CLICK = 'onContextualEditorEditClick';
                    var CONTEXTUAL_EDITOR_BLUR = 'onContextualEditorBlur';
                    var ROUTE_CHANGED = '$locationChangeStart';
                    var ENTERPRISE_SAVE_SUCCESS = 'onEnterpriseSaveSuccess';
                    var PERFORM_UNDO_REDO = 'onPerformUndoRedo';
                    var CHANGE_SAVE_TEXT = 'onSaveButtonTextChanged';
                    var CHANGE_SAVE_ENABLE = 'onSaveButtonEnabledChanged';
                    var CHANGE_STEP_URL = 'onStepUrlChanged';
                    var CANVAS_SCROLL = 'onCanvasScroll';
                    var CHANGE_STEP_TEXT = 'onStepTextChanged';
                    var PUBLIC_SCOPE_LOADED = 'onPublicScopeLoaded';
                    // ReSharper restore InconsistentNaming

                    var scopesArray = [];

                    // publish that we have it a modification on the editor content
                    // note that the parameters are particular to the problem domain
                    var editorContentChanged = function (actionType, target, contenBlockId, oldValue, newValue) {

                        $rootScope.$broadcast(EDITOR_CONTENT_CHANGED,
                        {
                            actionType: actionType,
                            target: target,
                            contentBlockId: contenBlockId,
                            previousValue: oldValue,
                            currentValue: newValue
                        });
                    };

                    // subscribe to editorContentChanged event.
                    // note that you should require $scope first 
                    // so that when the subscriber is destroyed you 
                    // don't create a closure over it, and te scope can clean up. 
                    var onEditorContentChanged = function ($scope, handler) {
                        $scope.$on(EDITOR_CONTENT_CHANGED, function (event, message) {

                            // note that the handler is passed the problem domain parameters                            
                            handler(message.actionType, message.target, message.contentBlockId, message.previousValue, message.currentValue);
                        });
                    };

                    var autoSaveContentWithDelay = function () {
                        timeout(function () {
                            scheduleAutosave();
                            $rootScope.$broadcast(AUTO_SAVE_CONTENT, {});
                        }, 1000 * 30);
                    };

                    var autoSaveContent = function () {
                        if (!intervalId) {
                            scheduleAutosave();
                        }
                        $rootScope.$broadcast(AUTO_SAVE_CONTENT, {});
                    };

                    var scheduleAutosave = function () {
                        intervalId = interval(function () {
                            autoSaveContent();
                        }, configuration.autoSaveFrecuency);
                    };

                    var onAutoSaveContent = function ($scope, handler) {
                        $scope.$on(AUTO_SAVE_CONTENT, function (event, message) {
                            handler(message);
                        });
                    };

                    var cancelAutoSave = function () {
                        interval.cancel(intervalId);
                    };

                    var userSaveContent = function () {
                        $rootScope.$broadcast(USER_SAVE_CONTENT, {});
                    };

                    var onUserSaveContent = function ($scope, handler) {
                        $scope.$on(USER_SAVE_CONTENT, function (event, message) {
                            handler(message);
                        });
                    };

                    var successfulSave = function () {
                        $rootScope.$broadcast(SUCCESSFULLY_SAVE, {});
                    };

                    var onSuccessfulSave = function ($scope, handler) {
                        $scope.$on(SUCCESSFULLY_SAVE, function (event, message) {
                            handler(message);
                        });
                    };

                    var failedSave = function () {
                        $rootScope.$broadcast(FAILED_SAVE, {});
                    };

                    var onFailedSave = function ($scope, handler) {
                        $scope.$on(FAILED_SAVE, function (event, message) {
                            handler(message);
                        });
                    };

                    var stepUrlChanged = function (stepIndex, newUrl) {
                        $rootScope.$broadcast(CHANGE_STEP_URL, { Index: stepIndex, Url: newUrl });
                    };

                    var onStepUrlChanged = function ($scope, handler) {
                        $scope.$on(CHANGE_STEP_URL, function (event, message) {
                            handler(message);
                        });
                    };
                    /*
                    ****** CONTEXTUAL EDITOR EVENTS ******
                    */

                    var contextualEditorBlur = function (id) {
                        $rootScope.$broadcast(CONTEXTUAL_EDITOR_BLUR, { contentBlockId: id });
                    };
                    var onContextualEditorBlur = function ($scope, handler) {
                        $scope.$on(CONTEXTUAL_EDITOR_BLUR, function (event, message) {
                            handler(message);
                        });
                    };

                    var contextualEditorFocus = function (id) {
                        $rootScope.$broadcast(CONTEXTUAL_EDITOR_FOCUS, { contentBlockId: id });
                    };
                    var onContextualEditorFocus = function ($scope, handler) {
                        $scope.$on(CONTEXTUAL_EDITOR_FOCUS, function (event, message) {
                            handler(message);
                        });
                    };

                    var contextualEditorClickOnEdit = function (id) {
                        $rootScope.$broadcast(CONTEXTUAL_EDITOR_EDIT_CLICK, { contentBlockId: id });
                    };
                    var onContextualEditorClickOnEdit = function ($scope, handler) {
                        $scope.$on(CONTEXTUAL_EDITOR_EDIT_CLICK, function (event, message) {
                            handler(message);
                        });
                    };
                    
                    var performUndoRedo = function (actionDescriptor, isUndo) {
                        $rootScope.$broadcast(PERFORM_UNDO_REDO, {
                            action: actionDescriptor,
                            isUndo: isUndo
                        });
                    };

                    var onPerformUndoRedo = function ($scope, handler) {
                        $scope.$on(PERFORM_UNDO_REDO, function (event, message) {
                            if ($scope.editorId == message.action.EditorInstanceId) {
                                handler(message.action, message.isUndo);
                            }
                        });
                    };

                    var canvasScrolling = function () {
                        $rootScope.$broadcast(CANVAS_SCROLL, {});
                    };
                    var onCanvasScrolling = function ($scope, handler) {
                        $scope.$on(CANVAS_SCROLL, function (event, message) {
                            handler(message);
                        });
                    };

                    var publicScopeLoaded = function (scopeType, scope) {
                        scopesArray[scopeType] = scope;
                        $rootScope.$broadcast(PUBLIC_SCOPE_LOADED, { type: scopeType, scope: scope });
                    };
                    var onPublicScopeLoaded = function ($scope, handler) {
                        $scope.$on(PUBLIC_SCOPE_LOADED, function (event, message) {
                            handler(message);
                        });
                    };

                    var getScope = function (scopeType) {
                        return scopesArray[scopeType];
                    }

                    var resetScopes = function () {
                        scopesArray = [];
                    }

                    /********** GLOBAL EVENTS **************/

                    var onRouteChanged = function ($scope, handler) {
                        $scope.$on(ROUTE_CHANGED, function (event, newRoute, oldRoute) {
                            handler(event, newRoute, oldRoute);
                        });
                    };

                    var enterpriseSaveSuccess = function () {
                        $rootScope.$broadcast(ENTERPRISE_SAVE_SUCCESS, {});
                    };

                    var onEnterpriseSaveSuccess = function ($scope, handler) {
                        $scope.$on(ENTERPRISE_SAVE_SUCCESS, function (event, message) {
                            handler(event, message);
                        });
                    };

                    var changeSaveText = function (saveButtonText) {
                        $rootScope.$broadcast(CHANGE_SAVE_TEXT, { buttonCaption: saveButtonText });
                    };

                    var onChangeSaveText = function ($scope, handler) {
                        $scope.$on(CHANGE_SAVE_TEXT, function (event, message) {
                            handler(event, message);
                        });
                    };

                    var changeStepText = function (stepText, stepIndex) {
                        $rootScope.$broadcast(CHANGE_STEP_TEXT, { description: stepText, stepIndex: stepIndex });
                    };

                    var onChangeStepText = function ($scope, handler) {
                        $scope.$on(CHANGE_STEP_TEXT, function (event, message) {
                            handler(event, message);
                        });
                    };

                    var changeSaveEnable = function (enabled) {
                        $rootScope.$broadcast(CHANGE_SAVE_ENABLE, { isEnabled: enabled });
                    };

                    var onChangeSaveEnable = function ($scope, handler) {
                        $scope.$on(CHANGE_SAVE_ENABLE, function (event, message) {
                            handler(event, message);
                        });
                    };

                    /*************************************/

                    return {
                        editorContentChanged: editorContentChanged,
                        onEditorContentChanged: onEditorContentChanged,
                        autoSaveContent: autoSaveContent,
                        onAutoSaveContent: onAutoSaveContent,
                        cancelAutoSave: cancelAutoSave,
                        userSaveContent: userSaveContent,
                        onUserSaveContent: onUserSaveContent,
                        contextualEditorBlur: contextualEditorBlur,
                        onContextualEditorBlur: onContextualEditorBlur,
                        contextualEditorFocus: contextualEditorFocus,
                        onContextualEditorFocus: onContextualEditorFocus,
                        contextualEditorClickOnEdit: contextualEditorClickOnEdit,
                        onContextualEditorClickOnEdit: onContextualEditorClickOnEdit,
                        onRouteChanged: onRouteChanged,
                        enterpriseSaveSuccess: enterpriseSaveSuccess,
                        onEnterpriseSaveSuccess: onEnterpriseSaveSuccess,
                        performUndoRedo: performUndoRedo,
                        onPerformUndoRedo: onPerformUndoRedo,
                        changeSaveText: changeSaveText,
                        onChangeSaveText: onChangeSaveText,
                        successfulSave: successfulSave,
                        onSuccessfulSave: onSuccessfulSave,
                        failedSave: failedSave,
                        onFailedSave: onFailedSave,
                        changeSaveEnable: changeSaveEnable,
                        onChangeSaveEnable: onChangeSaveEnable,
                        autoSaveContentWithDelay: autoSaveContentWithDelay,
                        changeRouteUrl: stepUrlChanged,
                        onChangeRouteUrl: onStepUrlChanged,
                        canvasScrolling: canvasScrolling,
                        onCanvasScrolling: onCanvasScrolling,
                        changeStepText: changeStepText,
                        onChangeStepText: onChangeStepText,
                        publicScopeLoaded: publicScopeLoaded,
                        onPublicScopeLoaded: onPublicScopeLoaded,
                        resetScopes: resetScopes,
                        getScope: getScope
                    };
                }
            ])
            .factory('requestInterceptor', [
                '$q',
                '$rootScope',
                function ($q, scope) {

                    return {
                        // On request success
                        request: function (config) {

                            if (config.showAlert) {
                                pace.trackPost();
                                scope.showAlert = true;
                                scope.alertMessage = config.loadingMessage || 'Saving';
                            } else if (!scope.showAlert) {
                                pace.restart();
                            }

                            // Return the config or wrap it in a promise if blank.
                            return config || $q.when(config);
                        },

                        // On request failure
                        requestError: function (rejection) {

                            // Return the promise rejection.
                            // TODO: Do we want to handle disconnected cases?

                            return $q.reject(rejection);
                        },

                        // On response success
                        response: function (response) {

                            if (scope.showAlert && response.config.showAlert || !scope.showAlert) {
                                pace.stop();
                                scope.showAlert = false;
                            }

                            // Return the response or promise.
                            return response || $q.when(response);
                        },

                        // On response failture
                        responseError: function (rejection) {

                            var promiseResponse = {};

                            // this cover the following case
                            // 1) start an alert loading
                            // 2) start another loading
                            // 3) end ajax loading -- does not fire stop, because the showAlert is true
                            // 4) end alert loading
                            if (scope.showAlert && rejection.config.showAlert || !scope.showAlert) {
                                pace.stop();
                                scope.showAlert = false;
                            }

                            switch (rejection.status) {
                                case 0:
                                case 401:
                                case 403:
                                    window.location.href = '/';
                                    promiseResponse = {
                                        status: 401,
                                        text: 'Unauthorized'
                                    };
                                    break;
                                case 500:
                                    window.location.href = errorPage;
                                    promiseResponse = {
                                        status: 500,
                                        text: 'Internal Server Error'
                                    };
                                    break;
                                default:
                                    var tmpErrors = rejection.data.ModelState;
                                    var errors = '';
                                    for (var key in tmpErrors) {

                                        errors += tmpErrors[key] + '\n';
                                    }

                                    promiseResponse = {
                                        status: rejection.status,
                                        text: errors
                                    };

                                    return $q.reject(promiseResponse);
                            }

                            // Return the promise rejection.
                            return $q.reject(rejection);
                        }
                    };
                }
            ])
            .factory('storeService', [
                'dataContext',
                '$rootScope',
                function (dc, scope) {

                    var getStores = function getStores(options, callback) {

                        var params = {
                            listId: options.listId || 0,
                            withMemberCount: !!options.withMemberCount
                        };

                        var callbackWrapper = function (data) {
                            if (angular.isFunction(callback)) {
                                callback(data);
                            }
                        };

                        return dc.getStores(params, callbackWrapper);
                    }

                    var update = function update(store, applyToAll, callback) {
                        var storeData = {
                            Id: store.Id,
                            FacebookURL: store.FacebookURL,
                            TwitterURL: store.TwitterURL,
                            WebsiteURL: store.WebsiteURL,
                            InstagramURL: store.InstagramURL,
                            GooglePlusURL: store.GooglePlusURL,
                            YelpURL: store.YelpURL,
                            FoursquareURL: store.FoursquareURL,
                            TripAdvisorURL: store.TripAdvisorURL,
                            OrderingURL: store.OrderingURL,
                            BlogURL: store.BlogURL,
                            PinterestURL: store.PinterestURL,
                            CustomAURL: store.CustomAURL,
                            CustomBURL: store.CustomBURL,
                            applyToAllLocations: applyToAll || false
                        };

                        var callbackWrapper = function (data) {
                            if (angular.isFunction(callback)) {
                                callback(data);
                            }
                        };

                        return dc.updateStores(storeData, callbackWrapper);
                    };

                    var result = {
                        getStores: getStores,
                        updateStores: update
                    };

                    return result;
                }
            ])
            .factory('clientService', [
                'dataContext',
                'editorEventsChannelService',
                '$rootScope',
                function (dc, editorEvents, scope) {

                    var clientData = {
                        IncludeViewOnlineByDefault: null,
                        IncludeLogoAddressByDefault: null,
                        DefaultReservationButtonColor: null,
                        IncludeFacebookByDefault: null,
                        IncludeTwitterByDefault: null,
                        IncludeWebsiteByDefault: null,
                        IncludeInstagramByDefault: null,
                        IncludeGooglePlusByDefault: null,
                        IncludeYelpByDefault: null,
                        IncludeFoursquareByDefault: null,
                        IncludeTripAdvisorByDefault: null,
                        IncludeOrderingByDefault: null,
                        IncludeBlogByDefault: null,
                        IncludePinterestByDefault: null,
                        IncludeCustomAByDefault: null,
                        IncludeCustomBByDefault: null,
                        DefaultSocialMediaFollowStyle: null
                    };

                    var setClientData = function (data) {
                        clientData.IncludeViewOnlineByDefault = data.IncludeViewOnlineByDefault;
                        clientData.IncludeLogoAddressByDefault = data.IncludeLogoAddressByDefault;
                        clientData.DefaultReservationButtonColor = data.DefaultReservationButtonColor;
                        clientData.IncludeFacebookByDefault = data.IncludeFacebookByDefault;
                        clientData.IncludeTwitterByDefault = data.IncludeTwitterByDefault;
                        clientData.IncludeWebsiteByDefault = data.IncludeWebsiteByDefault;
                        clientData.IncludeInstagramByDefault = data.IncludeInstagramByDefault;
                        clientData.IncludeGooglePlusByDefault = data.IncludeGooglePlusByDefault;
                        clientData.IncludeYelpByDefault = data.IncludeYelpByDefault;
                        clientData.IncludeFoursquareByDefault = data.IncludeFoursquareByDefault;
                        clientData.IncludeTripAdvisorByDefault = data.IncludeTripAdvisorByDefault;
                        clientData.IncludeOrderingByDefault = data.IncludeOrderingByDefault;
                        clientData.IncludeBlogByDefault = data.IncludeBlogByDefault;
                        clientData.IncludePinterestByDefault = data.IncludePinterestByDefault;
                        clientData.IncludeCustomAByDefault = data.IncludeCustomAByDefault;
                        clientData.IncludeCustomBByDefault = data.IncludeCustomBByDefault;
                        clientData.DefaultSocialMediaFollowStyle = data.DefaultSocialMediaFollowStyle;
                    }

                    var getSettings = function (callback) {
                        if (clientData.IncludeViewOnlineByDefault != null && clientData.IncludeFacebookByDefault != null) {
                            var result = angular.copy(clientData);

                            if (angular.isFunction(callback)) {
                                callback(result);
                            }

                            return result;
                        }
                        else {
                            var successCallback = function (responseData) {

                                setClientData(responseData);

                                if (angular.isFunction(callback)) {
                                    callback(responseData);
                                }
                            };

                            return dc.getClient(successCallback);
                        }
                    };

                    var update = function update(options, callback) {
                        var client = {
                            IncludeViewOnlineByDefault: options.IncludeViewOnlineByDefault != null ? options.IncludeViewOnlineByDefault : clientData.IncludeViewOnlineByDefault,
                            IncludeLogoAddressByDefault: options.IncludeLogoAddressByDefault != null ? options.IncludeLogoAddressByDefault : clientData.IncludeLogoAddressByDefault,
                            DefaultReservationButtonColor: options.DefaultReservationButtonColor || clientData.DefaultReservationButtonColor,
                            IncludeFacebookByDefault: options.IncludeFacebookURL != null ? options.IncludeFacebookURL : clientData.IncludeFacebookByDefault,
                            IncludeTwitterByDefault: options.IncludeTwitterURL != null ? options.IncludeTwitterURL : clientData.IncludeTwitterByDefault,
                            IncludeWebsiteByDefault: options.IncludeWebsiteURL != null ? options.IncludeWebsiteURL : clientData.IncludeWebsiteByDefault,
                            IncludeInstagramByDefault: options.IncludeInstagramURL != null ? options.IncludeInstagramURL : clientData.IncludeInstagramByDefault,
                            IncludeGooglePlusByDefault: options.IncludeGooglePlusURL != null ? options.IncludeGooglePlusURL : clientData.IncludeGooglePlusByDefault,
                            IncludeYelpByDefault: options.IncludeYelpURL != null ? options.IncludeYelpURL : clientData.IncludeYelpByDefault,
                            IncludeFoursquareByDefault: options.IncludeFoursquareURL != null ? options.IncludeFoursquareURL : clientData.IncludeFoursquareByDefault,
                            IncludeTripAdvisorByDefault: options.IncludeTripAdvisorURL != null ? options.IncludeTripAdvisorURL : clientData.IncludeTripAdvisorByDefault,
                            IncludeOrderingByDefault: options.IncludeOrderingURL != null ? options.IncludeOrderingURL : clientData.IncludeOrderingByDefault,
                            IncludeBlogByDefault: options.IncludeBlogURL != null ? options.IncludeBlogURL : clientData.IncludeBlogByDefault,
                            IncludePinterestByDefault: options.IncludePinterestURL != null ? options.IncludePinterestURL : clientData.IncludePinterestByDefault,
                            IncludeCustomAByDefault: options.IncludeCustomAURL != null ? options.IncludeCustomAURL : clientData.IncludeCustomAByDefault,
                            IncludeCustomBByDefault: options.IncludeCustomBURL != null ? options.IncludeCustomBURL : clientData.IncludeCustomBByDefault,
                            DefaultSocialMediaFollowStyle: options.DefaultSocialMediaFollowStyle != null ? options.DefaultSocialMediaFollowStyle : clientData.DefaultSocialMediaFollowStyle,
                            ForSettings: options.ForSettings != null ? options.ForSettings : false
                        };

                        var successCallback = function (responseData) {

                            setClientData(responseData);

                            if (angular.isFunction(callback)) {
                                callback(responseData);
                            }
                        };

                        return dc.updateClient(client, successCallback);
                    }

                    var result = {
                        getClient: getSettings,
                        updateClient: update
                    };

                    return result;
                }
            ]);
    }
);