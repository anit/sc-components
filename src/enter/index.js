'use strict';

/*!
 * sc-enter
 * Copyright(c) 2014 Madhusudhan Srinivasa <madhu@changer.nl>
 * MIT Licensed
 */

/**
 * sc-enter
 *
 * Usage:
 *
 *  <input sc-enter="search()" type="text" ng-model="term">
 */

angular.module('sc-enter', [])

.directive('scEnter', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.scEnter, {
            'event': event
          });
        });

        event.preventDefault();
      }
    });
  };
});
