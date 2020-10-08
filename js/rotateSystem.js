var rotateSys = {
    //rotateState: 0,
    NomalkickData: new Array(8),
    IkickData: new Array(8),
    changeState: function (tetro, x) {
        tetro.rotateState += x;
        if (tetro.rotateState < 0) tetro.rotateState += 4;
        tetro.rotateState %= 4;
    },
    reset: function (tetro) {
        tetro.rotateState = 0;
    },
    getOffset: function (tetro, direct, index, kind) { //direct:0 normal 1 reverse index:0 1 2 3 4 kind:0 1
        var posOffset = new Array(), i;
        if (tetro.rotateState == 0) {
            switch (direct) {
                case 0: i = 0; break;
                case 1: i = 7; break;
            }
        }
        else if (tetro.rotateState == 1) {
            switch (direct) {
                case 1: i = 1; break;
                case 0: i = 2; break;
            }
        }
        else if (tetro.rotateState == 3) {
            switch (direct) {
                case 1: i = 5; break;
                case 0: i = 6; break;
            }
        }
        else if (tetro.rotateState == 2) {
            switch (direct) {
                case 1: i = 3; break;
                case 0: i = 4; break;
            }
        }
        if (kind) {
            posOffset.push(this.NomalkickData[i][index * 2]);
            posOffset.push(this.NomalkickData[i][index * 2 + 1]);
        }
        else {
            posOffset.push(this.IkickData[i][index * 2]);
            posOffset.push(this.IkickData[i][index * 2 + 1]);
        }
        return posOffset;
    },
    NomalkickData: [[0, 0, -1, 0, -1, 1, 0, -2, -1, -2],//0->R
    [0, 0, 1, 0, 1, -1, 0, 2, 1, 2],  //R->0
    [0, 0, 1, 0, 1, -1, 0, 2, 1, 2], //R->2
    [0, 0, -1, 0, -1, 1, 0, -2, -1, -2],  //2->R
    [0, 0, 1, 0, 1, 1, 0, -2, 1, -2], //2->L
    [0, 0, -1, 0, -1, -1, 0, 2, -1, 2], //L->2
    [0, 0, -1, 0, -1, -1, 0, 2, -1, 2], //L->0
    [0, 0, 1, 0, 1, 1, 0, -2, 1, -2]], //0->L
    //----I
    IkickData: [[0, 0, -2, 0, 1, 0, -2, -1, 1, 2], //0->R
    [0, 0, 2, 0, -1, 0, 2, 1, -1, -2],  //R->0
    [0, 0, -1, 0, 2, 0, -1, 2, 2, -1], //R->2
    [0, 0, 1, 0, -2, 0, 1, -2, -2, 1],  //2->R
    [0, 0, 2, 0, -1, 0, 2, 1, -1, -2], //2->L
    [0, 0, -2, 0, 1, 0, -2, -1, 1, 2], //L->2
    [0, 0, 1, 0, -2, 0, 1, -2, -2, 1], //L->0
    [0, 0, -1, 0, 2, 0, -1, 2, 2, -1]], //0->L

    rotate: function (n, tetro, _feild = tetris.board, check = 1) {
        var pos = tetro.pos, block = tetro.block;
        var real = 1;
        var newLayout = [];
        var feild = _feild;
        var cols = tetris.columns, rows = tetris.rows;
        if (n == 0)
            for (var x = 0; x < block[0].length; x++) {
                newLayout[x] = [];
                for (var y = 0; y < block.length; y++) {
                    newLayout[x][y] = block[block.length - 1 - y][x];//顺时针旋转
                }
            }

        else if (n == 1)
            for (var x = 0; x < block[0].length; x++) {
                newLayout[x] = [];
                for (var y = 0; y < block.length; y++) {
                    newLayout[x][y] = block[y][block[0].length - x - 1];//逆时针旋转
                }
            }
        else if (n == 2)
            for (var x = 0; x < block[0].length; x++) {
                newLayout[x] = [];
                for (var y = 0; y < block.length; y++) {
                    newLayout[x][y] = block[block.length - 1 - x][block.length - 1 - y];//顺时针旋转
                }
            }

        if (check) {
            for (var x = 0; x < newLayout.length; x++) {
                for (var y = 0; y < newLayout[0].length; y++) {
                    if (newLayout[x][y] == 1) {
                        if (!tetris.checkCrossBorder(pos.x + y, pos.y + x)) {
                            real = 0;
                            continue;
                        }
                        if (feild[pos.y + x][pos.x + y] == 1)
                            real = 0;
                    }
                }
            }
        }

        if (real) {
            tetro.block = newLayout;
            switch (n) {
                case 0: this.changeState(tetro, 1); break;
                case 1: this.changeState(tetro, -1); break;
                case 2: this.changeState(tetro, 2); break;
            }
        }
        return real;
    },
    srsRot: function (n, tetro, _feild = tetris.board) {
        var real;
        var old_pos = new Pos(tetro.pos.x,tetro.pos.y);
        var Thiskind = tetro.kind;
        var pos = tetro.pos;
        for (var i = 0; i < 5; i++) {
            var Offset = this.getOffset(tetro, n, i, Thiskind);
            pos.y -= Offset[1];
            pos.x += Offset[0];
            real = this.rotate(n, tetro, _feild);
            if (real) {
                break;
            }
            else {
                pos.y = old_pos.y;
                pos.x = old_pos.x;
            }
        }
        return real;
    },
    Rot180: function (n, tetro, _feild = tetris.board) {
        var real;
        var old_pos = new Pos(tetro.pos.x,tetro.pos.y);
        //var Thiskind = tetro.kind;
        var pos = tetro.pos;
        var rotateState = tetro.rotateState;
        var Offset = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
        for (var i = 0; i < 5; i++) {
            pos.y -= Offset[i][1];
            pos.x += Offset[i][0];
            real = this.rotate(2, tetro, _feild);
            if (real) {
                break;
            }
            else {
                pos.y = old_pos.y;
                pos.x = old_pos.x;
                tetro.rotateState = rotateState;
            }
        }
        return real;
    }
}
