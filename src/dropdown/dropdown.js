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
      items: '='
    },
    link: function (scope, element, attrs) {
      var isDefined = angular.isDefined;
      var isFunction = angular.isFunction;
      var validTypes = ['simple', 'single', 'split'];
      var validFlavors = ['single', 'multiple'];
      var dropdown = {};
      var labelTpl;
      var flavor;
      var startTag = '';
      var closeTag = '';
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
      var attribute = scope.$parent.$eval(attrs.attribute);

      // keep-label
      var keepLabel = isDefined(attrs.keepLabel);

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

      // for multiple select, remember the selected ones in `_items`
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
          return onSelect(scope.selected.item);
        }

        // for multiple select
        var index = -1;
        scope.selected.items.forEach(function (_item, idx) {
          if (angular.equals(_item, item)) index = idx;
        });
        if (!~index) scope.selected.items.push(item);
        else scope.selected.items.splice(index, 1);
        onSelect(scope.selected.items);
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

        closeTag = [
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

      var activeSelection = 'ng-class="{ \'sc-dropdown-selected\': (selected.item || selected.items.length) }"';

      var listing = [
        startTag,
        '  <sc-listing class="'+ dropdownClass +'"',
        '    ' + active,
        '    items="items"',
        '    on-item-click="select"',
        '    template="template">',
        '  </sc-listing>',
        closeTag
      ].join('');

      dropdown.simple = [
        '<span class="dropdown">',
        '  <a href class="dropdown-toggle" '+ activeSelection +'>',
        '    ' + labelTpl,
        '  </a>',
        '  ' + listing,
        '</span>'
      ].join('');

      dropdown.single = [
        '<div class="btn-group" dropdown>',
        '  <button type="button" class="'+ btnClass +' dropdown-toggle" '+ activeSelection +'>',
        '    ' + labelTpl + ' <span class="caret"></span>',
        '  </button>',
        '  ' + listing,
        '</div>'
      ].join('');

      dropdown.split = [
        '<div class="btn-group" dropdown>',
        '  <button type="button" class="'+ btnClass +'" '+ activeSelection +'>'+ labelTpl +'</button>',
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
