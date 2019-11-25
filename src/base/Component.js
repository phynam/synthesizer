import { EventBus } from 'base/EventBus'

class Component extends EventBus
{
    busHandlers = {};

    constructor()
    {
        super();
    }

    /**
     * Bind event bus handlers.
     */
    _bindBusHandlers()
    {
        Object.keys(this.busHandlers).forEach(eventName => {
            this.subscribe(eventName, this.busHandlers[eventName].bind(this));
        });
    }
}

export {Component};