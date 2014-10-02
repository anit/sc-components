## sc-listing

Takes the following attributes

- `items` - `Array` of items to list
- `on-item-click` - A `Function` that is called on click of each item. `item` and `$index` are passed as argumets to this function, in that order.
- `template-url` - Path to the template for each item
- `template` - A template string (either this or template-url is needed otherwise a json will be shown)

Example:

```html
<sc-listing
  items="items"
  on-item-click="showItem"
  template-url="/templates/list-item.html">
</sc-listing>
```

[jsfiddle]()
