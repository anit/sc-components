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
 *    btn-placement="'left'"
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
  message: 'Are you sure?',
  btnPlacement: 'right'
})

.directive('scConfirm', [
  '$modal', '$compile', '$parse', '$http', '$q', '$templateCache', 'scConfirmDefaults',
  function ($modal, $compile, $parse, $http, $q, $templateCache, defaults) {
    return {
      restrict: 'A',
      link: function($scope, element, attrs) {
        var scope = $scope.$new();
        var isDefined = angular.isDefined;
        var deferred = $q.defer();
        var promise = deferred.promise;
        var validPlacements = ['left', 'center', 'right'];
        var btnPlacement;
        var template;
        var templateUrl;

        $scope.$on('$destroy', function () {
          scope.$destroy();
        });

        // Parse attrs

        // template and template-url
        if (isDefined(attrs.template)) {
          template = scope.$parent.$eval(attrs.template);
          deferred.resolve(template);
        } else if (isDefined(attrs.templateUrl)) {
          templateUrl = scope.$parent.$eval(attrs.templateUrl);
          $http.get(templateUrl, { cache: $templateCache })
            .success(function (html) {
              deferred.resolve(html);
            })
            .error(deferred.reject);
        } else {
          deferred.resolve('');
        }

        // btn-placement
        if (isDefined(attrs.btnPlacement)) {
          btnPlacement = scope.$parent.$eval(attrs.btnPlacement);
        }

        // sc-confirm-message
        scope.message = attrs.scConfirmMessage || defaults.message;
        attrs.$observe('scConfirmMessage', function (msg) {
          scope.message = msg || defaults.message;
        });

        // console.log($parse(attrs.scConfirm));
        // sc-confirm
        function onConfirm () {
          $parse(attrs.scConfirm)($scope);
        }

        // sc-on-cancel
        function onCancel () {
          $parse(attrs.scOnCancel)($scope);
        }

        if (!~validPlacements.indexOf(btnPlacement)) {
          btnPlacement = defaults.btnPlacement;
        }

        promise.then(function (tpl) {

          var template = [
            '<div class="modal-header">',
            '  <button type="button" class="close" ng-click="cancel()" aria-hidden="true">&times;</button>',
            '  <h4 class="modal-title">{{ message }}</h4>',
            '</div>',
            '<div class="modal-body">',
            '  '+ tpl +'&nbsp;',
            '</div>',
            '<div class="modal-footer sc-'+ btnPlacement +'">',
            '  <button class="btn btn-primary" ng-click="ok()">Yes</button>',
            '  <button class="btn btn-link" ng-click="cancel()">Cancel</button>',
            '</div>'
          ].join('\n');

          element.bind('click', function () {
            var modalInstance = $modal.open({
              template: template,
              controller: 'ModalInstanceCtrl',
              scope: scope,
              resolve: {
                onCancel: function () { return onCancel; }
              }
            });

            modalInstance.result.then(onConfirm);
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
  '$scope', '$modalInstance', 'onCancel',
  function ($scope, $modalInstance, onCancel) {
    $scope.ok = $modalInstance.close;
    $scope.cancel = function () {
      if (onCancel) onCancel();
      $modalInstance.dismiss('cancel');
    };
  }
]);

// TODO: give a provider
