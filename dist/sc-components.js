/**
 * sc-components
 * Simple reusable angular UI components
 * @version 0.1.20
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
 *    ui.bootstrap.dropdown
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
  'ui.bootstrap.dropdown'
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
      items: '=',
      ngModel: '=',

      // Call this method to determine if the filters are active
      // Based on what this method returns, the `sc-dropdown-selected` class
      // will be added
      activeSelection: '&'
    },
    link: function (scope, element, attrs) {
      var isDefined = angular.isDefined;
      var isFunction = angular.isFunction;
      var validTypes = ['simple', 'single', 'split'];
      var validFlavors = ['single', 'multiple'];

      // to store 3 types of dropdowns
      // - simple
      // - single
      // - split
      var dropdown = {};

      // template string containing the label that is displayed when dd is
      // closed
      var labelTpl;

      // 2 flavors of dropdown
      // - single
      // - multiple
      var flavor;

      // to call the on-select method as soon as an item from the dd is selected
      var autoSelect = true;

      // template for listing dropdown items
      var template = '';

      // for flavored dropdowns, include header
      var startTag = '';
      var closeTag = '';

      // for flavored dropdowns, include footer
      var footer = '';

      // active="method" attr when item in the dropdown listing is active
      var active = '';

      var dropdownClass = 'dropdown-menu';

      // defaults
      var btnClass = defaults.btnClass;
      var btnDefault = defaults.btnDefault;
      var type = defaults.type;
      var label = defaults.label;

      // Will contain `item` (single select) and `items` (multiple select)
      scope.selected = {};

      // Parse

      // attribute
      // when items is an array of obj, the attribute within the object
      // that is used to display the list item
      var attribute = scope.$parent.$eval(attrs.attribute);

      // keep-label
      // Always show label
      var keepLabel = isDefined(attrs.keepLabel);

      // auto-select (calls the onSelect method as soon as you click)
      if (isDefined(attrs.autoSelect)) {
        autoSelect = scope.$parent.$eval(attrs.autoSelect);
      }

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

      // flavor
      if (isDefined(attrs.flavor)) {
        flavor = scope.$parent.$eval(attrs.flavor);
        if (!~validFlavors.indexOf(flavor)) flavor = undefined;
      }

      // flavor compare
      // if (isDefined(attrs.flavorCompare)) {
      //   flavor.compare = scope.$parent.$eval(attrs.flavorCompare);
      // }

      function comparator (_item) {
        if (flavor !== 'multiple') {
          return angular.equals(_item, scope.selected.item);
        }

        // multiple
        return scope.selected.items.filter(function (item) {
          return angular.equals(_item, item);
        }).length;
      }

      // default
      if (isDefined(attrs.default)) {
        label = scope.$parent.$eval(attrs.default);
        if (flavor === 'multiple') {
          scope.selected.items = isFunction(label)
            ? label()
            : label;
        } else {
          scope.selected.item = isFunction(label)
            ? label()
            : label;
        }
        label = scope.selected.item;
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
        labelTpl = '{{ selected.item[\''+ attribute +'\'] || label }}';
        scope.template = '<a href>{{ item[\''+ attribute +'\'] }}</a>';
      } else {
        labelTpl = '{{ selected.item || label }}';
        scope.template = '<a href>{{ item }}</a>';
      }

      // if keep-label was passed as an attr, make sure the label is
      // shown always
      if (keepLabel) labelTpl = scope.label;

      // for multiple select, remember the selected ones in `selected.items`
      if (flavor === 'multiple' && !scope.selected.items) {
        scope.selected.items = [];
      }

      scope.select = function (item) {
        // single select
        if (flavor !== 'multiple') {
          if (angular.equals(scope.selected.item, item)) {
            scope.selected.item = undefined;
          } else {
            scope.selected.item = item;
          }
          if (autoSelect) onSelect(scope.selected.item);
          return;
        }

        // for multiple select
        var index = -1;
        scope.selected.items.forEach(function (_item, idx) {
          if (angular.equals(_item, item)) index = idx;
        });
        if (!~index) scope.selected.items.push(item);
        else scope.selected.items.splice(index, 1);
        if (autoSelect) onSelect(scope.selected.items);
      };

      if (flavor) {
        startTag = [
          '<div class="sc-dropdown '+ dropdownClass +'" ng-click="$event.stopPropagation()">',
          '  <div class="sc-dropdown-header">',
          '    <strong>{{ label }}</strong>',
          '    <a href ng-click="close()" class="pull-right">',
          '      <span aria-hidden="true">&times;</span>',
          '    </a>',
          '  </div>'
        ].join('');

        scope.onSelect = onSelect;

        if (isDefined(attrs.footer)) {
          footer = [
            '  <div class="sc-dropdown-footer">',
            '    <button class="btn btn-primary btn-xs btn-block" ng-click="onSelect(',
            flavor === 'multiple' ? 'selected.items' : 'selected.item',
            ')">',
            '      Apply',
            '    </button>',
            '  </div>',
          ].join('');
        }

        closeTag = [
          footer,
          '</div>'
        ].join('');

        // Add active class
        scope.active = function (_item) {
          return comparator(_item);
        };

        // Close single and multiple select dropdowns
        scope.close = function () {
          scope.$$childHead.isOpen = false;
        };

        active = 'active="active"';
        dropdownClass = '';
      }

      if (isDefined(attrs.templateUrl)) {
        template = 'template-url="'+ attrs.templateUrl +'">';
      } else {
        template = 'template="template">';
      }

      // use scope.activeSelection() only if it was provided
      var selectedClass;
      if (isDefined(attrs.activeSelection)) {
        selectedClass = 'ng-class="{ \'sc-dropdown-selected\': activeSelection() }"';
      } else {
        selectedClass = 'ng-class="{ \'sc-dropdown-selected\': (selected.item || selected.items.length) }"';
      }

      var listing = [
        startTag,
        '  <sc-listing class="'+ dropdownClass +'"',
        '    ' + active,
        '    items="items"',
        '    on-item-click="select"',
        '    ng-model="ngModel"',
        '    ' + template,
        '  </sc-listing>',
        closeTag
      ].join('');

      dropdown.simple = [
        '<span class="dropdown">',
        '  <a href class="dropdown-toggle" '+ selectedClass +'>',
        '    ' + labelTpl,
        '  </a>',
        '  ' + listing,
        '</span>'
      ].join('');

      dropdown.single = [
        '<div class="btn-group" dropdown>',
        '  <button type="button" class="'+ btnClass +' dropdown-toggle" '+ selectedClass +'>',
        '    ' + labelTpl + ' <span class="caret"></span>',
        '  </button>',
        '  ' + listing,
        '</div>'
      ].join('');

      dropdown.split = [
        '<div class="btn-group" dropdown>',
        '  <button type="button" class="'+ btnClass +'" '+ selectedClass +'>'+ labelTpl +'</button>',
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
    angular.extend(this.options, options);
    this.options.limit = options.limit || defaults.limit;
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
    var self = this;
    options = options || {};
    options.limit = options.limit || this.options.limit;
    options.page = options.page || this.options.page;
    options.sort_by = options.sort_by || this.options.sort_by;
    options.sort_type = options.sort_type || this.options.sort_type;

    angular.extend(this.options, options);
    var items = this.Resource.query(this.options);
    if (!this.items) this.items = [];
    this.items['$promise'] = items.$promise;
    this.$promise = items.$promise;
    items.$promise.then(function () {
      self.items = items;
    });
    return items;
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
      items: '=',
      ngModel: '='
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

      // active
      scope.active = isDefined(attrs.active)
        ? scope.$parent.$eval(attrs.active)
        : angular.noop;

      classes = classes.join(' ');
      itemClass = itemClass.join(' ');

      promise.then(function (tpl) {
        tpl = tpl || '{{ item | json }}';

        var template = [
          '<ul class="'+ classes +'">',
          '  <li class="'+ itemClass +'" ng-repeat="item in items" ng-click="onItemClick(item, $index)" ng-class="{ \'active\': active(item), \'last\': $last, \'first\': $first }" }">',
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