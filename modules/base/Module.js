class Module extends EventBus
{
    busHandlers = {};

    constructor()
    {
        super();
    }

    _bindBusHandlers()
    {
        Object.keys(this.busHandlers).forEach(eventName => {
            this.subscribe(eventName, this.busHandlers[eventName].bind(this));
        });
    }
}