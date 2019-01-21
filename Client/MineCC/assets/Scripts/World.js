var GLB = require('GLBConfig');
var WS = require("Socket");

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.initCanvas();
        this.initEvent();
    },

    // update (dt) {},

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

    initEvent(){
        cc.find("back", this.node).on("click", function (argument) {
            GLB.iType = 0;
            cc.director.loadScene("Challenge");
        }, this);
        var items = cc.find("items", this.node);
        for (var i = 0; i < 3; i++) {
            var node = cc.find("item" + (i+1).toString(), items);
            node.setName(i.toString());
            node.on("click", function (event) {
                if (WS.ws.readyState !== WebSocket.OPEN){
                    GLB.msgBox.active = true;
                    return;
                }
                var name = event.node.name;
                GLB.iDiff = parseInt(name);
                GLB.iWorldLv = 0;
                WS.sendMsg(GLB.GET_WORLD_STEP, name+""+GLB.iWorldLv, this);
            }, this);
        }
    },

    onResponse(cmd, msg){
        var args = msg.split("|");
        if (cmd == GLB.GET_WORLD_STEP){
            if (msg == "null")
                return;
            else if (msg == ""){
                // dosth
                return;
            }
            GLB.tPlaybackData = args;
            GLB.iType = 3;
            cc.director.loadScene("Main");
        }
    },
});
