class Module
{
    busHandlers = {};

    constructor()
    {
        this.bus = new EventBus();
    }

    _bindBusHandlers()
    {
        Object.keys(this.busHandlers).forEach(eventName => {
            this.bus.subscribe(eventName, this.busHandlers[eventName].bind(this));
        });
    }
}

window.Module = Module;