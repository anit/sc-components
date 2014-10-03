## sc-confirm

Similar to window.confirm but with modal window

## Dependencies

    ui.bootstrap

## API

Takes the following attributes

- `sc-confirm` - A `Function` that is called when the modal dialog is confirmed
- `sc-confirm-message` - A message `String` that is displayed as confirmation. By default "Are you sure?" is displayed.
- `sc-on-cancel` - A `Function` that is called after the modal is cancelled
- `template` - A template `String` that is loaded within the modal body
- `template-url` - path a template that is loaded within the modal body

## Usage

```html
<a href=""
  sc-confirm="remove(item)"
  sc-confirm-message="Are you sure you want to remove this?"
  sc-on-cancel="cancel(item)"
  template-url="/templates/confirm.html">
  Delete this
</a>
```

[jsfiddle]()
