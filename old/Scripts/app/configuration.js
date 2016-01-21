define('configuration',
    [], function () {
        'use strict';

       var steps = [
            { url: '/selectdesign/:designId?', description: 'Select Design', templateUrl: '/memberpages/NewEditor/partials/selectDesign.html', controller: 'SelectDesignCtrl', display: true, routeAlias: 'build' },
            { url: '/selectlayout', description: 'Select Layout', templateUrl: '/memberpages/NewEditor/partials/selectLayout.html', controller: 'SelectLayoutCtrl', display: true },
            { url: '/editcontent/:messageId?', description: 'Edit Content', templateUrl: '/memberpages/NewEditor/partials/editor.html', controller: 'EditContentCtrl', display: true, routeAlias: 'canned' }, // routeAlias intention is to make /canned work as /editcontent for menu and step handlers
            { url: '/members', description: 'Schedule & Send', templateUrl: '/memberpages/NewEditor/partials/members.html', controller: 'SelectMembersCtrl', display: true },
            { url: '/confirmation', description: '', templateUrl: '/memberpages/NewEditor/partials/confirmation.html', controller: 'ConfirmationCtrl', display: false },
            { url: '/canned/:id?/:type?', description: 'Canned Content', templateUrl: '/memberpages/NewEditor/partials/editor.html', controller: 'EditContentCtrl', display: false },
            { url: '/build/:type?/:name?/:category?', description: 'Build Your Own', templateUrl: '/memberpages/NewEditor/partials/selectDesign.html', controller: 'SelectDesignCtrl', display: false }
        ];

        var sessionKey = window.sessionKey;
        var hasSocialMedia = false;
        var maxFileSize = 5 * 1048576;  // 5 MB

    var isSuperUser,
        timeZone,
        twitterPostMaxLength,
        twitterSocialMediaTypeId,
        facebookPostMaxLegnth,
        facebookSocialMediaTypeId,
        foursquarePostMaxLength,
        foursquareSocialMediaTypeId,
        socialMediaPreviewLength,
        isFullSupportedClient,
        autoSpellCheck,
        couponCodeLabelText,
        hasReservationLink,
        hasWebpageLinks,
        showNewEditorTour;

        var editors = {
            TextOnlyEditor: 'text',
            ImageEditor: 'image'
        };

        var contentBlockEvents = {
            Reordered: 'Content Blocks Reordered',
            Deleted: 'Content Block Deleted',
            Created: 'Content Block Created'
        };

    var loyaltyMessageText = {
        1: 'Your Welcome message will be sent to new members when they join your mailing list.',
        2: 'Your Membership Anniversary message will be sent to members on the anniversary of the date they joined your mailing list.',
        3: 'Your Birthday message will be sent to members 7 days before their birthday.',
        4: 'Your Wedding Anniversary message will be sent to members 7 days before their wedding anniversary.',
        5: 'Your Thank You message will be sent to members 2 days after they dined at your restaurant.',
        6: 'Your Miss You message will be sent to members 4 months after they last dined at your restaurant.'
    };

        return {
            maxFileSize: maxFileSize,
            canvasClass: 'layoutTable',
            droppableContentBlockClass: 'droppableContentBlock',
            contentBlockClass: 'editorContentBlock',
            editorHtmlContainerId: 'editorCanvas',
            overlayClass: 'ui-widget-overlay',
            imageEditorModal: 'imageEditorModal',
            overlayMenuBarClass: 'contentBlockHoverMenuBar',
            contentBlockDefaultValue: 'editor-default-value',
            multiColumnClass: 'multiColumn',
            contentBlockEvents: contentBlockEvents,
            defaultValueText: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam, magni natus voluptas vero sit nesciunt consequatur eveniet iure tempora ex! Quas iure mollitia aut aspernatur. Voluptas non harum reiciendis vel? Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci, nobis, at, accusamus cumque sit laboriosam non voluptatibus totam iste fugit earum harum nam voluptates officiis et laudantium rem dolorem minus!</p>',
            steps: steps,
            sessionKey: sessionKey,
            isSuperUser: isSuperUser,
            // ReSharper disable UsageOfPossiblyUnassignedValue
            timeZone: timeZone,
            // ReSharper restore UsageOfPossiblyUnassignedValue
            editorDefinitions: editors,
            loyaltyMessageText: loyaltyMessageText, 
            onEditorContentChangeMessage: 'OnEditorContentChange',
            storageEditorContentKey: 'EditorContent',
            autoSaveFrecuency: 180000,
            hasSocialMediaEnabled: hasSocialMedia,
            twitterPostMaxLength: twitterPostMaxLength,
            twitterSocialMediaTypeId: twitterSocialMediaTypeId,
            facebookPostMaxLegnth: facebookPostMaxLegnth,
            facebookSocialMediaTypeId: facebookSocialMediaTypeId,
            foursquarePostMaxLength: foursquarePostMaxLength,
            foursquareSocialMediaTypeId: foursquareSocialMediaTypeId,
            socialMediaPreviewLength: socialMediaPreviewLength,
            isFullSupportedClient: isFullSupportedClient,
            autoSpellCheck: autoSpellCheck,
            couponCodeLabelText: couponCodeLabelText,
            hasReservationLink: hasReservationLink,
            hasWebpageLinks: hasWebpageLinks,
            allowedHtml: null,
            showNewEditorTour: showNewEditorTour,
            debug: false,
            loaded: false
        };
    });