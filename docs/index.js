(() => {
  function parseData(data) {
    if (!data)
      return null;
    return new Function(`return {${data}}`)();
  }
  function compare(base, other) {
    for (let key in base) {
      if (base.hasOwnProperty(key)) {
        if (typeof base[key] === "object" && base[key] !== null && other[key]) {
          if (!compare(base[key], other[key])) {
            return false;
          }
        } else if (base[key] !== other[key]) {
          return false;
        }
      }
    }
    return true;
  }
  function callFunction(functionName, self, ...args) {
    if (!functionName)
      return;
    let scope = window;
    let scopeSplit = functionName.split(".");
    for (let f of scopeSplit) {
      scope = scope && scope[f];
      if (scope instanceof Function)
        return scope.bind(self)(...args);
    }
    return;
  }
  class FormSubscribe extends HTMLFormElement {
    constructor() {
      super();
      this._lastCalled = 0;
      this._interval = +(this.dataset.debounce || 0);
      this._match = parseData(this.dataset.match);
      this._notMatch = parseData(this.dataset.matchNot);
      let el = this.dataset.targetEl;
      if (el) {
        this.el = document.querySelector(el);
      }
    }
    connectedCallback() {
      let event = this.dataset.event;
      if (!event)
        return;
      (this.el ?? document).addEventListener(event, this);
    }
    disconnectedCallback() {
      let event = this.dataset.event;
      if (!event)
        return;
      (this.el ?? document).removeEventListener(event, this);
    }
    /**
    * @param {CustomEvent} [e]
    * @returns {void}
    * */
    handleEvent(e) {
      if (e && (this._match && !compare(this._match, e) || this._notMatch && compare(this._notMatch, e))) {
        return;
      }
      let debounceInterval = this._interval;
      if (debounceInterval && this._lastCalled + debounceInterval > Date.now()) {
        this._lastCalled = Date.now();
        if (this._id)
          clearTimeout(this._id);
        this._id = setTimeout(() => this.handleEvent(e), debounceInterval);
        return;
      }
      this._lastCalled = Date.now();
      let call = this.dataset.call;
      let action = this.dataset.action;
      if (call) {
        callFunction(call, this, e);
      } else if (action) {
        if (!this._action) {
          this._action = new Function("event", action).bind(this);
        }
        this._action(e);
      } else {
        this.requestSubmit();
      }
    }
  }
  customElements.define("form-subscribe", FormSubscribe, { extends: "form" });
})();
