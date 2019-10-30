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
    on = (eventName, handler, context) => {

        this._eachNode(node => {
            let cb = e => {
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