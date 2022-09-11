const {ccclass, property} = cc._decorator;

import {GLB} from "./GLBConfig";
import {WS} from "./Socket";
//gid 1-btn 2-mine 3-flag 4-null 5-12-num 13-redmine 14-15-鼠标悬停时的按钮以及按下时的按钮

//文字内容
let GuidStepInfo = ["点击【开始】进行游戏", 
                    "【2】意味着该格子相邻的格子共有2个地雷", 
                    "点击空格翻开格子", 
                    "翻到地雷游戏结束，点击【开始】重新进行游戏", 
                    "长按格子0.2秒插旗，插旗的格子无法翻开，长按插旗的格子可收回旗帜", 
                    "【9】表示当前还剩下9个旗帜，旗帜的数量=地雷的数量",
                    "在剩下的1个(地雷)格子上也插上旗帜",
                    "当数字相邻的旗帜总和=数字时，点击数字可翻开相邻未插上旗帜的格子",
                    "翻开所有非地雷的格子获得胜利！"
                ];
//遮罩的位置，即要展示的内容的坐标位置
let GuideStepPos = [cc.v2(-255, -573), cc.v2(-140, 280), cc.v2(-210, 280), cc.v2(-255, -573), cc.v2(-210, 280), cc.v2(-245, 600), cc.v2(-210, 210), cc.v2(-140, 210), cc.v2(0, 0)];
//遮罩的大小，即要展示的内容的长宽大小
let GuideStepSize = [cc.size(130, 80), cc.size(70, 70), cc.size(70, 70), cc.size(130, 80), cc.size(70, 70), cc.size(70, 70), cc.size(70, 70), cc.size(70, 70), cc.size(0, 0)];

@ccclass
export default class Main extends cc.Component {

    @property(cc.Node)
    ndGuideStep: cc.Node = null;

    @property(cc.Node)
    ndBg: cc.Node = null;

    @property(cc.Node)
    tips: cc.Node = null;

    @property(cc.Node)
    mineMap: cc.Node = null;

    @property(cc.Node)
    midMineMap: cc.Node = null;

    @property(cc.Node)
    bigMineMap: cc.Node = null;

    @property(cc.Node)
    midScv: cc.Node = null;

    @property(cc.Node)
    bigScv: cc.Node = null;

    @property(cc.Node)
    togs: cc.Node = null;

    @property(cc.Node)
    goResult: cc.Node = null;

    @property(cc.Node)
    ndBack: cc.Node = null;

    @property(cc.Label)
    labTime: cc.Label = null;

    @property(cc.Label)
    labLeftMine: cc.Label = null;

    @property(cc.Label)
    labType: cc.Label = null;

    @property({
        type: cc.AudioClip
    })
    bombClip: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    checkClip: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    clickClip: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    winClip: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    loseClip: cc.AudioClip = null;
    
