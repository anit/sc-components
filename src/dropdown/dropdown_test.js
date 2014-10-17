'use strict';

describe('sc-dropdown', function () {
  var $document;
  var scope;
  var compile;
  var templateCache;
  var timeout;

  beforeEach(module('ui.bootstrap', 'sc-listing'));
  beforeEach(module('sc-dropdown'));
  beforeEach(module(
    'src/dropdown/simple-defaults.html',
    'src/dropdown/simple.html',
    'src/dropdown/single.html',
    'src/dropdown/split.html'
  ));

  beforeEach(inject(function ($rootScope, $compile, _$document_, $templateCache, $timeout) {
    $document = _$document_;
    scope = $rootScope;
    compile = $compile;
    templateCache = $templateCache;
    timeout = $timeout;

    scope.do = function (item) {
      scope.selected = 'You selected ' + (item.name || item);
    };

    scope.arr = [
      { name: 'black' },
      { name: 'green' }
    ];

    scope.getDefault = function () {
      return scope.arr[0];
    };

    scope.otherDefault = function () {
      return 'Some other value';
    };

    scope.items = ['red', 'blue'];
  }));

  function dropdown (type) {
    var tpl = templateCache.get('src/dropdown/' + type + '.html');
    var elm = angular.element(tpl);
    angular.element('body').append(elm);
    compile(elm)(scope);
    scope.$digest();
  }

  describe('type', function () {
    // split
    it('should provide a simple dropdown with default label', function () {
      dropdown('simple');

      var dd = $document.find('span.dropdown');
      var menu = dd.find('ul.list.dropdown-menu');
      var anchor = dd.find('a.dropdown-toggle');

      expect(dd.length).toBe(1);
      expect(anchor.text()).toContain('Choose from the list');

      // click on element
      anchor.trigger('click');

      // opens the dropdown
      expect(dd.attr('class')).toContain('open');
      expect(menu.length).toBe(1);
      expect(menu.find('li').length).toBe(2);
      expect(menu.find('li').eq(0).text()).toContain('black');
      expect(menu.find('li').eq(1).text()).toContain('green');
    });

    // single
    it('should provide a dropdown button with custom label and provided button class', function () {
      dropdown('single');

      var dd = $document.find('.btn-group');
      var menu = dd.find('ul.list.dropdown-menu');
      var button = dd.find('button.dropdown-toggle');

      expect(dd.length).toBe(1);
      expect(button.text()).toContain('choose from the colors');
      expect(button.attr('class')).toContain('btn btn-link');

      // click on element
      button.trigger('click');

      // opens the dropdown
      expect(dd.attr('class')).toContain('open');
      expect(menu.length).toBe(1);
      expect(menu.find('li').length).toBe(2);
      expect(menu.find('li').eq(0).text()).toContain('red');
      expect(menu.find('li').eq(1).text()).toContain('blue');
    });

    // split
    it('should provide a split dropdown', function () {
      dropdown('split');
      var dd = $document.find('.btn-group');
      expect(dd.find('button').length).toBe(2);
      expect(dd.find('button.dropdown-toggle span.caret').length).toBe(1);
    });

    it('should provide simple dropdown when type is invalid', function () {
      dropdown('simple-defaults');
      var dd = $document.find('span.dropdown');
      expect(dd.length).toBe(1);
    });
  });

  describe('on-select', function () {
    it('should call the onSelect method when clicked on item', function () {
      dropdown('simple');
      var dd = $document.find('span.dropdown');
      var menu = dd.find('ul.list.dropdown-menu');
      dd.find('a.dropdown-toggle').trigger('click');

      // click on the first dropdown item ('black')
      menu.find('li').eq(0).trigger('click');
      expect($document.find('.selected').text()).toContain('You selected black');
    });
  });

  describe('default', function () {
    it('should select default', function () {
      dropdown('split');
      var label = $document.find('button:not(.dropdown-toggle)');
      expect(label.text()).toContain('black');
    });

    it('should select default when default is function expression', function () {
      dropdown('simple-defaults');
      var label = $document.find('a.dropdown-toggle');
      expect(label.text()).toContain('Some other value');
    });
  });

  it('should accept array of elements and pass to onSelect when selected', function () {
    dropdown('single');
    var dd = $document.find('.btn-group');
    var menu = dd.find('ul.list.dropdown-menu');
    dd.find('button.dropdown-toggle').trigger('click');

    // click on the first dropdown item ('red')
    menu.find('li').eq(0).trigger('click');
    expect($document.find('.selected').text()).toContain('You selected red');
  });

  afterEach(function () {
    angular.element('body').empty();
  });
});
