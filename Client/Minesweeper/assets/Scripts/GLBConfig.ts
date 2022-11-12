/* 存放全局变量 */
var GLB = {
    // ip: "websocket.windgzs.cn",
    ip: "47.107.178.120:8080",
    userInfo: null,
    isClickCd: false,
    iType: 0, //0经典，1挑战，2回放
    iDiff: 0,
    tScore: [],
    tName: [],
    tPlaybackData: null,
    msgBox: null, //断线重连
    OpenID: null, //微信用户唯一标识
    withCredentials: false,
    bSpView: false, //刘海屏
    
    //event
    GET_SCORE: "getScore",
    GET_STEP: "getStep",
    GET_RANK: "getRank",
    SET_STEP: "setStep",
    WXLOGIN: "wxLogin",

    getTime(){
        let s = "[";
        let now = new Date();
        let hh = now.getHours();
        let mm = now.getMinutes();
        let ss = now.getSeconds();
        if (hh < 10) s+='0';
        s+=hh+":";
        if (mm < 10) s+="0";
        s+=mm+":";
        if (ss < 10) s+="0";
        s+=ss+"]";
        return s;
    }
};
export {GLB};