## sc-dropdown

Simple dropdowns that remember your selection!

## Dependencies

    sc-listing
    ui.bootstrap

## Usage

```html
  <sc-dropdown
    items="arr"
    attribute="'name'"
    default="getDefault"
    label="'Choose a color'"
    type="'single'"
    btn-class="'link'"
    flavor="'single'"
    keep-label
    on-select="show">
  </sc-dropdown>
```

```js
$scope.arr = [
  { id: 1, name: 'black' },
  { id: 2, name: 'blue' }
];

$scope.getDefault = function () {
  return $scope.items[0];
};

$scope.show = angular.noop;
```

## API

The following attributes are applicable

- `items`: (required) An `Array` of objects or strings
- `attribute`: (required if `items` is an array of objects) If `items` is an array of objects, the attribute within the object that needs to be displayed in the dropdown.
- `default`: (optional) An expression (can also be a `Function` that returns the default value to be selected from the `items` array)
- `label`: (optional) A default label to be displayed. Defaults to "Choose".
- `type`: (optional) There are 3 types of dropdowns available.
  - `simple`: A simple anchor link with dropdown. This is the default if type is not specified
  - `single`: A button with dropdown
  - `split`: A button with split caret as dropdown
- `btn-class`: (optional) When the `type` is single or split, the class to be applied to dropdowns button. Can be one of `primary`, `success`, `info`, `warning`, `link` and `danger`. Defaults to `link`.
- `on-select`: (optional) A `Function` that is called when the dropdown is selected. The `item` is passed as an argument
- `keep-label`: (optional) Always displays the label even when an item is selected from the dropdown
- `flavor`: (optional) There are two flavors. `single` and `multiple`. Flavors are offered for single select and multiple select functionality.

## Classes available

- `sc-dropdown`: for the dropdown menu itself
- `sc-dropdown-selected`: for the button or link label when a selection is active
