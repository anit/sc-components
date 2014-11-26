'use strict';

/*!
 * sc-listing
 * Copyright(c) 2014 Madhusudhan Srinivasa <madhu@changer.nl>
 * MIT Licensed
 */

/**
 * sc-listing
 *
 * Usage:
 *
 *  <listing
 *    items="items"
 *    on-item-click="showItem"
 *    class="'items'"
 *    item-class="'item'"
 *    template-url="'/templates/list-item.html'">
 *  </listing>
 *
 * it also takes `template` as an attribute which is just a template string
 */

angular.module('sc-listing', [])

.directive('scListing', [
  '$compile', '$http', '$q', '$templateCache', '$location',
  function ($compile, $http, $q, $templateCache, $location) {
    return {
      restrict: 'E',
      link: function ($scope, element, attrs) {
        var scope = $scope.$new();
        var isDefined = angular.isDefined;
        var deferred = $q.defer();
        var promise = deferred.promise;
        var classes = ['list sc-list'];
        var itemClass = ['list-item sc-list-item'];
        var template;
        var templateUrl;

        // Parse attrs

        // on-item-click
        if (isDefined(attrs.onItemClick)) {
          scope.onItemClick = $scope.$eval(attrs.onItemClick);
        }

        // template and template-url
        if (isDefined(attrs.template)) {
          template = $scope.$eval(attrs.template);
          deferred.resolve(template);
        } else if (isDefined(attrs.templateUrl)) {
          templateUrl = $scope.$eval(attrs.templateUrl);
          $http.get(templateUrl, { cache: $templateCache })
            .success(function (html) {
              deferred.resolve(html);
            })
            .error(deferred.reject);
        } else {
          deferred.resolve('');
        }

        // class
        if (isDefined(attrs.class)) {
          classes.push(attrs.class);
        }

        // item-class
        if (isDefined(attrs.itemClass)) {
          itemClass.push($scope.$eval(attrs.itemClass));
        }

        // active
        scope.active = isDefined(attrs.active)
          ? $scope.$eval(attrs.active)
          : angular.noop;

        $scope.$watch(attrs['items'], function (items) {
          scope.items = items;
        });

        $scope.$watch(attrs['ngModel'], function (ngModel) {
          scope.ngModel = ngModel;
        });

        classes = classes.join(' ');
        itemClass = itemClass.join(' ');

        promise.then(function (tpl) {
          tpl = tpl || '{{ item | json }}';

          var template = [
            '<ul class="'+ classes +'">',
            '  <li class="'+ itemClass +'" ng-repeat="item in items" ng-click="onItemClick(item, $index)" ng-class="{ \'active\': active(item), \'last\': $last, \'first\': $first }" }">',
            '    '+ tpl,
            '  </li>',
            '</ul>'
          ].join('');

          element.replaceWith($compile(template)(scope));
        });
      }
    };
}]);

// TODO: give a provider to override defaults
