/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function (config) {
    // Define changes to default configuration here. For example:
    // config.uiColor = '#AADC6E';

    config.toolbar = [
        { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline'] },
		{ name: 'lists', items: ['NumberedList', 'BulletedList'] },
        { name: 'aligns', items: ['Indent', 'Outdent', 'JustifyLeft', 'JustifyCenter', 'JustifyRight'] },        
        { name: 'insert', items: ['personalization'] },
        '/',
    	{ name: 'fontstyle', items: ['Font', 'FontSize', 'TextColor'] },
        { name: 'clipboard', items: ['Cut', 'Copy', 'Paste'] },
        { name: 'links', items: ['Link', 'Unlink'] },
        { name: 'insertlinks', items: ['updateprofile'] },
	];

    config.language = 'en';
    config.extraPlugins = 'personalization,updateprofile';
    
    // Se the most common block elements.
    config.format_tags = 'p;h1;h2;h3;pre';

    //config.font_names = 'Arial;Courier New;Garamond;Georgia;MS San Serif;Segoe UI;Tahoma;Times New Roman;Verdana';
    config.font_names = 'Andale Mono/"Andale Mono", AndaleMono, monospace;' +
                        'Arial/Arial, "Helvetica Neue", Helvetica, sans-serif;' +
                        'Arial Black/"Arial Black", "Arial Bold", Gadget, sans-serif;' +
                        'Book Antiqua/"Book Antiqua", Palatino, "Palatino Linotype", "Palatino LT STD", Georgia, serif;' +
                        'Century Gothic/"Century Gothic", CenturyGothic, AppleGothic, Arial, sans-serif;' +
                        'Courier New/"Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace;' +
                        'Garamond/Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif;' +
                        'Georgia/Georgia, Times, Times New Roman, serif;' +
                        'Helvetica/"Helvetica Neue", Helvetica, Arial, sans-serif;' +
                        'Impact/Impact, Haettenschweiler, "Franklin Gothic Bold", Charcoal, "Helvetica Inserat", "Arial Black", sans-serif;' +
                        'Lucida Console/"Lucida Console", "Lucida Sans Typewriter", Monaco, monospace;' +
                        'Lucida Sans Unicode/"Lucida Sans Unicode", "Lucida Grande", Tahoma, sans-serif;' +
                        'MS Sans Serif/MS Sans Serif, Arial, "Helvetica Neue", Helvetica, sans-serif;' +
                        'Palatino/Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif;' +
                        'Segoe UI/"Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif;' +
                        'Tahoma/Tahoma, Verdana, Segoe, sans-serif;' +
                        'Times New Roman/TimesNewRoman, "Times New Roman", Times, Baskerville, Georgia, serif;' +
                        'Trebuchet MS/"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Tahoma, sans-serif;' +
                        'Verdana/Verdana, Geneva, sans-serif;';
    
    
    config.fontSize_sizes = '8/8px;9/9px;10/10px;11/11px;12/12px;13/13px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;32/32px;36/36px;48/48px;72/72px;';
    config.skin = 'alphaeditor';

    config.linkShowAdvancedTab = false;
    config.linkShowTargetTab = false;

    config.disableNativeSpellChecker = false;
    config.removePlugins = 'liststyle,tabletools,scayt,menubutton,contextmenu';
    config.browserContextMenuOnCtrl = true;

    // Make dialogs simpler.
    //config.removeDialogTabs = 'image:advanced;link:advanced';
};
