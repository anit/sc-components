'use strict';

angular.module('sc-dropdown-demo', [
  'sc-dropdown'
])

.controller('DropdownCtrl', ['$scope', function ($scope) {
  $scope.items = [
    'black',
    'blue'
  ];

  $scope.arr = [
    {
      name: 'black'
    },
    {
      name: 'blue'
    }
  ];

  $scope.getDefault = function () {
    // return 'black';
    return $scope.arr[0];
  };

  $scope.show = function (color) {
    $scope.color = color;
  };

}]);
