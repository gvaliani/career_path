// Version 0.3.8
// AngularJS simple file upload directive
// this directive uses an iframe as a target
// to enable the uploading of files without
// losing focus in the ng-app.
//
// <div ng-app="app">
//   <div ng-controller="mainCtrl">
//    <form action="/uploads" ng-upload> 
//      <input type="file" name="avatar"></input>
//      <input type="submit" value="Upload" 
//         upload-submit="submited(content, completed)"></input>
//    </form>
//  </div>
// </div>
//
//  angular.module('app', ['ngUpload'])
//    .controller('mainCtrl', function($scope) {
//      $scope.submited = function(content, completed) {
//        if (completed) {
//          console.log(content);
//        }
//      }  
//  });
//
angular.module('ngUpload', [])
  .directive('uploadSubmit', [function () {
      return {
          restrict: 'AC',
          scope: {
              uploadSubmit: '&',
              beforeSubmit: '&',
              uploadButtonSelector: '@'
          },
          link: function (scope, element, attrs) {

              if (!scope.uploadSubmit) {
                  var message = "The expression on the ngUpload directive does not point to a valid function.";
                  throw message + "\n";
              }

              var uploadButtons = element.parents('.modal:eq(0)').find(scope.uploadButtonSelector);

              uploadButtons.on('click', function ($event) {
                  // Workaround to trigger the close of modal after save is completed
                  var closeModal = $($event.currentTarget).hasClass('saveAndClose') || $($event.currentTarget).hasClass('close');
                  var uploadImage = true;

                  // prevent default behavior of click
                  if ($event) {
                      $event.preventDefault = true;
                  }

                  scope.$apply(function () {
                      uploadImage = scope.beforeSubmit(scope, { form: element });
                  });

                  if (!uploadImage) {
                      // If there was no change but user is clicking save and close we need to close the modal
                      if (closeModal) {
                          $($event.currentTarget).closest('.bootstrap-modal').find('.cancel').trigger('click');
                      }
                      return;
                  }

                  if (uploadButtons.attr('disabled')) {
                      return;
                  }

                  // create a new iframe
                  var iframe = angular.element("<iframe id='upload_iframe' name='upload_iframe' border='0' width='0' src='" + element.attr('action') +"' height='0' style='width: 0px; height: 0px; border: none; display: none' />");

                  // add the new iframe to application
                  element.parent().append(iframe);

                  // attach function to load event of the iframe
                  iframe.bind('load', function () {

                      try {
                        this.contentDocument;
                    }
                    catch (e) {
                    }
                      // get content - requires jQuery
                      var content = iframe.contents().find('body').html();
                      try {
                          content = $.parseJSON(iframe.contents().find('body').text());
                      } catch (e) {
                          if (console) { console.log('WARN: XHR response is not valid json'); }
                      }

                      uploadButtons.removeAttr('disabled');                      

                      // execute the upload response function in the active scope
                      scope.$apply(function () {
                          scope.uploadSubmit({ content: content, completed: true, closeModal: closeModal });

                          // After uploading and saving, if save and close trigger cancel so it closes the modal
                          if (closeModal) {
                              setTimeout(function () { $($event.currentTarget).closest('.bootstrap-modal').find('.cancel').trigger('click'); }, 250);                              
                          }
                      });
                      // remove iframe
                      if (content !== "") { // Fixes a bug in Google Chrome that dispose the iframe before content is ready.
                          setTimeout(function () { iframe.remove(); }, 250);
                      }
                  });

                  scope.$apply(function () {
                      scope.uploadSubmit({ content: "Please wait...", completed: false, closeModal: false });
                  });

                 uploadButtons.attr('disabled','disabled');

                 element.submit();

              });
          }
      };
  } ])
  .directive('ngUpload', ['$parse', function ($parse) {
      return {
          restrict: 'AC',
          link: function (scope, element, attrs) {
              element.attr("target", "upload_iframe");
              element.attr("method", "post");
              // Append a timestamp field to the url to prevent browser caching results
              //        var separator = element.attr("action").indexOf('?')==-1 ? '?' : '&';
              //        element.attr("action", element.attr("action") + separator + "_t=" + new Date().getTime());
              element.attr("enctype", "multipart/form-data");
              element.attr("encoding", "multipart/form-data");
          }
      };
  } ]);
