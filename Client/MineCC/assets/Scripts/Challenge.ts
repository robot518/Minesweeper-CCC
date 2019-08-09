const {ccclass, property} = cc._decorator;

import {GLB} from "./GLBConfig";
import {WS} from "./Socket";

@ccclass
export default class Challenge extends cc.Component {

    @property(cc.Node)
    tips: cc.Node = null;

    @property(cc.Node)
    scv: cc.Node = null;

    @property(cc.Node)
    ndTips: cc.Node = null;

    @property(cc.Label)
    labName1: cc.Label = null;

    @property(cc.Label)
    labName2: cc.Label = null;

    @property(cc.Label)
    labName3: cc.Label = null;

    @property(cc.Label)
    labScore1: cc.Label = null;

    @property(cc.Label)
    labScore2: cc.Label = null;

    @property(cc.Label)
    labScore3: cc.Label = null;

    @property(cc.Label)
    labRank1: cc.Label = null;

    @property(cc.Label)
    labRank2: cc.Label = null;

    @property(cc.Label)
    labRank3: cc.Label = null;

    @property(cc.Label)
    labName1No1: cc.Label = null;

    @property(cc.Label)
    labName2No1: cc.Label = null;

    @property(cc.Label)
    labName3No1: cc.Label = null;

    @property(cc.Label)
    labScore1No1: cc.Label = null;

    @property(cc.Label)
    labScore2No1: cc.Label = null;

    @property(cc.Label)
    labScore3No1: cc.Label = null;

    @property(cc.Label)
    labRank1No1: cc.Label = null;

    @property(cc.Label)
    labRank2No1: cc.Label = null;

    @property(cc.Label)
    labRank3No1: cc.Label = null;

