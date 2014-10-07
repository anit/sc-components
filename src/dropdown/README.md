## sc-dropdown

Simple dropdowns that remember your selection!

## Dependencies

    sc-listing
    ui.bootstrap

## Usage

```html
  <sc-dropdown
    items="items"
    attribute="'name'"
    default="getDefault()"
    label="choose from the list"
    type="'simple'"
    btn-class="'link'"
    on-select="doSomething">
  </sc-dropdown>
```

```js
$scope.items = [
  { id: 1, name: 'black' },
  { id: 2, name: 'blue' }
];

$scope.getDefault = function () {
  return $scope.items[0];
};

$scope.doSomething = angular.noop;
```

## API

The following attributes are applicable

- `items` - An `Array` of objects or strings
- `attribute` - If `items` is an array of objects, the attribute within the object that needs to be displayed in the dropdown.
- `default` - An expression (can also be a `Function` that returns the default value to be selected from the `items` array)
- `label` - A default label to be displayed. Defaults to "Choose".
- `type` - There are 3 types of dropdowns available.
  - `simple`: A simple anchor link with dropdown. This is the default if type is not specified
  - `single`: A button with dropdown
  - `split`: A button with split caret as dropdown
- `btn-class` - When the `type` is single or split, the class to be applied to dropdowns button. Can be one of `primary`, `success`, `info`, `warning`, `link` and `danger`. Defaults to `default`.
- `on-select` - A `Function` that is called when the dropdown is selected. The `item` is passed as an argument
