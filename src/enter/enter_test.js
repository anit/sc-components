'use strict';

describe('sc-enter', function () {
  var $document;
  var scope;
  var count = 0;
  var triggerKeyDown = function (element, keyCode) {
    var e = $.Event('keydown');
    e.which = keyCode;
    element.trigger(e);
  };

  beforeEach(module('sc-enter'));

  beforeEach(inject(function ($rootScope, $compile, _$document_) {
    $document = _$document_;
    scope = $rootScope;

    var elm = angular.element([
      '<input sc-enter="do(item)" type="text" ng-model="term">',
      '<div class="answer">{{ answer }}</div>'
    ].join('\n'));

    scope.do = function (item) {
      count = count + 1;
      scope.answer = 'You entered ' + item.name + ' ' + count + ' times';
    };

    scope.item = {
      id: 1,
      name: 'test'
    };

    angular.element('body').append(elm);
    $compile(elm)(scope);
    scope.$digest();
  }));

  it('should call the scEnter method', function () {
    // press enter
    triggerKeyDown($document.find('input'), 13);
    var answer = $document.find('.answer');
    // console.log(angular.element('body'));
    expect(answer.text()).toContain('You entered test 1 times');
  });

  it('should not call the scEnter when backspace is pressed', function () {
    // press backspace
    triggerKeyDown($document.find('input'), 8);
    var answer = $document.find('.answer');
    expect(answer.text()).toBe('');
  });

  it('should call the scEnter method', function () {
    // press enter
    triggerKeyDown($document.find('input'), 13);
    var answer = $document.find('.answer');
    expect(answer.text()).toContain('You entered test 2 times');
  });

  afterEach(function () {
    angular.element('body').empty();
  });
});