    videoAd: any;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initCanvas();
        this.initEvent();
        this.initWXVideo();
        this.initShow();
        if (GLB.msgBox == null){
            var msgBox = cc.find("msgBox");
            GLB.msgBox = msgBox;
            cc.game.addPersistRootNode(msgBox);
            cc.find("btn", msgBox).on("click", function (argument) {
                if (GLB.isClickCd) return;
                GLB.isClickCd = true;
                setTimeout(function() {
                    GLB.isClickCd = false;
                }, 1000);
                msgBox.active = false;
                if (WS.ws.readyState !== WebSocket.OPEN) WS.reconnect();
            }, cc.game);
            msgBox.on("click", function (argument) {
                msgBox.active = false;
            }, cc.game);
        }
        WS.sendMsg(GLB.GET_SCORE, GLB.OpenID, this);
    }

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
    }

    // update (dt) {},

    initEvent(){
        var self = this;
        cc.find("scv/backScv", this.node).on("click", function (argument) {
            this.scv.active = false;
        }, this);
        var btns = cc.find("btns", this.node);
        cc.find("back", btns).on("click", function (argument) {
            GLB.iType = 0;
            cc.director.loadScene("Main");
        }, this);
        cc.find("reconnect", btns).on("click", function (argument) {
            GLB.msgBox.active = true;
        }, this);
        for (let i = 0; i < 3; i++) {
            var node = cc.find("go/item" + (i+1).toString(), this.node);
            //challenge-self
            node.on("click", function (event) {
                if (WS.ws.readyState !== WebSocket.OPEN){
                    GLB.msgBox.active = true;
                    return;
                }
                GLB.iType = 1;
                GLB.iDiff = i;
                cc.director.loadScene("Main");
            }, this);
            //play-self
            cc.find("play", node).on("click", function (event) {
                if (WS.ws.readyState !== WebSocket.OPEN){
                    GLB.msgBox.active = true;
                    return;
                }
                GLB.iDiff = i;
                WS.sendMsg(GLB.GET_STEP, i+""+GLB.OpenID, this);
            }, this);
            //no1-play
            cc.find("no1/play", node).on("click", function (event) {
                if (self.videoAd != null){
                    GLB.iDiff = i;
                    self.videoAd.show()
                    .catch(err => {
                        self.videoAd.load()
                        .then(() => self.videoAd.show())
                    })
                }
            }, this);
            //more
            cc.find("labType/more", node).on("click", function (event) {
                if (WS.ws.readyState !== WebSocket.OPEN){
                    GLB.msgBox.active = true;
                    return;
                }
                this.scv.active = true;
                var content = cc.find("content", this.scv).children;
                var iL = content.length;
                for (let i = 0; i < iL; i++) {
                    content[i].active = false;
                };
                this.ndTips.active = true;
                var tTitle = ["初级", "中级", "高级"];
                cc.find("labTitle", this.scv).getComponent(cc.Label).string = tTitle[i];
                WS.sendMsg(GLB.GET_RANK, i+"", this);
            }, this);
        };

        if (CC_WECHATGAME){
            let snake = cc.find("snake", btns);
            snake.active = true;
            snake.on("click", function (argument) {
                wx.navigateToMiniProgram({
                    appId: 'wx938546d6526f42dc',
                    path: '',
                    extraData: {
                        foo: 'Minesweeper'
                    },
                    envVersion: 'develop',
                        success(res) {
                        // 打开成功
                    console.log("success: ", res);
                    },
                    fail(res){
                        console.log("fail: ", res);
                    },
                })
            }, this);
        }
    }

    initWXVideo(){
        if (!window.wx) return;
        var self = this;
        let adUnitId = window.tt ? "1307gwbwf0q92pba53" : 'adunit-bfb85c76177f19b6';
        this.videoAd = wx.createRewardedVideoAd({
            adUnitId: adUnitId,
        });
        this.videoAd.onClose(res => {
            if (res && res.isEnded || res === undefined){
                if (WS.ws.readyState !== WebSocket.OPEN){
                    WS.reconnect();
                }
                var sName = GLB.tName[GLB.iDiff];
                if (sName == null) return;
                WS.sendMsg(GLB.GET_STEP, GLB.iDiff+""+sName, self);
            }else{

            }
        });
        this.videoAd.onError(err => {
          console.log(err)
        });
    }

    initShow(){
        this.scv.active = false;
        var str = "无";
        GLB.userInfo = GLB.userInfo || [];
        this.labName1.string = this.getStrName(GLB.userInfo.nickName);
        this.labName2.string = this.getStrName(GLB.userInfo.nickName);
        this.labName3.string = this.getStrName(GLB.userInfo.nickName);
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
    }

    onResponse(cmd, msg){
        var args = msg.split("|");
        if (cmd == GLB.GET_SCORE){
            for (var i = 0; i < 3; i++) {
                var cData = args[i] || "";
                var subData = cData.split(",");
                if (subData[1] != null)
                    GLB.tScore[i] = subData[1]/100;
                GLB.tName[i] = subData[3];
                this["labName" + (i+1).toString()].string = this.getNewStr(this.getStrName(GLB.userInfo.nickName), null);
                this["labRank" + (i+1).toString()].string = this.getNewStr(subData[0], null);
                this["labScore" + (i+1).toString()].string = this.getNewStr(subData[1], 1);
                this["labRank" + (i+1).toString() + "No1"].string = this.getNewStr(subData[2], null);
                this["labName" + (i+1).toString() + "No1"].string = this.getNewStr(this.getStrName(subData[3]), null);
                this["labScore" + (i+1).toString() + "No1"].string = this.getNewStr(subData[4], 1);
            };
        }else if(cmd == GLB.GET_STEP){
            if (msg == "null") return;
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
                labName.string = this.getStrName(sName);
                var labCost = cc.find("cost", item).getComponent(cc.Label);
                labCost.string = parseInt(data.substring(iComma+1))/100 + "s";
                var color = cc.Color.WHITE;
                if (sName == GLB.userInfo.nickName){
                    color = cc.Color.RED;
                }
                labRank.node.color = color;
                labName.node.color = color;
                labCost.node.color = color;
            };
            this.ndTips.active = false;
        }
    }

    getNewStr(str, idx){
        if (str == null || str == "无" || str == "") return "无";
        if (idx == 1) return parseInt(str)/100 + "s";
        else return str;
    }

    playTips(str){
        var lab = this.tips.children[0];
        lab.getComponent(cc.Label).string = str;
        this.tips.opacity = 255;
        this.tips.runAction(cc.fadeOut(2));
    }

    getStrName(s: string){
        if (s && s.length > 5) s = s.substring(0, 5)+"...";
        return s || "";
    }

    onWxEvent(s){
        if (!CC_WECHATGAME) return;
        let self = this;
        switch(s){
            case "share":
                // wx.shareAppMessage({
                //     title: "扫雷大神集锦！",
                //     desc: "超变态的扫雷大神集锦，神一般的操作看个爽！",
                //     templateId: "a5e39j0j0ebb4kmv77",
                //     imageUrl: "/resource/ttshare.jpg",
                // });
                wx.shareAppMessage({
                    title: "扫雷大神集锦！",
                    imageUrl: canvas.toTempFilePathSync({
                        destWidth: 500,
                        destHeight: 400
                    })
                });
                break;
            case "auth":
                wx.getSetting({
                    success(res) {
                        if (!res.authSetting['scope.userInfo']) {
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
                                // withCredentials: false,
                                style: {
                                    left: size.width/2-width/2,
                                    top: size.height/2-self.ndBack.y*size.height/dSize.height-height/2,
                                    width: width,
                                    height: height,
                                }
                            })
                            self.UserInfoButton.onTap((res) => {
                                // console.log("Res = ", res);
                                GLB.userInfo = res.userInfo;
                                let str = res.userInfo.nickName+"|"+res.userInfo.avatarUrl;
                                if (WS.sendMsg(GLB.WXLOGIN, str)){
                                    self.UserInfoButton.hide();
                                    self.playSound ("click");
                                    cc.director.loadScene("Challenge");
                                }
                            })
                        }else{
                            wx.getUserInfo({
                                success(res){
                                    // console.log("Res = ", res);
                                    GLB.userInfo = res.userInfo;
                                    let str = res.userInfo.nickName+"|"+res.userInfo.avatarUrl;
                                    WS.sendMsg(GLB.WXLOGIN, str);
                                }
                            })
                        }
                    }
                })
                break;
            case "login":
                wx.login({
                    success (res) {
                        if (res.code) {
                            //发起网络请求
                            console.log("code = ", res.code);
                            wx.request({
                                url: 'http://'+GLB.ip+":8080",
                                data: {
                                    code: res.code
                                },
                                success(response){
                                    console.log("success response = ", response);
                                    console.log("openid = ", response.data);
                                    GLB.OpenID = response.data;
                                    // cc.sys.localStorage.setItem("usrId", response.data);
                                    // GLB.usrId = cc.sys.localStorage.getItem("usrId") || null;
                                },
                                fail(response){
                                    console.log("fail response = ", response);
                                }
                            })
                        } else {
                            console.log('登录失败！' + res.errMsg)
                        }
                    }
                })
                // wx.checkSession({
                //     fail () {
                        
                //     }
                // })
                break;
        }
    }
}
