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

.directive('scListing', function ($compile, $http, $q, $templateCache) {
  return {
    restrict: 'E',
    scope: {
      items: '='
    },
    link: function (scope, element, attrs) {
      var isDefined = angular.isDefined;
      var deferred = $q.defer();
      var promise = deferred.promise;
      var classes = ['list'];
      var itemClass = ['list-item'];
      var template;
      var templateUrl;

      // Parse attrs

      // on-item-click
      if (isDefined(attrs.onItemClick)) {
        scope.onItemClick = scope.$parent.$eval(attrs.onItemClick);
      }

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

      // class
      if (isDefined(attrs.class)) {
        classes.push(attrs.class);
      }

      // item-class
      if (isDefined(attrs.itemClass)) {
        itemClass.push(scope.$parent.$eval(attrs.itemClass));
      }

      classes = classes.join(' ');
      itemClass = itemClass.join(' ');

      promise.then(function (tpl) {
        tpl = tpl || '{{ item | json }}';

        var template = [
          '<ul class="'+ classes +'">',
          '  <li class="'+ itemClass +'" ng-repeat="item in items" ng-click="onItemClick(item, $index)">',
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
