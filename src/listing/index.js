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
 *    template-url="'/templates/list-item.html'">
 *  </listing>
 *
 * it also takes `template` as an attribute which is just a template string
 */

angular.module('sc-listing', [])

.directive('scListing', function ($compile, $http, $q, $templateCache) {
  return {
    restrict: 'E',
    scope: {
      items: '=',
      onItemClick: '&'
    },
    link: function (scope, element, attrs) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      var template;
      var templateUrl = angular.isDefined(attrs.templateUrl)
        ? scope.$parent.$eval(attrs.templateUrl)
        : '';

      scope.onItemClick = scope.onItemClick();

      // Get the template
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
        tpl = tpl || '{{ item | json }}';

        var template = [
          '<ul class="list">',
          '  <li class="list-item" ng-repeat="item in items" ng-click="onItemClick(item, $index)">',
          '    '+ tpl,
          '  </li>',
          '</ul>'
        ].join('');

        element.replaceWith($compile(template)(scope));
      });
    }
  };
});

// TODO: give a provider to override defaults
