'use strict';

describe('sc-confirm', function () {
  var $document;
  var elm;
  var scope;
  var templateCache;
  var compile;
  var timeout;

  beforeEach(module('ui.bootstrap'));
  beforeEach(module('sc-confirm'));
  beforeEach(module(
    'src/confirm/template.html',
    'src/confirm/template-url.html',
    'src/confirm/no-template.html',
    'src/confirm/confirm.html'
  ));

  beforeEach(inject(function ($rootScope, $compile, _$document_, $timeout, $templateCache) {
    $document = _$document_;
    scope = $rootScope;
    templateCache = $templateCache;
    compile = $compile;
    timeout = $timeout;

    scope.template = 'src/confirm/confirm.html';
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
  }));

  /**
   * Setup
   */

  function setup (type) {
    var tpl = templateCache.get('src/confirm/'+ type +'.html');
    elm = angular.element(tpl);
    angular.element('body').append(elm);
    compile(elm)(scope);
    scope.$digest();

    $document.find('body a').trigger('click');
    inject(function ($transition) {
      // This is always called when transition ends
      timeout.flush();
    });
  }

  describe('sc-confirm-message', function () {
    it('should open the modal window with given message', function () {
      setup('template-url');
      var title = $document.find('.modal-title');
      expect(title.text()).toContain('Are you sure you want to remove this');
    });
  });

  describe('template-url', function () {
    it('should load the template provided', function () {
      setup('template-url');
      var body = $document.find('.modal-body');
      expect(body.text()).toContain('We are going to remove all the occurances of item');
      expect(body.find('p').length).toBe(1);
      expect(body.find('p strong').length).toBe(1);
      expect(body.find('p strong').text()).toBe('test');
    });
  });

  describe('sc-confirm', function () {
    it('should call the confirm method when confirmed', function () {
      setup('template-url');
      $document.find('.modal-footer .btn-primary').trigger('click');
      var answer = $document.find('.answer');
      expect(answer.text()).toBe('You confirmed test');
    });
  });

  describe('sc-cancel', function () {
    it('should call the cancel method when cancelled', function () {
      setup('template-url');
      // click on cancel
      $document.find('.modal-footer .btn-link').trigger('click');
      var answer = $document.find('.answer');
      expect(answer.text()).toBe('Oops, you cancelled test');
    });
  });

  describe('template', function () {
    it('should use the template when provided', function () {
      scope.template = '<div class="remove">All will be removed</div>';
      setup('template');
      var body = $document.find('.modal-body');
      expect(body.find('.remove').length).toBe(1);
      expect(body.text()).toContain('All will be removed');
    });
  });

  it('should display no modal body when no template is given', function () {
    setup('no-template');
    var body = $document.find('.modal-body');
    expect($.trim(body.text())).not.toBeTruthy();
  });

  it('should display default message when none provided', function () {
    setup('no-template');
    var title = $document.find('.modal-title');
    expect(title.text()).toContain('Are you sure ?');
  });

  describe('btn-placement', function () {
    it('should add appropriate class to footer', function () {
      setup('no-template');
      var footer = $document.find('.modal-footer');
      expect(footer.attr('class')).toContain('sc-left');
    });

    it('should add default class when invalid', function () {
      setup('template-url');
      var footer = $document.find('.modal-footer');
      expect(footer.attr('class')).toContain('sc-right');
    });
  });

  // Cleanup
  afterEach(function () {
    angular.element('body').empty();
  });
});
