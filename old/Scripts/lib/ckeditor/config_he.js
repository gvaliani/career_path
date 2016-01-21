/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function (config) {
    config.toolbar = [
        { name: 'source', items: ['Source'] }
    ];

    config.language = 'en';
    config.skin = 'alphaeditor';
    config.startupMode = 'source';

    config.extraPlugins = 'codemirror';
    config.codemirror = {
        theme: 'default',
        lineNumbers: true,
        lineWrapping: true
    };
};
