class EventBus
{
    events = {};

    /**
     * Publish a given event.
     * 
     * @param {string} eventName 
     * @param {array} args
     */
    publish(eventName, ...args)
    {
        this.events[eventName] && this.events[eventName].forEach(cb => {
            cb && cb(...args);
        });
    }

    /**
     * Subscribe a given callback to an event.
     * 
     * @param {string} eventName 
     * @param {function} callback 
     */
    subscribe(eventName, callback)
    {
        eventName.split(' ').forEach(e => {
            if(!this.events[e]) {
                this.events[e] = [];
            }

            this.events[e].push(callback);
        });
    }
}