define('editorSpecifications',
    ['angular', 'jquery', 'configuration'],
    function (angular, $, configuration) {
        'use strict';

        return angular
            .module('contextualDirectives', ['editor.services'])
            .directive('textEditor', [
                'editorEventsChannelService',
                function (editorEvents) {
                    var definition = {
                        restrict: 'A',
                        terminal: true,
                        scope: true,
                        link: function textEditorLink(scope, element) {

                            var actionType = 'Text Editor Change',
                                contentBlockId,
                                lastValue,
                                instance,
                                toolbar;

                            function getContent() {

                                var contentChanged;

                                // Sometimes CKEditor blur event does not get executed so we run this here
                                if (instance) {
                                    contentChanged = !reflectDefaultValue(instance.getData());
                                }

                                var stripAttributesForSaving = function ($obj) {

                                    var hasContentBlockDefaultValue = $obj.hasClass(configuration.contentBlockDefaultValue);

                                    $obj.removeAttr('spellcheck')
                                        .removeAttr('class')
                                        .removeAttr('role')
                                        .removeAttr('aria-label')
                                        .removeAttr('title')
                                        .removeAttr('aria-describedby')
                                        .removeAttr('tabindex')
                                        .removeAttr('contenteditable');

                                    // if has default value, preserve the class name so the block can be stripped before
                                    // saving in Enterprise
                                    if (hasContentBlockDefaultValue) {
                                        $obj.addClass(configuration.contentBlockDefaultValue);
                                    }

                                    // Remove width from css so that SM preview shows text wrapping around image
                                    // Remove position relative to make img more accesible
                                    $obj.css({ 'width' :'', 'position':'static'});

                                    // contentChanged is not necessarily the opposite of hasContentBlockDefaultValue
                                    // in this situation. contentChanged can only be set if CKEditor was instantiated
                                    if (contentChanged) {
                                        $obj.empty().append(instance.getData());
                                    }
                                };

                                var $wrapper = element.clone();

                                if ($wrapper.attr('contenteditable')) { // Text-Image Combo 
                                    stripAttributesForSaving($wrapper);
                                }
                                else {
                                    $wrapper.find('[contenteditable]').each(function () {
                                        stripAttributesForSaving($(this));
                                    });
                                }

                                $wrapper.find('p').each(function () {
                                    $(this).css('margin', '0');

                                    // if there was no text there is probably we use it only for create a new line (add a br)
                                    if (!$.trim($(this).text()).length && $(this).html().indexOf('<br') == -1) {
                                        $(this).append('<br/>');
                                    }
                                });

                                $wrapper.find('a').each(function () {
                                    var $that = $(this);
                                    if ($that.attr('href') !== 'javascript:;') {
                                        return;
                                    }
                                    var url;
                                    if ($that.attr('data-cke-saved-href') && $that.attr('data-cke-saved-href') !== 'javascript:;') {
                                        url = $that.attr('data-cke-saved-href');
                                    }

                                    if ($that.attr('data-editor-url') && $that.attr('data-editor-url') !== 'javascript:;') {
                                        url = $that.attr('data-editor-url');
                                    }

                                    $that.attr({ 'href': url, 'data-cke-saved-href': url, 'data-editor-url': url });
                                });

                                $wrapper.find('.ui-widget-overlay').remove();

                                return $wrapper;
                            };

                            /// used to add/remove the "configuration.contentBlockDefaultValue" class according to the current value
                            function reflectDefaultValue(editorValue) {
                                // use startWith because sometimes CKEditor picks up the overlay div
                                if (editorValue.length > configuration.defaultValueText.length) {
                                    editorValue = editorValue.substring(0, configuration.defaultValueText.length);
                                }

                                if (editorValue == configuration.defaultValueText) {
                                    element.addClass(configuration.contentBlockDefaultValue);
                                    return true;
                                }
                                else {
                                    element.removeClass(configuration.contentBlockDefaultValue);
                                    return false;
                                }
                            };

                            function performAction(actionDescriptor, isUndo) {
                                if (isUndo) {
                                    instance.setData(actionDescriptor.PreviousValue);
                                    reflectDefaultValue(actionDescriptor.PreviousValue);
                                } else {
                                    instance.setData(actionDescriptor.CurrentValue);
                                    reflectDefaultValue(actionDescriptor.CurrentValue);
                                }
                            };

                            function init() {

                                // needs to be done regardless user clicks or not on content block
                                if (!instance) {
                                    element.find('a').each(function () {
                                        var $that = $(this),
                                            url;

                                        if ($that.attr('href') !== 'javascript:;') {
                                            url = $that.attr('href');
                                        }

                                        if (!url && $that.attr('data-editor-url')) {
                                            url = $that.attr('data-editor-url');                                            
                                        }
                                        
                                        $that.attr({ 'data-editor-url': url, 'data-cke-saved-href': url });
                                    });
                                }

                                // jQuery events
                                $(element).delegate('.' + configuration.overlayClass, 'click', function () {
                                    if (!instance) {
                                        setupMarkup();
                                    }
                                    else {
                                        focus();
                                    }
                                });

                                editorEvents.onCanvasScrolling(scope, onScroll);
                            };

                            function onScroll() {
                                // check if instance has been created and if is visible

                                if (instance && toolbar && toolbar.filter(':visible').length) {
                                    // adapt to position
                                    positionToolbar();
                                }
                            };

                            function removeDefaultText() {
                                // remove default text when user clicks
                                var editorValue = instance.getData().trim();

                                if (editorValue.length > configuration.defaultValueText.length) {
                                    editorValue = editorValue.substring(0, configuration.defaultValueText.length);
                                }

                                if (editorValue == configuration.defaultValueText && element.hasClass(configuration.contentBlockDefaultValue)) {
                                    instance.setData('');
                                }
                            };

                            function focus() {

                                instance.focus();
                                removeDefaultText();
                                editorEvents.contextualEditorFocus(contentBlockId);

                                // Applying positioning on modal (needs to be done on visible dom)
                                positionToolbar();
                            };

                            function positionToolbar() {
                                toolbar
                                    .position({ my: 'center bottom', at: 'center top-20', of: instance.element.$, colission: 'none', within: '#' + configuration.editorHtmlContainerId });
                            };

                            function setupMarkup() {
                                CKEDITOR.config.scayt_autoStartup = configuration.autoSpellCheck;

                                // create instance
                                if (element.is('[data-contenteditable]')) {
                                    element.attr('contenteditable', true);
                                    instance = CKEDITOR.inline(element[0]);
                                } else {
                                    element.find('[data-contenteditable]').attr('contenteditable', true);
                                    instance = CKEDITOR.inline(element.find('[data-contenteditable]')[0]);
                                }

                                //set the initial focus
                                instance.on('instanceReady', function () {

                                    //set initial info
                                    contentBlockId = element.parents('.' + configuration.contentBlockClass + ':eq(0)').data('id');
                                    scope.editorId = instance.name;

                                    // setup HTML
                                    element.css('width', element.width());

                                    lastValue = instance.getData();

                                    instance.on('focus', focus);
                                    toolbar = $('#cke_' + instance.name);

                                    // trigger focus
                                    focus();
                                });

                                //set the on change event
                                instance.on('blur', function () {

                                    /// restore default text if the user doesnt set any text
                                    if (element.hasClass(configuration.contentBlockDefaultValue) && instance.getData() === '') {
                                        instance.setData(configuration.defaultValueText);
                                    }

                                    //there was a change on content?
                                    if (instance.getData() !== lastValue) {

                                        reflectDefaultValue(instance.getData());

                                        //notify "editor content changed" subscribers
                                        editorEvents.editorContentChanged(actionType, scope.editorId, contentBlockId, lastValue, instance.getData());

                                        //update our last value
                                        lastValue = instance.getData();
                                    }

                                    //execute on blur
                                    editorEvents.contextualEditorBlur(contentBlockId);

                                });

                                // undo/redo events
                                editorEvents.onPerformUndoRedo(scope, performAction);
                            };

                            if (!window.CKEDITOR) {
                                require(['ckeditor'], function () {
                                    init();
                                });
                            } else {
                                init();
                            }

                            angular.extend(scope, {
                               getContent: getContent
                            });
                        }
                    };

                    return definition;
                }
            ])
            .directive('imageEditor', [
                'editorEventsChannelService',
                function (editorEvents) {
                    var definition = {
                        restrict: 'A',
                        scope: true,
                        terminal: true,
                        link: function imageEditorLink(scope, element) {

                            var actionType = 'Image Editor Change',
                                lastValue,
                                contentBlockId,
                                modalScope,
                                defaultValue;

                            function getContent() {

                                var $wrapper = element.clone();

                                // clean up img attrs if user has changed it
                                // otherwise leave alone so when user returns the image content blocks still work
                                var isDefault = $wrapper.find('img').attr('src').indexOf('/Images/LayoutPreviews/') > -1;

                                var maxWidth = parseInt($wrapper.find('img').attr('data-max-width'));

                                if (!isDefault) {
                                    $wrapper.removeClass(configuration.contentBlockDefaultValue)
                                        .find('img')
                                        .removeAttr('class')
                                        .removeAttr('style')
                                        .removeAttr('data-max-width')
                                        .attr('border', '0');
                                }

                                // Find the image editor to remove the resizable elements
                                var cleanHtml;
                                if ($wrapper.find('img').parent('a').length) {

                                    // enabling image editor links
                                    var dataHref = $wrapper.find('img').parent('a').attr('data-editor-url');
                                    $wrapper.find('img').parent('a').attr('href', dataHref);

                                    // copy only useful markup
                                    cleanHtml = $wrapper.find('img').parent('a');
                                } else {
                                    cleanHtml = $wrapper.find('img, map');
                                }

                                // Replace the html with the resizable elements with just the img and the mapping
                                $wrapper.find('.ui-wrapper').parent().empty().append(cleanHtml);

                                // Special treatment for text-image content block combo (image on right)
                                // so that text wraps around image in social media preview, float:right must be removed
                                // and replaced with align="right" in the $wrapper
                                if (element.siblings("[text-editor]").length > 0 && $wrapper.css('float') == 'right') {
                                    $wrapper.css('float', 'none');
                                    $wrapper.attr('align', 'right');
                                }

                                // This is to do a better threatment when images end up with height or width NaN
                                // We'll set the max layout width if NaN
                                if (!$.isNumeric($wrapper.find('img').attr('width'))) {
                                    if ($wrapper.find('img').attr('data-file-width') > maxWidth) {
                                        $wrapper.find('img').attr('width', maxWidth);
                                        $wrapper.find('img').removeAttr('height');
                                    } else {
                                        $wrapper.find('img').attr('width', $wrapper.find('img').attr('data-file-width'));
                                        $wrapper.find('img').attr('height', $wrapper.find('img').attr('data-file-height'));
                                    }
                                }

                                if (!$.isNumeric($wrapper.find('img').attr('height'))) {
                                    $wrapper.find('img').removeAttr('height');
                                }

                                return $wrapper;
                            }

                            function init() {

                                // Restore float:right so it's displayed correctly on editable preview (Step 3)
                                if (element.siblings("[text-editor]").length > 0 && element.attr('align') == 'right') {
                                    element.css('float', 'right');
                                    element.removeAttr('align');
                                }

                                element.find('map area[data-editor-url], a[data-editor-url]').each(function eachMapUrl(ind, elem) {
                                    $(elem).attr('href', $(elem).attr('data-editor-url'));
                                });

                                window.requestAnimFrame(function () {
                                    /******** Get Content BlockId *******/
                                    element.find('.' + configuration.overlayClass).zIndex(1);
                                    contentBlockId = element.parents('.' + configuration.contentBlockClass).data('id');
                                    scope.editorId = 'Image Editor #' + contentBlockId + Math.random();


                                    // this creates the default resize dom structure.
                                    if (!element.find('map').length) {
                                        setupCanvasResize();
                                    }
                                });

                                element.parent().on('mouseover.imageEditor', function (evt) {

                                    // ensure z-index = 1
                                    if (element.find('.' + configuration.overlayClass).length) {

                                        element.find('.' + configuration.overlayClass).zIndex(1);

                                        // unsubscribe for this event
                                        element.parent().off('mouseover.imageEditor');

                                        //set events
                                        element.on('click', '.' + configuration.overlayClass, onClick);
                                        element.on('mouseover', '.' + configuration.overlayClass, onMouseOver);
                                    }
                                });

                                element.find('img').on('error', function onimgerror(ev) {
                                    if (lastValue && lastValue.src) {
                                        $(ev.currentTarget).attr('src', lastValue.src);
                                    }
                                });

                                // get modal scope
                                if (!editorEvents.getScope('IMAGE_MODAL_READY')) {

                                    editorEvents.onPublicScopeLoaded(scope, function (message) {
                                        if (message.type === 'IMAGE_MODAL_READY') {
                                            modalScope = message.scope;
                                            modalScope.savePromise.promise.then(null, null, imageEditorChanged);
                                        }
                                    });
                                } else {
                                    modalScope = editorEvents.getScope('IMAGE_MODAL_READY');
                                    modalScope.savePromise.promise
                                        .then(null, null, imageEditorChanged);
                                }

                                // undo/redo events
                                editorEvents.onPerformUndoRedo(scope, performAction);
                            }

                            function onClick() {
                                scope.$root.safeApply(function () {
                                    setupImageData();
                                    modalScope.validFile = true;
                                    modalScope.show();
                                });
                            }

                            function getImageAlignment() {
                                return element.closest('td').attr('align') || 'center';
                            };

                            function setupImageData(size) {

                                if (!lastValue) {
                                    var imgTarget = element.find('map').length ? element.find('img') : element.find('.ui-wrapper img');

                                    lastValue = {
                                        maxWidth: imgTarget.attr('data-max-width') ? parseInt(imgTarget.attr('data-max-width')) : getElementWidth($('.layoutTable')),
                                        src: imgTarget.attr('src'),
                                        alt: imgTarget.attr('alt'),
                                        fileWidth: parseInt(imgTarget.attr('data-file-width')),
                                        fileHeight: parseInt(imgTarget.attr('data-file-height')),
                                        id: imgTarget.attr('data-file-id'),
                                        width: parseInt(imgTarget.attr('width')),
                                        height: parseInt(imgTarget.attr('height')),
                                        linkto: imgTarget.closest('a').attr('data-editor-url'),
                                        map: $.fn.outerHTML(imgTarget.siblings('map:eq(0)')),
                                        alignEnabled: imgTarget.attr('data-align-enabled'),
                                        align: getImageAlignment()
                                    };

                                    if (!defaultValue) {
                                        defaultValue = lastValue;
                                    }
                                }

                                modalScope.imageData.maxWidth = lastValue.maxWidth;
                                modalScope.imageData.src = lastValue.src;
                                modalScope.imageData.alt = lastValue.alt;
                                modalScope.imageData.fileWidth = lastValue.fileWidth;
                                modalScope.imageData.fileHeight = lastValue.fileHeight;
                                modalScope.imageData.id = lastValue.id;
                                modalScope.imageData.width = size ? size.width : lastValue.width;
                                modalScope.imageData.height = size ? size.height : lastValue.height;
                                modalScope.imageData.linkto = lastValue.linkto;
                                modalScope.imageData.map = lastValue.map;
                                modalScope.mapperOutput = modalScope.imageData.map;
                                modalScope.previewSrc = modalScope.imageData.src;
                                modalScope.editorId = scope.editorId;
                                modalScope.imageData.alignEnabled = lastValue.alignEnabled;
                                modalScope.imageData.align = lastValue.align;
                            };

                            function imageEditorChanged(data, isInlineResize) {
                                if (modalScope.editorId !== scope.editorId) {
                                    return;
                                }

                                saveChangesInDom(data, isInlineResize);
                                // notify "editor content changed" subscribers
                                editorEvents.editorContentChanged(actionType, scope.editorId, contentBlockId, lastValue, data);
                                lastValue = data;                                
                            }

                            function performAction(actionDescriptor, isUndo) {
                                if (isUndo) {
                                    saveChangesInDom(actionDescriptor.PreviousValue);
                                    lastValue = actionDescriptor.PreviousValue;
                                } else {
                                    saveChangesInDom(actionDescriptor.CurrentValue);
                                    lastValue = actionDescriptor.CurrentValue;
                                }
                            };

                            function disableResizables() {
                                element.parents('.' + configuration.canvasClass)
                                        .find('.ui-wrapper img')
                                        .resizable('disable');
                            }

                            function onMouseOver(evt) {
                                // prevent bubbling
                                evt.stopImmediatePropagation();

                                if (element.find('.ui-wrapper').length) {
                                    disableResizables();
                                    if (!element.find('.ui-wrapper img[usemap]').length) {
                                        element.find('.ui-wrapper img').resizable('enable');
                                    }

                                }
                            };

                            function getElementWidth(container) {
                                var containerWidth = container.attr('width');

                                // if the element does not have width attr setted
                                if (!containerWidth) {
                                    return getElementWidth(container.parents('[width]:eq(0)'));
                                }

                                // if the container width is a percentage, multiply it by the width of the parent
                                if (containerWidth.indexOf('%') !== -1) {
                                    containerWidth = parseInt(containerWidth, 10) / 100;
                                    // width = container% * parentWidth;
                                    return containerWidth * getElementWidth(container.parents('[width]:eq(0)'));
                                } else {
                                    // the width of the container is a number, return that
                                    return parseInt(containerWidth, 10);
                                }
                            }

                            function setupCanvasResize() {

                                disableResizables();

                                /***** Image Resize on Canvas *****/
                                var imgTarget = element.find('img');

                                if (!imgTarget.siblings('map').length) {

                                    // Remove the style width/height from the parent element of the img
                                    element.css({ 'width': '', 'height': '' });

                                    var width = Number(imgTarget.attr('width')),
                                        height = Number(imgTarget.attr('height')),
                                        ratio = width / height,
                                        minW = width * 0.1,
                                        minH = height * 0.1,
                                        maxW,
                                        maxH;

                                    var siblings = element.siblings('[editable]').length;
                                    var maxContainerWidth = getElementWidth($('.layoutTable'));
                                    // get width of the first parent

                                    //var maxContainerWidth = parseInt(Number(layoutTable.parents('[width]:eq(0)').attr('width')) * (parseInt(layoutTable.attr('width'), 10) / 100), 10);

                                    // each sibling could fill min the 10% of maxContainerWidth
                                    var maxAvailableWidth = maxContainerWidth * (1 - (siblings / 10));

                                    maxW = maxAvailableWidth > Number(imgTarget.attr('data-file-width')) ? Number(imgTarget.attr('data-file-width')) : maxAvailableWidth;
                                    maxH = (maxW / width) * height;

                                    var resizedCss = {
                                        width: width < maxW ? width : maxW,
                                        height: height < maxH ? height : maxH
                                    };

                                    imgTarget.attr({
                                        'data-max-width': maxAvailableWidth,
                                        'width': resizedCss.width,
                                        'height': resizedCss.height
                                    });
                                    
                                    imgTarget.css(resizedCss);

                                    // If image is linked, the a tag needs to be inside the div.ui-wrapper instead of the other way around
                                    var link;
                                    if (imgTarget.parent('a').length)
                                    {
                                        link = imgTarget.parent('a').clone().empty();                                        
                                        imgTarget.unwrap();
                                    }

                                    imgTarget.resizable({
                                        aspectRatio: ratio,
                                        minWidth: minW,
                                        minHeight: minH,
                                        maxWidth: maxW,
                                        maxHeight: maxH,
                                        handles: "all",
                                        start: function () {
                                            editorEvents.contextualEditorFocus(contentBlockId);
                                        },
                                        stop: function (event, ui) {
                                            editorEvents.contextualEditorBlur(contentBlockId);

                                            if (ui.size.width != ui.originalSize.width
                                                && ui.size.height != ui.originalSize.height) {
                                                scope.safeApply(function () {

                                                    // setup the image data before change
                                                    setupImageData({
                                                        width: parseInt(ui.size.width),
                                                        height: parseInt(ui.size.height)
                                                    });

                                                    // change width and height
                                                    var changedMessage = {
                                                        data: angular.copy(lastValue)
                                                    };

                                                    changedMessage.data.width = ui.size.width;
                                                    changedMessage.data.height = ui.size.height;

                                                    // persist changes, notyfing that isInlineResize so if it's multi image we skip the automatic resize
                                                    scope.imageEditorChanged(changedMessage.data, true);
                                                });
                                            }
                                        }
                                    });

                                    if (link)
                                    {
                                        imgTarget.wrap(link);
                                    }

                                    if (element.parents('.editorContentBlock').find('table[multi-column]').length > 0) {
                                        resizeMultiColumn();
                                    }
                                }
                            }

                            function saveChangesInDom(imageData, isInlineResize) {
                                var imgElement = element.find('img[data-file-width]'),
                                    resizable = element.find('.ui-wrapper');

                                // remove/add class indicating whether the content block has changed its default value
                                if (angular.equals(imageData, defaultValue)) {
                                    element.addClass(configuration.contentBlockDefaultValue);
                                }
                                else {
                                    element.removeClass(configuration.contentBlockDefaultValue);
                                }

                                // check if the image has changed to update the manual resize
                                if (resizable.length && resizable.find('img').attr('src') != imageData.src) {

                                    var maxAvailableWidth = resizable.find('img').attr('data-max-width');

                                    var ratio = Number(imageData.width) / Number(imageData.height),
                                        minW = Number(imageData.width) * 0.1,
                                        minH = Number(imageData.height) * 0.1,
                                        maxW = maxAvailableWidth > Number(imageData.fileWidth) ? Number(imageData.fileWidth) : maxAvailableWidth,
                                        maxH = (maxW / Number(imageData.width)) * Number(imageData.height);

                                    // update the manual resize
                                    resizable.find('img').resizable('option', {
                                        aspectRatio: ratio,
                                        minWidth: minW,
                                        minHeight: minH,
                                        maxWidth: maxW,
                                        maxHeight: maxH
                                    });
                                }

                                // update img attr
                                imgElement.attr({
                                    'src': imageData.src,
                                    'height': maxAvailableWidth < imageData.width ? maxH : imageData.height,
                                    'width': maxAvailableWidth < imageData.width ? maxW : imageData.width,
                                    'data-file-id': imageData.id,
                                    'data-file-width': imageData.fileWidth,
                                    'data-file-height': imageData.fileHeight,
                                    'alt': imageData.alt,
                                    'data-map': !!imageData.map
                                });

                                var resizableCss = {
                                    width: maxAvailableWidth < imageData.width ? maxW : imageData.width,
                                    height: maxAvailableWidth < imageData.width ? maxH : imageData.height
                                };

                                // update resizable css
                                resizable.css(resizableCss);

                                if (imageData.alignEnabled) {
                                    if (resizable.length) {
                                        resizable.closest('td').attr('align', imageData.align);
                                    } else {
                                        imgElement.parents('td:eq(0)').attr('align', imageData.align);
                                    }
                                }

                                // update img css
                                imgElement.css(resizableCss);

                                var link = resizable.find('> a');

                                // update if link to is present
                                if (imageData.linkto) {

                                    if (link.length) {
                                        link.attr('data-editor-url', imageData.linkto);
                                    } else {
                                        link = $('<a href="javascript:;" data-editor-url="' + imageData.linkto + '"></a>').append(element.find('img'));
                                        resizable.append(link);
                                    }
                                } else if (link.length) {
                                    //remove link and let image
                                    resizable.append(link.find('img'));
                                    link.remove();
                                }

                                var previousMap = element.find('map');

                                if (imageData.map) {

                                    if (previousMap.length) {
                                        previousMap.remove();
                                    }
                                    var newMap = $(imageData.map);
                                    newMap.appendTo(imgElement.parent());
                                    imgElement.attr('useMap', '#' + newMap.attr('id'));

                                } else if (previousMap.length) {
                                    previousMap.remove();
                                    imgElement.removeAttr('useMap');
                                }

                                // If coming from resize, the imageData is empty object and we don't have to resize again
                                if (!isInlineResize) {
                                    resizeMultiColumn();
                                }
                            }

                            function resizeImage(elem, height, width) {
                                // This is to leave space between images that works in all email clients.
                                var imgElement = elem,
                                    resizable = elem.parents('.ui-wrapper');

                                // update img attr
                                imgElement.attr({
                                    'height': height,
                                    'width': width
                                });

                                resizable.resizable("option", "maxWidth", width);

                                var resizableCss = {
                                    width: width,
                                    height: height
                                };

                                // update resizable css
                                resizable.css(resizableCss);

                                // update img css
                                imgElement.css(resizableCss);
                            };

                            function getAttrValue(elem, name) {
                                return parseInt($(elem).attr('data-file-' + name) ? $(elem).attr('data-file-' + name) : $(elem).attr(name));
                            };

                            function isDefaultImage(elem) {
                                return $(elem).attr('src').toLowerCase().indexOf('/layoutpreviews') > -1;
                            };

                            function resizeMultiColumn() {
                                if (element.parents('[multi-column]').length > 0) {                                    
                                    resizeByHeight(getElementWidth($('.layoutTable')) - 10);                                    
                                }
                            };

                            function getMinHeight(images) {
                                var minHeight = 0;
                                $(images).each(function (index, elem) {
                                    if (!elem.isDefault && (minHeight == 0 || elem.fileHeight < minHeight)) {
                                        minHeight = elem.fileHeight;
                                    }
                                });

                                return minHeight;
                            };

                            function getTotalWidthByMinHeight(images, minHeight) {
                                var totalWidthAfterResize = 0;                               
                                $(images).each(function (index, elem) {
                                    var width = elem.fileWidth; // This is width of default images

                                    // If not default image, apply ratio
                                    if (!elem.isDefault) {
                                        var ratioHeight = minHeight / elem.fileHeight;

                                        // If the image with the min height
                                        if (ratioHeight == 1) {
                                            elem.isMinHeight = true;                                         
                                        }

                                        width = elem.fileWidth * ratioHeight;
                                    }

                                    totalWidthAfterResize += width;
                                });

                                return totalWidthAfterResize;
                            };

                            function getMinImageWidth(images) {
                                var minImageWidth = 0;
                                $(images).each(function (index, elem) {
                                    if (elem.isDefault) {
                                        minImageWidth = elem.fileWidth;
                                    }
                                });

                                return minImageWidth;
                            };

                            function resizeByHeight(maxContainerWidth) {
                                var images =[];

                                // Fill the array for easier handling
                                element.parents('[multi-column]').find('img[data-file-width]').each(function(index, elem) {
                                    images.push({
                                        fileHeight: getAttrValue(elem, 'height'),
                                        fileWidth: getAttrValue(elem, 'width'),
                                        isDefault: isDefaultImage(elem),
                                        isMinHeight: false,                                        
                                        imageElem: $(elem)
                                    });
                                });

                                // Get the min height of all images in block
                                var minHeight = getMinHeight(images);
                                // Check what will be the total width based by minHeight
                                var totalWidthByMinHeight = getTotalWidthByMinHeight(images, minHeight);
                                var minImageWidth = getMinImageWidth(images);

                                var totalPercentOccupied = 0;
                                var first = true;

                                // If total width is greater than container, we need to find a new size
                                if (totalWidthByMinHeight > maxContainerWidth) {
                                    var diffWidth = 0;
                                    $(images).each(function (index, elem) {
                                        if (elem.isMinHeight && first) {
                                            first = false; // this flag is in case there are multiple images with same min height

                                            // get % width occupied by that image                                                
                                            var percentOccupied = elem.fileWidth / totalWidthByMinHeight;

                                            // if occupies more than 50% and there are 3 images, apply max of 50%
                                            if (percentOccupied > 0.5 && images.length == 3) {
                                                var newImageWidth = totalWidthByMinHeight * 0.5;
                                                diffWidth = elem.fileWidth - newImageWidth;
                                                percentOccupied = 0.5;
                                            }
                                            else if (percentOccupied > 0.8 && images.length == 2) {
                                                var newImageWidth = totalWidthByMinHeight * 0.8;
                                                diffWidth = elem.fileWidth - newImageWidth;
                                                percentOccupied = 0.8;
                                            }
                                            totalPercentOccupied += percentOccupied;

                                            // Percentage adjusted to the max container width
                                            var newWidth = percentOccupied * maxContainerWidth;
                                            var newHeight = (newWidth / elem.fileWidth) * minHeight;
                                            minHeight = newHeight;
                                        } else {
                                            totalPercentOccupied += elem.fileWidth / totalWidthByMinHeight;
                                        }
                                    });                                    
                                }

                                var totalWidthOfImages = 0;
                                var resetPadding = false;

                                $(images).each(function (index, elem) {
                                    var ratioHeight = minHeight / elem.fileHeight;

                                    // For non default images, apply resize based on min height
                                    if (!elem.isDefault) {
                                        var height = minHeight;
                                        var width = elem.fileWidth * ratioHeight;

                                        totalWidthOfImages += width;
                                        resizeImage(elem.imageElem, height, width);
                                    } else {
                                        // Since we're not considering default images for minHeight, we need to resize them to it does not take more than maxContainerWidth
                                        var totalSpareWidth = totalWidthByMinHeight - minImageWidth;
                                        var percentChange = elem.fileWidth / totalSpareWidth;
                                        var finalWidth = (diffWidth * percentChange) + elem.fileWidth;
                                        var percentOccupied = finalWidth / totalWidthByMinHeight;

                                        // Percentage adjusted to the max container width
                                        var newWidth = percentOccupied * maxContainerWidth;
                                        var newRatioWidth = newWidth / elem.fileWidth;
                                        var newHeight = newRatioWidth * elem.fileHeight;                                        

                                        // This is for the case of only one big image that takes up to 50%
                                        if (diffWidth > 0) {
                                            newWidth = 113;
                                            newHeight = 50;
                                        } // This is for the case when resize is such that the placeholder ends up being really small
                                        else if (newWidth < 50 || newHeight < 50) {
                                            newWidth = 50;
                                            newHeight = 50;
                                            resetPadding = true;
                                        }

                                        totalWidthOfImages += newWidth;
                                        resizeImage(elem.imageElem, newHeight, newWidth);
                                    }
                                });

                                // This will apply a padding left and right of 5px and add centering
                                applyCenteringPadding(images, maxContainerWidth, totalWidthOfImages, resetPadding);
                            };

                            function applyCenteringPadding(images, maxContainerWidth, totalWidthOfImages, resetPadding) {
                                var padding = (maxContainerWidth - totalWidthOfImages - (10 * (images.length - 1))) / 2;

                                $(images).each(function (index, elem) {
                                    if (resetPadding) {
                                        elem.imageElem.closest("td").css("padding-left", "1px");
                                        elem.imageElem.closest("td").css("padding-right", "1px");
                                    }
                                    else {
                                        elem.imageElem.closest("td").css("padding-left", "5px");
                                        elem.imageElem.closest("td").css("padding-right", "5px");
                                    }

                                    if (index == 0) {
                                        elem.imageElem.closest("td").css("padding-left", padding + "px");
                                    }

                                    if (index == images.length - 1) {
                                        elem.imageElem.closest("td").css("padding-right", padding + "px");
                                    }
                                });
                            };

                            if (!window.imgmap) {
                                require(['imgmap'], function () {
                                    init();
                                });
                            } else {
                                init();
                            }

                            angular.extend(scope, {
                                imageEditorChanged: imageEditorChanged,
                                getContent: getContent,
                                resizeMultiColumn: resizeMultiColumn
                            });
                        }
                    };
                    return definition;
                }
            ])
            .directive('redeemButtonEditor', [
                'editorEventsChannelService',
                function (editorEvents) {
                    var definition = {
                        restrict: 'A',
                        terminal: true,
                        scope: true,
                        link: function (scope, element) {

                            var actionType = 'Redeem Button Editor Change',
                                contentBlockId,
                                lastValue,
                                instance;

                            scope.getContent = function () {
                                var $wrapper = element.clone();

                                if ($wrapper.find('a').length) {
                                    // restore URL
                                    var dataHref = $wrapper.find('a').attr('data-editor-url');
                                    if (dataHref) {
                                        $wrapper.find('a').attr('href', dataHref);
                                        $wrapper.find('a').removeAttr('data-editor-url');
                                    }
                                }

                                return $wrapper;
                            };
                        }
                    };
                    return definition;
                }
            ])
            .directive('dividerEditor', [
                'editorEventsChannelService',
                function (editorEvents) {
                    var definition = {
                        restrict: 'A',
                        terminal: true,
                        scope: true,
                        link: function (scope, element) {

                            var actionType = 'Divider Editor Change',
                                contentBlockId,
                                lastValue,
                                instance;

                            scope.getContent = function () {
                                return element.clone();
                            };
                        }
                    };
                    return definition;
                }
            ])
            .directive('socialFollowEditor', [
                'editorEventsChannelService',
                'clientService',
                function (editorEvents, clientService) {
                    var definition = {
                        restrict: 'A',
                        terminal: true,
                        scope: true,
                        link: function (scope, element) {

                            var actionType = 'Social Follow Change',
                                styleActionType = 'Social Follow Style Change',
                                contentBlockId,
                                lastValue,
                                modalScope,
                                styleModalScope,
                                lastStyleSelected,
                                styleSelected;

                            function getContent() {
                                return element.clone();
                            };

                            function stylesSaveCallback(modalData) {
                                lastStyleSelected = styleSelected;
                                styleSelected = modalData.setSelected;

                                // notify "editor content changed" subscribers
                                editorEvents.editorContentChanged(styleActionType, scope.editorId, contentBlockId, lastStyleSelected, modalData.setSelected);

                                if (modalData.makeDefaultIconSet) {
                                    clientService.updateClient({ DefaultSocialMediaFollowStyle: styleSelected, ForSettings: true });
                                }

                                setStylesViewValue();
                            };

                            function setStylesViewValue() {
                                var icons = element.find('a > img');

                                // we change 'ColorSq' for 'ColorCir'
                                for (var i = 0; i < icons.length; i++) {
                                    var src = icons.eq(i).attr('src');
                                    src = src.replace(lastStyleSelected, styleSelected);
                                    icons.eq(i).attr('src', src);
                                }
                            }
                            
                            function show() {
                                var doShow = function doShow() {
                                    scope.safeApply(function () {
                                        // pass data on which links to check based on what's displayed on the editable preview
                                        var data = [];
                                        lastValue = {};
                                        element.find('a[friendlyName]').each(function () {
                                            data.push({ alias: $(this).attr('friendlyName'), included: $(this).attr('data-included') });
                                            lastValue['Include' + $(this).attr('friendlyName')] = $(this).attr('data-included') == "true";
                                        });

                                        modalScope.editorId = scope.editorId;
                                        modalScope.show(data);
                                    });
                                }

                                var checkStatusBeforeShow = function () {
                                    // Need to ensure client email settings are fetched from database first
                                    // before opening the modal
                                    if (element.find('a[data-included]').length > 0) {
                                        doShow();
                                        clearInterval(timer);
                                    }
                                }

                                var timer = setInterval(checkStatusBeforeShow, 50);
                            };

                            function showStyle() {
                                scope.$root.safeApply(function () {
                                    styleModalScope.setup({
                                        callback: stylesSaveCallback,
                                        setSelected: styleSelected
                                    });
                                    styleModalScope.show();
                                });
                            };

                            function updateIconsFromHtml() {
                                element.find('a[data-included]').each(function () {
                                    if ($(this).attr('data-included') == 'true') {
                                        $(this).show();
                                    }
                                    else {
                                        $(this).hide();
                                    }
                                });
                            }

                            function onSocialFollowChanged(event, message) {
                                if (modalScope.editorId == scope.editorId && message.data !== lastValue) {

                                    saveChangesInDom(message.data);

                                    // notify "editor content changed" subscribers
                                    editorEvents.editorContentChanged(actionType, scope.editorId, contentBlockId, lastValue, message.data);

                                    // update our last value
                                    lastValue = message.data;
                                }
                            }

                            function saveChangesInDom(data) {
                                element.find('a[friendlyName]').each(function () {
                                    var propName = 'Include' + $(this).attr('friendlyName');
                                    $(this).attr('data-included', data[propName]);
                                    if (data[propName]) {
                                        $(this).show();
                                    }
                                    else {
                                        $(this).hide();
                                    }
                                });
                            }

                            function performAction(actionDescriptor, isUndo) {

                                if (actionDescriptor.Description === actionType) {
                                if (isUndo) {
                                    saveChangesInDom(actionDescriptor.PreviousValue);
                                    lastValue = actionDescriptor.PreviousValue;
                                } else {
                                    saveChangesInDom(actionDescriptor.CurrentValue);
                                    lastValue = actionDescriptor.CurrentValue;
                                }
                                }

                                if (actionDescriptor.Description === styleActionType) {
                                    lastStyleSelected = styleSelected;
                                    if (isUndo) {
                                        styleSelected = actionDescriptor.PreviousValue;
                                    } else {
                                        styleSelected = actionDescriptor.CurrentValue;
                                    }
                                    setStylesViewValue();
                                }

                            };

                            function init() {
                                if (element.find('a[data-included]').length == 0) {
                                    // The content block is being dropped
                                    // Get the default include for the client
                                    clientService.getClient(function (settings) {

                                        // everything after "SocialFollow/" on the url
                                        lastStyleSelected = element.find('a:eq(0) img').attr('src').split('SocialFollow/')[1];
                                        // everything after the first "/"
                                        lastStyleSelected = lastStyleSelected.split('/')[0];

                                        // if the user has a custom style selected by default
                                        // apply such style as soon the content block is dropped on the mail
                                        if (settings.DefaultSocialMediaFollowStyle) {

                                            // apply the default style for the user
                                            styleSelected = settings.DefaultSocialMediaFollowStyle;
                                            setStylesViewValue();
                                        } else {
                                            styleSelected = lastStyleSelected;
                                        }

                                        element.find('a[friendlyName]').each(function () {
                                            var prop = 'Include' + $(this).attr('friendlyName').replace('URL', '') + 'ByDefault';
                                            $(this).attr('data-included', settings[prop]);

                                        });

                                        updateIconsFromHtml();

                                        setListeners();

                                        if (!configuration.hasWebpageLinks) {
                                            scope.show();
                                        }
                                    });
                                }
                                else {
                                    // Loading draft
                                    updateIconsFromHtml();

                                    // get selected style
                                    styleSelected = element.find('a:eq(0) img').attr('src').split('SocialFollow/')[1]; // everything after "SocialFollow/" on the url
                                    styleSelected = styleSelected.split('/')[0]; // everything after the first "/"

                                    // set listeners
                                    setListeners();
                                }
                            };

                            function setListeners() {
                                element.on('mouseover.htmlEditor', function(evt) {

                                        // ensure z-index = 1
                                        if (element.find('.' + configuration.overlayClass).length) {

                                            element.find('.' + configuration.overlayClass).zIndex(1);

                                            // unsubscribe for this event
                                            element.parents('.' + configuration.contentBlockClass).off('mouseover.htmlEditor');

                                            contentBlockId = element.parents('.' + configuration.contentBlockClass).data('id');
                                            scope.editorId = 'Social Follow Editor #' + contentBlockId + Math.random();
                                        }
                                    });

                                // get editor modals scope
                                if (!editorEvents.getScope('URL_MANAGER_READY')) {
                                    editorEvents.onPublicScopeLoaded(scope, function(message) {
                                        if (message.type === 'URL_MANAGER_READY') {
                                            modalScope = message.scope;
                                        }
                                    });
                                } else {
                                    modalScope = editorEvents.getScope('URL_MANAGER_READY');
                                }

                                if (!editorEvents.getScope('SOCIAL_STYLE_INIT')) {
                                    editorEvents.onPublicScopeLoaded(scope, function(message) {
                                        if (message.type == 'SOCIAL_STYLE_INIT') {
                                            styleModalScope = message.scope;
                                        }
                                    });
                                } else {
                                    styleModalScope = editorEvents.getScope('SOCIAL_STYLE_INIT');
                                }

                                //set events
                                element.on('click', '.' + configuration.overlayClass, scope.show);

                                // subscribe to modal event
                                scope.$on('SOCIAL_FOLLOW_CHANGED', onSocialFollowChanged);

                                // undo/redo events
                                editorEvents.onPerformUndoRedo(scope, performAction);
                                editorEvents.onContextualEditorClickOnEdit(scope, function(event) {
                                    if (event.contentBlockId == contentBlockId) {
                                        scope.show();
                                    }
                                });

                                element.parents('.' + configuration.contentBlockClass + ':eq(0)')
                                    .on('click', '.' + configuration.overlayMenuBarClass + ' a.style', showStyle);
                            };

                            $.extend(scope, {
                                show: show,
                                getContent: getContent
                            });

                            init();
                        }
                    };
                    return definition;
                }
            ])
            .directive('buttonEditor', [
                'editorEventsChannelService', 'clientService',
                function (editorEvents, clientService) {
                    var definition = {
                        restrict: 'A',
                        scope: true,
                        terminal: true,
                        link: function (scope, element) {

                            var actionType = 'Button Editor Change',
                                contentBlockId,
                                modalScope,
                                defaultColor;

                            scope.getContent = function getContent() {
                                var $wrapper = element.clone();

                                if ($wrapper.find('a').length) {
                                    // restore URL
                                    var dataHref = $wrapper.find('a').attr('data-editor-url');
                                    if (dataHref) {
                                        $wrapper.find('a').attr('href', dataHref);
                                        $wrapper.find('a').removeAttr('data-editor-url');
                                    }
                                }

                                return $wrapper;
                            };

                            var saveCallback = function saveCallback(modalData) {

                                if (!scope.editorId) {
                                    scope.editorId = 'Button Editor #' + contentBlockId + Math.random();
                                }

                                //notify "editor content changed" subscribers
                                editorEvents.editorContentChanged(actionType, scope.editorId, contentBlockId, scope.color, modalData.color);

                                scope.color = modalData.color;

                                if (modalData.makeDefaultColor) {
                                    clientService.updateClient({ DefaultReservationButtonColor: scope.color, ForSettings: false });
                                    configuration.defaultReservationButtonColor = scope.color;
                                }

                                setViewValue();
                            };

                            var setViewValue = function setViewValue() {
                                element.find('.reservationButtonLink').css('background-color', scope.color);
                                element.attr('data-color', scope.color);
                            };

                            var init = function init() {

                                clientService.getClient(function (settings) {
                                    defaultColor = settings.DefaultReservationButtonColor || element.attr('data-default-color');
                                    scope.color = element.attr('data-color') && element.attr('data-color').length ? element.attr('data-color') : defaultColor;
                                    setViewValue();
                                });

                                contentBlockId = element.parents('.' + configuration.contentBlockClass + ':eq(0)').data('id');
                                scope.editorId = 'Button Editor #' + contentBlockId + Math.random();

                                if (!editorEvents.getScope('BUTTON_EDITOR_INIT')) {
                                    editorEvents.onPublicScopeLoaded(scope, function (message) {
                                        if (message.type == 'BUTTON_EDITOR_INIT') {
                                            modalScope = message.scope;
                                        }
                                    });
                                } else {
                                    modalScope = editorEvents.getScope('BUTTON_EDITOR_INIT');
                                }

                                element.delegate('.' + configuration.overlayClass, {
                                    click: scope.show
                                });

                                element.parents('.' + configuration.contentBlockClass + ':eq(0)')
                                    .on('click', '.' + configuration.overlayMenuBarClass + ' a.style', scope.show);

                                editorEvents.onPerformUndoRedo(scope, perfomAction);
                            };

                            scope.show = function show() {
                                scope.safeApply(function () {
                                    scope.color = element.attr('data-color') && element.attr('data-color').length ? element.attr('data-color') : defaultColor;
                                    modalScope.setup({
                                        color: scope.color,
                                        callback: saveCallback
                                    });

                                    modalScope.show();
                                });
                            };

                            var perfomAction = function (actionDescriptor, isUndo) {
                                if (isUndo) {
                                    scope.color = actionDescriptor.PreviousValue;
                                } else {
                                    scope.color = actionDescriptor.CurrentValue;
                                }

                                setViewValue();
                            }

                            if (!window.Farbtastic) {
                                require(['farbtastic'], function () {
                                    init();
                                });
                            } else {
                                init();
                            }
                        }
                    };
                    return definition;
                }
            ])
            .directive('htmlEditor', [
                    'editorEventsChannelService',
                    function (editorEvents) {
                        var definition = {
                            restrict: 'A',
                            terminal: true,
                            scope: true,
                            link: function link(scope, element) {
                                var actionType = 'Html Editor Change',
                                    contentBlockId,
                                    modalScope;

                                function getContent() {
                                    var tempHtml = element.clone().removeClass('ng-scope');
                                    // restore urls in hyperlinks
                                    $(tempHtml).find('a[data-editor-url]').each(function () {
                                        $(this).attr('href', $(this).attr('data-editor-url')).removeAttr('data-editor-url');
                                    });

                                    return tempHtml;
                                }

                                function show() {
                                    scope.safeApply(function () {
                                        if (!element.hasClass(configuration.contentBlockDefaultValue)) {
                                            var temp = element.clone();
                                            // restore urls in hyperlinks
                                            temp.find('a[data-editor-url]').each(function () {
                                                $(this).attr('href', $(this).attr('data-editor-url')).removeAttr('data-editor-url');
                                            });
                                            scope.html = removeEditorToolbars(temp);
                                        } else {
                                            scope.html = '';
                                        }

                                        modalScope.setup({
                                            html: scope.html,
                                            callback: saveCallback
                                        });

                                        modalScope.show();
                                    });
                                }

                                function removeEditorToolbars(elem) {
                                    return elem.clone().find('.' + configuration.overlayMenuBarClass + ', .' + configuration.overlayClass).remove().end().html();
                                }

                                function saveCallback(modalData) {

                                    if (!scope.editorId) {
                                        scope.editorId = 'Html Editor #' + contentBlockId + Math.random();
                                    }

                                    // notify "editor content changed" subscribers
                                    editorEvents.editorContentChanged(actionType, scope.editorId, contentBlockId, scope.html, modalData.html);

                                    if (modalData.html.length) {
                                        scope.html = modalData.html;
                                    } else {
                                        scope.html = scope.getContentBlockDefaultHtml('data-html-editor');
                                        element.addClass(configuration.contentBlockDefaultValue);
                                    }

                                    if (element.hasClass(configuration.contentBlockDefaultValue) && modalData.html.length) {
                                        element.removeClass(configuration.contentBlockDefaultValue);
                                    }

                                    setViewValue();
                                }

                                function setViewValue() {
                                    if (scope.html) {
                                        element.html(scope.html);
                                    }
                                }

                                function onPerformUndoRedo(actionDescriptor, isUndo) {
                                    if (isUndo) {
                                        scope.html = actionDescriptor.PreviousValue;
                                    } else {
                                        scope.html = actionDescriptor.CurrentValue;
                                    }

                                    setViewValue();
                                }

                                function init() {
                                    if (!editorEvents.getScope('HTML_EDITOR_INIT')) {
                                        editorEvents.onPublicScopeLoaded(scope, function (message) {
                                            if (message.type == 'HTML_EDITOR_INIT') {
                                                modalScope = message.scope;
                                            }
                                        });
                                    } else {
                                        modalScope = editorEvents.getScope('HTML_EDITOR_INIT');
                                    }

                                    contentBlockId = element.parents('.' + configuration.contentBlockClass + ':eq(0)').data('id');

                                    element.on('click', ' > *:not(.' + configuration.overlayMenuBarClass + ')', show);
                                    editorEvents.onPerformUndoRedo(scope, onPerformUndoRedo);
                                }

                                init();

                                angular.extend(scope, {
                                    show: show,
                                    getContent: getContent
                                });
                            }
                        };
                        return definition;
                    }
            ]);
    });