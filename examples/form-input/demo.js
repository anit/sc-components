'use strict';

angular.module('sc-form-input-demo', [
  'sc-enter',
  'sc-form-input'
])

.controller('DemoCtrl', ['$scope', function ($scope) {
  $scope.count = 0;
  $scope.record = function () {
    console.log($scope.item.name);
  };

  $scope.item = {
    name: ''
  };
}]);
