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
     * Create a DOM element from a string of HTML
     * 
     * @param {string} htmlString 
     */
    createElement(htmlString) {
        let div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild; 
    }

    /**
     * Bind each handler element in the handlers hash to a given callback, scoped to current element.
     */
    _bindHandlers() {
        Object.keys(this.handlers).forEach(key => {
            let [eventName, selector] = key.split(':');
            this._bindHandler(selector, eventName, this.handlers[key])
        });
    }

    /**
     * Bind a given eventname to a handler method.
     * 
     * @param {string} selector
     * @param {string} eventName 
     * @param {function} handler 
     */
    _bindHandler(selector, eventName, handler) {
        _(this.el).on(eventName, selector, handler, this);
    }
}

window.View = View;