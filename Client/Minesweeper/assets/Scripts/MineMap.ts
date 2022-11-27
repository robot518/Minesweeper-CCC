import { _decorator, Component, Node,UITransform} from 'cc';

import {GLB} from "./GLBConfig";

var _dx = 70;
var _iM = 20;

const {ccclass, property} = _decorator;

@ccclass("MineMap")
export class MineMap extends Component {
    
    @property({
        visible: true
    })

    _iDiff: number = 0;

    _iTime: number;
    _bTouch: boolean;
    _iRow: number;
    _iLine: number;
    _iTotal: number;
    _mouse: Node;
    _delt: any;
    idx: number;
    _preIdx: number;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initParas();
        // this.initShow();
        this.initEvent();
    }

    start () {
        
    }

    update (dt) {
        if (this._iTime != -1){
            this._iTime+=dt;
            if (this._iTime > 0.2){
                this._delt.onFlagEvent(this.idx);
                if (window.tt && GLB.iType != 2){
                    let iR = this.idx % this._iRow;
                    let iL = Math.floor (this.idx / this._iRow);
                    this.setMousePos(iR, iL);
                }
                this._bTouch = false;
                this._iTime = -1;
            }
        }
    }

    initParas(){
        this._bTouch = false;
        this._iTime = -1;
        if (this._iDiff == 0) {
            this._iRow = this._iLine = 9;
        } else if (this._iDiff == 1){
            this._iRow = this._iLine = 16;
        } else if (this._iDiff == 2){
            this._iRow = 16;
            this._iLine = 30;
        }

        this._mouse = this.node.getChildByName('mouse');
        this._mouse.active = false;
    }

    //tilemap中左下为(0, 0), tile坐标左上为0,0
    //正常坐标转换成tilemap坐标
    initEvent(){
        this.node.on(Node.EventType.TOUCH_START, function (event) {
            if (this._bTouch == true || GLB.iType == 2)  return;
            this._bTouch = true;
            let touchPos = event.touch.getUILocation();
            let nPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(cc.v3(touchPos.x,touchPos.y,0));
            this._prePos = touchPos;
            let iR = Math.floor (nPos.x / _dx);
            let iL = this._iLine - 1 - Math.floor (nPos.y / _dx);
            this.idx = iR + iL * this._iRow;
            console.log("touchPos=",touchPos.x,touchPos.y);
            console.log("nPos = ",nPos.x,nPos.y);
            console.log(iR,iL,this.idx);
            this._preIdx = this.idx;
            if (this._delt.getBGameOver() == false && this._delt._tBtns[this.idx] == 1){
                this._iTime = 0;
                //if (this._delt._tFlag[this.idx] == 0) this._delt.showPressedColor(this.idx);
            }
        }, this)
        this.node.on(Node.EventType.TOUCH_MOVE, function (event) {
            let touchPos = event.touch.getUILocation();
            let nPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(cc.v3(touchPos.x,touchPos.y,0));
            let iR = Math.floor (nPos.x / _dx);
            let iL = this._iLine - 1 - Math.floor (nPos.y / _dx);
            //if (this._delt._tBtns[this._preIdx] == 1) this._delt.showNormalColor(this._preIdx);
            this._preIdx = iR + iL * this._iRow;
            //if (this._delt._tBtns[this._preIdx] == 1) this._delt.showHighlightedColor(this._preIdx);
            if (this._bTouch == false || GLB.iType == 2)  return;
            if (Math.abs(touchPos.x - this._prePos.x) > _iM || Math.abs(touchPos.y - this._prePos.y) > _iM)
                this._iTime = -1;
        }, this)
        this.node.on(Node.EventType.TOUCH_END, function (event) {
            //if (this._delt._tBtns[this._preIdx] == 1) this._delt.showNormalColor(this._preIdx);
            if (this._bTouch == false || GLB.iType == 2)  return;
            let touchPos = event.touch.getUILocation();
            if (Math.abs(touchPos.x - this._prePos.x) > _iM || Math.abs(touchPos.y - this._prePos.y) > _iM){
                this._prePos = null;
            } else{
                this._delt.onClick(this.idx);
            }
            this._bTouch = false;
            this._iTime = -1;
        }, this)
        this.node.on(Node.EventType.TOUCH_CANCEL, function (event) {
            //this._delt.showNormalColor(this.idx);
        }, this)
    }

    setMousePos(iR, iL){
        if (!this._mouse.active) this._mouse.active = true;
        var pos = cc.v2(iR*_dx, (this._iLine-iL-1)*_dx);
        this._mouse.setPosition(pos);
    }

    hideMouse(){
        this._mouse.active = false;
    }
}
