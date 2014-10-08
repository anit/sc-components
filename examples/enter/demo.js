'use strict';

angular.module('sc-enter-demo', [
  'sc-enter'
])

.controller('DemoCtrl', ['$scope', function ($scope) {
  $scope.count = 0;
  $scope.record = function () {
    $scope.count = $scope.count + 1;
  };
}]);
