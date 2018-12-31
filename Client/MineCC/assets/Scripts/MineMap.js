var GLB = require('GLBConfig');

cc.Class({
    extends: cc.Component,

    properties: {
        _iDiff: {
            default: 0,
            visible: true,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initParas();
        this.initShow();
        this.initEvent();
    },

    start () {
        
    },

    update (dt) {
        if (this._iTime != -1){
            this._iTime+=dt;
            if (this._iTime > 0.2){
                this.onFlagEvent();
                this._bTouch = false;
                this._iTime = -1;
            }
        }
    },

    initParas(){
        this._iTime = -1;
        if (this._iDiff == 0) {
            this._iRow = this._iLine = 9;
        } else if (this._iDiff == 1){
            this._iRow = this._iLine = 16;
        } else if (this._iDiff == 2){
            this._iRow = 16;
            this._iLine = 30;
        }
        this._dx = 70;
        this._iM = 20;
        this._iTotal = this._iRow*this._iLine;
        this._tiledMap = this.node.getComponent('cc.TiledMap');
        this._layerLab = this._tiledMap.getLayer("lab");
        this._layerMine = this._tiledMap.getLayer("mine");
        this._layerBtn = this._tiledMap.getLayer("btn");
        this._layerFlag = this._tiledMap.getLayer("flag");
        this._layerPoint = this._tiledMap.getLayer("point");

        this._bTouch = false;

        if (GLB.iType == 1)
            this.tPB = [];
    },

    //gid 1-btn 2-mine 3-flag 4-null 5-12-num 13-redmine 14-greenflag 15-point
    initShow(){
        this._layerLab.node.active = true;
        this._layerMine.node.active = true;
        this._layerFlag.node.active = true;
        this.showBtn(true);
        for (var i = 0; i < this._iTotal; i++) {
            var iR = i % this._iRow;
            var iL = Math.floor (i / this._iRow);
            this._layerBtn.setTileGIDAt(1, iR, iL);
            this._layerFlag.setTileGIDAt(4, iR, iL);
            this._layerMine.setTileGIDAt(4, iR, iL);
            this._layerLab.setTileGIDAt(4, iR, iL);
            this._layerPoint.setTileGIDAt(4, iR, iL);
        };
    },

    //tilemap中左下为(0, 0)
    //正常坐标转换成tilemap坐标
    initEvent(){
        this.node.on("touchstart", function (event) {
            if (this._bTouch == true || GLB.iType == 2)
                return;
            this._bTouch = true;
            var touchPos = event.touch.getLocation();
            var nPos = this.node.convertToNodeSpace(touchPos);
            this._prePos = touchPos;
            this.iR = Math.floor (nPos.x / this._dx);
            this.iL = this._iLine - 1 - Math.floor (nPos.y / this._dx);
            this.idx = this.iR + this.iL * this._iRow;
            if (this._delt.getBGameOver() == false && this._layerBtn.getTileGIDAt(this.iR, this.iL) == 1)
                this._iTime = 0;
        }, this)
        this.node.on("touchmove", function (event) {
            if (this._bTouch == false || GLB.iType == 2) return;
            var nPos = event.touch.getLocation();
            if (Math.abs(nPos.x - this._prePos.x) > this._iM || Math.abs(nPos.y - this._prePos.y) > this._iM)
                this._iTime = -1;
        }, this)
        this.node.on("touchend", function (event) {
            if (this._bTouch == false || GLB.iType == 2) return;
            var nPos = event.touch.getLocation();
            if (Math.abs(nPos.x - this._prePos.x) > this._iM || Math.abs(nPos.y - this._prePos.y) > this._iM){
                this._prePos = null;
            } else{
                this.onClick();
            }
            this._bTouch = false;
            this._iTime = -1;
        }, this)
    },

    onClick(){
        var delt = this._delt;
        if (delt.getBGameOver() == true)
            return;
        var iBtn = this._layerBtn.getTileGIDAt(this.iR, this.iL);
        var iNum = this._layerLab.getTileGIDAt(this.iR, this.iL);
        if (iBtn == 4 && iNum == 4)
            return;
        if (iBtn == 4 && iNum != 4){
            if (GLB.iType == 1){
                var str = "2" + this.idx.toString() + "." + delt.getITime();
                this.tPB.push(str);
            }
            delt.onClickNum(this.idx);
            return;
        }
        var mode = delt.getMode();
        if (mode == 0){
            if (this._layerFlag.getTileGIDAt(this.iR, this.iL) == 3)
                return;
            if (this._layerMine.getTileGIDAt(this.iR, this.iL) == 2){
                delt.playSound("bomb");
                this.showRedMine();
                delt.onEnd();
                this.strBack = "bomb";
            }else{
                if (GLB.iType == 1){
                    var str = "0" + this.idx.toString() + "." + delt.getITime();
                    this.tPB.push(str);
                }
                delt.playSound("check");
                delt.setTSearch();
                delt.showGrids(this.idx);
                this.showBtns(delt._tBtns);
                delt.showWin();
            }
        }else{
            this.onFlagEvent();
        }
    },

    //iType 0正常翻，1插旗，2点数字
    onPlaybackEvent(iType, idx){
        var delt = this._delt;
        var iR = idx % this._iRow;
        var iL = Math.floor (idx / this._iRow);
        this._layerPoint.setTileGIDAt(15, iR, iL);
        if (iType == 0){
            delt.playSound("check");
            delt.setTSearch();
            delt.showGrids(idx);
            this.showBtns(delt._tBtns);
            delt.showWin();
        } else if (iType == 1){
            delt.playSound("check");
            var iFlag = this._layerFlag.getTileGIDAt(iR, iL);
            if (iFlag == 4){
                this._layerFlag.setTileGIDAt(3, iR, iL);
                delt._tFlag[idx] = 1;
                delt.setMineCount (-1);
            }else if(iFlag == 3){
                this._layerFlag.setTileGIDAt(4, iR, iL);
                delt._tFlag[idx] = 0;
                delt.setMineCount (1);
            }
        } else if (iType == 2){
            delt.onClickNum(idx);
        }
        var self = this;
        this._layerPoint.scheduleOnce(function (argument) {
            self._layerPoint.setTileGIDAt(4, iR, iL);
        }, delt.iPBTime);
    },

    onFlagEvent(){
        var delt = this._delt;
        var iFlag = this._layerFlag.getTileGIDAt(this.iR, this.iL);
        if (iFlag == 4 && delt.getMineCount () == 0)
            return;
        delt.playSound("check");
        if (iFlag == 4){
            this._layerFlag.setTileGIDAt(3, this.iR, this.iL);
            delt._tFlag[this.idx] = 1;
            delt.setMineCount (-1);
        } else if (iFlag == 3){
            this._layerFlag.setTileGIDAt(4, this.iR, this.iL);
            delt._tFlag[this.idx] = 0;
            delt.setMineCount (1);
        }
        if (GLB.iType == 1){
            var str = "1" + this.idx.toString() + "." + delt.getITime();
            this.tPB.push(str);
        }
    },

    showRedMine(idx){
        if (idx == null)
            this._layerMine.setTileGIDAt(13, this.iR, this.iL);
        else{
            this.idx = idx;
            this.iR = idx % this._iRow;
            this.iL = Math.floor (idx / this._iRow);
            this._layerMine.setTileGIDAt(13, this.iR, this.iL);
        }
    },

    showBackMine(){
        if (this.strBack == "bomb"){
            this._layerMine.setTileGIDAt(2, this.iR, this.iL);
            this._layerFlag.setTileGIDAt(3, this.iR, this.iL);
            this._delt._tFlag[this.idx] = 1;
            this._delt.setMineCount (-1);
        } else if (this.strBack == "lose"){
            this._layerFlag.setTileGIDAt(4, this.iR, this.iL);
            this._delt._tFlag[this.idx] = 0;
            this._delt.setMineCount (1);
        }
    },

    showMines(t){
        var lMine = this._layerMine;
        for (var i = 0; i < this._iTotal; i++) {
            var iR = i % this._iRow;
            var iL = Math.floor (i / this._iRow);
            if (t[i] == 0) {
                lMine.setTileGIDAt(4, iR, iL);
            } else
                lMine.setTileGIDAt(2, iR, iL);
        };
    },

    showLabs(t){
        for (var i = 0; i < this._iTotal; i++) {
            var iR = i % this._iRow;
            var iL = Math.floor (i / this._iRow);
            var gid = t[i];
            if (gid < 0)
                gid = 0;
            this._layerLab.setTileGIDAt(4 + gid, iR, iL);
        };
    },

    showBtn(bShow){
        this._layerBtn.node.active = bShow;
    },

    showBtns(t){
        for (var i = 0; i < this._iTotal; i++) {
            var iR = i % this._iRow;
            var iL = Math.floor (i / this._iRow);
            if (t[i] == 0){
                this._layerBtn.setTileGIDAt(4, iR, iL);
            }else{
                this._layerBtn.setTileGIDAt(1, iR, iL);
            }
        }; 
    },

    showGreenFlag(){
        this._layerFlag.setTileGIDAt(14, this.iR, this.iL);
    },

    hideFlag(idx){
        var iCurRow = idx % this._iRow;
        var iCurLine = Math.floor (idx / this._iRow);
        this._layerFlag.setTileGIDAt(4, iCurRow, iCurLine);
    },

    showFlags(t){
        for (var i = 0; i < this._iTotal; i++) {
            var iR = i % this._iRow;
            var iL = Math.floor (i / this._iRow);
            if (t[i] == 1){
                this._layerFlag.setTileGIDAt(3, iR, iL);
            }else if (t[i] == 0)
                this._layerFlag.setTileGIDAt(4, iR, iL);
        }; 
    },

    getTPB(){
        return this.tPB;
    },
});
