'use strict';

describe('sc-list', function () {
  var scope;
  var Resource;
  var List;
  var FakeResource;
  var Item;
  var httpBackend;
  var items;

  beforeEach(module('ngResource'));
  beforeEach(module('sc-list'));

  beforeEach(inject(function ($rootScope, $resource, scList, $httpBackend) {
    scope = $rootScope;
    Resource = $resource;
    List = scList;
    httpBackend = $httpBackend;
    FakeResource = angular.noop;
    Item = new Resource('/items');
    items = [
      { id: 1, name: 'item 1', age: 11 },
      { id: 2, name: 'item 2', age: 22 },
      { id: 3, name: 'item 3', age: 33 }
    ];
  }));

  describe('List()', function () {
    it('should throw when resource is not provided', function () {
      expect(function () {
        new List();
      }).toThrow();
    });

    it('should throw when resource is not a resource instance', function () {
      expect(function () {
        new List(FakeResource);
      }).toThrow();
    });

    it('should throw if resource doesn\'t have a query method', function () {
      FakeResource = new Resource('/items');
      delete FakeResource.query;
      expect(function () {
        new List(FakeResource);
      }).toThrow();
    });
  });

  describe('list.options and properties', function () {
    it('should provide sort, goto, refresh and fetch methods', function () {
      var list = new List(Item);
      expect(list.sort).toBeDefined();
      expect(list.goto).toBeDefined();
      expect(list.refresh).toBeDefined();
      expect(list.fetch).toBeDefined();
    });

    it('should set limit, page and sort_type to defaults', function () {
      var list = new List(Item);
      expect(list.options.limit).toBe(20);
      expect(list.options.page).toBe(0);
      expect(list.options.sort_type).toBe(1);

      var list2 = new List(Item, {
        limit: 10,
        page: 2,
        sort_type: -1
      });
      expect(list2.options.limit).toBe(10);
      expect(list2.options.page).toBe(2);
      expect(list2.options.sort_type).toBe(-1);
    });
  });

  describe('.fetch()', function () {
    it('should fetch items', function () {
      var list = new List(Item);
      var req = httpBackend.expect('GET', /\/items/);
      var result = list.fetch();
      req.respond(items);
      httpBackend.flush();
      result = angular.toJson(result);
      expect(result).toEqual(angular.toJson(items));
    });

    it('should assign $promise and items property when fetched', function () {
      var list = new List(Item);
      var req = httpBackend.expect('GET', /\/items/);
      list.refresh();
      req.respond(items);
      httpBackend.flush();
      expect(list.items).toBeDefined();
      expect(list.items.length).toBe(3);
      expect(list.$promise).toBeDefined();
    });
  });

  describe('.sort()', function () {
    it('.sort() and filter should set query params', function () {
      var list = new List(Item, { filter: 'ite', sort_type: -1 });
      var req = httpBackend.expect('GET', /\/items/);
      list.sort('age', 1);
      req.respond(function (method, url) {
        expect(url).toContain('filter=ite');
        expect(url).toContain('sort_type=1');
        expect(url).toContain('sort_by=age');
        return items;
      });
      httpBackend.flush();
      expect(list.options.sort_by).toBe('age');
      expect(list.options.sort_type).toBe(1);
      expect(list.options.filter).toBe('ite');
    });
  });

  describe('.goto()', function () {
    it('.goto() should set page param', function () {
      var list = new List(Item, { filter: 'ite', sort_type: -1 });
      var req = httpBackend.expect('GET', /\/items/);
      list.goto(2);
      req.respond(function (method, url) {
        expect(url).toContain('page=2');
        return items;
      });
      httpBackend.flush();
      expect(list.options.page).toBe(2);
    });
  });
});
