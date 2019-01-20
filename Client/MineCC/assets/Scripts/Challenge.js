var GLB = require('GLBConfig');
var WS = require("Socket");

cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.Node,
        scv: cc.Node,

        ndRegister: cc.Node,

        ndTips: cc.Node,
        labName1: cc.Label,
        labName2: cc.Label,
        labName3: cc.Label,
        labScore1: cc.Label,
        labScore2: cc.Label,
        labScore3: cc.Label,
        labRank1: cc.Label,
        labRank2: cc.Label,
        labRank3: cc.Label,

        labName1No1: cc.Label,
        labName2No1: cc.Label,
        labName3No1: cc.Label,
        labScore1No1: cc.Label,
        labScore2No1: cc.Label,
        labScore3No1: cc.Label,
        labRank1No1: cc.Label,
        labRank2No1: cc.Label,
        labRank3No1: cc.Label,

        labWorldMine: cc.Label,

        editName: cc.EditBox,
        editPass: cc.EditBox,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    },

    start () {
        this.initCanvas();
        this.initEvent();
        this.initShow();
        if (GLB.msgBox == null){
            var msgBox = cc.find("msgBox");
            GLB.msgBox = msgBox;
            cc.game.addPersistRootNode(msgBox);
            cc.find("btn", msgBox).on("click", function (argument) {
                if (GLB.isClickCd)
                    return;
                GLB.isClickCd = true;
                setTimeout(function() {
                    GLB.isClickCd = false;
                }, 1000);
                msgBox.active = false;
                if (WS.ws.readyState !== WebSocket.OPEN)
                    WS.reconnect();
            }, cc.game);
            msgBox.on("click", function (argument) {
                msgBox.active = false;
            }, cc.game);
        }
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
        cc.find("scv/backScv", this.node).on("click", function (argument) {
            this.scv.active = false;
        }, this);
        var btns = cc.find("btns", this.node);
        cc.find("back", btns).on("click", function (argument) {
            GLB.iType = 0;
            cc.director.loadScene("Main");
        }, this);
        cc.find("switch", btns).on("click", function (argument) {
            this.ndRegister.active = true;
        }, this);
        cc.find("reconnect", btns).on("click", function (argument) {
            GLB.msgBox.active = true;
        }, this);
        cc.find("world", btns).on("click", function (argument) {
            if (WS.ws.readyState !== WebSocket.OPEN){
                GLB.msgBox.active = true;
                return;
            }
            if (GLB.iWorldMine > 0){
                if (GLB.sName != "")
                    WS.sendMsg(GLB.SET_WORLD_MINE, GLB.sName, -1);
                cc.director.loadScene("World");
            }else{
                this.playTips("完成中级挑战可进入");
            }
        }, this);
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
                    this.ndRegister.active = true;
                    return;
                }
                var name = event.node.name;
                GLB.iType = 1;
                GLB.iDiff = parseInt(name);
                cc.director.loadScene("Main");
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
                this.ndTips.active = true;
                var tTitle = ["初级", "中级", "高级"];
                cc.find("labTitle", this.scv).getComponent(cc.Label).string = tTitle[name];
                WS.sendMsg(GLB.GET_RANK, name, this);
            }, this);
        };

        //login
        cc.find("btnLogin", this.ndRegister).on("click", function (argument) {
            if (this.getBEmpty() == true)
                return;
            WS.sendMsg(GLB.LOGIN, this.editName.string + "|" + this.editPass.string, this);
        }, this);
        cc.find("btnRegister", this.ndRegister).on("click", function (argument) {
            if (this.getBEmpty() == true)
                return;
            WS.sendMsg(GLB.REGISTER, this.editName.string + "|" + this.editPass.string, this);
        }, this);
        cc.find("btnTourist", this.ndRegister).on("click", function (argument) {
            this.ndRegister.active = false;
            this.initGLBData();
            GLB.sName = "";
            WS.sendMsg(GLB.GET_SCORE, GLB.sName, this);
        }, this);
        this.ndRegister.on("click", function (argument) {
            this.ndRegister.active = false;
        }, this);
    },

    initShow(){
        this.scv.active = false;
        var str = "无";
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

        this.labWorldMine.string = GLB.iWorldMine;
    },

    onResponse(cmd, msg){
        var args = msg.split("|");
        if (cmd == GLB.REGISTER || cmd == GLB.LOGIN){
            if (msg == "200"){ //成功
                this.ndRegister.active = false;
                this.initGLBData();
                WS.sendMsg(GLB.GET_SCORE, GLB.sName, this);
            } else
                this.playTips(msg);
        }else if (cmd == GLB.GET_SCORE){
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
            this.ndTips.active = false;
        }
    },

    getNewStr(str, idx){
        if (str == null || str == "无" || str == "")
            return "无";
        if (idx == 1)
            return parseInt(str)/100 + "s";
        else
            return str;
    },

    initGLBData(){
        GLB.sName = this.editName.string;
        GLB.tScore = [];
        GLB.tName = [];
    },

    playTips(str){
        var lab = this.tips.children[0];
        lab.getComponent(cc.Label).string = str;
        this.tips.opacity = 255;
        this.tips.runAction(cc.fadeOut(2));
    },

    getBEmpty(){
        if (WS.ws.readyState !== WebSocket.OPEN){
            GLB.msgBox.active = true;
            return true;
        }
        var sName = this.editName.string;
        var sPass = this.editPass.string;
        if (sName == ""){
            this.playTips("名字不能为空");
            return true;
        }
        if (sPass == ""){
            this.playTips("密码不能为空");
            return true;
        }
        return false;
    },
});
