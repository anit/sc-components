/**
 * sc-components
 * Simple reusable angular UI components
 * @version 0.1.2
 * Copyright(c) SafetyChanger
 * @license MIT
 */

'use strict';

angular.module('sc-components', [
  'sc-confirm',
  'sc-dropdown',
  'sc-enter',
  'sc-list',
  'sc-listing'
]);

'use strict';

/**
 * sc-confirm
 *
 * Similar to window.confirm but with modal window
 *
 * Dependencies
 *
 *    ui.bootstrap
 *
 * Make sure you include the source files of ui.bootstrap.modal
 *
 * Usage
 *
 *  <a sc-confirm="remove()"
 *    sc-confirm-message="Are you sure custom message?"
 *    sc-on-cancel="cancel()"
 *    template-url="'/templates/confirm.html'"
 *    btn-placement="'left'"
 *    item="resource">
 *  </a>
 */

angular.module('sc-confirm', [
  'ui.bootstrap'
])

/**
 * Constants
 */

.constant('scConfirmDefaults', {
  message: 'Are you sure ?',
  btnPlacement: 'right'
})

.directive('scConfirm', [
  '$modal', '$compile', '$parse', '$http', '$q', '$templateCache', 'scConfirmDefaults',
  function ($modal, $compile, $parse, $http, $q, $templateCache, defaults) {
    return {
      restrict: 'A',
      scope: {
        scConfirm: '&',
        scOnCancel: '&'
      },
      link: function(scope, element, attrs) {
        var isDefined = angular.isDefined;
        var deferred = $q.defer();
        var promise = deferred.promise;
        var validPlacements = ['left', 'center', 'right'];
        var btnPlacement;
        var template;
        var templateUrl;

        // Parse attrs

        // template and template-url
        if (isDefined(attrs.template)) {
          template = scope.$parent.$eval(attrs.template);
          deferred.resolve(template);
        } else if (isDefined(attrs.templateUrl)) {
          templateUrl = scope.$parent.$eval(attrs.templateUrl);
          $http.get(templateUrl, { cache: $templateCache })
            .success(function (html) {
              deferred.resolve(html);
            })
            .error(deferred.reject);
        } else {
          deferred.resolve('');
        }

        // btn-placement
        if (isDefined(attrs.btnPlacement)) {
          btnPlacement = scope.$parent.$eval(attrs.btnPlacement);
        }

        if (!~validPlacements.indexOf(btnPlacement)) {
          btnPlacement = defaults.btnPlacement;
        }

        promise.then(function (tpl) {
          var message = attrs.scConfirmMessage || defaults.message;
          var modalHtml = [
            '<div class="modal-header">',
            '  <button type="button" class="close" ng-click="cancel()" aria-hidden="true">&times;</button>',
            '  <h4 class="modal-title">'+ message +'</h4>',
            '</div>',
            '<div class="modal-body">',
            '  '+ tpl +'&nbsp;',
            '</div>',
            '<div class="modal-footer sc-'+ btnPlacement +'">',
            '  <button class="btn btn-primary" ng-click="ok()">Yes</button>',
            '  <button class="btn btn-link" ng-click="cancel()">Cancel</button>',
            '</div>'
          ].join('\n');

          element.bind('click', function () {
            var modalInstance = $modal.open({
              template: modalHtml,
              controller: 'ModalInstanceCtrl',
              scope: scope.$parent,
              resolve: {
                scOnCancel: function () { return scope.scOnCancel; }
              }
            });

            modalInstance.result.then(scope.scConfirm);
          });
        });
      }
    };
  }
])

/**
 * scConfirm Modal Controller
 */

.controller('ModalInstanceCtrl', [
  '$scope', '$modalInstance', 'scOnCancel',
  function ($scope, $modalInstance, scOnCancel) {
    $scope.ok = $modalInstance.close;
    $scope.cancel = function () {
      $scope.$parent.$eval(scOnCancel);
      $modalInstance.dismiss('cancel');
    };
  }
]);

// TODO: give a provider

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

'use strict';

