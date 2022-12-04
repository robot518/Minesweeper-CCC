import { _decorator, Component, Node, Vec2, Vec3, UITransform, clamp, Touch, ColliderComponent, PhysicsSystem } from 'cc';

const {ccclass, property} = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {

    @property(Node)
    player: Node = null;

    joyStickBtn: Node;
    dir: any;

    maxSpeed: number = 5;
    canMove: boolean = true;

    // LIFE-CYCLE CALLBACKS:

    
    onLoad () {
        // get joyStickBtn
        this.joyStickBtn = this.node.children[0]; 
        this.dir = cc.v2(0, 0);
    
        // touch event
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }
    
    onDestroy() {
        // touch event
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }
    

    start () {

    }

    update (dt) {
        // get ratio
        let len = this.joyStickBtn.position.length();
        let maxLen = this.node.getComponent(UITransform).width / 2;
        let ratio = len / maxLen;
     
        // restrict joyStickBtn inside the joyStickPanel
        if (ratio > 1) {
            this.joyStickBtn.setPosition(this.joyStickBtn.position.div(ratio));
            ratio = 1;
        }

        // let dis = this.dir.mul(this.maxSpeed * ratio);
        // this.player.setPosition(this.player.position.add(dis));
    }

    onTouchStart(event) {
        if (!this.canMove) return;
        // when touch starts, set joyStickBtn's position 
        let touchPos = event.touch.getUILocation();
        let pos = this.node.getComponent(UITransform).convertToNodeSpaceAR(cc.v3(touchPos.x,touchPos.y,0));
        console.log("onTouchStart",event.touch.getUILocation(),pos);
        this.joyStickBtn.setPosition(pos);
    }
     
    onTouchMove(event) {
        if (!this.canMove) return;
        // constantly change joyStickBtn's position
        let posDelta = event.getDelta();
        console.log(posDelta);
        let prePos = this.joyStickBtn.position;
        this.joyStickBtn.setPosition(cc.v3(prePos.x+posDelta.x,prePos.y+posDelta.y,0));
        this.dir = this.joyStickBtn.position.normalize();
        //this.player.getComponent('RigidCharactorController').speed = this.dir;
    }
     
    onTouchEnd(event) {
        // reset
        //this.joyStickBtn.setPosition(cc.v3(0, 0,0));
    }
     
    onTouchCancel(event) {
        // reset
        //this.joyStickBtn.setPosition(cc.v3(0, 0,0));
    }
}
