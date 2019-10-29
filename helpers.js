/**
 * Helpers
 */
class DOMHelpers
{
    nodes;

    constructor(x) {
        if(typeof x === 'string') {
            this.nodes = document.querySelectorAll(x);
        }
        if(typeof x === 'object' && x.nodeName) {
            this.nodes = [x];
        }
    }

    /**
     * Assign given handler to named event for each node.
     */
    on = (eventName, handler) => {
        this._eachNode(node => {
            let cb = e => {
                handler(new DOMHelpers(node), e);
            }
            node.addEventListener(eventName, cb);
        });

        return this;
    }

    _eachNode = cb => {
        for(let i = 0; i < this.nodes.length; i++) {
            cb(this.nodes[i]);
        }
    }
}

window._ = selector => {
    return new DOMHelpers(selector);
}