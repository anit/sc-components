
angular.module('sc-listing-demo', [
  'sc-listing'
])

.controller('ListCtrl', ['$scope', function ($scope) {

  var items = [];
  for (var i = 0; i < 100; i++) {
    items.push({
      name: 'item ' + i,
      description: 'bla bla bla '+ i
    });
  }
  $scope.items = items;
  $scope.showItem = function (index, item) {
    $scope.index = index;
    $scope.item = item;
  };

  $scope.sort = function () {
    items = items.reverse();
  };
}]);
