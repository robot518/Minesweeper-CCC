var GLB = require('GLBConfig');
var WS = require("Socket");

cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.Node,
        mineMap: cc.Node,
        midMineMap: cc.Node,
        bigMineMap: cc.Node,
        midScv: cc.Node,
        bigScv: cc.Node,
        togs: cc.Node,
        goRivive: cc.Node,
        goResult: cc.Node,
        labTime: cc.Label,
        labLeftMine: cc.Label,
        labMineTips: cc.Label,
        labPBTime: cc.Label,
        labType: cc.Label,

        labStart: cc.Label,
        labScale: cc.Label,
        labDiff: cc.Label,
        labJunior: cc.Label,
        labMiddle: cc.Label,
        labSenior: cc.Label,
        labInterval: cc.Label,
        labCurCost: cc.Label,
        labCost: cc.Label,
        labSure: cc.Label,

        display: cc.Sprite,
        bombClip: cc.AudioSource,
        checkClip: cc.AudioSource,
        clickClip: cc.AudioSource,
        winClip: cc.AudioSource,
        loseClip: cc.AudioSource,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.initCanvas();
        this.initParas();
        this.initEvent();
        this.initShow();
        var self = this;
        this.labTime.scheduleOnce(function (argument) {
            self.onStart();
        }, 0.01);
    },

    initCanvas(){
        var canvas = this.node.getComponent(cc.Canvas);
        var size = canvas.designResolution;
        var cSize = cc.view.getFrameSize();
        if (cSize.width/cSize.height >= size.width/size.height){
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }else{
            canvas.fitWidth = true;
            canvas.fitHeight = false;
        }
        canvas.alignWithScreen();
    },

    update (dt) {
        this._updateSubDomainCanvas();
        if (this.bPlayTime == true){
            this._iTime+=dt;
            this.labTime.string = this.getITime().toString();
            if (this.bPlayback == true && this._iTime >= this.iPlaybackTime){
                this.showPlayback(this.iPBidx);
                this.iPBidx++;
                this.iPlaybackTime = this.getPlaybackTime(this.iPBidx);
            }
        }
    },

    // 刷新开放数据域的纹理
    _updateSubDomainCanvas () {
        if (!this.tex || !window.wx) {
            return;
        }
        var openDataContext = wx.getOpenDataContext();
        var sharedCanvas = openDataContext.canvas;
        this.tex.initWithElement(sharedCanvas);
        this.tex.handleLoadedTexture();
        this.display.spriteFrame = new cc.SpriteFrame(this.tex);
    },

    initParas(){
        this._smTileMap = this.mineMap.getComponent("MineMap");
        this._smTileMap._delt = this;
        this._midTileMap = this.midMineMap.getComponent("MineMap");
        this._midTileMap._delt = this;
        this._bigTileMap = this.bigMineMap.getComponent("MineMap");
        this._bigTileMap._delt = this;
        this.tex = new cc.Texture2D();
        this.bSound = true;
        this._iMode = 0;
        this._tSearch = [];

        this._iDiff=0; //实际为单选按钮选择的难度
        this._dx = 70;
        this._iShowX = 9;
        this._iShowY = 12;
        this.bPlayTime = false;
        this.midPreOff = cc.v2(250, 130);
        this.bigPreOff = cc.v2(250, 620);
        this.bScale = false;
        this._iLife = 1; 
        this._iTime = 0;

        if (GLB.iType == 1 || GLB.iType == 2){
            this._iDiff = GLB.iDiff;
            if (GLB.iType == 2){ //playback
                this.tPBBtns = [];
                this.tPBFlags = [];
                this.bPlayback = true;
                this.iPBidx = 2;
                this.iPlaybackTime = this.getPlaybackTime(this.iPBidx); //playbackData中一步的时间
            }
        }
    },

    initEvent(){
        var self=this;
        var btns = cc.find("btns", this.node);
        cc.find("sure", this.goResult).on("click", function (argument) {
            this.goResult.active = false;
            if (GLB.iType == 0) return;
            var score = GLB.tScore[this._iDiff];
            if (score == "" || score == null || this._iTime < score){
                var strStepInfo = WS.getStrPBStepInfo(this._tileMap.getTPB());
                if (strStepInfo == "")
                    return;
                //因为redis zadd精度问题这里时间*100
                var iTime = this._iTime.toFixed(2);
                var str = this._iDiff.toString() + "|" + GLB.sName + "|" + (iTime*100) + "|"
                + this.sPBMineNum + "|" + this.iPBNum + "|" + strStepInfo;
                WS.sendMsg(GLB.SET_STEP, str);
            }
        }, this);
        cc.find("goTop/back", this.node).on("click", function (argument) {
            var str = GLB.iType == 0 ? "Login" : "Challenge";
            cc.director.loadScene(str);
        }, this);
        var normal = cc.find("normal", btns);
        cc.find("start", normal).on("click", function (argument) {
            self.onStart();
        }, this);
        cc.find("scale", normal).on("click", function (argument) {
            this.onScale();
        }, this);
        cc.find("diff", normal).on("click", function (argument) {
            self.togs.active = !self.togs.active;
        }, this);
        cc.find("type", normal).on("click", function (argument) {
            self.onType();
        }, this);
        var playback = cc.find("playback", btns);
        var ndStop = cc.find("stop", playback);
        var ndPlay = cc.find("play", playback);
        cc.find("undo", playback).on("click", function (argument) {
            if (this.iPBidx <= 2)
                return;
            this.iPBidx--;
            if (ndStop.active == true){
                this.bPlayTime = false;
                ndPlay.active = true;
                ndStop.active = false;
            }
            if (this.tPBBtns.length == 1)
                return;
            this.tPBBtns.pop();
            var tFlag = this.tPBFlags.pop();
            this._tBtns = this.tPBBtns[this.tPBBtns.length - 1].slice(0);
            this._tFlag = this.tPBFlags[this.tPBFlags.length - 1].slice(0);
            this._tileMap.showBtns(this._tBtns);
            this._tileMap.showFlags(this._tFlag);
            var sData = GLB.tPlaybackData[self.iPBidx];
            var iDot = sData.indexOf(".");
            var idx = sData.substring(1, iDot);
            this.iPlaybackTime = sData.substring(iDot+1); //时间重置1
            if (sData[0] == 1)
                this.setMineCount (2*tFlag[idx]-1);
            sData = GLB.tPlaybackData[self.iPBidx-1];
            this._iTime = this.iPBidx == 2 ? 0 : parseFloat(sData.substring(sData.indexOf(".")+1));
            this.labTime.string = this.iPBidx == 2 ? "0.00" : this._iTime.toString();
        }, this);
        ndStop.on("click", function (argument) {
            this.bPlayTime = false;
            ndPlay.active = true;
            ndStop.active = false;
        }, this);
        ndPlay.on("click", function (argument) {
            ndStop.active = true;
            ndPlay.active = false;
            if (this.iPBidx < GLB.tPlaybackData.length-2){
                this.bPlayTime = true;
            };
        }, this);
        cc.find("redo", playback).on("click", function (argument) {
            if (this.iPBidx > GLB.tPlaybackData.length-1)
                return;
            if (ndStop.active == true){
                this.bPlayTime = false;
                ndPlay.active = true;
                ndStop.active = false;
            }
            var sData = GLB.tPlaybackData[self.iPBidx];
            var iDot = sData.indexOf(".");
            this._iTime = parseFloat(sData.substring(iDot+1)); //时间重置2
            self.labTime.string = this._iTime.toString();
            self._tileMap.onPlaybackEvent(sData[0], sData.substring(1, iDot));
            self.tPBBtns.push(self._tBtns.slice(0));
            self.tPBFlags.push(self._tFlag.slice(0));
            this.iPBidx++;
            this.iPlaybackTime = this.getPlaybackTime(this.iPBidx);
        }, this);
        cc.find("sub/rank", btns).on("click", function (argument) {
            self.playSound ("click");
            self.display.node.active = !self.display.node.active;
            if (self.display.node.active == true){
                var openDataContext = wx.getOpenDataContext();
                openDataContext.postMessage({
                    iType: 2,
                    cost: self._iTime.toFixed(2),
                });
            };
        }, this);
        cc.find("sub/stat", btns).on("click", function (argument) {
            self.playSound ("click");
            self.display.node.active = !self.display.node.active;
            if (self.display.node.active == true){
                var openDataContext = wx.getOpenDataContext();
                openDataContext.postMessage({
                    iType: 3,
                });
            };
        }, this);
        cc.find("sub/share", btns).on("click", function (argument) {
            self.playSound ("click");
            wx.shareAppMessage({
                title: "你来挑战我啊！",
                imageUrl: canvas.toTempFilePathSync({
                    destWidth: 500,
                    destHeight: 400
                })
            });
        }, this);
        var ndSound = cc.find("sub/sound", btns);
        ndSound.on("click", function (argument) {
            self.bSound = !self.bSound;
            if (self.bSound == true){
                ndSound.color = cc.Color.WHITE;
                self.playSound ("click");
            } else
                ndSound.color = cc.Color.GRAY;
        }, this);
        cc.find("goRivive", this.node).on("click", function (argument) {
            this.goRivive.active = false;
            if (this.bannerAd != null)
                this.bannerAd.hide();
            if (this._iDiff != 0)
                this.sendDataToWX();
        }, this);
        cc.find("goRivive/rivive", this.node).on("click", function (argument) {
            if (self.videoAd != null){
                self.videoAd.show()
                .catch(err => {
                    self.videoAd.load()
                    .then(() => self.videoAd.show())
                })
            }
        }, self);

        if (!window.wx)
            return;
        var openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({
            iType: -1,
        });
        this.videoAd = wx.createRewardedVideoAd({
            adUnitId: 'adunit-bfb85c76177f19b6'
        })
        this.videoAd.onClose(res => {
            if (res && res.isEnded || res === undefined){
                self._iLife--;
                self.onRivive();
            }else{

            }
        })
        this.videoAd.onError(err => {
          console.log(err)
        })
    },

    initShow(){
        this.goResult.active = false;
        this.goRivive.active = false;
        this.midScv.active = false;
        this.bigScv.active = false;
        if (!window.wx || GLB.iType == 2 || GLB.iType == 1){
            var sub = cc.find("btns/sub", this.node);
            cc.find("rank", sub).active = false;
            cc.find("stat", sub).active = false;
            if (!window.wx)
                cc.find("share", sub).active = false;
        }
        var normal = cc.find("btns/normal", this.node);
        if (GLB.iType == 1)
            cc.find("diff", normal).active = false;
        else if (GLB.iType == 2){
            cc.find("diff", normal).active = false;
            cc.find("start", normal).active = false;
            cc.find("type", normal).active = false;
            cc.find("scale", normal).active = false;
        }
        if (GLB.iLang == "zh")
            this.onZhShow();
        else if (GLB.iLang == "en")
            this.onEnShow();
    },

    onZhShow(){
        this.labJunior.string = "初级";
        this.labMiddle.string = "中级";
        this.labSenior.string = "高级";
        this.labStart.string = "开始";
        this.labScale.string = "缩放";
        this.labDiff.string = "难度";
        this.labType.string = this._iMode == 0 ? "翻开" : "插旗";
        this.labInterval.string = "播放间隔：";
        this.labCurCost.string = "当前纪录:";
        this.labCost.string = "用时:";
        this.labSure.string = "确定";
    },

    onEnShow(){
        this.labJunior.string = "Junior";
        this.labMiddle.string = "Middle";
        this.labSenior.string = "Senior";
        this.labStart.string = "Start";
        this.labScale.string = "Scale";
        this.labDiff.string = "Diff";
        this.labType.string = this._iMode == 0 ? "Open" : "Flag";
        this.labInterval.string = "Play interval: ";
        this.labCurCost.string = "Record:";
        this.labCost.string = "Cost:";
        this.labSure.string = "Confirm";
    },

    showResult(){
        this.goResult.active = true;
        var sTitle = "挑战成功";
        if (GLB.iLang == "en")
            sTitle = "Succeed";
        var score = GLB.tScore[this._iDiff];
        if (score && this._iTime >= score){
            sTitle = "挑战失败";
            if (GLB.iLang == "en")
                sTitle = "Lose";
        }
        if (score == null)
            score = "无";
        cc.find("labResult", this.goResult).getComponent(cc.Label).string = sTitle;
        cc.find("preCost", this.goResult).getComponent(cc.Label).string = score.toString();
        cc.find("cost", this.goResult).getComponent(cc.Label).string = this._iTime.toFixed(2).toString();
    },

    showWinResult(){
        this.goResult.active = true;
        var sTitle = "挑战成功";
        if (GLB.iLang == "en")
            sTitle = "Succeed";
        cc.find("labResult", this.goResult).getComponent(cc.Label).string = sTitle;
        cc.find("preCost", this.goResult).active = false;
        cc.find("cost", this.goResult).getComponent(cc.Label).string = this._iTime.toFixed(2).toString();
    },

    onType(){
        this.onClickMode();
        // var scv = this._iDiff == 1 ? this.midScv : this.bigScv;
        // scv = scv.getComponent(cc.ScrollView);
        // var offPos = scv.getScrollOffset();
        // cc.log("offPos = ", offPos.x, offPos.y);
    },

    onScale(){
        if (this._iDiff == 0) return;
        var scv = this._iDiff == 1 ? this.midScv : this.bigScv;
        scv = scv.getComponent(cc.ScrollView);
        var map = this._iDiff == 1 ? this.midMineMap : this.bigMineMap;
        var pos = this._iDiff == 1 ? this.midPreOff : this.bigPreOff;
        if (this.bScale == false){
            var posTemp = scv.getScrollOffset();
            this.offPos = cc.v2(Math.abs(posTemp.x), Math.abs(posTemp.y));
            scv.scrollToOffset(pos);
            map.scaleX = this._iShowX/this._iRow;
            map.scaleY = this._iShowY/this._iLine;
            this.bScale = true;
            scv.horizontal = false;
            scv.vertical = false;
        }else {
            map.scaleX = 1;
            map.scaleY = 1;
            this.bScale = false;
            scv.horizontal = true;
            scv.vertical = true;
            scv.scrollToOffset(this.offPos);
        }
    },

    onStart(){
        this.reset();
        this.initMines();
        this.initLabs();
        if (GLB.iType == 2){
            this.initStartShow(parseInt(GLB.tPlaybackData[1]));
            this.tPBBtns.push(this._tBtns.slice(0));
            this.tPBFlags.push(this._tFlag.slice(0));
            var self = this;
            self.onScale();
            this.labTime.scheduleOnce(function (argument) {
                cc.find("btns/playback", self.node).active = true;
            }, 0.5);
        } else{
            this.initGridShow();
        }
    },

    getPlaybackTime(idx){
        var sData = GLB.tPlaybackData[idx];
        if (sData == null)
            return;
        return sData.substring(sData.indexOf(".")+1);
    },

    showPlayback(idx){
        var sData = GLB.tPlaybackData[idx];
        if (sData == null)
            return;
        var iNum = sData.indexOf(".");
        this.labTime.string = sData.substring(iNum+1).toString();
        this._tileMap.onPlaybackEvent(sData[0], sData.substring(1, iNum));
        this.tPBBtns.push(this._tBtns.slice(0));
        this.tPBFlags.push(this._tFlag.slice(0));
        if (idx >= GLB.tPlaybackData.length-1){
            this.bPlayTime = false;
        };
    },

    reset(){
        this._iLife = 1;
        this.display.node.active = false;
        this.togs.active = false;
        this._bGameOver=false;
        this._iTime=0;
        this.labTime.string="0.00";
        if (GLB.iType == 0){
            var children = this.togs.children;
            for (var i = 0; i < children.length; i++) {
                var tog = children[i].getComponent(cc.Toggle);
                if (tog.isChecked == true){
                    this._iDiff = i;
                    break;
                }
            };
        }
        if (this._iDiff == 0){
            this._iMineCount = 10;
            this._iRow = this._iLine = 9;
            this._tileMap = this._smTileMap;
            this.midScv.active = false;
            this.mineMap.active = true;
            this.bigScv.active = false;
        }else if (this._iDiff == 1){
            this._iMineCount = 40;
            this._iRow = this._iLine = 16;
            this._tileMap = this._midTileMap;
            this.midScv.active = true;
            this.mineMap.active = false;
            this.bigScv.active = false;
        }else if (this._iDiff == 2){
            this._iMineCount = 99;
            this._iRow = 16;
            this._iLine = 30;
            this._tileMap = this._bigTileMap;
            this.midScv.active = false;
            this.mineMap.active = false;
            this.bigScv.active = true;
        }
        this._iTotal = this._iRow * this._iLine;
        this.labMineTips.string = "[" + this._iMineCount + "_" + this._iRow + "*" + this._iLine + "]";
        this.showMineCount(this._iMineCount);
        this._tileMap.initShow();
    },

    initMines(){
        var tNum = [];
        var tMineNum = [];
        this._tNum = [];
        this._tFlag = [];
        this._tBtns = [];
        this._tMine = [];
        for (var i = 0; i < this._iTotal; i++) {
            tNum.push(i);
            tMineNum[i] = 0;
            this._tNum[i] = 0;
            this._tFlag[i] = 0;
            this._tBtns[i] = 1;
            // this._tBtns[i] = 0;
        };
        if (GLB.iType == 2){
            tMineNum = WS.getTPBMineNum();
        }else{
            for (var i = 0; i < this._iMineCount; i++) {
                var iRandom = Math.floor(Math.random() * (tNum.length - 1));
                var iNum = tNum.splice(iRandom, 1);
                tMineNum[iNum] = 1;
            };
            if (GLB.iType == 1)
                this.sPBMineNum = WS.getStrPBMineNum(tMineNum);
        }
        this._tileMap.showMines(tMineNum);
        for (var i = 0; i < this._iTotal; i++) {
            if (tMineNum [i] == 1) {
                this._tMine.push(i);
                this._tNum[i] = -1;
            }
        };
    },

    initLabs(){
        var _iRow = this._iRow;
        for (var i = 0; i < this._iMineCount; i++) {
            var iMine = this._tMine[i];
            var iCurRow = iMine % _iRow;
            var iCurLine = Math.floor(iMine/_iRow);
            for (var iLine = 0; iLine < 3; iLine++) {
                for (var iRow = 0; iRow < 3; iRow++) {
                    var iRowTemp = iCurRow - 1 + iRow;
                    var iLineTemp = iCurLine - 1 + iLine;
                    if (iRowTemp > -1 && iRowTemp < _iRow && iLineTemp > -1 && iLineTemp < this._iLine){
                        var idx = iMine + (iRow - 1) + (iLine * _iRow - _iRow);
                        if (this._tNum[idx] != -1)
                            this._tNum[idx]++;
                    }
                };
            };
        };
        this._tileMap.showLabs(this._tNum);
    },

    initGridShow(){
        if (this.bPlayTime == false)
            this.bPlayTime = true;
        var tNum = [];
        for (var i = 0; i < this._iTotal; i++) {
            tNum.push(i);
        };
        for (var i = 0; i < this._iTotal; i++) {
            var iRandom = Math.floor(Math.random() * (tNum.length - 1));
            var iNum = tNum.splice(iRandom, 1)[0];
            if (this._tNum[iNum] == 0){
                if (GLB.iType == 1)
                    this.iPBNum = iNum;
                this.initStartShow(iNum);
                break;
            }
        };
    },

    initStartShow(iNum){
        this.playSound("check");
        this.setTSearch();
        this.showGrids(iNum);
        this._tileMap.showBtns(this._tBtns);
        if (this._iDiff != 0){
            var iR = iNum % this._iRow;
            var iL = Math.floor(iNum/this._iRow);
            var iRLimit = this._iRow - this._iShowX;
            var iLLimit = this._iLine - this._iShowY;
            if (iR > iRLimit)
                iR = iRLimit;
            if (iL > iLLimit)
                iL = iLLimit;
            var scv = this._iDiff == 1 ? this.midScv : this.bigScv;
            scv = scv.getComponent(cc.ScrollView);
            if (this.bScale == false)
                scv.scrollToOffset(cc.v2(this._dx * iR, this._dx * iL), 0);
            this.offPos = cc.v2(this._dx * iR, this._dx * iL);
        }
        this.showWin();
    },

    setTSearch(){
        this._tSearch = [];
    },

    showGrids(idxNum){
        var _iRow = this._iRow;
        var iLabNum = this._tNum [idxNum];
        if (iLabNum >= 0) {
            this._tBtns[idxNum] = 0;
            if (iLabNum == 0) {
                var iMine = parseInt(idxNum);
                var iCurLine = Math.floor (iMine / _iRow);
                var iCurRow = iMine % _iRow;
                for (var iLine = 0; iLine < 3; iLine++) {
                    for (var iRow = 0; iRow < 3; iRow++) {
                        var iRowTemp = iCurRow - 1 + iRow;
                        var iLineTemp = iCurLine - 1 + iLine;
                        if (iRowTemp > -1 && iRowTemp < _iRow && iLineTemp > -1 && iLineTemp < this._iLine) {
                            var idx = iMine + (iRow - 1) + (iLine * _iRow - _iRow);
                            if (this._tFlag[idx] == 0 && this._tBtns[idx] == 1 && this._tSearch.indexOf(idx) == -1) {
                                this._tSearch.push(idx);
                                this.showGrids (idx);
                            }
                        }
                    }
                }
            }
        }
    },

    onClickNum(idxNum){
        var _iRow = this._iRow;
        var iMine = parseInt(idxNum);
        var iCurLine = Math.floor (iMine / _iRow);
        var iCurRow = iMine % _iRow;
        //统计标记的地雷数量，标错return;
        var iShowNum = 0;
        for (var iLine = 0; iLine < 3; iLine++) {
            for (var iRow = 0; iRow < 3; iRow++) {
                var iRowTemp = iCurRow - 1 + iRow;
                var iLineTemp = iCurLine - 1 + iLine;
                if (iRowTemp > -1 && iRowTemp < _iRow && iLineTemp > -1 && iLineTemp < this._iLine) {
                    var idx = iMine + (iRow - 1) + (iLine * _iRow - _iRow);
                    if (this._tFlag[idx] == 1) {
                        iShowNum++;
                    }
                }
            }
        }
        //判断地雷是否均被标记
        if (this._tNum[idxNum] != iShowNum)
            return;
        this.playSound("check");
        this.setTSearch();
        //展开地图
        for (var iLine = 0; iLine < 3; iLine++) {
            for (var iRow = 0; iRow < 3; iRow++) {
                var iRowTemp = iCurRow - 1 + iRow;
                var iLineTemp = iCurLine - 1 + iLine;
                if (iRowTemp > -1 && iRowTemp < _iRow && iLineTemp > -1 && iLineTemp < this._iLine) {
                    var idx = iMine + (iRow - 1) + (iLine * _iRow - _iRow);
                    if (this._tFlag[idx] == 0){
                        if (this._tNum[idx] == -1){
                            this._tBtns[idx] = 0;
                            this.playSound("bomb");
                            this._tileMap.showRedMine(idx);
                            this.onEnd();
                            this._tileMap.strBack = "bomb";
                            break;
                        }
                        if (this._tBtns[idx] == 1){
                            if (this._tSearch.indexOf(idx) == -1) {
                                this._tSearch.push(idx);
                                this.showGrids (idx);
                            }
                        }
                    }
                }
            }
        };
        this._tileMap.showBtns(this._tBtns);
        this.showWin();
    },

    showWin(){
        var bWin = true;
        for (var i = 0; i < this._iTotal; i++) {
            if (this._tNum[i] != -1 && this._tBtns[i] == 1) {
                bWin = false;
                break;
            }
        }
        if (bWin == true) {
            this._bGameOver = true;
            this.playSound ("win");
            this.onEnd ();
            this.bPlayTime = false;
            if (window.wx && this._iDiff == 0){
                var openDataContext = wx.getOpenDataContext();
                openDataContext.postMessage({
                    iType: 1,
                    cost: this._iTime.toFixed(2),
                });
            }
        }
    },

    getBGameOver(){
        return this._bGameOver;
    },

    onRivive(){
        if (this._tileMap == null) return;
        this._tileMap.showBackMine();
         for (var i = 0; i < this._tMine.length; i++) {
            this._tBtns[this._tMine[i]] = 1;
        };
        this._tileMap.showBtns(this._tBtns);
        this._bGameOver = false;
        this.bPlayTime = true;
        this.goRivive.active = false;
        if (this.bannerAd != null)
            this.bannerAd.hide();
    },

    sendDataToWX(){
        if (window.wx){
            var idx = -1;
            if (this._iDiff == 1)
                idx = 4;
            else if (this._iDiff == 2)
                idx = 6;
            if (idx != -1){
                var self = this;
                var openDataContext = wx.getOpenDataContext();
                openDataContext.postMessage({
                    iType: idx,
                    cost: self._iTime.toFixed(2),
                });
            }
        }
    },

    playSound(sName){
        if (window.wx && (sName == "bomb" || sName == "lose")){
            if (this._iLife > 0){
                this.goRivive.active = true;
                if (this.bannerAd != null)
                    this.bannerAd.destory();
                var systemInfo = wx.getSystemInfoSync();
                this.bannerAd = wx.createBannerAd({
                    adUnitId: 'adunit-24778ca4dc4e174a',
                    style: {
                        left: 0,
                        top: systemInfo.windowHeight - 144,
                        width: 720,
                    }
                });
                var self = this;
                this.bannerAd.onResize(res => {
                    if (self.bannerAd)
                        self.bannerAd.style.top = systemInfo.windowHeight - self.bannerAd.style.realHeight
                })
                this.bannerAd.show();
                this.bannerAd.onError(err => {
                  console.log(err);
                  //无合适广告
                  if (err.errCode == 1004){

                  }
                })
            }
            if (this._iLife == 0 && this._iDiff != 0)
                this.sendDataToWX();
        }
        if (sName == "win"){
            if (GLB.iType == 1)
                this.showResult();
            else if (GLB.iType == 0)
                this.showWinResult();
            if (window.wx){
                var idx = -1;
                if (this._iDiff == 1)
                    idx = 5;
                else if (this._iDiff == 2)
                    idx = 7;
                if (idx != -1){
                    var self = this;
                    var openDataContext = wx.getOpenDataContext();
                    openDataContext.postMessage({
                        iType: idx,
                        cost: self._iTime.toFixed(2),
                    });
                }
            }
        }
        if (this.bSound == false)
            return;
        var t = {bomb: this.bombClip, check: this.checkClip, click: this.clickClip, win: this.winClip, lose: this.loseClip};
        t[sName].play();
        // var url = cc.url.raw("resources/audio/"+sName+".mp3");
        // cc.audioEngine.play(url, false, 1);
    },

    playTips(str){
        var lab = this.tips.children[0];
        lab.getComponent(cc.Label).string = str;
        this.tips.opacity = 255;
        this.tips.runAction(cc.fadeOut(3));
    },

    showMineCount(iMineCount){
        this.labLeftMine.string = iMineCount.toString();
    },

    getMineCount(){
        return this._iMineCount;
    },

    setMineCount(iNum){
        this._iMineCount += iNum;
        this.showMineCount(this._iMineCount);
    },

    onEnd(){
        for (var i = 0; i < this._tMine.length; i++) {
            this._tBtns[this._tMine[i]] = 0;
        };
        this._tileMap.showBtns(this._tBtns);
        this._bGameOver = true;
        this.bPlayTime = false;
    },

    onClickMode(){
        this._iMode = 1 - this._iMode;
        if (GLB.iLang == "zh")
            this.labType.string = this._iMode == 0 ? "翻开" : "插旗";
        else if (GLB.iLang == "en")
            this.labType.string = this._iMode == 0 ? "Open" : "Flag";
        this.labType.node.color = this._iMode == 0 ? cc.Color.BLACK : new cc.Color(160, 50, 40);
    },

    getMode(){
        return this._iMode;
    },

    getITime(){
        return this._iTime.toFixed(2);
    },
});
