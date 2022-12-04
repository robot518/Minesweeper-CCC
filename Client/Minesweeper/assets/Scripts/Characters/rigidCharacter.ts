
import { _decorator, Component, Node, Vec3, RigidBodyComponent, EPSILON, ColliderComponent, ICollisionEvent, CameraComponent, IContactEquation, Collider, director, RigidBody, PhysicsSystem } from 'cc';
const { ccclass, property } = _decorator;
const _v3_0 = new Vec3();
class ContactPoint {
    point = new Vec3();
    normal = new Vec3();
    collider!: Collider;
    assign(ce: IContactEquation, c: Collider) {
        if (ce.isBodyA) {
            ce.getWorldNormalOnB(this.normal);
            ce.getWorldPointOnA(this.point);
        } else {
            (ce as any).getWorldNormalOnA(this.normal);
            ce.getWorldPointOnB(this.point);
        }
        this.collider = c;
        return this;
    }
}

const _ctPool: ContactPoint[] = [];
class ContactPool {
    static getContacts(ces: IContactEquation[], c: Collider, cps: ContactPoint[]) {
        for (let i = 0; i < ces.length; i++) {
            cps.push(this.getContact(ces[i], c));
        }
    }
    static getContact(ce: IContactEquation, c: Collider): ContactPoint {
        const cp = _ctPool.length > 0 ? _ctPool.pop()! : new ContactPoint();
        return cp.assign(ce, c);
    }
    static recyContacts(cps: ContactPoint[]) {
        Array.prototype.push.call(_ctPool, ...cps);
        cps.length = 0;
    }
}
@ccclass('RigidCharacter')
export class RigidCharacter extends Component {
    @property
    maxSpeed = 5;

    @property
    damping = 0.5;

    @property
    slopeLimit = 30;

    @property
    gravity = -20;

    _rigidBody: RigidBodyComponent = null!;
    _collider: ColliderComponent = null!;
    _grounded = true;
    _toSteep = false;
    _contacts: ContactPoint[] = [];
    _groundContact: ContactPoint = null!;
    _groundNormal = Vec3.UP.clone();

    _velocity = new Vec3();
    get velocity() { return this._velocity; }
    get onGround() { return this._grounded; }


    start() {
        this._rigidBody = this.getComponent(RigidBodyComponent)!;
        // useCCD(this._rigidBody);
        this._collider = this.getComponent(ColliderComponent)!;
        this._collider.on('onCollisionEnter', this.onCollision, this);
        this._collider.on('onCollisionStay', this.onCollision, this);
        this._collider.on('onCollisionExit', this.onCollision, this);
    }

    move(dir: Vec3, speed: number) {
        this._rigidBody.getLinearVelocity(_v3_0);
        Vec3.scaleAndAdd(_v3_0, _v3_0, dir, speed);

        const ms = this.maxSpeed;
        const len = _v3_0.lengthSqr();
        if (len > ms) {
            _v3_0.normalize();
            _v3_0.multiplyScalar(ms);
        }
        this._rigidBody.setLinearVelocity(_v3_0);
    }

    updateFunction(dt: number) {
        this.updateContactInfo();
        this.applyGravity();
        this.applyDamping();
        this.saveState();
    }

    applyDamping(dt = 1 / 60) {
        this._rigidBody.getLinearVelocity(_v3_0);
        if (_v3_0.lengthSqr() > EPSILON) {
            _v3_0.multiplyScalar(Math.pow(1.0 - this.damping, dt));
            this._rigidBody.setLinearVelocity(_v3_0);
        }
    }

    applyGravity() {
        const g = this.gravity;
        const m = this._rigidBody.mass;
        _v3_0.set(0, m * g, 0);
        this._rigidBody.applyForce(_v3_0)

    }

    saveState() {
        this._rigidBody.getLinearVelocity(this._velocity);
    }

    updateContactInfo() {
        this._grounded = false;
        this._groundContact = null!;
        const wp = this.node.worldPosition;
        let maxY = -0.001;
        
        for (let i = 0; i < this._contacts.length; i++) {
            const c = this._contacts[i];
            const n = c.normal, p = c.point;
            if (n.y <= 0.0001) continue;
            else {
                if (n.y > maxY && p.y > wp.y - 0.1) {
                    this._grounded = true;
                    maxY = n.y;
                    this._groundContact = c;
                }
            }
        }
        if (this._grounded) {
            Vec3.copy(this._groundNormal, this._groundContact.normal);
            this._toSteep = this._groundContact.normal.y <= Math.cos(this.slopeLimit * Math.PI / 180);
        } else {
            Vec3.copy(this._groundNormal, Vec3.UP);
            this._toSteep = false;
        }
        ContactPool.recyContacts(this._contacts);
    }

    onCollision(event: ICollisionEvent) {
        ContactPool.getContacts(event.contacts, event.selfCollider, this._contacts);
    }
}

function useCCD(rb: RigidBody, ms = 0.0001, sr = 0.005) {
    if (rb) {
        if (PhysicsSystem.PHYSICS_AMMO) {
            const Ammo = (globalThis as any)['Ammo'];
            const impl = rb.body!.impl;
            impl['useCCD'] = true;
            const co = Ammo.castObject(impl, Ammo.btCollisionObject) as any;
            co['wrapped'] = rb.body;
            co['useCCD'] = true;
            impl.setCcdMotionThreshold(ms);
            impl.setCcdSweptSphereRadius(sr);
        } else if (PhysicsSystem.PHYSICS_PHYSX) {
            (rb.body as any).useCCD(sr > 0);
        }
    }
}
