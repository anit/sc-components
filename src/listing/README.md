## sc-listing

Provides a simple listing

## API

Takes the following attributes

- `items` - (required) `Array` of items to list
- `on-item-click` - (optional) A `Function` that is called on click of each item. `item` and `$index` are passed as argumets to this function, in that order.
- `template-url` - (optional) Path to the template for each item
- `template` - (optional) A template string (either this or template-url is needed otherwise a json will be shown)

## Usage

```html
<sc-listing
  items="items"
  on-item-click="showItem"
  template-url="'/templates/list-item.html'">
</sc-listing>
```

[jsfiddle]()
