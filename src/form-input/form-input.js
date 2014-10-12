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
