## sc-listing

Provides a simple listing

## Usage

```html
<sc-listing
  items="items"
  on-item-click="show"
  class="'items'"
  item-class="'item'"
  template-url="'/templates/list-item.html'"
  active="active">
</sc-listing>
```

```js
$scope.show = function (item) {
  // $state.go('list.detail', { id: item._id })
};

$scope.active = function (item) {
  return item._id == $state.params.id;
}
```

## API

Takes the following attributes

- `items`: (required) `Array` of items to list
- `on-item-click`: (optional) A `Function` that is called on click of each item. `item` and `$index` are passed as argumets to this function, in that order.
- `template-url`: (optional) Path to the template for each item
- `template`: (optional) A template string (either this or template-url is needed otherwise a json will be shown)
- `class`: (optional) `String` css class to be applied on the list `<ul>`
- `item-class`: (optional) `String` css class to be applied on the list item `<li>`
- `active`: (optional) A `Function` that is called to apply the `active` class on `ul > li`
