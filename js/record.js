class Recorder {

    constructor(_seed, _operFunc) {
        this.seed = _seed;
        this.time = [];
        this.oper = [];
        this.playIndex = 0;
        this.operFunc = _operFunc;
        this.timeAll = 0;
        this.gameType = 1;
        this.gameTime = 100;
    }

    add(operation, time) {
        this.oper.push(operation);
        let len = this.time.length;
        if (len === 0) {
            this.timeAll += this.getTime(time);
            this.time.push(this.timeAll);
        } else {
            let t = time - this.timeAll;
            this.timeAll += this.getTime(t);
            this.time.push(this.timeAll);
        }
    }

    isEnd = () => {
        return this.playIndex < this.time.length ? false : true;
    }

    play(interval) { //1.5 3 5.5 4 ->0 1
        ////console.log('is play');
        for (let i = this.playIndex; i < this.time.length; i++) {
            if (this.time[i] <= interval) {
                ////console.log('oper'+this.oper[i]);
                this.operFunc(this.oper[i]);
                this.playIndex = i + 1;
                //break;
            }
            else {
                break;
            }
        }
    }

    getTime(t) {
        t = Math.round(t * 100) / 100;
        /*if (t >= 1) {
            t = 0.99;
        }*/
        return t;
    }

    encode1to2(num) {
        let n1 = num >> 8;
        let n2 = num & 0xff;
        return String.fromCharCode(n1) + String.fromCharCode(n2);
    }

    encode2to1 = (op1, op2) => {
        op2 = op2 || 0;
        let code = (op1 << 6) + op2;
        return String.fromCharCode(code);
    }

    encode = () => {
        var str = '';
        // 第1位游戏类型
        ////console.log(this.gameType)
        str += String.fromCharCode(this.gameType);

        // 第2、3位随机种子;
        str += this.encode1to2(this.seed);
        // 第4、5位操作长度
        let len = this.oper.length;
        str += this.encode1to2(len);
        // 第6、7位总时间
        let gameTime = Math.floor(this.gameTime * 100);
        str += this.encode1to2(gameTime);
        // 第8-12位留空
        str += '89abc';
        // 操作数2压1
        let i, op1, op2;
        for (i = 0; i < len; i += 2) {
            op1 = this.oper[i];
            // 0是最后补位的无效操作
            op2 = this.oper[i + 1] || 0;
            str += this.encode2to1(op1, op2);
        }
        // 一个时间拆成两个数压到一个字节
        for (i = 0; i < len; i++) {
            let t = i === 0 ? this.time[i] : this.time[i] - this.time[i - 1];
            op1 = t * 10 >> 0;
            op2 = Math.round(t * 100 - op1 * 10);
            str += this.encode2to1(op1, op2);
        }
        //console.log("编码", (Object.clone(this)))
        return str;
    }
    /**
     * 两个字节解成一个数
     */
    decode2to1 = (n1, n2) => {
        return (n1 << 8) + n2;
    }
    /**
     * 解码
     */
    decode(str) {
        ////console.log('解析')
        this.reset();

        // 头信息12位
        let hl = 12;
        if (!str || str.length < hl) {
            alert('Replay data is wrong!');
            return -1;
        }
        // 第1位游戏类型
        this.gameType = str.charCodeAt(0);
        //console.log('gameType:', this.gameType)
        // 第2、3位随机种子;
        this.seed = this.decode2to1(str.charCodeAt(1), str.charCodeAt(2));
        //console.log('seed:', this.seed)
        ////console.log('seed:',this.seed)
        // 第4、5位操作长度
        let len = this.decode2to1(str.charCodeAt(3), str.charCodeAt(4));
        //console.log('len:', len)
        // 第6、7位总时间
        let gameTime = this.decode2to1(str.charCodeAt(5), str.charCodeAt(6));
        this.gameTime = gameTime / 100;
        // 操作数除以2补整，是操作位数
        let opLen = len % 2 === 1 ? (len + 1) / 2 : len / 2;
        // 总长度可计算出
        let total = hl + opLen + len;
        if (str.length !== total) {
            return;
        }
        // 解码操作数
        let ops = this.oper;
        let i, code, n1, n2;
        for (i = 0; i < opLen; i++) {
            code = str.charCodeAt(hl + i);
            n1 = code >> 6;
            n2 = code & 63;
            ops.push(n1);
            // 0是最后补位的无效操作
            //if (n2 !== 0) {
            ops.push(n2);
            //}
        }
        // 解码时间
        let time = this.time;
        for (i = 0; i < len; i++) {
            code = str.charCodeAt(hl + opLen + i);
            n1 = code >> 6;
            n2 = code & 63;
            let t = n1 / 10 + n2 / 100;
            this.timeAll += t;
            time.push(this.timeAll);
        }
        return 0;
        //console.log("解析", this);
    }

    reset() {
        this.gameTime = 100;
        this.gameType = 5;
        this.seed = 0;
        this.oper = [];
        this.time = [];
        this.playIndex = 0;
        this.timeAll = 0;
    }
    print() {
        /* //console.log('print recorder:', this.gameType, this.seed, this.oper.length, this.timeAll, this.time);
         //console.log("ops:", this.oper.join(','));
         //console.log("time:", this.time.join(','));*/
        //console.log(this.encode());
    }

    encodeUnicode(str) {
        var res = [];
        for (var i = 0; i < str.length; i++) {
            res[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
        }
        return "\\u" + res.join("\\u");
    }
}