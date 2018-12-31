cc.Class({
    extends: cc.Component,

    properties: {
        rank: cc.Label,
        head: cc.Sprite,
        labName: cc.Label,
        cost: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // this.head.node.active = false;
    },

    // update (dt) {},

    initShow(idx, data){
        idx = idx ? idx.toString() : "1";
        this.showRank(idx);
        this.showName(data.nickname);
        var iCost = 3601;
        if (data.KVDataList.length > 0)
            iCost = data.KVDataList[0].value;
        this.showCost(iCost);
        var url = data.avatarUrl;
        this.showHead(url);
    },

    showRank(idx){
        this.rank.string = idx;
    },

    showCost(value){
        this.cost.string = value + "秒";
    },

    showName(str){
        if (str.length > 5) 
            str = str.substring(0, 5) + "..";
        this.labName.string = str || "洞房不败";
    },

    showHead(url){
        if (url == null) return;
        var self = this;
        cc.loader.load({url: url, type: 'png'}, function(err, texture) {
            self.head.spriteFrame = new cc.SpriteFrame(texture);
        }.bind(this));
    },
});
