# `@html-traits/on`

See an example <https://jon49.github.io/form-subscribe/>.

## Why?

I use this with my `html-form` library. I mainly use it to submit forms or
perform some small UI interactions based off of events that happen elsewhere on
the page.

## Overview

The `on` html trait provides a flexible mechanism for handling events and
reacting to those events, either by doing a requestSubmit command against the
attached form or the form of the submitting form child element. If the
`data-action` attribute is attached it will instead run that action.

It also includes conditional checks on the event data and debouncing.

## Usage

```html
<form
    traits="on"
    data-events="load submit"
    data-match="detail: { value: 'valid' }"
    data-action="app.handleFormSubmit()">
  <!-- Form content goes here -->
</form>
```

- **data-events:** Specifies the events to listen for. In this case it will call
  the action immediately when loaded, then it will wait for the submit action.
- **data-match:** Specifies conditions for the event to match.
- **data-action:** Calls the window attached `app.handleFormSubmit()` function.
  met.

If `data-action` is not present it will call `requestSumbit(submitter)` on the
attached form.

Actions are called with the variables `event` (the event), `$` (same as
`document.querySelector`), `$$` (same as `document.querySelectorAll`), `this`
the element that the trait is attached to.

## Examples

### Example 1: Action

```html
<p 
  traits="on"
  data-events="load itemAdded"
  data-action="this.innerText = `There are ${myList.childElementCount} items.`"
  >
</p>
<input
  id="myInput"
  traits="on"
  data-events="keydown"
  data-target-el="myInput"
  data-debounce="500"
  data-action="
    if (event.key !== 'Enter') return;
    let li = document.createElement('li');
    li.innerText = this.value;
    myList.append(li);
    this.value = '';
    let newItemEvent = new CustomEvent('itemAdded');
    this.dispatchEvent(newItemEvent);
    " >
<ul id="myList">
</ul>
```

This example is pushing the limits of this pattern. But what it does, it has an
input which adds items to `myList` on enter. It has a debounce rate of 500
milliseconds before it will respond. Then the `p` element will say how many
items there are, it first writes teh value on document load, then anytime the
`itemAdded` event is dispatched. It is a bit cumbersome, but for little scripts
this is great. If you find you need complicated scripts like this all over then
it might be time to pick a different library. But if you just have one to three
lines of code then this is a great pattern.

### Example 2: Basic Usage

```html
<form
    id="my-form"
    traits="on"
    data-events="submit"
    data-match-not="target: { id: 'my-form' }"
    >
  <!-- Form content goes here -->
</form>
```

In this example, the form will request a submit on the "submit" event. Except
when itself is submitted.

### Example 3: Conditional Execution

```html
<form
    traits="on"
    data-events="input"
    data-match="target: { value: { length: 10} }"
    data-action="handleInputChange(event)">
  <!-- Form content goes here -->
</form>
```

This example triggers the `handleInputChange` function only when the length of the
input value is 10.

### Example 4: Debouncing

```html
<form
    on="form-subscribe"
    data-events="input"
    data-debounce="500"
    data-action="handleInputDebounced(this, event)">
  <!-- Form content goes here -->
</form>
```

The `handleInputDebounced` function will be called with a debounce of 500
milliseconds, preventing rapid consecutive calls.

