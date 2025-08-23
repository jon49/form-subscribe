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

let $ = x => document.querySelector(x)
let $$ = x => document.querySelectorAll(x)

class XOn {

    /**
     * @param {HTMLElement} el 
     */
    constructor(el) {
        this.el = el
        this.action = el.dataset.action
        /**
         * @type {HTMLFormElement}
         */
        this.form =
            el instanceof HTMLFormElement
                ? el
            // @ts-ignore
            : el.form

        if (this.form) {
            this.submitter =
                el instanceof HTMLFormElement
                    ? null
                : el instanceof HTMLButtonElement
                    ? el
                : el.closest('[type="submit"]')
        }

        this._lastCalled = 0
        this._interval = +(el.dataset.debounce || 0)
        this._match = parseData(el.dataset.match)
        this._notMatch = parseData(el.dataset.matchNot)
        let targetEl = el.dataset.targetEl
        if (targetEl) {
            this.targetEl = document.querySelector(targetEl)
        }

        let events = el.dataset.events?.split(" ")
        if (!events?.length) return
        for (let event of events) {
            if (event === "load") {
                if (this.action != null) {
                    this.runAction()
                } else {
                    // @ts-ignore
                    this.form?.requestSubmit(this.submitter)
                }
            } else {
                (this.targetEl ?? document).addEventListener(event, this)
            }
        }
    }

    /**
    * @param {Event} [e]
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

        if (this.action != null) {
            this.runAction(e)
        } else {
            // @ts-ignore
            this.form?.requestSubmit(this.submitter)
        }
    }

    /**
    * @param {Event} [e]
    * @returns {void}
    * */
    runAction(e) {
        if (!this._action) {
            let action = this.action
            if (!action) return
            this._action = new Function("event", "$", "$$", action).bind(this.el)
        }
        // @ts-ignore
        this._action(e, $, $$)
    }

}

// @ts-ignore
window.defineTrait?.("on", XOn)
