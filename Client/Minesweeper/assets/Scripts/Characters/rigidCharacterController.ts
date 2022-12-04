
import { _decorator, Component, Node, Vec2, Vec3, Quat, clamp, systemEvent, SystemEventType, Touch, ColliderComponent, PhysicsSystem } from 'cc';
import { RigidCharacter } from './rigidCharacter';
const { ccclass, property } = _decorator;
const v3_0 = new Vec3();

@ccclass('RigidCharacterController')
export class RigidCharactorController extends Component {
    @property(RigidCharacter)
    character: RigidCharacter = null!;

    @property({ type: Vec3 })
    speed: Vec3 = new Vec3(1, 0, 1);

    protected _stateX: number = 0;  // 1 positive, 0 static, -1 negative
    protected _stateZ: number = 0;
    protected _speed = 0;

    update (dtS: number) {
        const dt = PhysicsSystem.instance.fixedTimeStep;
        this.updateCharacter(dt);
    }

    onEnable () {
        systemEvent.on(SystemEventType.TOUCH_START, this.touchStart, this);
        systemEvent.on(SystemEventType.TOUCH_MOVE, this.touchMove, this);
        systemEvent.on(SystemEventType.TOUCH_END, this.touchEnd, this);
        systemEvent.on(SystemEventType.TOUCH_CANCEL, this.touchCancel, this);

    } 

    onDisable () {
        systemEvent.off(SystemEventType.TOUCH_START, this.touchStart, this);
        systemEvent.off(SystemEventType.TOUCH_MOVE, this.touchMove, this);
        systemEvent.off(SystemEventType.TOUCH_END, this.touchEnd, this);
        systemEvent.off(SystemEventType.TOUCH_CANCEL, this.touchCancel, this);

    }

    touchStart (touch: Touch) {
        this._stateX = 0;
    }

    touchMove (touch: Touch) {
        let x = touch.getUIDelta().x;
        if (x > 0) {
            this._stateX = this.speed.x;  
        } else {
            this._stateX = -this.speed.x;
        }
    }

    touchEnd (touch: Touch) {
        this._stateX = 0;
    }

    touchCancel (touch: Touch) {
        this._stateX = 0;
    }

    updateCharacter (dt: number) {
        this.character.updateFunction(dt);
        
        // move
        this._stateZ = this.speed.z;
        if (!this.character.onGround) return;
        if (this._stateX || this._stateZ) {
            v3_0.set(this._stateX, 0, this._stateZ);
            v3_0.normalize();
            this.character.move(v3_0, 0.1);
        }
    }

}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
