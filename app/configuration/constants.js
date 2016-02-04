function constants(angular, app, options, _){
	'use strict';

	var defaultOptions = {
		sessionKey: null,
		hasSocialMediaEnabled: false,
		maxFileSize: 5 * 1048576,  // 5 MB
		editorDefinitions: {
            TextOnlyEditor: 'text',
            ImageEditor: 'image'
        },
        contentBlockEvents: {
            Reordered: 'Content Blocks Reordered',
            Deleted: 'Content Block Deleted',
            Created: 'Content Block Created'
        },
        canvasClass: 'layout-table',
        contentBlockClass: 'editor-content-block',
        contentBlockDefaultValue: 'editor-default-value',
        droppableContentBlockClass: 'droppable-content-block',
        editorHtmlContainerId: 'editorCanvas',
        overlayClass: 'ui-widget-overlay',
        imageEditorModal: 'imageEditorModal',
        overlayMenuBarClass: 'content-block-menu-bar',
        multiColumnClass: 'multiColumn',
		onEditorContentChangeMessage: 'OnEditorContentChange',
		storageEditorContentKey: 'EditorContent',
        defaultValueText: '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam, magni natus voluptas vero sit nesciunt consequatur eveniet iure tempora ex! Quas iure mollitia aut aspernatur. Voluptas non harum reiciendis vel? Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci, nobis, at, accusamus cumque sit laboriosam non voluptatibus totam iste fugit earum harum nam voluptates officiis et laudantium rem dolorem minus!</p>',
        autoSaveFrequency: 180000,
        allowedHtml: null,
        debug: false,
        loaded: false
	};

	_.extend(defaultOptions, options);

	app.constant('constants', defaultOptions);
}

module.exports = constants;
