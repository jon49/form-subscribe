(() => {
  function parseData(data) {
    if (!data) return null;
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
    if (!functionName) return;
    let scope = window;
    let scopeSplit = functionName.split(".");
    for (let f of scopeSplit) {
      scope = scope && scope[f];
      if (scope instanceof Function) return scope.bind(self)(...args);
    }
    return;
  }
  class FormSubscribe {
    /**
     * @param {HTMLElement} el 
     */
    constructor(el) {
      this.el = el;
      this.form = el instanceof HTMLFormElement ? el : el.form;
      if (this.form) {
        this.submitter = el instanceof HTMLFormElement ? null : el instanceof HTMLButtonElement ? el : el.closest('[type="submit"]');
      }
      this._lastCalled = 0;
      this._interval = +(el.dataset.debounce || 0);
      this._match = parseData(el.dataset.match);
      this._notMatch = parseData(el.dataset.matchNot);
      let targetEl = el.dataset.targetEl;
      if (targetEl) {
        this.targetEl = document.querySelector(targetEl);
      }
      if (el.hasAttribute("data-onload")) {
        this.form?.requestSubmit(this.submitter);
        this.runAction();
      }
      let event = el.dataset.event;
      if (!event) return;
      (this.targetEl ?? document).addEventListener(event, this);
    }
    /**
    * @param {Event} [e]
    * @returns {void}
    * */
    handleEvent(e) {
      if (e && (this._match && !compare(this._match, e) || this._notMatch && compare(this._notMatch, e))) {
        return;
      }
      let debounceInterval = this._interval;
      if (debounceInterval && this._lastCalled + debounceInterval > Date.now()) {
        this._lastCalled = Date.now();
        if (this._id) clearTimeout(this._id);
        this._id = setTimeout(() => this.handleEvent(e), debounceInterval);
        return;
      }
      this._lastCalled = Date.now();
      let call = this.el.dataset.call;
      let action = this.el.dataset.action;
      if (call) {
        callFunction(call, this, e);
      } else if (action) {
        this.runAction(e);
      } else {
        this.form?.requestSubmit(this.submitter);
      }
    }
    /**
    * @param {Event} [e]
    * @returns {void}
    * */
    runAction(e) {
      if (!this._action) {
        let action = this.el.dataset.action;
        if (!action) return;
        this._action = new Function("event", "$", "$$", action).bind(this.el);
      }
      this._action(e, (x) => document.querySelector(x), (x) => document.querySelectorAll(x));
    }
  }
  window.defineTrait?.("x-on", FormSubscribe);
})();
