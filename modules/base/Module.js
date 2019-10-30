class Module
{
    constructor()
    {
        this.bus = new EventBus();
    }
}

window.Module = Module;