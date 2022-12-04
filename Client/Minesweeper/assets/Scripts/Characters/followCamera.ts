
import { _decorator, Component, Node, Vec3, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowCamera')
export class FollowCamera extends Component {

    @property(Node)
    followTarget: Node | null = null!;

    lateUpdate(deltaTime: number) {
        if (this.followTarget) {
            const pos = this.followTarget.worldPosition;
            const pos2 = this.node.worldPosition;
            this.node.worldPosition = new Vec3(pos2.x, pos2.y, pos.z);
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
