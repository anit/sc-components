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
   * load more
   *
   * @return {Array}
   * @api public
   */
  List.prototype.more = function () {
    var pageNo = this.items && this.items.length ?
        this.options.page + 1 :
        this.options.page;

    return this.fetch({ 
      page: pageNo
    }, true);
  };

  /**
   * fetch
   *
   * @param {Object} options
   * @return {Array}
   * @api public
   */

  List.prototype.refresh =
  List.prototype.fetch = function (options, append) {
    var self = this;
    options = options || {};

    angular.extend(this.options, options);
    var items = this.Resource.query(this.options, function (res, headers) {
      self.headers = headers();
    });

    if (!this.items) this.items = [];
    this.items['$promise'] = items.$promise;
    this.$promise = items.$promise;
    items.$promise.then(function () {
      if (append) {
        self.items.push.apply(self.items, items);
      } else {
        self.items = items;
      }
    });

    return items;
  };

  return List;
}]);
