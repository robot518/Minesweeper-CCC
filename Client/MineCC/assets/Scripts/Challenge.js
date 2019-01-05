var Login = require("Login");
var GLB = require('GLBConfig');
var WS = require("Socket");

cc.Class({
    extends: cc.Component,

    properties: {
        zhe: cc.Node,
        tips: cc.Node,
        scv: cc.Node,
        labTips: cc.Node,
        labName1: cc.Label,
        labName2: cc.Label,
        labName3: cc.Label,
        labScore1: cc.Label,
        labScore2: cc.Label,
        labScore3: cc.Label,
        labRank1: cc.Label,
        labRank2: cc.Label,
        labRank3: cc.Label,

        labJunior: cc.Label,
        labMiddle: cc.Label,
        labSenior: cc.Label,

        labName1No1: cc.Label,
        labName2No1: cc.Label,
        labName3No1: cc.Label,
        labScore1No1: cc.Label,
        labScore2No1: cc.Label,
        labScore3No1: cc.Label,
        labRank1No1: cc.Label,
        labRank2No1: cc.Label,
        labRank3No1: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    },

    start () {
        if (GLB.iLang == "zh")
            this.sShowStr = "无";
        else if (GLB.iLang = "en")
            this.sShowStr = "nil";
        this.initCanvas();
        this.initEvent();
        this.initShow();
        WS.sendMsg(GLB.GET_SCORE, GLB.sName, this);
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

    // update (dt) {},

    initEvent(){
        // for (var i = 0; i < 5; i++) {
        //     var iRandom = (Math.floor(Math.random() * 60));
        //     var sName = "哈"+iRandom;
        //     var str = 0 + "|" + sName + "|" + iRandom + "|"
        //     + "" + "|" + "" + "|" + "";
        //     WS.sendMsg(GLB.SET_STEP, str);
        // };
        var btns = cc.find("btns", this.node);
        cc.find("back", btns).on("click", function (argument) {
            cc.director.loadScene("Login");
            if (this.bannerAd != null)
                this.bannerAd.hide();
        }, this);
        cc.find("scv/backScv", this.node).on("click", function (argument) {
            this.scv.active = false;
            if (this.bannerAd != null)
                this.bannerAd.hide();
        }, this);
        // cc.find("scv/left", this.node).on("click", function (argument) {
        // }, this);
        // cc.find("scv/right", this.node).on("click", function (argument) {
        // }, this);
        for (var i = 0; i < 3; i++) {
            var node = cc.find("go/item" + (i+1).toString(), this.node);
            node.setName(i.toString());
            //challenge-self
            node.on("click", function (event) {
                if (WS.ws.readyState !== WebSocket.OPEN){
                    GLB.msgBox.active = true;
                    return;
                }
                if (GLB.sName == ""){
                    GLB.bShowRegister = true;
                    cc.director.loadScene("Login");
                    if (this.bannerAd != null)
                        this.bannerAd.hide();
                    return;
                }
                var name = event.node.name;
                GLB.iType = 1;
                GLB.iDiff = parseInt(name);
                cc.director.loadScene("Main");
                if (this.bannerAd != null)
                    this.bannerAd.hide();
            }, this);
            //play-self
            cc.find("play", node).on("click", function (event) {
                if (WS.ws.readyState !== WebSocket.OPEN){
                    GLB.msgBox.active = true;
                    return;
                }
                if (GLB.sName == "")
                    return;
                var name = event.node.parent.name;
                GLB.iDiff = parseInt(name);
                WS.sendMsg(GLB.GET_STEP, name+GLB.sName, this);
            }, this);
            //no1-play
            cc.find("no1/play", node).on("click", function (event) {
                if (WS.ws.readyState !== WebSocket.OPEN){
                    GLB.msgBox.active = true;
                    return;
                }
                var name = event.node.parent.parent.name;
                GLB.iDiff = parseInt(name);
                var sName = GLB.tName[GLB.iDiff];
                if (sName == null)
                    return;
                WS.sendMsg(GLB.GET_STEP, name+sName, this);
            }, this);
            //more
            cc.find("labType/more", node).on("click", function (event) {
                if (WS.ws.readyState !== WebSocket.OPEN){
                    GLB.msgBox.active = true;
                    return;
                }
                var name = event.node.parent.parent.name;
                this.scv.active = true;
                var content = cc.find("content", this.scv).children;
                var iL = content.length;
                for (var i = 0; i < iL; i++) {
                    content[i].active = false;
                };
                this.labTips.active = true;
                var tTitle = ["初级", "中级", "高级"];
                cc.find("labTitle", this.scv).getComponent(cc.Label).string = tTitle[name];
                WS.sendMsg(GLB.GET_RANK, name, this);
            }, this);
        };

        if (window.wx){
            if (this.bannerAd != null)
                this.bannerAd.destory();
            var systemInfo = wx.getSystemInfoSync();
            this.bannerAd = wx.createBannerAd({
                adUnitId: 'adunit-b277badf437cdf40',
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
    },

    initShow(){
        this.scv.active = false;
        var str = this.sShowStr;
        this.labName1.string = str;
        this.labName2.string = str;
        this.labName3.string = str;
        this.labScore1.string = str;
        this.labScore2.string = str;
        this.labScore3.string = str;
        this.labRank1.string = str;
        this.labRank2.string = str;
        this.labRank3.string = str;
        this.labName1No1.string = str;
        this.labScore1No1.string = str;
        this.labName2No1.string = str;
        this.labScore2No1.string = str;
        this.labName3No1.string = str;
        this.labScore3No1.string = str;
        if (GLB.iLang == "zh")
            this.onZhShow();
        else if (GLB.iLang == "en")
            this.onEnShow();
    },

    onZhShow(){
        this.labJunior.string = "初级";
        this.labMiddle.string = "中级";
        this.labSenior.string = "高级";
    },

    onEnShow(){
        this.labJunior.string = "Junior";
        this.labMiddle.string = "Middle";
        this.labSenior.string = "Senior";
    },

    onResponse(cmd, msg){
        var args = msg.split("|");
        if (cmd == GLB.GET_SCORE){
            for (var i = 0; i < 3; i++) {
                var cData = args[i] || "";
                var subData = cData.split(",");
                if (subData[1] != null)
                    GLB.tScore[i] = subData[1]/100;
                GLB.tName[i] = subData[3];
                this["labName" + (i+1).toString()].string = this.getNewStr(GLB.sName);
                this["labRank" + (i+1).toString()].string = this.getNewStr(subData[0]);
                this["labScore" + (i+1).toString()].string = this.getNewStr(subData[1], 1);
                this["labRank" + (i+1).toString() + "No1"].string = this.getNewStr(subData[2]);
                this["labName" + (i+1).toString() + "No1"].string = this.getNewStr(subData[3]);
                this["labScore" + (i+1).toString() + "No1"].string = this.getNewStr(subData[4], 1);
            };
        }else if(cmd == GLB.GET_STEP){
            if (msg == "null")
                return;
            GLB.tPlaybackData = args;
            GLB.iType = 2;
            if (this.bannerAd != null)
                this.bannerAd.hide();
            cc.director.loadScene("Main");
        }else if(cmd == GLB.GET_RANK){
            var iCount = args.length;
            if (iCount == 0 || msg == ""){
                return;
            }
            if (iCount > 10)
                iCount = 10;
            var content = cc.find("content", this.scv).children;
            for (var i = 0; i < iCount; i++) {
                var item = content[i];
                item.active = true;
                var data = args[i];
                var iComma = data.indexOf(",");
                var sName = data.substring(0, iComma);
                var labRank = cc.find("rank", item).getComponent(cc.Label);
                labRank.string = (i+1).toString();
                var labName = cc.find("name", item).getComponent(cc.Label);
                labName.string = sName;
                var labCost = cc.find("cost", item).getComponent(cc.Label);
                labCost.string = parseInt(data.substring(iComma+1))/100 + "s";
                var color = cc.Color.WHITE;
                if (sName == GLB.sName){
                    color = cc.Color.RED;
                }
                labRank.node.color = color;
                labName.node.color = color;
                labCost.node.color = color;
            };
            this.labTips.active = false;
        }
    },

    getNewStr(str, idx){
        if (str == null || str == "无" || str == "")
            return this.sShowStr;
        if (idx == 1)
            return parseInt(str)/100 + "s";
        else
            return str;
    },

    playTips(){
        var str = "";
        if (GLB.iLang == "zh")
            str = "请检查网络!";
        else if (GLB.iLang = "en")
            str = "Please check the network!";
        if (this.tips == null) return;
        var lab = this.tips.children[0];
        lab.getComponent(cc.Label).string = str;
        this.tips.opacity = 255;
        this.tips.runAction(cc.fadeOut(2));
    },
});
