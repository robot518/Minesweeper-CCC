var GLB = require('GLBConfig');
var WS = require("Socket");
var _dx = 70;
var _iM = 20;
var bMove = true;

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
        this._iTotal = this._iRow*this._iLine;
        this._tiledMap = this.node.getComponent('cc.TiledMap');
        this._layerLab = this._tiledMap.getLayer("lab");
        this._layerMine = this._tiledMap.getLayer("mine");
        this._layerBtn = this._tiledMap.getLayer("btn");
        this._layerFlag = this._tiledMap.getLayer("flag");

        this._mouse = this.node.getChildByName('mouse');
        this._player = this.node.getChildByName('player');
        this._mouse.active = false;
        if (this._player != null){
            if (GLB.iType == 3)
                this._player.active = true;
            else 
                this._player.active = false;
        }
    },

    //gid 1-btn 2-mine 3-flag 4-null 5-12-num 13-redmine 14-greenflag
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
        };
        if (GLB.iType == 1)
            this.tPB = [];
        bMove = true;
        this.node.active = true;
    },

    //tilemap中左下为(0, 0), tile坐标左上为0,0
    //正常坐标转换成tilemap坐标
    initEvent(){
        this.node.on("touchstart", function (event) {
            if (this._bTouch == true || GLB.iType == 2 || this.getBMove() == false)  return;
            this._bTouch = true;
            var touchPos = event.touch.getLocation();
            var nPos = this.node.convertToNodeSpace(touchPos);
            this._prePos = touchPos;
            this.iR = Math.floor (nPos.x / _dx);
            this.iL = this._iLine - 1 - Math.floor (nPos.y / _dx);
            this.idx = this.iR + this.iL * this._iRow;
            if (GLB.iType != 3 && GLB.iType != 4){
                if (this._delt.getBGameOver() == false && this._layerBtn.getTileGIDAt(this.iR, this.iL) == 1)
                    this._iTime = 0;
            }
        }, this)
        this.node.on("touchmove", function (event) {
            if (this._bTouch == false || GLB.iType == 2 || this.getBMove() == false)  return;
            var nPos = event.touch.getLocation();
            if (GLB.iType != 3 && GLB.iType != 4){
                if (Math.abs(nPos.x - this._prePos.x) > _iM || Math.abs(nPos.y - this._prePos.y) > _iM)
                    this._iTime = -1;
            }
        }, this)
        this.node.on("touchend", function (event) {
            if (this._bTouch == false || GLB.iType == 2 || this.getBMove() == false)  return;
            var nPos = event.touch.getLocation();
            if (Math.abs(nPos.x - this._prePos.x) > _iM || Math.abs(nPos.y - this._prePos.y) > _iM){
                this._prePos = null;
            } else{
                if (GLB.iType == 3){
                    if (this._layerFlag.getTileGIDAt(this.iR, this.iL) != 3 && this.getPlayerIdx() != this.idx
                    && this._layerBtn.getTileGIDAt(this.iR, this.iL) == 1){ //插旗的格子无法到达，不能不移动，格子需未翻开
                        this._delt.playSound("check");
                        this.setPlayerPos(this.iR, this.iL);
                        bMove = false;
                        var self = this;
                        this._layerFlag.scheduleOnce(function (argument) {
                            bMove = true;
                            self._delt.onRedo();
                        }, 1);
                    }
                }else
                    this.onClick();
            }
            this._bTouch = false;
            this._iTime = -1;
        }, this)
    },

    getBMove(){
        if (GLB.iType == 3 && bMove == false)
            return false;
        return true;
    },

    setPlayerPos(iR, iL){
        var pos = cc.v2(iR*_dx, (this._iLine-iL-1)*_dx);
        this._player.setPosition(pos);
        if (this._layerBtn.getTileGIDAt(iR, iL) == 1) //有格子
            this._player.zIndex = 1;
        else
            this._player.zIndex = 0;
    },

    getPlayerIdx(){
        var pos = this._player.getPosition();
        var iR = pos.x/_dx;
        var iL = this._iLine - (pos.y/_dx+1);
        return iR + iL * this._iRow;
    },

    checkPlayerSurvive(){
        var pos = this._player.getPosition();
        var iR = pos.x/_dx;
        var iL = this._iLine - (pos.y/_dx+1);
        if (this._layerBtn.getTileGIDAt(iR, iL) == 1) //有格子
            return true;
        return false;
    },

    setMousePos(iR, iL){
        var pos = cc.v2(iR*_dx, (this._iLine-iL-1)*_dx);
        this._mouse.setPosition(pos);
    },

    hideMouse(){
        this._mouse.active = false;
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
    //world 0/2点到雷胜利, 1点到雷死亡
    onPlaybackEvent(iType, idx){
        var delt = this._delt;
        var iR = idx % this._iRow;
        var iL = Math.floor (idx / this._iRow);
        if (this._mouse.active == false)
            this._mouse.active = true;
        this.setMousePos(iR, iL);
        var bWin = false;
        var bLose = false;
        if (iType == 0){
            if (GLB.iType == 3 && this.getPlayerIdx() == idx){
                delt.playSound("bomb");
                bMove = false;
                bWin = true;
            }else{
                delt.playSound("check");
                delt.setTSearch();
                delt.showGrids(idx);
                this.showBtns(delt._tBtns);
                delt.showWin();
                if (GLB.iType == 3 && this.checkPlayerSurvive() == false){
                    delt.playSound("lose");
                    bMove = false;
                    bLose = true;
                }
            }
        } else if (iType == 1){
            delt.playSound("check");
            var iFlag = this._layerFlag.getTileGIDAt(iR, iL);
            if (iFlag == 4){
                this._layerFlag.setTileGIDAt(3, iR, iL);
                delt._tFlag[idx] = 1;
                delt.setMineCount (-1);
                if (GLB.iType == 3 && this.getPlayerIdx() == idx){
                    delt.playSound("lose");
                    bMove = false;
                    bLose = true;
                }
            }else if(iFlag == 3){
                this._layerFlag.setTileGIDAt(4, iR, iL);
                delt._tFlag[idx] = 0;
                delt.setMineCount (1);
            }
        } else if (iType == 2){
            delt.onClickNum(idx);
            if (GLB.iType == 3 && this.checkPlayerSurvive() == false){
                delt.playSound("lose");
                bMove = false;
                bLose = true;
            }
        }
        if (bWin || bLose){
            this._layerFlag.scheduleOnce(function (argument) {
                delt.showWorldResult(bWin);
            }, 1.5);
        }
    },

    onFlagEvent(){
        var delt = this._delt;
        var iFlag = this._layerFlag.getTileGIDAt(this.iR, this.iL);
        if (iFlag == 4 && delt.getMineCount () == 0)
            return;
        delt.playSound("check");
        var tile = this._layerFlag.getTiledTileAt(this.iR, this.iL, true);
        var tileNode = tile.node;
        if (iFlag == 4){
            this._layerFlag.setTileGIDAt(3, this.iR, this.iL);
            delt._tFlag[this.idx] = 1;
            delt.setMineCount (-1);
            tileNode.scale = 5;
            tileNode.runAction(cc.scaleTo(0.1, 1, 1));
        } else if (iFlag == 3){
            var self = this;
            tileNode.runAction(cc.sequence(cc.scaleTo(0.1, 5), cc.callFunc(function (argument) {
                tileNode.scale = 1;
                self._layerFlag.setTileGIDAt(4, self.iR, self.iL);
                delt._tFlag[self.idx] = 0;
                delt.setMineCount (1);
            })));
        }
        if (GLB.iType == 1){
            var str = "1" + this.idx.toString() + "." + delt.getITime();
            this.tPB.push(str);
        }
    },

    showAllRedMine(){
        for (var i = 0; i < this._iLine; i++) {
            for (var j = 0; j < this._iRow; j++) {
                this._layerMine.setTileGIDAt(13, j, i);
            };
        };
    },

    showAllNormalMine(){
        for (var i = 0; i < this._iLine; i++) {
            for (var j = 0; j < this._iRow; j++) {
                this._layerMine.setTileGIDAt(2, j, i);
            };
        };
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
