var GLB = require('GLBConfig')
var WS = require("Socket");
// var WXBizDataCrypt = require('./WXBizDataCrypt')

cc.Class({
    extends: cc.Component,

    properties: {
        tips: cc.Node,
        intro: cc.Node,
        ndSet: cc.Node,
        ndRegister: cc.Node,
        labTitle: cc.Label,
        labStart: cc.Label,
        labChallenge: cc.Label,
        labWorld: cc.Label,
        labT1: cc.Label,
        labT2: cc.Label,
        labT3: cc.Label,
        labT4: cc.Label,
        labT1Info: cc.Label,
        labT2Info: cc.Label,
        labT3Info: cc.Label,
        labT4Info: cc.Label,
        labVersion: cc.Label,
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
        // this.initWXEvent();
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

    initWXEvent(){
        var temp = cc.find("temp", this.node);
        temp.active = true;
        if (window.wx){
            // wx.login({
            //   success(res) {
            //     console.log("res = ", res);
            //     if (res.code) {
            //       // 发起网络请求
            //       wx.request({
            //         url: "https://" + GLB.ip + ":8080",
            //         data: {
            //           code: res.code
            //         },
            //         success(res){
            //             console.log("request success = ", res);
            //         },
            //         fail(res){
            //             console.log("request fail = ", res);
            //         },
            //       })
            //         // WS.sendMsg(GLB.WXLOGIN, code);
            //     } else {
            //       console.log('登录失败！' + res.errMsg)
            //     }
            //   }
            // })
            // console.log("GLB.wxUserInfo = ", GLB.wxUserInfo);
            if (GLB.wxUserInfo.nickName != null){
                temp.active = false;
                return;
            }
            wx.getUserInfo({
                success: function (res) {
                    GLB.wxUserInfo = res.userInfo;
                    temp.active = false;
                    // GLB.sName = res.userInfo.nickName;
                    // WS.sendMsg(GLB.LOGIN, GLB.sName + "|" + this.editPass.string, this);
                    // console.log("res2 = ", res);
                },
                fail: function (argument) {
                    wx.getSystemInfo({
                        success: function(data) {
                            GLB.getUserInfoBtn = wx.createUserInfoButton({
                                type: 'text',
                                text: '微信登陆',
                                style: {
                                    left: data.screenWidth * 0.2,
                                    top: data.screenHeight * 0.5,
                                    width: data.screenWidth * 0.65,
                                    height: data.screenHeight * 0.07,
                                    lineHeight: data.screenHeight * 0.07,
                                    backgroundColor: '#fe714a',
                                    color: '#ffffff',
                                    textAlign: 'center',
                                    fontSize: data.screenHeight * 0.05,
                                    borderRadius: 8
                                }
                            });
                            GLB.getUserInfoBtn.onTap(function(res) {
                                if (GLB.isClickCd) {
                                    return;
                                }
                                GLB.isClickCd = true;
                                setTimeout(function() {
                                    GLB.isClickCd = false;
                                }, 1000);
                                if (res.userInfo){
                                    GLB.wxUserInfo = res.userInfo;
                                    // GLB.sName = res.userInfo.nickName;
                                    // WS.sendMsg(GLB.LOGIN, GLB.sName + "|" + this.editPass.string, this);
                                }
                                // console.log("res1 = ", res);
                                GLB.getUserInfoBtn.hide();
                                temp.active = false;
                            });
                        }
                    });
                },
            })
        } else
            temp.active = false;
    },

    // update (dt) {},

    initEvent(){
        var btns = cc.find("btns", this.node);
        cc.find("start", btns).on("click", function (argument) {
            if (this.btn != null)
                this.btn.hide();
            if (this.bannerAd != null)
                this.bannerAd.hide();
            GLB.iType = 0;
            cc.director.loadScene("Main");
        }, this);
        //匹配按钮PK
        cc.find("pk", btns).on("click", function (argument) {
            if (this.btn != null)
                this.btn.hide();
            if (this.bannerAd != null)
                this.bannerAd.hide();
            cc.director.loadScene("Challenge");
        }, this);
        cc.find("world", btns).on("click", function (argument) {
            this.playTips("未开启");
        }, this);
        cc.find("help", btns).on("click", function (argument) {
            this.intro.active = !this.intro.active;
        }, this);
        cc.find("set", btns).on("click", function (argument) {
            this.ndSet.active = !this.ndSet.active;
            if (this.ndSet.active == true && GLB.iLang == "en"){
                var children = this.ndSet.children;
                children[1].getComponent(cc.Toggle).isChecked = true;
            }
        }, this);
        cc.find("reconnect", btns).on("click", function (argument) {
            GLB.msgBox.active = true;
        }, this);
        cc.find("switch", btns).on("click", function (argument) {
            this.ndRegister.active = true;
        }, this);
        cc.find("snake", btns).on("click", function (argument) {
            if (window.wx){
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
            }
        }, this);
        var children = this.ndSet.children;
        //上中文下英文
        children[0].on("toggle", function (argument) {
            GLB.iLang = "zh";
            this.onZhShow();
        }, this);
        children[1].on("toggle", function (argument) {
            GLB.iLang = "en";
            this.onEnShow();
        }, this);
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
            GLB.bLogin = false;
        }, this);
        if (window.wx){
            if (this.btn == null){
                this.btn = wx.createGameClubButton({
                    icon: 'green',
                    style: {
                        left: 20,
                        top: 20,
                        width: 50,
                        height: 50,
                    }
                });
                this.btn.show();
            }
            if (this.bannerAd != null)
                this.bannerAd.destory();
            var systemInfo = wx.getSystemInfoSync();
            this.bannerAd = wx.createBannerAd({
                adUnitId: 'adunit-625d994da482c066',
                style: {
                    left: 0,
                    top: systemInfo.windowHeight - 144,
                    width: 720,
                }
            });
            var self = this;
            this.bannerAd.onResize(res => {
                if (self.bannerAd)
                    self.bannerAd.style.top = systemInfo.windowHeight - self.bannerAd.style.realHeight;
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
        if (!window.wx)
            cc.find("btns/snake", this.node).active = false;
        else
            cc.find("btns/snake", this.node).active = true;
        this.ndRegister.active = GLB.bShowRegister;
        this.labVersion.string = GLB.iVersion;
        if (GLB.bShowRegister == true)
            GLB.bShowRegister = false;
        // }
        if (GLB.iLang == "zh")
            this.onZhShow();
        else if (GLB.iLang == "en")
            this.onEnShow();

        //检查热更新
        cc.log("GLB.bHotUpdate = ", GLB.bHotUpdate);
        if (cc.sys.isNative && cc.sys.isMobile && GLB.bHotUpdate == true && !window.wx)
            this.getComponent("HotUpdate").show();
        // if (GLB.bHotUpdate == true)
        //     this.getComponent("HotUpdate").show();
    },

    onResponse(cmd, msg){
        if (msg == "200"){ //成功
            this.ndRegister.active = false;
            this.initGLBData();
            GLB.bLogin = true;
        } else
            this.playTips(msg);
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

    onEnShow(){
        this.labTitle.string = "Wind Minesweeper";
        this.labStart.string = "Common";
        this.labChallenge.string = "Challenge";
        this.labWorld.string = "MineWorld";
        this.labT1.string = "[Rule]";
        this.labT2.string = "[Mode]";
        this.labT3.string = "[Numbers]";
        this.labT4.string = "[Click on the Numbers]";
        this.labT1Info.string = "Open all non-mine grid to win";
        this.labT2Info.string = '"Open" and "flag" two modes, click the button in the middle below to switch, when you judge a grid as a mine, flag flag can be inserted"';
        this.labT3Info.string = "The number represents the number of mines in the eight surrounding cells";
        this.labT4Info.string = "When the number of flags in the 8 squares around the number is equal to the number, click the number to open the unopened squares around the number";
    },

    onZhShow(){
        this.labTitle.string = "wind扫雷";
        this.labStart.string = "经典";
        this.labChallenge.string = "挑战";
        this.labWorld.string = "雷之大陆";
        this.labT1.string = "【玩法】";
        this.labT2.string = "【模式】";
        this.labT3.string = "【数字】";
        this.labT4.string = "【点击数字】";
        this.labT1Info.string = "翻开所有非地雷的格子获得胜利";
        this.labT2Info.string = '“翻开”和“插旗”两种模式，点击下方中间的按钮进行切换，当你判断某个格子为地雷时，可进行插旗标记';
        this.labT3Info.string = "数字表示周围8个格子中地雷的数量";
        this.labT4Info.string = "当数字周围8个格子的旗帜数等于数字时，点击数字可翻开周围未翻开的格子";
    },
});
