## sc-list

A simple list api

## Usage

Include `sc-list` as dependency in your angular module.

```js
// Item is a angular resource
var list = new List(Item, {

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
  - `options.sort_type` - Sort type. `-1` for descending and `1` for ascending. Default is `1`
- `items` - The angular resource array
- `$promise` - Promise object when the list is being `fetch`ed
- `Resource` - The resource being fetched

#### Methods

- `.sort(field [, sort_type])` - Takes `field` and `sort_type`. `sort_type` can be `1` (ascending) or `-1` (descending). Default is `1`
- `refresh([options])` - Does a `.query` on `Resource`
