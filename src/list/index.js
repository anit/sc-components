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

.factory('scList', function () {

  /**
   * List
   *
   * @param {Resource} Resource
   * @param {Object} options
   * @api public
   */

  function List (Resource, options) {
    if (Resource.prototype.constructor.name !== 'Resource') {
      throw new Error('Resource must be an instance of $resource');
    }

    options = options || {};
    this.options = {};
    this.options.limit = options.limit || 20;
    this.options.filter = options.filter;
    this.options.page = options.page || 0;
    this.options.sort_by = options.sort_by;
    this.options.sort_type = options.sort_type || 1;
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
    this.options.sort_type = parseInt(this.options.sort_type) * -1;
    return this.fetch({
      sort_type: type * this.options.sort_type,
      sort_by: field
    });
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
});