/**
 * sc-dropdown
 *
 * dropdowns
 *
 * Dependencies
 *
 *    sc-listing
 *    ui.bootstrap
 *
 * Usage:
 *
 *    <sc-dropdown
 *      items="items"
 *      attribute="'name'"
 *      default="expression"
 *      label="'Choose assignee'"
 *      type="'simple'" // or 'single' or 'split'
 *      on-select="doSomething">
 *    </sc-dropdown>
 *
 * There are 3 types of dropdowns available.
 *   - simple: a simple anchor link (default)
 *   - single: a button with dropdown
 *   - split: a button with split caret as dropdown
 */

angular.module('sc-dropdown', [
  'sc-listing',
  'ui.bootstrap'
])

/**
 * Constants
 */

.constant('scDropdownDefaults', {
  btnClass: 'btn btn-',
  btnDefault: 'link',
  type: 'simple',
  label: 'Choose from the list'
})

.directive('scDropdown', ['$compile', 'scDropdownDefaults', function ($compile, defaults) {
  return {
    restrict: 'E',
    scope: {
      items: '='
    },
    link: function (scope, element, attrs) {
      var isDefined = angular.isDefined;
      var isFunction = angular.isFunction;
      var validTypes = ['simple', 'single', 'split'];
      var dropdown = {};
      var labelTpl;

      // defaults
      var btnClass = defaults.btnClass;
      var btnDefault = defaults.btnDefault;
      var type = defaults.type;
      var label = defaults.label;

      // Parse

      // attribute
      var attribute = scope.$parent.$eval(attrs.attribute);

      // type
      if (isDefined(attrs.type)) {
        type = scope.$parent.$eval(attrs.type);
        type = !~validTypes.indexOf(type)
          ? 'simple'
          : type;
      }

      // label
      if (isDefined(attrs.label)) {
        scope.label = scope.$parent.$eval(attrs.label);
      }

      // default
      if (isDefined(attrs.default)) {
        label = scope.$parent.$eval(attrs.default);
        scope.item = isFunction(label)
          ? label()
          : label;
        label = scope.item;
      }
      scope.label = scope.label || label;

      // btn-class
      if (isDefined(attrs.btnClass)) {
        btnDefault = scope.$parent.$eval(attrs.btnClass);
      }
      btnClass = btnClass + btnDefault;

      // on-select
      var onSelect = scope.$parent.$eval(attrs.onSelect);

      // Check if the items is an array of objects or strings
      // and depending on that, build the template

      if (typeof scope.items[0] !== 'string') {
        labelTpl = '{{ item[\''+ attribute +'\'] || label }}';
        scope.template = '<a href>{{ item[\''+ attribute +'\'] }}</a>';
      } else {
        labelTpl = '{{ item || label }}';
        scope.template = '<a href>{{ item }}</a>';
      }

      scope.select = function (item) {
        scope.item = item;
        onSelect(item);
      };

      var listing = [
        '  <sc-listing class="dropdown-menu"',
        '    items="items"',
        '    on-item-click="select"',
        '    template="template">',
        '  </sc-listing>'
      ].join('');

      dropdown.simple = [
        '<span class="dropdown">',
        '  <a href class="dropdown-toggle">',
        '    ' + labelTpl,
        '  </a>',
        '  ' + listing,
        '</span>'
      ].join('');

      dropdown.single = [
        '<div class="btn-group" dropdown>',
        '  <button type="button" class="'+ btnClass +' dropdown-toggle">',
        '    ' + labelTpl + ' <span class="caret"></span>',
        '  </button>',
        '  ' + listing,
        '</div>'
      ].join('');

      dropdown.split = [
        '<div class="btn-group" dropdown>',
        '  <button type="button" class="'+ btnClass +'">'+ labelTpl +'</button>',
        '  <button type="button" class="'+ btnClass +' dropdown-toggle">',
        '    <span class="caret"></span>',
        '  </button>',
        '  ' + listing,
        '</div>'
      ].join('');

      element.replaceWith($compile(dropdown[type])(scope));
    }
  };
}]);

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

'use strict';

