class DOMHelpers
{
    nodes;
    query;

    constructor(x) {
        if(typeof x === 'string') {
            this.nodes = document.querySelectorAll(x);
            this.query = x;
        }
        if(typeof x === 'object' && x.nodeName) {
            this.nodes = [x];
        }
    }

    /**
     * Assign given handler to named event for each node.
     */
    on = (eventName, ...args) => {

        let handler = args[0], context = args[1], delegateSelector;

        if(typeof args[0] === 'string' && typeof args[1] === 'function') {
            delegateSelector = args[0];
            handler = args[1];
            context = args[2];
        }

        this._eachNode(node => {
            let cb = e => {
                if(! e.target.matches(delegateSelector)) {
                    return;
                }

                handler.bind(context || this)(e, node);
            }
            node.addEventListener(eventName, cb);
        });

        return this;
    }

    first = () => {
        return this.nodes[0];
    }

    /**
     * Iterate over all nodes in collection.
     */
    _eachNode = cb => {
        for(let i = 0; i < this.nodes.length; i++) {
            cb(this.nodes[i]);
        }
    }
}

window._ = selector => {
    return new DOMHelpers(selector);
}