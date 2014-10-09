## sc-confirm

Similar to window.confirm but with modal window

## Dependencies

    ui.bootstrap

## Usage

```html
<a href=""
  sc-confirm="remove(item)"
  sc-confirm-message="Are you sure you want to remove this?"
  sc-on-cancel="cancel(item)"
  template-url="'/templates/confirm.html'">
  Delete this
</a>
```

## API

Takes the following attributes

- `sc-confirm`: (required) A `Function` that is called when the modal dialog is confirmed
- `sc-confirm-message`: (optional) A message `String` that is displayed as confirmation. By default "Are you sure?" is displayed.
- `sc-on-cancel`: (optional) A `Function` that is called after the modal is cancelled
- `template`: (optional) A template `String` that is loaded within the modal body
- `template-url`: (optional) Path of a template that is loaded within the modal body
- `btn-placement`: (optional) A `String` that adds a class to the modal footer.
 Valid options are `left`, `right` and `center`. Default value is `right`. The class added to modal footer is prefixed with `sc-`. So class would be `sc-left`. In your css, you can use align this by using

  ```css
  .modal-footer.sc-left {
    text-align: left;
  }
  ```
