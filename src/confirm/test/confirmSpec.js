'use strict';

describe('sc-confirm', function () {
  var $document;

  beforeEach(module('ui.bootstrap', 'sc-confirm'));
  beforeEach(module('src/confirm/test/confirm.html'));

  beforeEach(inject(function ($rootScope, $compile, _$document_, $timeout) {
    $document = _$document_;
    var scope = $rootScope;
    var elm = angular.element([
      '<a href=""',
      '  sc-confirm="remove(item)"',
      '  sc-confirm-message="Are you sure you want to remove this?"',
      '  sc-on-cancel="cancel(item)"',
      '  template-url="\'src/confirm/test/confirm.html\'">',
      '  Delete this',
      '</a>',
      '<div class="answer">{{ answer }}</div>'
    ].join('\n'));

    scope.remove = function (item) {
      scope.answer = 'You confirmed ' + item.name;
    };

    scope.cancel = function (item) {
      scope.answer = 'Oops, you cancelled ' + item.name;
    };

    scope.item = {
      id: 1,
      name: 'test'
    };

    angular.element('body').append(elm);
    $compile(elm)(scope);
    scope.$digest();

    $document.find('body a').trigger('click');
    inject(function ($transition) {
      if ($transition.transitionEndEventName) {
        $timeout.flush();
      }
    });
  }));

  it('should do open the modal window with given message', function () {
    var title = $document.find('.modal-title');
    expect(title.text()).toContain('Are you sure you want to remove this');
  });

  it('should load the template provided', function () {
    var body = $document.find('.modal-body');
    expect(body.text()).toContain('We are going to remove all the occurances of item');
    expect(body.find('p').length).toBe(1);
    expect(body.find('p strong').length).toBe(1);
    expect(body.find('p strong').text()).toBe('test');
  });

  it('should call the confirm method when confirmed', function () {
    $document.find('.modal-footer .btn-primary').trigger('click');
    var answer = $document.find('.answer');
    expect(answer.text()).toBe('You confirmed test');
  });

  it('should call the cancel method when cancelled', function () {
    $document.find('.modal-footer .btn-link').trigger('click');
    var answer = $document.find('.answer');
    expect(answer.text()).toBe('Oops, you cancelled test');
  });

  // Cleanup
  afterEach(function () {
    angular.element('body').empty();
  });
});
