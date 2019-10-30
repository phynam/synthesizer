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
        this.events[eventName] && this.events[eventName](payload);
    }

    /**
     * Subscribe a given callback to an event.
     * 
     * @param {string} eventName 
     * @param {function} callback 
     */
    subscribe(eventName, callback)
    {
        this.events[eventName] = callback;
    }
}

window.EventBus = EventBus;