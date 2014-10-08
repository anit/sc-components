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
 *    template-url="'/templates/confirm.html'"
 *    item="resource">
 *  </a>
 */

angular.module('sc-confirm', [
  'ui.bootstrap'
])

/**
 * Constants
 */

.constant('scConfirmDefaults', {
  message: 'Are you sure ?'
})

.directive('scConfirm', [
  '$modal', '$compile', '$parse', '$http', '$q', '$templateCache', 'scConfirmDefaults',
  function ($modal, $compile, $parse, $http, $q, $templateCache, defaults) {
    return {
      restrict: 'A',
      scope: {
        scConfirm: '&',
        scOnCancel: '&'
      },
      link: function(scope, element, attrs) {
        var deferred = $q.defer();
        var promise = deferred.promise;
        var template;
        var templateUrl;

        // Parse attrs

        // template and templateUrl
        if (angular.isDefined(attrs.template)) {
          template = scope.$parent.$eval(attrs.template);
          deferred.resolve(template);
        } else if (angular.isDefined(attrs.templateUrl)) {
          templateUrl = scope.$parent.$eval(attrs.templateUrl);
          $http.get(templateUrl, { cache: $templateCache })
            .success(function (html) {
              deferred.resolve(html);
            })
            .error(deferred.reject);
        } else {
          deferred.resolve('');
        }

        promise.then(function (tpl) {
          var message = attrs.scConfirmMessage || defaults.message;
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
      $scope.$parent.$eval(scOnCancel);
      $modalInstance.dismiss('cancel');
    };
  }
]);

// TODO: give a provider
