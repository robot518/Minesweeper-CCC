/* 存放全局变量 */
var _GLBConfig = {
    ip: "websocket.windgzs.cn",
    // ip: "127.0.0.1",
    wxUserInfo: [],
    getUserInfoBtn: null,
    isClickCd: false,
    iType: 0, //0经典，1挑战，2回放，3雷之大陆
    iDiff: 0,
    tScore: [],
    tName: [],
    tPlaybackData: null,
    sName: "",
    msgBox: null, //断线重连
    iWorldMine: 1, //mineworld入场券
    iWorldLv: 0, //挑战第几关
    
    //event
    GETVERSION: "getVersion",
    REGISTER: "register",
    LOGIN: "login",
    GET_SCORE: "getScore",
    GET_STEP: "getStep",
    GET_RANK: "getRank",
    SET_STEP: "setStep",
    WXLOGIN: "wxLogin",
    GET_WORLD_STEP: "getWorldStep",
    GET_WORLD_MINE: "getWorldMine",
    SET_WORLD_MINE: "setWorldMine",
};
module.exports = _GLBConfig;