/**
 * sc-components
 * Simple reusable angular UI components
 * @version 0.1.6
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
      var classes = ['list sc-list'];
      var itemClass = ['list-item sc-list-item'];
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

//# sourceMappingURL=sc-components.js.map