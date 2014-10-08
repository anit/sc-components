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
    'src/dropdown/test/simple-defaults.html',
    'src/dropdown/test/simple.html',
    'src/dropdown/test/single.html',
    'src/dropdown/test/split.html'
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

    scope.items = ['red', 'blue'];
  }));

  function dropdown (type) {
    var tpl = templateCache.get('src/dropdown/test/' + type + '.html');
    var elm = angular.element(tpl);
    angular.element('body').append(elm);
    compile(elm)(scope);
    scope.$digest();
  }

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

  it('should call the onSelect method when clicked on item', function () {
    dropdown('simple');
    var dd = $document.find('span.dropdown');
    var menu = dd.find('ul.list.dropdown-menu');
    dd.find('a.dropdown-toggle').trigger('click');

    // click on the first dropdown item ('black')
    menu.find('li').eq(0).trigger('click');
    expect($document.find('.selected').text()).toContain('You selected black');
  });

  afterEach(function () {
    angular.element('body').empty();
  });
});
