class EventBus
{
    events = {};

    /**
     * Publish a given event.
     * 
     * @param {string} eventName 
     * @param {object} payload 
     */
    publish(eventName, payload)
    {
        this.events[eventName].forEach(cb => {
            cb && cb(payload);
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
        if(! this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(callback);
    }
}