/*!
 * sc-enter
 * Copyright(c) 2014 Madhusudhan Srinivasa <madhu@changer.nl>
 * MIT Licensed
 */

/**
 * sc-enter
 *
 * Usage:
 *
 *  <input sc-enter="search()" type="text" ng-model="term">
 */

angular.module('sc-enter', [])

.directive('scEnter', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.scEnter, {
            'event': event
          });
        });

        event.preventDefault();
      }
    });
  };
});

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

'use strict';

/*!
 * sc-form-input
 *
 * Simple form fields
 *
 * Usage:
 *
 *    <sc-form-input
 *      input-type="'text'" // 'textarea', 'password', 'email', etc
 *      type="'inline'" // default is 'normal'
 *      editable="mode('edit')"
 *      required="bool"
 *      autofocus="bool"
 *      read-only="bool"
 *      ng-model="field"
 *      label="'firstname'"
 *      pattern="//"
 *      min-length="10"
 *      max-length="30"
 *      rows="2"
 *      cols="10"
 *      placeholder="'Enter your firstname'"
 *      >
 *    </sc-form-input>
 */

angular.module('sc-form-input', [])

/**
 * Constants
 */

.constant('scFormInputDefaults', {
  type: 'normal',
  inputType: 'text',
  required: false,
  autofocus: false,
  readOnly: false,
  editable: true
})

.directive('scFormInput', ['$compile', 'scFormInputDefaults', function ($compile, defaults) {

  var allowed = [

  ];

  return {
    restrict: 'E',
    scope: {

    },
    link: function (scope, element, attrs) {
      var isDefined = angular.isDefined;
      var isFunction = angular.isFunction;

      // Parse attrs

      // input-type (default is text)

      // type

      // editable

      // required

      // autofocus

      // read-only

      // ng-model

      // label

      // pattern

      // min-length

      // max-length

      // rows

      // cols

      // placeholder

      var template = [
        '<div class="form-group sc-form-group">',
        '  <label for="inputEmail3" class="col-sm-2 control-label">Email</label>'
      ];

      template = template.concat([
        '  <div class="col-sm-10">'
      ]);

      template = template.concat([
        '    <input type="email" class="form-control" id="inputEmail3" placeholder="Email" ng-model="'+ attrs.ngModel +'">'
      ]);

      template = template.concat([
        '  </div>'
      ]);

      template = template.concat([
        '</div>'
      ]);

      element.replaceWith($compile(template.join('\n'))(scope));
    }
  };
}])

// TODO: give a provider

'use strict';

/*!
 * sc-list
 * Copyright(c) 2014 Madhusudhan Srinivasa <madhu@changer.nl>
 * MIT Licensed
 */

/**
 * sc-list
 *
 * Usage:
 *
 *    var list = new List(Item);
 *    list.fetch(); // or list.refresh();
 *    list.sort('name', -1);
 */

angular.module('sc-list', [])

/**
 * List defaults
 */

.constant('scListDefaults', {
  limit: 20,
  page: 0,
  sort_type: 1
})

