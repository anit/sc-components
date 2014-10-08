
describe('sc-confirm', function () {
  var elm;
  var scope;

  // load sc-confirm and the dependent 'ui.bootstrap' module
  beforeEach(module('ui.bootstrap', 'sc-confirm'));
  beforeEach(module('src/confirm/test/confirm.html'));

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope;
    elm = angular.element([
      '<a href=""',
      '  sc-confirm="remove(item)"',
      '  sc-confirm-message="Are you sure you want to remove this?"',
      '  sc-on-cancel="cancel(item)"',
      '  template-url="\'src/confirm/test/confirm.html\'">',
      '  Delete this',
      '</a>'
    ].join('\n'));

    scope.remove = function (item) {
      scope.answer = 'confirmed';
    };

    scope.cancel = function (item) {
      scope.answer = 'cancelled';
    };

    scope.item = {
      id: 1,
      name: 'test'
    };

    angular.element('body').append(elm);
    $compile(elm)(scope);
    elm.trigger('click');
    scope.$digest();
  }));

  it('should do...', function () {
    console.log(angular.element('html'));
    expect(0).toBe(0);
  });
});
