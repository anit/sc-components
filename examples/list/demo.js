'use strict';

angular.module('sc-list-demo', [
  'ngResource',
  'cgBusy',
  'sc-listing',
  'sc-list'
])

.factory('Item', ['$resource', function ($resource) {
  var Item = $resource('/items/:id', { id: '@id' });
  return Item;
}])

.controller('ListCtrl', [
  '$scope', 'Item', 'scList',
  function ($scope, Item, List) {

    var list = new List(Item, {
      limit: 10,
      sort_by: 'name',
      sort_type: -1
    });
    list.fetch();

    $scope.list = list;
    $scope.tplPath = '/templates/list-item.html';
    $scope.tpl = [
      '{{ item.name }}'
    ].join('');

    $scope.showItem = function (item, index) {
      $scope.index = index;
      $scope.item = item;
    };
  }
]);
