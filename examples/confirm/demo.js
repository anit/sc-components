
angular.module('sc-confirm-demo', [
  'sc-confirm'
])

.controller('DemoCtrl', ['$scope', function ($scope) {
  $scope.remove = function (item) {
    $scope.answer = 'confirmed';
  };

  $scope.cancel = function (item) {
    $scope.answer = 'cancelled';
  };

  $scope.item = {
    id: 1,
    name: 'test'
  };
}]);
