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
      var flavor = {};
      var startTag = '';
      var closeTag = '';
      var active = '';
      var dropdownClass = 'dropdown-menu';

      // defaults
      var btnClass = defaults.btnClass;
      var btnDefault = defaults.btnDefault;
      var type = defaults.type;
      var label = defaults.label;

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
      if (isDefined(attrs.flavorType)) {
        flavor.type = scope.$parent.$eval(attrs.flavorType);
        if (!~validFlavors.indexOf(flavor.type)) flavor.type = undefined;
      }

      // flavor compare
      // if (isDefined(attrs.flavorCompare)) {
      //   flavor.compare = scope.$parent.$eval(attrs.flavorCompare);
      // }

      function comparator (_item) {
        if (flavor.type !== 'multiple') {
          return angular.equals(_item, scope.item);
        }

        // multiple
        return scope._items.filter(function (item) {
          return angular.equals(_item, item);
        }).length;
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

      // if keep-label was passed as an attr, make sure the label is
      // shown always
      if (keepLabel) labelTpl = scope.label;

      // for multiple select, remember the selected ones in `_items`
      if (flavor.type === 'multiple') scope._items = [];

      scope.select = function (item) {
        // single select
        scope.item = item;
        if (flavor.type !== 'multiple') return onSelect(item);

        // for multiple select
        var index = -1;
        scope._items.forEach(function (_item, idx) {
          if (angular.equals(_item, item)) index = idx;
        });
        if (!~index) scope._items.push(item);
        else scope._items.splice(index, 1);
        onSelect(scope._items);
      };

      if (flavor.type) {
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
