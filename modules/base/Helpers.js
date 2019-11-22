class Helpers {

    onDrag(handler, mouseup, clickEvent) {

        let handle = e => {

            let x, y;

            if(clickEvent) {
                x = helpers.dragDistanceX(e, clickEvent), y = helpers.dragDistanceY(e, clickEvent);
            }

            handler(e, x, y);
        };

        let mhandle = e => {

            if(mouseup) {
                mouseup(e);
                document.removeEventListener('mouseup', mhandle, false);
            }

            document.removeEventListener('mousemove', handle, false);
        }

        document.addEventListener('mousemove', handle, false);
        document.addEventListener('mouseup', mhandle, false);
    }

    dragDistanceY(e, from) {
        return e.pageY - from.pageY;
    }

    dragDistanceX(e, from) {
        return e.pageX - from.pageX;
    }
}

window.helpers = new Helpers();