import { _decorator, Component, Node, Vec2, Vec3, UITransform, clamp, Touch, ColliderComponent, PhysicsSystem } from 'cc';
import { RigidCharactorController } from '../Characters/rigidCharacterController';

const {ccclass, property} = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {

    @property(RigidCharactorController)
    player: RigidCharactorController = null;

    joyStickBtn: Node;

    maxSpeed: number = 5;
    canMove: boolean = true;

    // LIFE-CYCLE CALLBACKS:

    
    onLoad () {
        // get joyStickBtn
        this.joyStickBtn = this.node.children[0]; 
    
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
            let curPos = cc.v3(this.joyStickBtn.position.x/ratio,this.joyStickBtn.position.y/ratio,this.joyStickBtn.position.z);
            this.joyStickBtn.setPosition(curPos);
        }
    }

    onTouchStart(event) {
        if (!this.canMove) return;
        // when touch starts, set joyStickBtn's position 
        let touchPos = event.touch.getUILocation();
        let pos = this.node.getComponent(UITransform).convertToNodeSpaceAR(cc.v3(touchPos.x,touchPos.y,0));
        this.joyStickBtn.setPosition(pos);
    }
     
    onTouchMove(event) {
        if (!this.canMove) return;
        // constantly change joyStickBtn's position
        let posDelta = event.getUIDelta();
        posDelta = cc.v3(posDelta.x,posDelta.y,0);
        let curPos = this.joyStickBtn.position.add(posDelta);
        this.joyStickBtn.setPosition(curPos);
        let tempPos = cc.v3(curPos.x,curPos.y,curPos.z);
        let dir = tempPos.normalize();
        // this.player.changeSpeed(cc.v3(dir.x,0,dir.y));
    }
     
    onTouchEnd(event) {
        // reset
        this.joyStickBtn.setPosition(cc.v3(0, 0,0));
    }
     
    onTouchCancel(event) {
        // reset
        this.joyStickBtn.setPosition(cc.v3(0, 0,0));
    }
}