    bPlayTime: boolean;
    bPlayback: boolean;
    _iTime: number;
    iPlaybackTime: number;
    iPBidx: number;
    _smTileMap: any;
    _midTileMap: any;
    _bigTileMap: any;
    bSound: boolean;
    _iMode: number;
    _iDiff: number;
    _dx: number;
    _iShowX: number;
    _iShowY: number;
    midPreOff: cc.Vec2;
    bigPreOff: cc.Vec2;
    bScale: boolean;
    tPBBtns: any[];
    tPBFlags: any[];
    _tileMap: any;
    _tBtns: any;
    _tFlag: any;
    sPBMineNum: string;
    iPBNum: string;
    offPos: cc.Vec2;
    _iRow: number;
    _iLine: number;
    coPlayTime: any;
    _bGameOver: boolean;
    _iMineCount: number;
    _iTotal: number;
    _tNum: any[];
    _layerBtn: any;
    _layerFlag: any;
    _mouse: cc.Node;
    tPB: any[];
    UserInfoButton: any;
    _bannerAd: any;
    _interstitialAd: any;
    _bForce: boolean = false;
    _recorder: any;
    _videoPath: any;
    _bUpdateBanner: boolean = false;
    _iBannerTime: number = 0;
    _clipIndexList: any[];
    _videoShareBtn: any;
    _bGuide: boolean = false; //是否要进行引导
    _iGuide: number = 0; //引导步骤的索引

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initCanvas();
        this.initParas();
        this.initEvent();
        this.initShow();
    }

    initCanvas(){
        var canvas = this.node.getComponent(cc.Canvas);
        var size = canvas.designResolution;
        var cSize = cc.view.getFrameSize();
        if (cc.sys.os == cc.sys.OS_IOS){ //刘海屏判断
            GLB.bSpView = (cSize.width == 414 && cSize.height == 896)||(cSize.width == 375 && cSize.height == 812)||
            (cSize.width == 390 && cSize.height == 844)||(cSize.width == 428 && cSize.height == 926);
        }
        else if((cc.sys.os == cc.sys.OS_ANDROID)){
            // if (cSize.height/cSize.width > 16/9) GLB.bSpView = true;
            GLB.bSpView = (cSize.width == 363 && cSize.height == 797);
        }
        // cc.find("goTop/lab", this.node).getComponent(cc.Label).string = cSize.width+"|"+cSize.height;
        // cc.log("initCanvas=",cSize.width,cSize.height);
        // console.log("111",cSize.width,cSize.height);
        if (GLB.bSpView){
            canvas.fitWidth = true;
            canvas.fitHeight = true;
        }else if (cSize.width/cSize.height >= size.width/size.height){
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }else{
            canvas.fitWidth = true;
            canvas.fitHeight = false;
        }
    }

    update (dt) {
        if (this.bPlayTime == true){
            this._iTime+=dt;
            this.labTime.string = this.getITime().toString();
            if (this.bPlayback == true && this._iTime >= this.iPlaybackTime){
                this.showPlayback(this.iPBidx);
                this.iPBidx++;
                this.iPlaybackTime = this.getPlaybackTime(this.iPBidx);
            }
        }
        // if (this._bUpdateBanner){
        //     this._iBannerTime+=dt;
        //     if (this._iBannerTime > 45 && this._bannerAd){
        //         this._bannerAd.destroy();
        //         this._bannerAd = null;
        //         this.onWxEvent("initBanner");
        //         this._iBannerTime = 0;
        //         if (this.goResult.active == true && this._bannerAd) this._bannerAd.show();
        //     }
        // }
    }

    initParas(){
        this._smTileMap = this.mineMap.getComponent("MineMap");
        this._smTileMap._delt = this;
        this._midTileMap = this.midMineMap.getComponent("MineMap");
        this._midTileMap._delt = this;
        this._bigTileMap = this.bigMineMap.getComponent("MineMap");
        this._bigTileMap._delt = this;
        this.bSound = true;
        this._iMode = 0;

        this._tNum = [];
        this._tFlag = [];
        this._tBtns = [];

        this._iDiff=0; //实际为单选按钮选择的难度
        this._dx = 70;
        this._iShowX = 9;
        this._iShowY = 12;
        this.bPlayTime = false;
        this.midPreOff = cc.v2(-50, 300);
        this.bigPreOff = cc.v2(-50, 1790);
        this.bScale = false;
        this._iTime = 0;

        if (GLB.iType == 1) {
            this._iDiff = GLB.iDiff;
            this.tPB = [];
        }else if (GLB.iType == 2){
            this._iDiff = GLB.iDiff;
            this.tPBBtns = [];
            this.tPBFlags = [];
            this.bPlayback = true;
            this.iPBidx = 2;
            this.iPlaybackTime = this.getPlaybackTime(this.iPBidx); //playbackData中一步的时间
        }
    }

    initEvent(){
        var self = this;
        let guide = cc.find("guide", this.node);
        // cc.sys.localStorage.removeItem('guide');
        cc.find("cancel", guide).on("click", function (argument) {
            this.playSound("click");
            guide.active = false;
            cc.sys.localStorage.setItem('guide', true);
            this.onStart();
        }, this);
        cc.find("sure", guide).on("click", function (argument) {
            this.playSound("click");
            guide.active = false;
            this._bGuide = true;
            this.showGuide(false);
            this.showGuideStep();
        }, this);
        cc.find("goTop/mine/lab", this.node).on("click", function (argument) {
            if (this._bGuide && this._iGuide == 6) this.showGuideStep();
        }, this);
        var btns = cc.find("btns", this.node);
        cc.find("sure", this.goResult).on("click", function (argument) {
            self.playSound("click");
            this.onWxEvent("hideBanner");
            if (this._videoShareBtn != null) this._videoShareBtn.hide();
            this.goResult.active = false;
        }, this);
        var normal = cc.find("normal", btns);
        cc.find("start", normal).on("click", function (argument) {
            this.onStart();
            if (this._bGuide){
                if (this._iGuide == 1 || this._iGuide == 4){
                    this.showGuideStep();
                }
            }
        }, this);
        cc.find("scale", normal).on("click", function (argument) {
            this.onScale();
        }, this);
        cc.find("diff", normal).on("click", function (argument) {
            self.togs.active = !self.togs.active;
        }, this);
        cc.find("type", normal).on("click", function (argument) {
            self.onClickMode();
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
            this.showBtns();
            this.showFlags();
            var sData = GLB.tPlaybackData[self.iPBidx];
            var iDot = sData.indexOf(".");
            var idx = sData.substring(1, iDot);
            this.iPlaybackTime = sData.substring(iDot+1); //时间重置1
            if (sData[0] == 1)
                this.setMineCount (2*tFlag[idx]-1);
            sData = GLB.tPlaybackData[self.iPBidx-1];
            iDot = sData.indexOf(".");
            this._iTime = this.iPBidx == 2 ? 0 : parseFloat(sData.substring(iDot+1));
            this.labTime.string = this.iPBidx == 2 ? "0.00" : this._iTime.toString();
            if (iDot != -1){
                idx = sData.substring(1, iDot);
                this._tileMap.setMousePos(idx % this._iRow, Math.floor (idx / this._iRow));
            }else
                this._tileMap.hideMouse();
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
            this.onRedo(ndStop, ndPlay);
        }, this);
        this.ndBack.on("click", function (argument) {
            this.playSound("click");
            if (window.tt && !GLB.userInfo){
                if (this._bForce && !GLB.OpenID) this.onWxEvent("login");
                else this.onWxEvent("ttAuth");
            }else cc.director.loadScene("Challenge");
        }, this);
        var ndSound = cc.find("sub/sound", btns);
        ndSound.on("click", function (argument) {
            self.bSound = !self.bSound;
            if (self.bSound == true){
                ndSound.color = cc.Color.WHITE;
                self.playSound("click");
            } else
                ndSound.color = cc.Color.GRAY;
        }, this);

        if (cc.sys.platform === cc.sys.WECHAT_GAME){
            let share = cc.find("sub/share", btns);
            share.active = true;
            share.on("click", function (argument) {
                this.playSound("click");
                this.onWxEvent("share");
            }, this);
            this.onWxEvent("initBanner");
            this.onWxEvent("login");
            this.onWxEvent("initInterstitial");

            if (window.tt){
                tt.onShareAppMessage(function (res){
                    console.log(res.channel);
                    // do something
                    return {
                        title: '扫雷大神集锦！',
                        imageUrl: '/resource/ttshare.jpg',
                        //   query: 'k1=v1&k2=v2',
                        success() {
                            console.log('分享成功')
                        },
                        fail(e) {
                            console.log('分享失败', e)
                        }
                    }
                });
                let shareVideo = cc.find("share", this.goResult);
                shareVideo.active = true;
                shareVideo.on("click", function (params) {
                    this.playSound("click");
                    // if (!window.tt){ //微信设备不支持处理
                    //     let recorder = wx.getGameRecorder();
                    //     if (!recorder.isFrameSupported()) this.playTips("设备不支持");
                    //     return;
                    // }
                    this.onWxEvent("shareVideo");
                }, this);

                this.onWxEvent("initVideoRecord");
            }else {
                // this.onWxEvent("initVideoShareBtn");
            }
        }
    }

    initShow(){
        this.goResult.active = false;
        this.midScv.active = false;
        this.bigScv.active = false;
        var normal = cc.find("btns/normal", this.node);
        var back = cc.find("btns/sub/back", this.node);
        var diff = cc.find("diff", normal);
        var start = cc.find("start", normal);
        var type = cc.find("type", normal);
        if (GLB.iType == 0){
            this.ndBg.color = new cc.Color(122, 122, 122);
            normal.active = true;
            diff.active = true;
            start.active = true;
            type.active = true;
            this.labTime.node.active = true;
            back.active = true;
            let bGuided = cc.sys.localStorage.getItem("guide")
            if (!bGuided) {
                cc.find("guide", this.node).active = true;
                return;
            }
        }else if (GLB.iType == 1){
            this.ndBg.color = new cc.Color(68, 107, 107);
            diff.active = false;
        }else if (GLB.iType == 2){
            this.ndBg.color = new cc.Color(68, 107, 107);
            diff.active = false;
            start.active = false;
            type.active = false;
            cc.find("scale", normal).active = false;
        }
        let self = this;
        this.labTime.scheduleOnce(function (argument) {
            self.onStart();
        }, 0.01)
    }

    //引导界面的处理
    showGuideStep(){
        this.ndGuideStep.active = true;
        this.ndGuideStep.getChildByName("lab").getComponent(cc.Label).string = GuidStepInfo[this._iGuide];
        let mask = this.ndGuideStep.getChildByName("mask");
        let spt = mask.getChildByName("spt");
        mask.setContentSize(GuideStepSize[this._iGuide]);
        mask.setPosition(GuideStepPos[this._iGuide]);
        spt.setPosition(cc.v2(-GuideStepPos[this._iGuide].x, -GuideStepPos[this._iGuide].y));
        this._iGuide++;
        if (this._iGuide == 9){
            let self = this;
            this.labTime.scheduleOnce(function (argument) {
                self.ndGuideStep.active = false;
            }, 3)
        }
    }

    showGuide(b){
        let normal = cc.find("btns/normal", this.node);
        cc.find("diff", normal).active = b;
        cc.find("type", normal).active = b;
        cc.find("btns/sub/back", this.node).active = b;
    }

    onRedo(ndStop, ndPlay){
        var self = this;
        if (this.iPBidx > GLB.tPlaybackData.length-1)
            return;
        if (GLB.iType == 2 && ndStop.active == true){
            this.bPlayTime = false;
            ndPlay.active = true;
            ndStop.active = false;
        }
        var sData = GLB.tPlaybackData[self.iPBidx];
        var iDot = sData.indexOf(".");
        this._iTime = parseFloat(sData.substring(iDot+1)); //时间重置2
        self.labTime.string = this._iTime.toString();
        self.onPlaybackEvent(sData[0], sData.substring(1, iDot));
        self.tPBBtns.push(self._tBtns.slice(0));
        self.tPBFlags.push(self._tFlag.slice(0));
        this.iPBidx++;
        this.iPlaybackTime = this.getPlaybackTime(this.iPBidx);
    }

    //iType 0正常翻，1插旗，2点数字
    onPlaybackEvent(iType, idx){
        var iR = idx % this._iRow;
        var iL = Math.floor (idx / this._iRow);
        this._tileMap.setMousePos(iR, iL);
        if (iType == 0){
            // this.playSound("check");
            this.showGrids(idx);
            this.showBtns();
            this.showWin();
        } else if (iType == 1){
            this.playSound("check");
            this.onFlagEvent(idx);
        } else if (iType == 2){
            this.onClickNum(idx);
        }
    }

    showResult(){
        this.goResult.active = true;
        var sTitle = "成功";
        var score = GLB.tScore[this._iDiff];
        if (score && this._iTime >= score){
            sTitle = "失败";
        }else {
            var strStepInfo = WS.getStrPBStepInfo(this.tPB);
            if (strStepInfo != ""){
                //因为redis zadd精度问题这里时间*100
                var iTime = parseFloat(this._iTime.toFixed(2));
                var str = this._iDiff.toString() + "|" + GLB.OpenID + "|" + (iTime*100) + "|"
                + this.sPBMineNum + "|" + this.iPBNum + "|" + strStepInfo;
                WS.sendMsg(GLB.SET_STEP, str);
            }
        }
        if (score == null)
            score = "无";
        cc.find("labResult", this.goResult).getComponent(cc.Label).string = sTitle;
        cc.find("preCost", this.goResult).getComponent(cc.Label).string = score.toString();
        cc.find("cost", this.goResult).getComponent(cc.Label).string = this._iTime.toFixed(2).toString();
        this.onWxEvent("stopVideo");
        this.onWxEvent("showBanner");
        if (this._interstitialAd != null) {
            if (Math.random() > 0.66) this.onWxEvent("showInterstitial");
        }
        if (this._videoShareBtn != null) this._videoShareBtn.show();
    }

    showNormalResult(iType){
        this.goResult.active = true;
        var sTitle = iType == 1 ? "成功" : "失败";
        cc.find("labResult", this.goResult).getComponent(cc.Label).string = sTitle;
        cc.find("preCost", this.goResult).active = false;
        cc.find("cost", this.goResult).getComponent(cc.Label).string = this._iTime.toFixed(2).toString();
        this.onWxEvent("stopVideo");
        this.onWxEvent("showBanner");
        if (this._bGuide){
            if (iType == 1){
                this._bGuide = false;
                cc.sys.localStorage.setItem('guide', true);
                this.showGuide(true);
                if (this._interstitialAd != null) this.onWxEvent("showInterstitial");
            }
        }else if (this._interstitialAd != null) {
            if (Math.random() > 0.66) this.onWxEvent("showInterstitial");
        }
        if (this._videoShareBtn != null) this._videoShareBtn.show();
    }

    onScale(){
        if (this._iDiff == 0) return;
        var scv = this._iDiff == 1 ? this.midScv.getComponent(cc.ScrollView) : this.bigScv.getComponent(cc.ScrollView);
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
    }

    onStart(){
        this.reset();
        this.initMines(); //2有特殊处理
        this.showFlags();
        if (window.tt) {
            this.onWxEvent("startVideo");
            if (GLB.iType != 2) this._tileMap.hideMouse();
        }
        if (GLB.iType == 2){
            this.initStartShow(parseInt(GLB.tPlaybackData[1]));
            this.tPBBtns.push(this._tBtns.slice(0));
            this.tPBFlags.push(this._tFlag.slice(0));
            var self = this;
            self.onScale();
            if (GLB.iType == 2){
                this.labTime.scheduleOnce(function (argument) {
                    cc.find("btns/playback", self.node).active = true;
                }, 0.5);
            }
        }else {
            if (GLB.iType == 0){
                this.bPlayTime = false;
                this.labTime.string="00:00";
                this.playTime();
            }else if (this.bPlayTime == false)
                this.bPlayTime = true;
            this.initGridShow();
        }
    }

    getPlaybackTime(idx){
        var sData = GLB.tPlaybackData[idx];
        if (sData == null) return;
        return sData.substring(sData.indexOf(".")+1);
    }

    showPlayback(idx){
        var sData = GLB.tPlaybackData[idx];
        if (sData == null) return;
        var iNum = sData.indexOf(".");
        this.labTime.string = sData.substring(iNum+1).toString();
        this.onPlaybackEvent(sData[0], sData.substring(1, iNum));
        this.tPBBtns.push(this._tBtns.slice(0));
        this.tPBFlags.push(this._tFlag.slice(0));
        if (idx >= GLB.tPlaybackData.length-1){
            this.bPlayTime = false;
        };
    }

    showBtns(){
        for (let i = 0; i < this._iTotal; i++) {
            let row = i % this._iRow;
            let line = Math.floor(i/this._iRow);
            if (this._tBtns[i] == 1){
                this._layerBtn.setTileGIDAt(1, row, line);
            }else if (this._tNum[i] == -1){
                this._layerBtn.setTileGIDAt(2, row, line);
            }else{
                this._layerBtn.setTileGIDAt(4+this._tNum[i], row, line);
            }
        }
        this._layerBtn._cullingDirty = true;
    }

    showEndBtns(){
        for (let i = 0; i < this._iTotal; i++) {
            let row = i % this._iRow;
            let line = Math.floor(i/this._iRow);
            if (this._tNum[i] == -1){
                this._layerBtn.setTileGIDAt(2, row, line);
            }else if (this._tBtns[i] == 1){
                this._layerBtn.setTileGIDAt(1, row, line);
            }else{
                this._layerBtn.setTileGIDAt(4+this._tNum[i], row, line);
            }
        }
        this._layerBtn._cullingDirty = true;
    }

    onFlagEvent(idx){
        if (this._tFlag[idx] == 0 && this._iMineCount == 0 || this._tBtns[idx] == 0) return;
        this.playSound("check");
        this._tFlag[idx] = 1 - this._tFlag[idx];
        if (this._tFlag[idx] == 0){
            this.setMineCount(1);
        }else this.setMineCount(-1);
        let row = idx % this._iRow;
        let line = Math.floor(idx/this._iRow);
        this._layerFlag.setTileGIDAt(4-this._tFlag[idx], row, line);
        if (GLB.iType == 1){
            var str = "1" + idx.toString() + "." + this.getITime();
            this.tPB.push(str);
        }
        this._layerFlag._cullingDirty = true;
        if (this._bGuide){
            if (this._iGuide == 5 || this._iGuide == 7){
                this.showGuideStep();
            }
        }
    }

    showFlags(){
        for (let i = 0; i < this._iTotal; i++) {
            let row = i % this._iRow;
            let line = Math.floor(i/this._iRow);
            this._layerFlag.setTileGIDAt(4-this._tFlag[i], row, line);
        }
        this._layerFlag._cullingDirty = true;
    }

    showRedMine(idx){
        let row = idx % this._iRow;
        let line = Math.floor(idx/this._iRow);
        this._layerBtn.setTileGIDAt(13, row, line);
    }

    showNormalColor(idx){
        let row = idx % this._iRow;
        let line = Math.floor(idx/this._iRow);
        // cc.log("normal idx = ", idx);
        this._layerBtn.setTileGIDAt(1, row, line);
        this._layerBtn._cullingDirty = true;
    }

    showHighlightedColor(idx){
        let row = idx % this._iRow;
        let line = Math.floor(idx/this._iRow);
        // cc.log("highlight idx = ", idx);
        this._layerBtn.setTileGIDAt(14, row, line);
        this._layerBtn._cullingDirty = true;
    }

    showPressedColor(idx){
        let row = idx % this._iRow;
        let line = Math.floor(idx/this._iRow);
        // cc.log("pressed idx = ", idx);
        this._layerBtn.setTileGIDAt(15, row, line);
        this._layerBtn._cullingDirty = true;
    }

    onClick(idx){
        if (!this._bGameOver) {
            if (this._tBtns[idx] == 0 && this._tNum[idx] > 0) { //数字
                if (GLB.iType == 1){
                    var str = "2" + idx.toString() + "." + this.getITime();
                    this.tPB.push(str);
                }
                this.onClickNum(idx);
            } else if (this._iMode == 0){
                if (this._tFlag[idx] == 0){
                    if (this._tNum[idx] == -1){ //地雷
                        this.onEnd();
                        this.showRedMine(idx);
                        this.playSound("bomb");
                        if (this._bGuide) {
                            this._iGuide = 3;
                            this.showGuideStep();
                        }
                    }else if (this._tBtns[idx] == 1){ //格子
                        if (GLB.iType == 1){
                            var str = "0" + idx.toString() + "." + this.getITime();
                            this.tPB.push(str);
                        }
                        // this.playSound("check");
                        this.showGrids(idx);
                        this.showBtns();
                        this.showWin();
                    }
                }
            }else{
                this.onFlagEvent(idx);
            }
            if (window.tt && GLB.iType != 2){
                let iR = idx % this._iRow;
                let iL = Math.floor (idx / this._iRow);
                this._tileMap.setMousePos(iR, iL);
            }
        }
    }

    reset(){
        if (GLB.iType == 0 && this.coPlayTime){
            this.labTime.unschedule(this.coPlayTime);
        }
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
        var scale = cc.find("btns/normal/scale", this.node);
        if (this._iDiff == 0){
            this._iMineCount = 10;
            this._iRow = this._iLine = 9;
            this._tileMap = this._smTileMap;
            this.midScv.active = false;
            this.mineMap.active = true;
            this.bigScv.active = false;
            scale.active = false;
        }else if (this._iDiff == 1){
            this._iMineCount = 40;
            this._iRow = this._iLine = 16;
            this._tileMap = this._midTileMap;
            this.midScv.active = true;
            this.mineMap.active = false;
            this.bigScv.active = false;
            if (GLB.iType != 2) scale.active = true;
        }else if (this._iDiff == 2){
            this._iMineCount = 99;
            this._iRow = 16;
            this._iLine = 30;
            this._tileMap = this._bigTileMap;
            this.midScv.active = false;
            this.mineMap.active = false;
            this.bigScv.active = true;
            if (GLB.iType != 2) scale.active = true;
        }
        let map = this._tileMap.node.getComponent(cc.TiledMap);
        this._layerBtn = map.getLayer("btn");
        this._layerFlag = map.getLayer("flag");
        // this._mouse = this._tileMap.node.getChildByName('mouse');
        // this._mouse.active = false;
        this._iTotal = this._iRow * this._iLine;
        this.showMineCount(this._iMineCount);
    }

    initMines(){
        let tNum = [];
        let tMineNum = [];
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
            if (this._bGuide){
                for (let i = 0; i < this._iRow; i++){
                    if (i == 2) tMineNum[0] = 1;
                    else if (i == 6) tMineNum[this._iRow*(this._iLine-1)] = 1;
                    else tMineNum[this._iLine*i+1] = 1;
                }
                tMineNum[43] = 1;
            }else{
                for (var i = 0; i < this._iMineCount; i++) {
                    var iRandom = Math.floor(Math.random() * (tNum.length - 1));
                    let iNum = tNum.splice(iRandom, 1)[0];
                    tMineNum[iNum] = 1;
                };
            }
            if (GLB.iType == 1) this.sPBMineNum = WS.getStrPBMineNum(tMineNum);
        }
        for (var k = 0; k < this._iTotal; k++) {
            if (tMineNum [k] == 1) {
                this._tNum[k] = -1;
                let row = k % this._iRow;
                let line = Math.floor(k / this._iRow);
                for (let i = row-1; i < row+2; i++) for (let j = line-1; j < line+2; j++) {
                    if (i > -1 && j > -1 && i < this._iRow && j < this._iLine){
                        let idx = this._iRow*j+i;
                        if (this._tNum[idx] != -1) this._tNum[idx]++;
                    }
                }
            }
        };
    }

    playTime(){
        var self = this;
        this.coPlayTime = function (argument) {
            self.labTime.string = self.getStrTime(++self._iTime);
        }
        this.labTime.schedule(this.coPlayTime, 1);
    }

    getStrTime(iTime){
        let iM = Math.floor(iTime/60);
        let iS = iTime%60;
        let str = "";
        if (iM < 10) str += "0";
        str += iM.toString()+":";
        if (iS < 10) str += "0";
        str += iS.toString();
        return str;
    }

    initGridShow(){
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
    }

    initStartShow(iNum){
        // this.playSound("check");
        this.showGrids(iNum);
        this.showBtns();
        if (this._iDiff != 0){
            var iR = iNum % this._iRow;
            var iL = Math.floor(iNum/this._iRow);
            var iRLimit = this._iRow - this._iShowX;
            var iLLimit = this._iLine - this._iShowY;
            if (iR > iRLimit)
                iR = iRLimit;
            if (iL > iLLimit)
                iL = iLLimit;
            var scv = this._iDiff == 1 ? this.midScv.getComponent(cc.ScrollView) : this.bigScv.getComponent(cc.ScrollView);
            if (this.bScale == false)
                scv.scrollToOffset(cc.v2(this._dx * iR, this._dx * iL), 0);
            this.offPos = cc.v2(this._dx * iR, this._dx * iL);
        }
        this.showWin();
    }

    showGrids(idxNum){
        let _iRow = this._iRow;
        let iLabNum = this._tNum [idxNum];
        if (iLabNum != -1) {
            this._tBtns[idxNum] = 0;
            if (iLabNum == 0) {
                let iMine = parseInt(idxNum);
                let line = Math.floor (iMine / _iRow);
                let row = iMine % _iRow;
                for (let x = row-1; x < row+2; x++) for (let y = line-1; y < line+2; y++) {
                    if (x >= 0 && y >= 0 && x < _iRow && y < this._iLine){
                        let idx = _iRow*y+x;
                        if (this._tBtns[idx] == 1 && this._tFlag[idx] == 0) this.showGrids(idx);
                    }
                }
            }
        }
    }

    onClickNum(idxNum){
        if (this._bGuide && this._iGuide == 2){
            this.showGuideStep();
            return;
        }
        let _iRow = this._iRow;
        let iMine = parseInt(idxNum);
        let line = Math.floor (iMine / _iRow);
        let row = iMine % _iRow;
        //统计标记的地雷数量，标错return;
        var iShowNum = 0;
        for (let x = row-1; x < row+2; x++) for (let y = line-1; y < line+2; y++) {
            if (x >= 0 && y >= 0 && x < _iRow && y < this._iLine){
                let idx = _iRow*y+x;
                if (this._tFlag[idx] == 1) iShowNum++;
            }
        }
        //判断地雷是否均被标记
        if (this._tNum[idxNum] != iShowNum) return;
        //展开地图
        for (let x = row-1; x < row+2; x++) for (let y = line-1; y < line+2; y++) {
            if (x >= 0 && y >= 0 && x < _iRow && y < this._iLine){
                let idx = _iRow*y+x;
                if (this._tFlag[idx] == 0){
                    if (this._tNum[idx] == -1){
                        this._tBtns[idx] = 0;
                        this.onEnd();
                        this.showRedMine(idx);
                        this.playSound("bomb");
                        return;
                    }
                    if (this._tBtns[idx] == 1) this.showGrids (idx);
                }
            }
        }
        this.showBtns();
        this.showWin();
        if (this._bGuide && this._iGuide == 8){
            this.showGuideStep();
        }
    }

    showWin(){
        var bWin = true;
        for (var i = 0; i < this._iTotal; i++) {
            if (this._tNum[i] != -1 && this._tBtns[i] == 1) {
                bWin = false;
                break;
            }
        }
        if (bWin == true) {
            this.onEnd ();
            this.playSound("win");
        }else{
            this.playSound("check");
        }
    }

    getBGameOver(){
        return this._bGameOver;
    }

    playSound(sName){
        if (this.bSound){
            let t = {bomb: this.bombClip, check: this.checkClip, click: this.clickClip, win: this.winClip, lose: this.loseClip};
            cc.audioEngine.play(t[sName], false, 1);
        }
        if (sName == "win"){
            if (GLB.iType == 1)
                this.showResult();
            else if (GLB.iType == 0)
                this.showNormalResult(1);
        }else if (sName == "bomb")
            this.showNormalResult(0);
    }

    playTips(str){
        var lab = this.tips.children[0];
        lab.getComponent(cc.Label).string = str;
        this.tips.opacity = 255;
        this.tips.runAction(cc.fadeOut(3));
    }

    showMineCount(iMineCount){
        this.labLeftMine.string = iMineCount.toString();
    }

    setMineCount(iNum){
        this._iMineCount += iNum;
        this.showMineCount(this._iMineCount);
    }

    onEnd(){
        this.showEndBtns();
        this._bGameOver = true;
        if (GLB.iType == 0){
            this.labTime.unschedule(this.coPlayTime);
        }else this.bPlayTime = false;
    }

    onClickMode(){
        this._iMode = 1 - this._iMode;
        this.labType.string = this._iMode == 0 ? "翻开" : "插旗";
        this.labType.node.color = this._iMode == 0 ? cc.Color.BLACK : new cc.Color(160, 50, 40);
    }

    getITime(){
        return this._iTime.toFixed(2);
    }

    onWxEvent(s){
        if (cc.sys.platform !== cc.sys.WECHAT_GAME) return;
        let self = this;
        switch(s){
            case "initBanner": //横屏广告
                //tt广告刷新处理
                // if (window.tt) {
                //     this._bannerAd = null;
                // }
                if (this._bannerAd == null){
                    if (window.tt){
                        const {
                            windowWidth,
                            windowHeight,
                        } = tt.getSystemInfoSync();
                        var targetBannerAdWidth = 200;
                        
                        // 创建一个居于屏幕底部正中的广告
                        let bannerAd = tt.createBannerAd({
                            adUnitId: 'm2j65emdb9c1amndbh',
                            style: {
                                width: targetBannerAdWidth,
                                top: windowHeight - (targetBannerAdWidth / 16 * 9), // 根据系统约定尺寸计算出广告高度
                            },
                        });
                        // 也可以手动修改属性以调整广告尺寸
                        bannerAd.style.left = (windowWidth - targetBannerAdWidth) / 2;
                        
                        // 尺寸调整时会触发回调
                        // 注意：如果在回调里再次调整尺寸，要确保不要触发死循环！！！   
                        bannerAd.onResize(size => {
                            // console.log(size.width, size.height);
                        
                            // 如果一开始设置的 banner 宽度超过了系统限制，可以在此处加以调整
                            if (targetBannerAdWidth != size.width) {
                                targetBannerAdWidth = size.width;
                                bannerAd.style.top = windowHeight - (size.width / 16 * 9);
                                bannerAd.style.left = (windowWidth - size.width) / 2;
                            }
                        });
                        this._bannerAd = bannerAd;
                        // this._bUpdateBanner = true;
                    }else {
                        var systemInfo = wx.getSystemInfoSync();
                        this._bannerAd = wx.createBannerAd({
                            adUnitId: "adunit-24778ca4dc4e174a",
                            adIntervals: 30,
                            style: {
                                left: 0,
                                top: systemInfo.windowHeight - 144,
                                width: 720,
                            }
                        });
                        this._bannerAd.onResize(res => {
                            if (self._bannerAd != null)
                                self._bannerAd.style.top = systemInfo.windowHeight - self._bannerAd.style.realHeight;
                        })
                    }
                    this._bannerAd.onError(err => {
                        console.log(GLB.getTime()+"bannerAd err");
                        console.log(err);
                        //无合适广告
                        if (err.errCode == 1004){

                        }
                    })
                    this._bannerAd.hide();
                }
                break;
            case "auth": //授权/获取用户信息
                wx.getSetting({
                    success(res) {
                        if (!res.authSetting['scope.userInfo']) {
                            if (window.tt) return;

                            let size = cc.view.getFrameSize();
                            let dSize = self.node.getComponent(cc.Canvas).designResolution;
                            let pix = 1;
                            if (size.width/size.height >= dSize.width/dSize.height){
                                pix = dSize.height/size.height;
                            }else pix = dSize.width/size.width;
                            let width = self.ndBack.width/pix, height = self.ndBack.height/pix;
                            // console.log(size, width, height, pix);
                            self.UserInfoButton = wx.createUserInfoButton({
                                type: 'text',
                                text: '',
                                withCredentials: GLB.withCredentials,
                                style: {
                                    left: self.ndBack.x/pix,
                                    top: size.height-self.ndBack.y/pix-height/2,
                                    width: width,
                                    height: height,
                                    // backgroundColor: '#ff0000',
                                }
                            })
                            self.UserInfoButton.onTap((res) => {
                                // console.log("Res = ", res);
                                if (res.userInfo){
                                    GLB.userInfo = res.userInfo;
                                    let str = GLB.OpenID+"&"+res.userInfo.nickName+"&"+res.userInfo.avatarUrl;
                                    if (WS.sendMsg(GLB.WXLOGIN, str)){
                                        self.UserInfoButton.hide();
                                        self.playSound("click");
                                        cc.director.loadScene("Challenge");
                                    }
                                }
                            })
                        }else{
                            wx.getUserInfo({
                                withCredentials: GLB.withCredentials,
                                success(res){
                                    // console.log("getUserInfo Res = ", res);
                                    GLB.userInfo = res.userInfo;
                                    let str = GLB.OpenID+"&"+GLB.userInfo.nickName+"&"+GLB.userInfo.avatarUrl;
                                    WS.sendMsg(GLB.WXLOGIN, str);
                                }
                            })
                        }
                        // if (window.tt) return;
                        // if (!res.authSetting["scope.record"]){
                        //     wx.authorize({
                        //         scope: "scope.record",
                        //         suceess(){
                        //             console.log("record auth suceess");
                        //         },
                        //         fail(){
                        //             console.log("record auth fail");
                        //         },
                        //     })
                        // }
                    }
                })
                break;
            case "login": //登陆
                // cc.sys.localStorage.setItem("OpenID", null);
                GLB.OpenID = cc.sys.localStorage.getItem("OpenID");
                // console.log("OpenID2 = ", GLB.OpenID, GLB.userInfo);
                if (GLB.OpenID){
                    if (!GLB.userInfo) this.onWxEvent("auth");
                }else {
                    wx.login({
                        force: self._bForce,
                        success (res) {
                            if (res.code) {
                                //发起网络请求
                                // console.log("code = ", res.code);
                                let code = res.code;
                                if (window.tt) code+="tttttt";
                                wx.request({
                                    // url: 'http://'+GLB.ip,
                                    url: "https://websocket.windgzs.cn",
                                    data: {
                                        code: code
                                    },
                                    success(response){
                                        // console.log("success response = ", response);
                                        console.log("OpenID = ", response.data);
                                        GLB.OpenID = response.data;
                                        cc.sys.localStorage.setItem("OpenID", response.data);
                                        self.onWxEvent("auth");
                                    },
                                    fail(response){
                                        console.log("fail response = ", response);
                                    }
                                })
                            } else if (res.anonymousCode || res.isLogin == false){
                                console.log("头条账号未登陆");
                                self._bForce = true;
                            }else{
                                console.log('登录失败！' + res.errMsg)
                            }
                        }
                    })
                }
                // wx.checkSession({ //用于检测SessionKey是否过期
                //     success () {
                //         //session_key 未过期，并且在本生命周期一直有效
                //         if (!GLB.userInfo) this.onWxEvent("auth");
                //     },
                //     fail () {
                //         // session_key 已经失效，需要重新执行登录流程
                        
                //     }
                // })
                break;
            case "ttAuth": //头条授权要做特殊处理
                tt.authorize({
                    scope: "scope.userInfo",
                    success(res){
                        // console.log("res = ", res);
                        self.onWxEvent("auth");
                    },
                    fail(res){
                        // console.log("fail res = ", res);
                        tt.openSetting();
                        // wx.openSetting
                    }
                })
                break;
            case "initInterstitial": //插屏广告，头条系列没有
                // 创建插屏广告实例，提前初始化
                if (wx.createInterstitialAd){
                    this._interstitialAd = wx.createInterstitialAd({
                        adUnitId: 'adunit-a844f91ff64bfc4f'
                    })
                }
                break;
            case "showInterstitial":
                // 在适合的场景显示插屏广告
                if (this._interstitialAd) {
                    this._interstitialAd.show().catch((err) => {
                        console.error(err)
                    })
                }
                break;
            case "initVideoRecord": //录屏功能，微信没有
                if (this._recorder == null){
                    if (window.tt){
                        this._recorder = tt.getGameRecorderManager();
                        this._recorder.onStart(res =>{
                            console.log(GLB.getTime()+'录屏开始');
                            self._videoPath = null;
                        })
                        this._recorder.onStop((res)=>{
                            console.log(GLB.getTime()+"onStop=", res.videoPath, this._iTime);
                            if (self._bGameOver == false) {
                                this.labLeftMine.scheduleOnce(function (params) {
                                    self._recorder.start({duration: 300 });
                                }, 0.1)
                                return;
                            }
                            if (this._iTime < 3) return;
                            self._videoPath = res.videoPath;
                        })
                        this._recorder.onError((res)=>{
                            console.log(GLB.getTime()+"err"+res.errMsg);
                            console.error(res);
                        })
                    }else{
                        this._recorder = wx.getGameRecorder();
                        this._recorder.on("start", ()=>{
                            console.log(GLB.getTime()+'录屏开始');
                            self._videoPath = null;
                        })
                        this._recorder.on("stop", (res)=>{
                            console.log(GLB.getTime()+"onStop=", res.tempFilePath, this._iTime);
                            if (this._iTime < 3) return;
                            self._videoPath = res.tempFilePath;
                        })
                        this._recorder.on("abord", ()=>{
                            self._recorder.start({duration: 600000 }); //ms 及6分钟
                        })
                    }
                }
                break;
            case "stopVideo":
                // console.log(GLB.getTime()+"stopVideo"+this._recorder);
                if (this._recorder) {
                    this.labLeftMine.scheduleOnce(function (params) {
                        if (self._iTime < 3) return;
                        console.log(GLB.getTime()+"stop");
                        self._recorder.stop();
                    }, 0.3);
                }
                break;
            case "startVideo":
                if (this._recorder) {
                    if (window.tt){
                        if (this._recorder._recording) this._recorder.stop();
                        else this._recorder.start({duration: 300 });
                    }else{
                        console.log(GLB.getTime()+"this._recorder=", this._recorder);
                        if (this._recorder._recording) this._recorder.abord();
                        else this._recorder.start({duration: 600000 });
                    }
                }
                break;
            case "shareVideo":
                if (this._iTime < 3){
                    this.playTips("录屏失败：录屏时长低于 3 秒");
                }else if (self._videoPath){
                    tt.shareAppMessage({
                        channel: 'video',
                        // title: '超变态的扫雷操作',
                        extra: {
                          videoPath: self._videoPath, // 可用录屏得到的视频地址
                        //   videoTopics: ['扫雷']
                        },
                        success() {
                          console.log('分享视频成功');
                        },
                        fail(e) {
                          console.log('分享视频失败', e.errMsg, self._videoPath);
                          if (e.errMsg.indexOf("short") != -1) self.playTips("分享视频失败，视频时间过短");
                        }
                    })
                    // tt.shareVideo({
                    //     videoPath: self._videoPath,
                    //     success(){
                    //         // console.log('分享视频成功');
                    //     },
                    //     fail(e){
                    //         // console.log('分享视频失败', e);
                    //     }
                    // })
                }else if(this._iTime > 300) this.playTips("录屏失败：录屏时长低于 5 分钟");
                else {
                    this.playTips("录屏失败：视频地址为空");
                }
                break;
            case "share": //分享
                if (window.tt){
                    tt.shareAppMessage({
                        // channel: "article",
                        title: "扫雷大神集锦！",
                        // extra: "超变态的扫雷大神集锦，神一般的操作看个爽！",s
                        // templateId: "a5e39j0j0ebb4kmv77",
                        imageUrl: "/resource/ttshare.jpg",
                    });
                }else{
                    wx.shareAppMessage({
                        title: "扫雷大神集锦！",
                        imageUrl: canvas.toTempFilePathSync({
                            destWidth: 500,
                            destHeight: 400
                        })
                    });
                }
                break;
            case "showBanner":
                // console.log(GLB.getTime()+"1"+this._bannerAd);
                // if (window.tt && this._bannerAd == null) this.onWxEvent("initBanner");
                // console.log(GLB.getTime()+"2"+this._bannerAd);
                if (this._bannerAd != null) this._bannerAd.show();
                // if (this._bannerAd != null) {
                //     if (window.tt) {
                //         this._bannerAd.destroy();
                //         this.labLeftMine.scheduleOnce(function (params) {
                //             self.onWxEvent("initBanner");
                //         }, 1);
                //     }else this._bannerAd.show();
                // }
                break;
            case "hideBanner":
                // if (this._bannerAd != null) {
                //     if (window.tt){
                //         this._bannerAd.destroy();
                //         this._bannerAd = null;
                //     }else this._bannerAd.hide();
                // }
                if (this._bannerAd != null) this._bannerAd.hide();
                break;
            // case "initVideoShareBtn":
            //     if (!self._videoShareBtn) {
            //         let size = cc.view.getFrameSize();
            //         let dSize = self.node.getComponent(cc.Canvas).designResolution;
            //         let pix = 1;
            //         if (size.width/size.height >= dSize.width/dSize.height){
            //             pix = dSize.height/size.height;
            //         }else pix = dSize.width/size.width;
            //         let videoShare = cc.find("share", this.goResult);
            //         let width = videoShare.width/pix, height = videoShare.height/pix;
            //         // console.log(size, width, height, pix);
            //         self._videoShareBtn = wx.createGameRecorderShareButton({
            //             share: {
            //                 bgm: "",
            //                 timeRange: [],
            //             },
            //             text: '',
            //             style: {
            //                 left: videoShare.x/pix,
            //                 top: size.height-videoShare.y/pix-height/2,
            //                 width: width,
            //                 height: height,
            //                 // backgroundColor: '#ff0000',
            //             }
            //         })
            //         self._videoShareBtn.onTap((res) => {
            //             console.log(GLB.getTime()+"shareVideo"+res);
            //         })
            //         self._videoShareBtn.hide();
            //     }
            //     break;
        }
    }
}
