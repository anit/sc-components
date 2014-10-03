'use strict';

/**
 * sc-confirm
 *
 * Similar to window.confirm but with modal window
 *
 * Dependencies
 *
 *    ui.bootstrap
 *
 * Make sure you include the source files of ui.bootstrap.modal
 *
 * Usage
 *
 *  <a sc-confirm="remove()"
 *    sc-confirm-message="Are you sure custom message?"
 *    sc-on-cancel="cancel()"
 *    template-url="/templates/confirm.html"
 *    item="resource">
 *  </a>
 */

angular.module('sc-confirm', [
  'ui.bootstrap'
])

.directive('scConfirm', [
  '$modal', '$compile', '$parse', '$http', '$q', '$templateCache',
  function ($modal, $compile, $parse, $http, $q, $templateCache) {
    return {
      restrict: 'A',
      scope: {
        scConfirm: '&',
        scOnCancel: '&'
      },
      compile: function(element, attrs) {

        var deferred = $q.defer();
        var promise = deferred.promise;
        var getter;

        // All of this to get the template
        if (attrs.template) {
          getter = $parse(attrs.template);
          deferred.resolve({ getter: getter });
        } else if (attrs.templateUrl) {
          $http
            .get(attrs.templateUrl, { cache: $templateCache })
            .success(function (html) {
              deferred.resolve({ getter: getter, html: html });
            })
            .error(deferred.reject);
        } else {
          deferred.resolve({ html: '' })
        }

        return function (scope, element, attrs) {
          promise.then(function (res) {
            var tpl = (res.getter && res.getter(scope.$parent)) || res.html;
            var message = attrs.scConfirmMessage || 'Are you sure ?';

            var modalHtml = [
              '<div class="modal-header">',
              '  <button type="button" class="close" ng-click="cancel()" aria-hidden="true">&times;</button>',
              '  <h4 class="modal-title">'+ message +'</h4>',
              '</div>',
              '<div class="modal-body">',
              '  '+ tpl +'&nbsp;',
              '</div>',
              '<div class="modal-footer">',
              '  <button class="btn btn-primary" ng-click="ok()">Yes</button>',
              '  <button class="btn btn-link" ng-click="cancel()">Cancel</button>',
              '</div>'
            ].join('\n');

            element.bind('click', function () {
              var modalInstance = $modal.open({
                template: modalHtml,
                controller: 'ModalInstanceCtrl',
                scope: scope.$parent,
                resolve: {
                  scOnCancel: function () { return scope.scOnCancel; }
                }
              });

              modalInstance.result.then(scope.scConfirm);
            });
          });
        };
      }
    };
  }
])

/**
 * scConfirm Modal Controller
 */

.controller('ModalInstanceCtrl', [
  '$scope', '$modalInstance', 'scOnCancel',
  function ($scope, $modalInstance, scOnCancel) {
    $scope.ok = $modalInstance.close;
    $scope.cancel = function () {
      if (scOnCancel) scOnCancel();
      $modalInstance.dismiss('cancel');
    };
  }
])

// TODO: give a provider
