class CurrentSelectionCollection extends Collection
{
    constructor()
    {
        super();
    }

    push = (item, el) => {
        let x = item.toArray(true);
        x.original = item.toArray();
        x.el = el;
        this.items.push(x);
        return this;
    }
}