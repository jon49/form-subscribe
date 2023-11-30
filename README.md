# `form-subscribe` Custom Form Element

See an example <https://jon49.github.io/form-subscribe/>.

## Why?

I use this with my `html-form` library. I mainly use it to submit forms based
off of events that happen elsewhere on the page. Sometimes it is nice having the
other functionality too.

## Overview

The form-subscribe custom form element extends the `HTMLFormElement` class and
provides a flexible mechanism for handling form events and executing actions
based on specified configurations. It allows for dynamic event binding,
conditional checks, and debouncing.

## Usage

```html
<form
    is="form-subscribe"
    data-event="submit"
    data-match="detail: { value: 'valid' }"
    data-call="handleFormSubmit">
  <!-- Form content goes here -->
</form>
```

- **data-event:** Specifies the event to listen for.
- **data-match:** Specifies conditions for the event to match.
- **data-call:** Specifies the function to call when the event conditions are
  met.

## Examples

### Example 1: Basic Usage

```html
<form
    id="my-form"
    is="form-subscribe"
    data-event="submit"
    data-match-not="target: { id: 'my-form' }"
    >
  <!-- Form content goes here -->
</form>
```

In this example, the form will request a submit on the "submit" event. Except
when itself is submitted.

### Example 2: Conditional Execution

```html
<form
    is="form-subscribe"
    data-event="input"
    data-match="target: { value: { length: 10} }"
    data-call="handleInputChange">
  <!-- Form content goes here -->
</form>
```

This example triggers the `handleInputChange` function only when the length of the
input value is 10.

### Example 3: Debouncing

```html
<form
    is="form-subscribe"
    data-event="input"
    data-debounce="500"
    data-call="handleInputDebounced">
  <!-- Form content goes here -->
</form>
```

The `handleInputDebounced` function will be called with a debounce of 500
milliseconds, preventing rapid consecutive calls.