.factory('scList', ['scListDefaults', function (defaults) {

  /**
   * List
   *
   * @param {Resource} Resource
   * @param {Object} options
   * @api public
   */

  function List (Resource, options) {
    if (!Resource || Resource.prototype.constructor.name !== 'Resource') {
      throw new Error('Resource must be an instance of $resource');
    }

    if (typeof Resource.query !== 'function') {
      throw new Error('Resource must have a query function');
    }

    options = options || {};
    this.options = {};
    this.options.limit = options.limit || defaults.limit;
    this.options.filter = options.filter;
    this.options.page = options.page || defaults.page;
    this.options.sort_by = options.sort_by;
    this.options.sort_type = options.sort_type || defaults.sort_type;
    this.Resource = Resource;
  }

  /**
   * sort
   *
   * @param {String} field
   * @param {Integer} type (1 or -1)
   * @return {Array}
   * @api public
   */

  List.prototype.sort = function (field, type) {
    this.options.sort_type = parseInt(this.options.sort_type, 10) * -1;
    return this.fetch({
      sort_type: type * this.options.sort_type,
      sort_by: field
    });
  };

  /**
   * goto
   *
   * @param {Number} page
   * @return {Array}
   * @api public
   */

  List.prototype.goto = function (page) {
    this.options.page = parseInt(page, 10);
    return this.fetch();
  };

  /**
   * fetch
   *
   * @param {Object} options
   * @return {Array}
   * @api public
   */

  List.prototype.refresh =
  List.prototype.fetch = function (options) {
    options = options || {};
    options.limit = options.limit || this.options.limit;
    options.filter = options.filter || this.options.filter;
    options.page = options.page || this.options.page;
    options.sort_by = options.sort_by || this.options.sort_by;
    options.sort_type = options.sort_type || this.options.sort_type;

    this.options = options;
    this.items = this.Resource.query(this.options);
    this.$promise = this.items.$promise;
    return this.items;
  };

  return List;
}]);

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

  describe('list instance', function () {
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

  describe('.sort() and options.filter', function () {
    it('should set proper query params', function () {
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
    it('should set page param', function () {
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

'use strict';

/*!
 * sc-listing
 * Copyright(c) 2014 Madhusudhan Srinivasa <madhu@changer.nl>
 * MIT Licensed
 */

/**
 * sc-listing
 *
 * Usage:
 *
 *  <listing
 *    items="items"
 *    on-item-click="showItem"
 *    class="'items'"
 *    item-class="'item'"
 *    template-url="'/templates/list-item.html'">
 *  </listing>
 *
 * it also takes `template` as an attribute which is just a template string
 */

angular.module('sc-listing', [])

.directive('scListing', function ($compile, $http, $q, $templateCache) {
  return {
    restrict: 'E',
    scope: {
      items: '='
    },
    link: function (scope, element, attrs) {
      var isDefined = angular.isDefined;
      var deferred = $q.defer();
      var promise = deferred.promise;
      var classes = ['list'];
      var itemClass = ['list-item'];
      var template;
      var templateUrl;

      // Parse attrs

      // on-item-click
      if (isDefined(attrs.onItemClick)) {
        scope.onItemClick = scope.$parent.$eval(attrs.onItemClick);
      }

      // template and template-url
      if (isDefined(attrs.template)) {
        template = scope.$parent.$eval(attrs.template);
        deferred.resolve(template);
      } else if (isDefined(attrs.templateUrl)) {
        templateUrl = scope.$parent.$eval(attrs.templateUrl);
        $http.get(templateUrl, { cache: $templateCache })
          .success(function (html) {
            deferred.resolve(html);
          })
          .error(deferred.reject);
      } else {
        deferred.resolve('');
      }

      // class
      if (isDefined(attrs.class)) {
        classes.push(attrs.class);
      }

      // item-class
      if (isDefined(attrs.itemClass)) {
        itemClass.push(scope.$parent.$eval(attrs.itemClass));
      }

      classes = classes.join(' ');
      itemClass = itemClass.join(' ');

      promise.then(function (tpl) {
        tpl = tpl || '{{ item | json }}';

        var template = [
          '<ul class="'+ classes +'">',
          '  <li class="'+ itemClass +'" ng-repeat="item in items" ng-click="onItemClick(item, $index)">',
          '    '+ tpl,
          '  </li>',
          '</ul>'
        ].join('');

        element.replaceWith($compile(template)(scope));
      });
    }
  };
});

// TODO: give a provider to override defaults

'use strict';

describe('sc-listing', function () {
  var $document;
  var scope;
  var compile;
  var templateCache;

  beforeEach(module('ui.bootstrap'));
  beforeEach(module('sc-listing'));
  beforeEach(module(
    'src/listing/template.html',
    'src/listing/template-url.html',
    'src/listing/no-template.html',
    'src/listing/list-item.html'
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
    scope.tplPath = 'src/listing/list-item.html';
    scope.tpl = '<span>{{ item.name }}</span>';
    scope.showItem = function (item, index) {
      scope.index = index;
      scope.item = item;
    };
  }));

  function setup (type) {
    var tpl = templateCache.get('src/listing/' + type + '.html');
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

//# sourceMappingURL=sc-components.js.map