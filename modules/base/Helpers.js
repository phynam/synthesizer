class Helpers {

    onDrag(handler, mouseup, clickEvent) {

        let dragged = false;

        let handle = e => {

            let x, y;

            if(clickEvent) {
                x = helpers.dragDistanceX(e, clickEvent), y = helpers.dragDistanceY(e, clickEvent);
            }

            if(!dragged && Math.abs(x + y) > 2) {
                dragged = true;
            }

            handler(e, x, y);
        };

        let mhandle = e => {

            if(mouseup) {
                mouseup(e, dragged);
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