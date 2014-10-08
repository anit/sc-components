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
