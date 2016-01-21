(function () {
    var root = this;

    defineBundledLibraries();
    loadPluginsAndBoot();

    function defineBundledLibraries() {
        // These are already loaded via bundles.  
        // We define them and put them in the root object. 
        define('jquery', [], function () { return root.jQuery; });
        define('jqueryui', ['jquery'], function ($) { return root.jQuery.ui; });
        define('angular', [], function () { return root.angular; });
        define('uibootstrap', ['angular'], function ($) { return root.angular; });
        define('ngResource', ['jquery'], function ($) { return root.angular; });
        define('amplifyStore', [], function () { return root.amplify; });
        define('ngUpload', ['angular'], function () { return root.angular; });
        define('angularRoute', ['angular'], function () { return root.angular; });
    }

    function loadPluginsAndBoot() {

        require.config({
            baseUrl: 'neweditor/scripts/',
            paths: {
                partials: '../partials',
                ckeditor: 'lib/ckeditor/ckeditor',
                imgmap: 'lib/imgmap',
                excanvas: 'lib/excanvas',
                farbtastic: 'lib/farbtastic',
                app: './../app/app',
                controllers: './../app/controllers',
                services: './../app/services',
                configuration: './../app/configuration',
                directives: './../app/directives',
                editorSpecifications: './../app/editorSpecifications'
            }
        });

        require(['angular', 'app', 'pace'],
            function (angular, app, pace) {
                angular.element(document).ready(function () {
                    angular.bootstrap(angular.element('#editor-app'), ['editor']);
                });
            }
        );
    }
})();