import { macro, EventKeyboard, Game, game, KeyCode, input, Input } from 'cc';

class InputClass {
    key = {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false,
        shift: false
    }

    moveDir = 0;
    moveForward = 0;
    moveBack = 0;
    moveBrake = 0;

    registerEvents () {
        // Your initialization goes here.
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown (event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                this.key.left = true;
                // this.moveDir = -1;
                break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this.key.right = true;
                // this.moveDir = 1;
                break;
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W:
                this.key.up = true;
                this.moveForward = 1;
                break;
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S:
                this.key.down = true;
                this.moveBack = 1;
                break;
            case KeyCode.SPACE:
                this.key.space = true;
                this.moveBrake = 1;
                break;
            case KeyCode.SHIFT_LEFT:
                this.key.shift = true;
                break;
        }
    }

    onKeyUp (event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                this.key.left = false;
                // this.moveDir = 0;
                break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this.key.right = false;
                // this.moveDir = 0;
                break;
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W:
                this.key.up = false;
                this.moveForward = 0;
                break;
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S:
                this.key.down = false;
                this.moveBack = 0;
                break;
            case KeyCode.SPACE:
                this.key.space = false;
                this.moveBrake = 0;
                break;
            case KeyCode.SHIFT_LEFT:
                this.key.shift = false;
                break;
        }
    }
}

let InputDistance = new InputClass;

game.on(Game.EVENT_GAME_INITED, () => {
    InputDistance.registerEvents();
})

export default InputDistance;
