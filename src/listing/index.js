'use strict';
// jshint unused: false

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
 *    template-url="/templates/list-item.html">
 *  </listing>
 *
 * it also takes `template` as an attribute which is just a template string
 */

angular.module('sc-listing', [])

.directive('scListing', function ($compile, $parse, $http, $q, $templateCache) {
  return {
    restrict: 'E',
    scope: {
      items: '=',
      onItemClick: '&',
      promise: '='
    },
    compile: function (element, attrs) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      var getter;

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
      }

      return function (scope, element, attrs) {
        promise.then(function (res) {
          var itemTpl = (res.getter && res.getter(scope)) || res.html;

          scope.onItemClick = scope.onItemClick();

          var template = [
            '<ul class="list">',
            '  <li class="list-item" ng-repeat="item in items" ng-click="onItemClick(item, $index)">',
            '    '+ (itemTpl || '{{ item | json }}') +'',
            '  </li>',
            '</ul>'
          ].join('');

          element.replaceWith($compile(template)(scope));
        });
      };
    }
  };
});

// TODO: give a provider to override defaults
