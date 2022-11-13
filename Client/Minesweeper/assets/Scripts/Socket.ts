import {GLB} from "./GLBConfig";

var ws = null;
var WS = {
    ws: ws,
    obj: null,
    sendMsg: null,
    close: null,
    reconnect: null,
    tt: null,
    getStrPBMineNum: null,
    getTPBMineNum: null,
    getStrPBStepInfo: null,
};
var bError = false;
var lockReconnect = false;
var heartCheck = {
    timeout: 30000,
    timeoutObj: null,
    serverTimeoutObj: null,
    start: function(){
        var self = this;
        this.timeoutObj && clearTimeout(this.timeoutObj);
        this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
        this.timeoutObj = setTimeout(function(){
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            //onmessage拿到返回的心跳就说明连接正常
            ws.send("0");
            self.serverTimeoutObj = setTimeout(function() {
                console.log(GLB.getTime()+"heart-timeout");
                ws.close();
            }, self.timeout);
        }, this.timeout)
    }
}
var creatWS = function () {
    ws = null;
    if (cc.sys.platform === cc.sys.WECHAT_GAME || cc.sys.os === cc.sys.OS_IOS)
        ws = new WebSocket("wss://www.robot518.com/websocket"); //wx/ios
    else if (cc.sys.os === cc.sys.OS_ANDROID)
        ws = new WebSocket("ws://101.132.117.122:8080/websocket"); //anroid其中安卓ssl连不上
    else{
        // ws = new WebSocket("ws://127.0.0.1:8080/websocket"); //本地测试
        ws = new WebSocket("wss://www.robot518.com/websocket");
        // ws = new WebSocket("wss://minesweeper.robot518.com/websocket"); //本地
        // ws = new WebSocket("ws://101.132.117.122:8080/websocket"); //本地 
    }
    WS.ws = ws;
    ws.onopen = function (event) {
        console.log(GLB.getTime()+"Send Text WS was opened.");
        if (GLB.msgBox) GLB.msgBox.active = false;
        heartCheck.start();
    };
    ws.onmessage = function (event) {
        heartCheck.start();
        var data = event.data;
        if (data == "0") return;
        // console.log(GLB.getTime()+"response text msg = " + data);
        var i1 = data.indexOf(":");
        if (i1 == -1 || WS.obj == null) return;
        var cmd = data.substring(0, i1);
        var sResponse = data.substring(i1+1);
        WS.obj.onResponse(cmd, sResponse);
    };
    ws.onerror = function (event) {
        console.log(GLB.getTime()+"Send Text fired an error.", event);
        bError = true;
    };
    ws.onclose = function (e) {
        if (e.code && e.code.toString() != "1001" && GLB.msgBox) GLB.msgBox.active = true;
        console.log(GLB.getTime()+"WebSocket instance closed.", e);
        if (bError == false) WS.reconnect();
    };
}
WS.sendMsg = function (cmd: string, msg: string, obj) {
    if (cmd == null) return;
    if (ws.readyState === WebSocket.OPEN) {
        if (cmd == "0"){
            ws.send(cmd);
            return;
        }
        msg = msg || "";
        var str = cmd + ":" + msg.toString();
        // console.log(GLB.getTime()+"sendMsg = ", str);
        ws.send(str);
        if (obj != null){
            WS.obj = obj;
        }
        return true;
    }else {
        console.log(GLB.getTime()+"WebSocket instance wasn't ready...");
        if (GLB.msgBox) GLB.msgBox.active = true;
        return false;
    }
};
WS.close = function () {
    ws.close();
};
WS.reconnect = function () {
    if (lockReconnect) return;
    lockReconnect = true;
    this.tt && clearTimeout(this.tt);
    this.tt = setTimeout(()=>{
        bError = false;
        creatWS();
        lockReconnect = false;
    }, 1000)
};
WS.getStrPBMineNum = function (tMineNum) {
    var str = "";
    var iL = tMineNum.length;
    var iCut = 52;
    for (var i = 0; i < iL; i++) {
        if (i%iCut == 0)
            str+="1";
        str += tMineNum[i].toString();
    };
    var iStart = 0;
    var sTemp = str.substring(iStart, iCut+1);
    var sNew = parseInt(sTemp, 2).toString(16);
    iStart = iCut+1;
    var iCount = Math.floor(iL/iCut);
    for (var i = 0; i < iCount; i++) {
        var iEnd = (iCut+1)*(i+2);
        sTemp = str.substring(iStart, iEnd);
        sNew += "." + parseInt(sTemp, 2).toString(16);
        iStart = iEnd;
    };
    return sNew;
};
WS.getTPBMineNum = function () {
    var t = [];
    var str = GLB.tPlaybackData[0];
    var agrs = str.split(".");
    var iL = agrs.length;
    // var iL = str.length;
    for (var i = 0; i < iL; i++) {
        var sTemp = parseInt(agrs[i], 16).toString(2).substring(1);
        for (var j = 0; j < sTemp.length; j++) {
            t.push(parseInt(sTemp[j]));
        };
        // t.push(parseInt(str[i]));
    };
    return t;
};
WS.getStrPBStepInfo = function (tPB) {
    if (tPB.length == 0) return "";
    var str = tPB[0];
    if (tPB.length > 1){
        for (var i = 1; i < tPB.length; i++) {
            str += "|" + tPB[i];
        };
    }
    return str;
};
// creatWS();
export {WS};