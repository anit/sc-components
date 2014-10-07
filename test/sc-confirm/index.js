
describe('sc-confirm', function () {
  var elm;
  var scope;

  // load sc-confirm and the dependent 'ui.bootstrap' module
  beforeEach(module('ui.bootstrap', 'sc-confirm'));
  beforeEach(module('test/templates/confirm.html'));

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope;
    elm = angular.element([
      '<a href=""',
      '  sc-confirm="remove(item)"',
      '  sc-confirm-message="Are you sure you want to remove this?"',
      '  sc-on-cancel="cancel(item)"',
      '  template-url="\'test/templates/confirm.html\'">',
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

    $compile(elm)(scope);
    scope.$digest();
  }));

  it('should do...', function () {
    expect(0).toBe(0);
  });
});
