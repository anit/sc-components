## sc-components

Simple angular UI components that we reuse across all of our apps.

## Installation

Clone the repo, make sure you have [npm](https://www.npmjs.org/), [bower](http://bower.io/) and [gulp](http://gulpjs.com/) installed. By running the following you can checkout the examples in `public/`

```sh
$ npm install
$ bower install
$ gulp serve
```

## API

The following components are available

#### listing

The following attributes are used

- `items` - `Array` of items to list
- `on-item-click` - A `Function` that is called on click of each item. `$index` and `item` itself are passed as argumets to this function.
- `template-url` - Path to the template for each item
- `template` - A template string (either this or template-url is needed otherwise a json will be shown)

Usage:

Include `sc-listing` as a dependent module.
Then in the html

```html
<sc-listing
  items="items"
  on-item-click="showItem"
  template-url="/templates/list-item.html">
</sc-listing>
```

## License

MIT
