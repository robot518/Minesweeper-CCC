const {ccclass, property} = cc._decorator;

import {GLB} from "./GLBConfig";

var _dx = 70;
var _iM = 20;

@ccclass
export default class MineMap extends cc.Component {
    
    @property({
        visible: true
    })
    _iDiff: number = 0;

    _iTime: number;
    _bTouch: boolean;
    _iRow: number;
    _iLine: number;
    _iTotal: number;
    _mouse: cc.Node;
    _delt: any;
    idx: number;

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
        this.node.on("touchstart", function (event) {
            if (this._bTouch == true || GLB.iType == 2)  return;
            this._bTouch = true;
            var touchPos = event.touch.getLocation();
            var nPos = this.node.convertToNodeSpace(touchPos);
            this._prePos = touchPos;
            let iR = Math.floor (nPos.x / _dx);
            let iL = this._iLine - 1 - Math.floor (nPos.y / _dx);
            this.idx = iR + iL * this._iRow;
            if (this._delt.getBGameOver() == false && this._delt._tBtns[this.idx] == 1)
                this._iTime = 0;
        }, this)
        this.node.on("touchmove", function (event) {
            if (this._bTouch == false || GLB.iType == 2)  return;
            var nPos = event.touch.getLocation();
            if (Math.abs(nPos.x - this._prePos.x) > _iM || Math.abs(nPos.y - this._prePos.y) > _iM)
                this._iTime = -1;
        }, this)
        this.node.on("touchend", function (event) {
            if (this._bTouch == false || GLB.iType == 2)  return;
            var nPos = event.touch.getLocation();
            if (Math.abs(nPos.x - this._prePos.x) > _iM || Math.abs(nPos.y - this._prePos.y) > _iM){
                this._prePos = null;
            } else{
                this._delt.onClick(this.idx);
            }
            this._bTouch = false;
            this._iTime = -1;
        }, this)
    }

    setMousePos(iR, iL){
        var pos = cc.v2(iR*_dx, (this._iLine-iL-1)*_dx);
        this._mouse.setPosition(pos);
    }

    hideMouse(){
        this._mouse.active = false;
    }

    showMouse(){
        this._mouse.active = true;
    }
}
