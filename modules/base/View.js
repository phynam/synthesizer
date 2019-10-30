/**
 * Responsible only for handling dom events, sanitizing DOM data and user input,
 * and bubbling up as events to be caught elsewhere.
 */
class View extends Module
{
    selector;
    _el;
    el;
    handlers = {};

    constructor(selector) {

        super();

        if(!selector) {
            console.error('[View] No selector passed to view instance.');
        }

        /** 
         * Create DOM helper element, and DOM node references
         */
        this.selector = selector;
        this._el = _(this.selector);
        this.el = this._el.first();
    }

    /**
     * Bind each handler element in the handlers hash to a given callback, scoped to current element.
     */
    _bindHandlers() {
        Object.keys(this.handlers).forEach(key => {
            let [selector, eventName] = key.split(':');
            this._bindHandler(selector, eventName, this.handlers[key])
        });
    }

    /**
     * Bind a given eventname to a handler method.
     * 
     * @param {string} el
     * @param {string} eventName 
     * @param {function} handler 
     */
    _bindHandler(el, eventName, handler) {
        _(this.el).on(eventName, el, handler, this);
    }
}

window.View = View;