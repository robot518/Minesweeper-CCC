/* 存放全局变量 */
var _GLBConfig = {
    ip: "websocket.windgzs.cn",
    // ip: "127.0.0.1",
    wxUserInfo: [],
    getUserInfoBtn: null,
    isClickCd: null,
    bInit: false,
    bLogin: false,
    iType: 0, //0经典，1挑战，2回放
    iDiff: 0,
    tScore: [],
    tName: [],
    tPlaybackData: null,
    iLang: "zh", //zh中文，en英文
    // iLang: "en",
    sName: "",
    bShowRegister: false,
    
    //event
    REGISTER: "register",
    LOGIN: "login",
    GET_SCORE: "getScore",
    GET_STEP: "getStep",
    GET_RANK: "getRank",
    SET_STEP: "setStep",
    WXLOGIN: "wxLogin",
};
module.exports = _GLBConfig;