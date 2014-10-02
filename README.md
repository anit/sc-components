## sc-components

Simple UI components that we reuse across all of our apps.

## Installation

Clone the repo, make sure you have `npm`, `bower` and `gulp` installed.

```sh
$ npm install
$ bower install
$ gulp serve
```

## API

The following components are available

#### listing

Usage:
include `sc-listing` as a dependent module

```html
<listing
  items="items"
  on-item-click="showItem"
  template-url="/templates/list-item.html">
</listing>
```

## License

MIT
