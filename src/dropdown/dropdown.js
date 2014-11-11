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

.directive('scDropdown', ['$compile', 'scDropdownDefaults', '$parse', function ($compile, defaults, $parse) {
  return {
    restrict: 'E',
    scope: {
      items: '=',
      ngModel: '=',

      // Call this method to determine if the filters are active
      // Based on what this method returns, the `sc-dropdown-selected` class
      // will be added
      activeSelection: '&',
      onToggle: '&'
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
        // scope.label = scope.$parent.$eval(attrs.label);
        attrs.$observe('label', function (val) {
          scope.label = val;
        });
      }

      // flavor
      if (isDefined(attrs.flavor)) {
        flavor = scope.$parent.$eval(attrs.flavor);
        if (!~validFlavors.indexOf(flavor)) flavor = undefined;
      }

      /**
       * Compare items/item
       */

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
        '<span class="dropdown" on-toggle="onToggle()(open)">',
        '  <a href class="dropdown-toggle" '+ selectedClass +'>',
        '    ' + labelTpl,
        '  </a>',
        '  ' + listing,
        '</span>'
      ].join('');

      dropdown.single = [
        '<div class="btn-group" dropdown on-toggle="onToggle()(open)">',
        '  <button type="button" class="'+ btnClass +' dropdown-toggle" '+ selectedClass +'>',
        '    ' + labelTpl + ' <span class="caret"></span>',
        '  </button>',
        '  ' + listing,
        '</div>'
      ].join('');

      dropdown.split = [
        '<div class="btn-group" dropdown on-toggle="onToggle()(open)">',
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
