// @ts-check

/**
* @param {string | undefined} data
* @returns {any}
* */
function parseData(data) {
    if (!data) return null
    return new Function(`return {${data}}`)()
}

/**
* @param {any} other
* @param {any} base
* @returns {boolean}
* */
function compare(base, other) {
    for (let key in base) {
        if (base.hasOwnProperty(key)) {
            if (typeof base[key] === 'object' && base[key] !== null && other[key]) {
                if (!compare(base[key], other[key])) {
                    return false
                }
            } else if (base[key] !== other[key]) {
                return false
            }
        }
    }
    return true
}

/**
* @param {string | undefined} functionName
* @param {any[]} args
* @param {any} self
* @returns {Function | undefined}
* */
function callFunction(functionName, self, ...args) {
    if (!functionName) return
    let scope = window
    let scopeSplit = functionName.split('.')
    for (let f of scopeSplit) {
        // @ts-ignore
        scope = scope && scope[f]
        if (scope instanceof Function) return scope.bind(self)(...args)
    }
    return
}

class FormSubscribe {

    /**
     * @param {HTMLElement} el 
     */
    constructor(el) {
        this.el = el
        /**
         * @type {HTMLFormElement}
         */
        this.form =
            el instanceof HTMLFormElement
                ? el
            // @ts-ignore
            : el.form
        if (!this.form) {
            throw new Error("Element is not a form or does not have a form ancestor.")
        }
        this._lastCalled = 0
        this._interval = +(el.dataset.debounce || 0)
        this._match = parseData(el.dataset.match)
        this._notMatch = parseData(el.dataset.matchNot)
        let targetEl = el.dataset.targetEl
        if (targetEl) {
            this.targetEl = document.querySelector(targetEl)
        }

        if (el.hasAttribute('data-onload')) {
            this.form.requestSubmit()
        }
        let event = el.dataset.event
        if (!event) return
        // @ts-ignore
        ;(this.el ?? document).addEventListener(event, this)
    }

    /**
    * @param {CustomEvent} [e]
    * @returns {void}
    * */
    handleEvent(e) {
        if (e
            && (this._match && !compare(this._match, e)
               || this._notMatch && compare(this._notMatch, e))) {
            return
        }

        let debounceInterval = this._interval
        if (debounceInterval
            && this._lastCalled + debounceInterval > Date.now()) {
            this._lastCalled = Date.now()
            if (this._id) clearTimeout(this._id)
            this._id = setTimeout(() => this.handleEvent(e), debounceInterval)
            return
        }

        this._lastCalled = Date.now()

        let call = this.el.dataset.call
        let action = this.el.dataset.action
        if (call) {
            callFunction(call, this, e)
        } else if (action) {
            if (!this._action) {
                this._action = new Function("event", action).bind(this)
            }
            // @ts-ignore
            this._action(e)
        } else {
            this.form.requestSubmit()
        }
    }

}

// @ts-ignore
window.defineTrait?.("x-subscribe", FormSubscribe)
