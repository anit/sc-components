'use strict';

describe('sc-listing', function () {
  var $document;
  var scope;
  var compile;
  var templateCache;

  beforeEach(module('ui.bootstrap'));
  beforeEach(module('sc-listing'));
  beforeEach(module(
    'src/listing/test/template.html',
    'src/listing/test/template-url.html',
    'src/listing/test/no-template.html',
    'src/listing/test/list-item.html'
  ));

  beforeEach(inject(function ($rootScope, $compile, _$document_, $templateCache) {
    $document = _$document_;
    scope = $rootScope;
    compile = $compile;
    templateCache = $templateCache;

    var items = [];
    for (var i = 0; i < 10; i++) {
      items.push({
        id: i,
        name: 'item ' + i,
        description: 'bla bla bla '+ i,
        age: Math.floor(Math.random() * 100)
      });
    }

    scope.items = items;
    scope.tplPath = 'src/listing/test/list-item.html';
    scope.tpl = '<span>{{ item.name }}</span>';
    scope.showItem = function (item, index) {
      scope.index = index;
      scope.item = item;
    };
  }));

  function setup (type) {
    var tpl = templateCache.get('src/listing/test/' + type + '.html');
    var elm = angular.element(tpl);
    angular.element('body').append(elm);
    compile(elm)(scope);
    scope.$digest();
  }

  describe('template-url', function () {
    it('should list the items', function () {
      setup('template-url');
      var listing = $document.find('ul.list');
      var li = listing.find('li');
      expect(listing.length).toBe(1);
      expect(li.length).toBe(10);
      expect(li.eq(0).text()).toContain('item 0');
      expect(li.eq(0).text()).toContain('age');
    });

    it('should use the provided template-url for the list item', function () {
      setup('template-url');
      var li = $document.find('ul.list li').eq(0);
      expect(li.attr('class')).toContain('list-item');
      expect(li.find('strong').length).toBe(1);
    });
  });

  describe('template', function () {
    it('should use a template string for the list item', function () {
      setup('template');
      var li = $document.find('ul.list li').eq(0);
      expect(li.find('span').length).toBe(1);
    });
  });

  it('should spit the json when no template or template-url is provided', function () {
    setup('no-template');
    var li = $document.find('ul.list li').eq(0);
    expect(li.html()).toContain('{');
  });

  describe('on-item-click', function () {
    it('should call the on-item-click method when clicked on li', function () {
      setup('template');
      var li = $document.find('ul.list li');
      // click on the 9th element in the list
      li.eq(8).trigger('click');
      var selected = $document.find('.selected');
      expect(selected.find('.name').text()).toBe('item 8');
      expect(selected.find('.age').text()).toBeTruthy();
      expect(selected.find('.description').text()).toBe('bla bla bla 8');
      expect(selected.find('.id').text()).toBe('8');
    });
  });

  describe('class and item-class', function () {
    it('should apply the provided class and item-class', function () {
      setup('template');
      var ul = $document.find('ul.list');
      var li = ul.find('li');
      expect(ul.attr('class')).toContain('items');
      expect(li.eq(0).attr('class')).toContain('item');
    });
  });

  afterEach(function () {
    angular.element('body').empty();
  });
});
