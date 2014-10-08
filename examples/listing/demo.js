'use strict';

angular.module('sc-listing-demo', [
  'ngResource',
  'cgBusy',
  'sc-listing'
])

.factory('Item', ['$resource', function ($resource) {
  var Item = $resource('/items/:id', { id: '@id' });
  return Item;
}])

.controller('ListCtrl', ['$scope', 'Item', function ($scope, Item) {
  var optionsCache = {
    sort_type: -1
  };

  $scope.items = getItems();

  $scope.tplPath = '/templates/list-item.html';
  $scope.tpl = [
    '{{ item.name }}'
  ].join('');

  $scope.showItem = function (item, index) {
    $scope.index = index;
    $scope.item = item;
  };

  $scope.sort = function (field, type) {
    optionsCache.sort_type = optionsCache.sort_type * -1;
    $scope.items = getItems({
      sort_type: type * optionsCache.sort_type,
      sort_by: field
    });
  };

  $scope.refresh = function () {
    $scope.items = getItems(optionsCache);
  };

  function getItems (options) {
    options = options || {};
    options.limit = options.limit || 20;
    options.filter = $scope.filter;
    options.page = options.page || 0;
    options.sort_by = options.sort_by || 'name';
    options.sort_type = options.sort_type || 1;
    optionsCache = options;
    return Item.query(options);
  }
}]);
