
import { _decorator, Component, Node, Vec2, Vec3, Quat, clamp, Touch, ColliderComponent, PhysicsSystem, v3 } from 'cc';
import { RigidCharacter } from './rigidCharacter';
const { ccclass, property } = _decorator;
const v3_0 = new Vec3();

@ccclass('RigidCharacterController')
export class RigidCharactorController extends Component {
    @property(RigidCharacter)
    character: RigidCharacter = null!;

    @property({ type: Vec3 })
    speed: Vec3 = new Vec3(0, 0, 0);

    protected _stateX: number = 0;  // 1 positive, 0 static, -1 negative
    protected _stateZ: number = 0;

    rotation = new Quat();
    rotationSpeed = 180;

    update (dtS: number) {
        const dt = PhysicsSystem.instance.fixedTimeStep;
        this.updateCharacter(dt);
    }

    updateCharacter (dt: number) {
        this.character.updateFunction(dt);

        //dir
        Quat.fromViewUp(this.rotation, v3(this.speed.z, 0, this.speed.x));
        this.node.rotation = this.node.rotation.lerp(this.rotation, dt*this.rotationSpeed);
        // float turnSpeed = Mathf.Lerp(m_StationaryTurnSpeed, m_MovingTurnSpeed, m_ForwardAmount);
		// this.node.rotate(0, m_TurnAmount * turnSpeed * Time.deltaTime, 0);
        
        // move
        // this._stateZ = this.speed.z;
        // this._stateX = this.speed.x;
        // if (!this.character.onGround) return;
        // if (this._stateX || this._stateZ) {
        //     v3_0.set(this._stateX, 0, this._stateZ);
        //     v3_0.normalize();
        //     this.character.move(v3_0, 0.1);
        // }
    }

    changeSpeed(dir: Vec3){
        this.speed = dir;
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
