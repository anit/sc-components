## sc-list

A simple list api

## Usage

Include `sc-list` as dependency in your angular module.

```js
// Item is a angular resource
var list = new List(Item, {
  limit: 10,
  sort_by: 'name',
  sort_type: -1
});
list.fetch(); // => does a .query on Item with the options provided
```

## API

The following are the instance objects and methods available

#### Objects

- `options` - List options used for sorting, searching and pagination
  - `options.limit` - `Number` of records to be fetched. Default is `20`
  - `options.filter` - `String` to be searched
  - `options.page` - Current page `Number`. Default is `0`
  - `options.sort_by` - `String` field to be sorted by.
  - `options.sort_type` - `Number` Sort type. `-1` for descending and `1` for ascending. Default is `1`
- `items` - The angular resource array
- `$promise` - Promise object when the list is being `fetch`ed
- `Resource` - The resource being queried

#### Methods

- `.sort(field [, sort_type])` - Takes `field` and `sort_type`
- `fetch([options])` - Does a `.query` on `Resource`
- `refresh([options])` - Same as `.fetch()`
