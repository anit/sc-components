## sc-dropdown

Simple dropdowns that remember your selection!

## Dependencies

    sc-listing
    ui.bootstrap

## Usage

```html
  <sc-dropdown
    items="items"
    type="simple"
    on-select="doSomething">
  </sc-dropdown>
```

## API

The following attributes are applicable

- `items` - An `Array`
- `type` - There are 3 types of dropdowns available.
  - `simple`: a simple anchor link
  - `single`: a button with dropdown
  - `split`: a button with split caret as dropdown
- `on-select` - A `Function` that is called when the dropdown is selected. The `item` is passed as an argument
