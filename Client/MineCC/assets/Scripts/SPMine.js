var SPMine = {
    _iTotal: 108,
    _iRow: 9,
    getSPMine(str){
        switch (str) {
        case "sz":
            return this.getZMine ();
        case "sh":
            return this.getHMine ();
        case "si":
            return this.getIMine ();
        // case "sc":
        //     return this.getCMine ();
        case "su":
            return this.getUMine ();
        // case "sl":
        //     return this.getLMine ();
        case "sa":
            return this.getAMine ();
        case "sn":
            return this.getNMine ();
        case "ss":
            return this.getSMine ();
        case "sw":
            return this.getWMine ();
        case "so":
            return this.getOMine ();
        default:
            return this.getZMine ();
        }
    },

    getZMine(){
        var iTotal = this._iTotal;
        var iRow = this._iRow;
        var tMineNum = [];
        for (var i = 0; i < iTotal; i++) {
            var iLine = Math.floor (i / iRow) + 1;
            var iR = i % iRow;
            if (i < iRow)
                tMineNum[i] = 1;
            else if (i >= iTotal - iRow)
                tMineNum[i] = 1;
            else if (iLine == 2 && iR == iRow - 1)
                tMineNum[i] = 1;
            else if (iLine == 3 && (iR == iRow - 1 || iR == iRow - 2))
                tMineNum[i] = 1;
            else if (iLine == 4 && (iR == iRow - 2 || iR == iRow - 3))
                tMineNum[i] = 1;
            else if (iLine == 5 && (iR == iRow - 3 || iR == iRow - 4))
                tMineNum[i] = 1;
            else if (iLine == 6 && (iR == iRow - 4 || iR == iRow - 5))
                tMineNum[i] = 1;
            else if (iLine == 7 && (iR == iRow - 5 || iR == iRow - 6))
                tMineNum[i] = 1;
            else if (iLine == 8 && (iR == iRow - 6 || iR == iRow - 7))
                tMineNum[i] = 1;
            else if (iLine == 9 && (iR == iRow - 7 || iR == iRow - 8))
                tMineNum[i] = 1;
            else if (iLine == 10 && (iR == iRow - 8 || iR == iRow - 9))
                tMineNum[i] = 1;
            else if (iLine == 11 && iR == iRow - 9)
                tMineNum[i] = 1;
            else
                tMineNum[i] = 0;
        };
        return tMineNum;
    },

    getHMine(){
        var iTotal = this._iTotal;
        var iRow =this._iRow;
        var tMineNum = [];
        for (var i = 0; i < iTotal; i++) {
            var iLine = Math.floor (i / iRow) + 1;
            var iR = i % iRow;
            if (iR == 0 || iLine == 6 || iR == 8)
                tMineNum [i] = 1;
            else
                tMineNum[i] = 0;
        };
        return tMineNum;
    },

    getIMine(){
        var iTotal = this._iTotal;
        var iRow = this._iRow;
        var tMineNum = [];
        for (var i = 0; i < iTotal; i++) {
            var iLine = Math.floor (i / iRow) + 1;
            var iR = i % iRow;
            if (iR == 4)
                tMineNum [i] = 1;
            else if ((iLine == 1 || iLine == 12) && (iR > 1 && iR < 7))
                tMineNum [i] = 1;
            else
                tMineNum[i] = 0;
        };
        return tMineNum;
    },

    getUMine(){
        var iTotal = this._iTotal;
        var iRow = this._iRow;
        var tMineNum = [];
        for (var i = 0; i < iTotal; i++) {
            var iLine = Math.floor (i / iRow) + 1;
            var iR = i % iRow; 
            if (iR == 0 || iLine == 12 || iR == 8)
                tMineNum [i] = 1;
            else
                tMineNum[i] = 0;
        };
        return tMineNum;
    },

    getAMine(){
        var iTotal = this._iTotal;
        var iRow = this._iRow;
        var tMineNum = [];
        for (var i = 0; i < iTotal; i++) {
            var iLine = Math.floor (i / iRow) + 1;
            var iR = i % iRow; 
            if (iLine == 1 && iR == 4)
                tMineNum [i] = 1;
            else if (iLine == 2 && (iR == 3 || iR == 5))
                tMineNum[i] = 1;
            else if (iLine == 3 && (iR == 3 || iR == 5))
                tMineNum[i] = 1;
            else if (iLine == 4 && (iR == 3 || iR == 5))
                tMineNum[i] = 1;
            else if (iLine == 5 && (iR == 2 || iR == 6))
                tMineNum[i] = 1;
            else if (iLine == 6 && (iR == 2 || iR == 6))
                tMineNum[i] = 1;
            else if (iLine == 7 && (iR == 2 || iR == 6))
                tMineNum[i] = 1;
            else if (iLine == 8 && (iR >= 1 && iR <= 7))
                tMineNum[i] = 1;
            else if (iLine == 9 && (iR == 1 || iR == 7))
                tMineNum[i] = 1;
            else if (iLine == 10 && (iR == 0 || iR == 8))
                tMineNum[i] = 1;
            else if (iLine == 11 && (iR == 0 || iR == 8))
                tMineNum[i] = 1;
            else if (iLine == 12 && (iR == 0 || iR == 8))
                tMineNum[i] = 1;
            else
                tMineNum[i] = 0;
        };
        return tMineNum;
    },

    getNMine(){
        var iTotal = this._iTotal;
        var iRow = this._iRow;
        var tMineNum = [];
        for (var i = 0; i < iTotal; i++) {
            var iLine = Math.floor (i / iRow) + 1;
            var iR = i % iRow; 
            if (iR == 0 || iR == 8)
                tMineNum [i] = 1;
            else if (iLine == 2 && iR == 1)
                tMineNum[i] = 1;
            else if (iLine == 3 && iR == 2)
                tMineNum[i] = 1;
            else if (iLine == 4 && iR == 3)
                tMineNum[i] = 1;
            else if (iLine == 5 && iR == 3)
                tMineNum[i] = 1;
            else if (iLine == 6 && iR == 4)
                tMineNum[i] = 1;
            else if (iLine == 7 && iR == 4)
                tMineNum[i] = 1;
            else if (iLine == 8 && iR == 5)
                tMineNum[i] = 1;
            else if (iLine == 9 && iR == 5)
                tMineNum[i] = 1;
            else if (iLine == 10 && iR == 6)
                tMineNum[i] = 1;
            else if (iLine == 11 && iR == 7)
                tMineNum[i] = 1;
            else
                tMineNum[i] = 0;
        };
        return tMineNum;
    },

    getSMine(){
        var iTotal = this._iTotal;
        var iRow = this._iRow;
        var tMineNum = [];
        for (var i = 0; i < iTotal; i++) {
            var iLine = Math.floor (i / iRow) + 1;
            var iR = i % iRow;
            if (iLine == 1 || iLine == 6 || iLine == 12)
                tMineNum[i] = 1;
            else if (iR == 0 && (iLine <= 6 || iLine > 8))
                tMineNum[i] = 1;
            else if (iR == 8 && (iLine <= 3 || iLine > 5))
                tMineNum[i] = 1;
            else
                tMineNum[i] = 0;
        };
        return tMineNum;
    },

    getWMine(){
        var iTotal = this._iTotal;
        var iRow = this._iRow;
        var tMineNum = [];
        for (var i = 0; i < iTotal; i++) {
            var iLine = Math.floor (i / iRow) + 1;
            var iR = i % iRow;
            if ((iLine == 1 || iLine == 12) && iR > 5)
                tMineNum[i] = 1;
            else if ((iLine == 2 || iLine == 11) && iR > 2 && iR < 6)
                tMineNum[i] = 1;
            else if ((iLine == 3 || iLine == 10) && iR < 3)
                tMineNum[i] = 1;
            else if ((iLine == 4 || iLine == 9) && iR == 0)
                tMineNum[i] = 1;
            else if ((iLine == 5 || iLine == 8) && iR > 0 && iR < 3)
                tMineNum[i] = 1;
            else if ((iLine == 6 || iLine == 7) && iR > 2 && iR < 5)
                tMineNum[i] = 1;
            else
                tMineNum[i] = 0;
        };
        return tMineNum;
    },

    getOMine(){
        var iTotal = this._iTotal;
        var iRow = this._iRow;
        var tMineNum = [];
        for (var i = 0; i < iTotal; i++) {
            var iLine = Math.floor (i / iRow) + 1;
            var iR = i % iRow;
            if ((iR == 0 || iR == 8) && (iLine > 3 && iLine < 10))
                tMineNum[i] = 1;
            else if ((iR == 1 || iR == 7) && (iLine == 2 || iLine == 3 || iLine == 11 || iLine == 10))
                tMineNum[i] = 1;
             else if ((iR == 2 || iR == 6) && (iLine == 2 || iLine == 1 || iLine == 11 || iLine == 12))
                tMineNum[i] = 1;
             else if ((iR > 2 && iR < 6) && (iLine == 1 || iLine == 12))
                tMineNum[i] = 1;
            else
                tMineNum[i] = 0;
        };
        return tMineNum;
    },
};

module.exports = SPMine;