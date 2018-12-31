cc.Class({
    extends: cc.Component,

    properties: {
        ndMine: cc.Node,
        ndContent: cc.Node,
        ndStat: cc.Node,
        ndRank: cc.Node,

        labWin: cc.Label,
        labLose: cc.Label,
        labMinTime: cc.Label,
        labAvgTime: cc.Label,
        labRate: cc.Label,
        labCount: cc.Label,
        labMaxWinSteak: cc.Label,
        labCurWinSteak: cc.Label,

        labWinSP: cc.Label,
        labLoseSP: cc.Label,
        labMinTimeSP: cc.Label,
        labAvgTimeSP: cc.Label,
        labRateSP: cc.Label,
        labCountSP: cc.Label,
        labMaxWinSteakSP: cc.Label,
        labCurWinSteakSP: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.tLab = [this.labWin, this.labLose, this.labRate, this.labAvgTime, this.labCount, this.labMinTime, this.labMaxWinSteak, this.labCurWinSteak];
        this.tLabSP = [this.labWinSP, this.labLoseSP, this.labRateSP, this.labAvgTimeSP, this.labCountSP, this.labMinTimeSP, this.labMaxWinSteakSP, this.labCurWinSteakSP];
        this.tKey = ["win1", "lose1", "rate1", "aTime1", "count1", "mTime1", "mSteak1", "nSteak1", "allTime1",];
        this.tKeySP = ["winSPSP1", "LoseSPSP1", "RateSPSP1", "ATimeSPSP1", "CountSPSP1", "MTimeSPSP1", "MSteakSPSP1", "NSteakSPSP1", "AllTimeSPSP1",];
        this.initEvent();
        this.initShow();
    },

    initShow(){
        this.ndStat.active = false;
        this.ndMine.active = false;
        var children = this.ndContent.children;
        var iL = children.length;
        for (var i = 0; i < iL; i++) {
            children[i].active = false;
        };
    },

    initEvent(){
        if (window.wx) {
            var self = this;
            wx.onMessage(data => {
                // console.log("接收主域发来消息：", data);
                var cost = parseInt(data.cost);
                if (data.iType >3 || data.iType == -1){
                    if (data.iType == 4)
                        self.setLoseUserInfo();
                    else if (data.iType == 5)
                        self.setWinUserInfo(cost);
                    else if (data.iType == 6)
                        self.setLoseUserInfoSP();
                    else if (data.iType == 7)
                        self.setWinUserInfoSP(cost);
                    else if (data.iType == -1)
                        self.initStatData();
                    return;
                }
                if (data.iType == 3){
                    self.ndStat.active = true;
                    self.ndRank.active = false;
                    self.initShowStat();
                    return;
                }
                self.ndRank.active = true;
                self.ndStat.active = false;
                wx.getUserCloudStorage({
                    keyList: ["cost"],
                    success: function (res) {
                        console.log('getUserCloudStorage', 'success', res)
                        self.ndMine.active = true;
                        var nData = res.KVDataList;
                        var cItem = self.ndMine.getComponent("cItem");
                        var iV = nData.length == 0 ? 3601 : parseInt(nData[0].value);
                        if (data.iType == 1 && cost < iV) {
                            wx.setUserCloudStorage({
                                KVDataList: [{
                                    key: "cost",
                                    value: cost.toString(),
                                }],
                            });
                        }
                        if (data.iType == 1){
                            iV = iV < cost ? iV : cost;
                        }
                        cItem.showCost(iV);
                    },
                });
                wx.getUserInfo({
                    openIdList: ['selfOpenId'],
                    success: function (res) {
                        console.log("success", res);
                        var usrData = res.data[0];
                        self.ndMine.active = true;
                        var cItem = self.ndMine.getComponent("cItem");
                        cItem.showName(usrData.nickName);
                        cItem.showHead(usrData.avatarUrl);
                        wx.getFriendCloudStorage({
                            keyList: ["cost"],
                            success: res => {
                                console.log("wx.getFriendCloudStorage success", res);
                                let data = res.data;
                                data.sort((a, b) => {
                                    if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                        return 0;
                                    }
                                    if (a.KVDataList.length == 0) {
                                        return 1;
                                    }
                                    if (b.KVDataList.length == 0) {
                                        return -1;
                                    }
                                    return a.KVDataList[0].value - b.KVDataList[0].value;
                                });
                                // self.showItems(data, usrData.avatarUrl);
                                if (data.length == 0) return;
                                var children = self.ndContent.children;
                                var iL = data.length > children.length ? children.length : data.length;
                                for (var i = 0; i < iL; i++) {
                                    var item = children[i].getComponent("cItem");
                                    var nData = data[i];
                                    item.node.active = true;
                                    item.initShow(i + 1, nData);
                                    if (usrData.avatarUrl == nData.avatarUrl)
                                        item.showRank(i+1);
                                };
                            },
                        });
                    }
                });
            });
        }
    },

    // update (dt) {},
    initStatData(){
        var self = this;
        // wx.removeUserCloudStorage({keyList: ["cost"]});
        // wx.removeUserCloudStorage({keyList: ["win", "lose", "rate", "aTime", "count", "mTime", "mSteak", "nSteak", "allTime",
        //     "winSPSP", "LoseSPSP", "RateSPSP", "ATimeSPSP", "CountSPSP", "MTimeSPSP", "MSteakSPSP", "NSteakSPSP", "AllTimeSPSP",],
        // })
        wx.getUserCloudStorage({
            keyList: ["win1", "lose1", "rate1", "aTime1", "count1", "mTime1", "mSteak1", "nSteak1", "allTime1",
            "winSPSP1", "LoseSPSP1", "RateSPSP1", "ATimeSPSP1", "CountSPSP1", "MTimeSPSP1", "MSteakSPSP1", "NSteakSPSP1", "AllTimeSPSP1",],
            success: function (res) {
                var data = res.KVDataList;
                var iL = data.length;
                if (iL != 18){
                    var nData = [];
                    for (var i = 0; i < 9; i++) {
                        var str1 = self.tKey[i];
                        var iV = self.getV(str1, data);
                        if (iV == null){
                            if (i == 5)
                                nData.push({key: str1, value: "3601"});
                            else
                                nData.push({key: str1, value: "0"});
                        }
                    };
                    for (var i = 0; i < 9; i++) {
                        var str2 = self.tKeySP[i];
                        var iV = self.getV(str2, data);
                        if (iV == null){
                            if (i == 5)
                                nData.push({key: str2, value: "3601"});
                            else
                                nData.push({key: str2, value: "0"});
                        }
                    };
                    wx.setUserCloudStorage({
                        KVDataList: nData,
                    });
                }
            },
        })
    },
    getV(str, t){
        var iL = t.length;
        for (var i = 0; i < iL; i++) {
            if (t[i].key == str){
                return t[i].value;
            }
        };
        return null;
    },
    initShowStat(){
        var self = this;
        wx.getUserCloudStorage({
            keyList: ["win1", "lose1", "rate1", "aTime1", "count1", "mTime1", "mSteak1", "nSteak1", "allTime1",
            "winSPSP1", "LoseSPSP1", "RateSPSP1", "ATimeSPSP1", "CountSPSP1", "MTimeSPSP1", "MSteakSPSP1", "NSteakSPSP1", "AllTimeSPSP1",],
            success: function (res) {
                var data = res.KVDataList;
                for (var i = 0; i < 8; i++) {
                    self.tLab[i].string = data[i].value;
                    self.tLabSP[i].string = data[9 + i].value;
                };
            },
        })
    },
    //胜利次数0、失败次数1、最短用时2、平均用时3、胜率4、总次数5、最大连胜6、当前连胜7、总用时8
    setWinUserInfo(iTime){
        wx.getUserCloudStorage({
            keyList: ["win1", "count1", "mTime1", "mSteak1", "nSteak1", "allTime1",],
            success: function (res) {
                // iTime = parseInt(iTime);
                // console.log(res, iTime);
                var data = res.KVDataList;
                var iCount = parseInt(data[1].value) + 1;
                var iWinCount = parseInt(data[0].value) + 1;
                var iRate = (iWinCount / iCount).toFixed(2);
                var mTime = parseInt(data[2].value);
                if (iTime < mTime)
                    mTime = iTime;
                var allTime = parseInt(data[5].value) + iTime;
                var aTime = (allTime/iWinCount).toFixed(2);
                var nSteak = parseInt(data[4].value) + 1;
                var mSteak = parseInt(data[3].value);
                if (nSteak > mSteak)
                    mSteak = nSteak;

                wx.setUserCloudStorage({
                    KVDataList: [
                        {key: "win1", value: iWinCount.toString()},
                        {key: "rate1", value: iRate.toString()},
                        {key: "count1", value: iCount.toString()},
                        {key: "mTime1", value: mTime.toString()},
                        {key: "aTime1", value: aTime.toString()},
                        {key: "mSteak1", value: mSteak.toString()},
                        {key: "nSteak1", value: nSteak.toString()},
                        {key: "allTime1", value: allTime.toString()},
                    ],
                });
            },
        })
    },

    setLoseUserInfo(){
        wx.getUserCloudStorage({
            keyList: ["win1", "lose1", "count1",],
            success: function (res) {
                var data = res.KVDataList;
                var iLose = parseInt(data[1].value) + 1;
                var iCount = parseInt(data[2].value) + 1;
                var iWinCount = parseInt(data[0].value);
                var iRate = (iWinCount / iCount).toFixed(2);
                
                wx.setUserCloudStorage({
                    KVDataList: [
                        {key: "lose1", value: iLose.toString()},
                        {key: "rate1", value: iRate.toString()},
                        {key: "count1", value: iCount.toString()},
                        {key: "nSteak1", value: "0"},
                    ],
                });
            },
        })
    },

    setWinUserInfoSP(iTime){
        wx.getUserCloudStorage({
            keyList: ["winSPSP1", "CountSPSP1", "MTimeSPSP1", "MSteakSPSP1", "NSteakSPSP1", "AllTimeSPSP1",],
            success: function (res) {
                // iTime = parseInt(iTime);
                var data = res.KVDataList;
                var iCount = parseInt(data[1].value) + 1;
                var iWinCount = parseInt(data[0].value) + 1;
                var iRate = (iWinCount / iCount).toFixed(2);
                var mTime = parseInt(data[2].value);
                if (iTime < mTime)
                    mTime = iTime;
                var allTime = parseInt(data[5].value) + iTime;
                var aTime = (allTime/iWinCount).toFixed(2);
                var nSteak = parseInt(data[4].value) + 1;
                var mSteak = parseInt(data[3].value);
                if (nSteak > mSteak)
                    mSteak = nSteak;

                wx.setUserCloudStorage({
                    KVDataList: [
                        {key: "winSPSP1", value: iWinCount.toString()},
                        {key: "RateSPSP1", value: iRate.toString()},
                        {key: "CountSPSP1", value: iCount.toString()},
                        {key: "MTimeSPSP1", value: mTime.toString()},
                        {key: "ATimeSPSP1", value: aTime.toString()},
                        {key: "MSteakSPSP1", value: mSteak.toString()},
                        {key: "NSteakSPSP1", value: nSteak.toString()},
                        {key: "AllTimeSPSP1", value: allTime.toString()},
                    ],
                });
            },
        })
    },

    setLoseUserInfoSP(){
        wx.getUserCloudStorage({
            keyList: ["winSPSP1", "LoseSPSP1", "CountSPSP1",],
            success: function (res) {
                var data = res.KVDataList;
                var iLose = parseInt(data[1].value) + 1;
                var iCount = parseInt(data[2].value) + 1;
                var iWinCount = parseInt(data[0].value);
                var iRate = (iWinCount / iCount).toFixed(2);
                
                wx.setUserCloudStorage({
                    KVDataList: [
                        {key: "LoseSPSP1", value: iLose.toString()},
                        {key: "RateSPSP1", value: iRate.toString()},
                        {key: "CountSPSP1", value: iCount.toString()},
                        {key: "NSteakSPSP1", value: "0"},
                    ],
                });
            },
        })
    },
});
