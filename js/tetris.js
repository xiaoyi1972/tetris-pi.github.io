CanvasRenderingContext2D.prototype.StringRGBA = function (r, g, b, a) {
    let str = 'rgba(' + r.toString() + ',' + g.toString() + ',' + b.toString() + ',' + a.toString() + ')';
    return str;
}

function deepcopyArr(arr) {
    var outarr = [], len = arr.length;
    for (var i = 0; i < len; i++) {
        outarr[i] = new Array();
        for (var j = 0; j < arr[i].length; j++) {
            outarr[i][j] = arr[i][j];
        }
    }
    return outarr;
}

let displayBlock = {
    0: [[1, 1], [1, 1]],//O
    1: [[1, 1, 1, 1]],//I
    2: [[0, 1, 0], [1, 1, 1]],//T
    3: [[1, 0, 0], [1, 1, 1]],//J
    4: [[0, 0, 1], [1, 1, 1]],//L
    5: [[1, 1, 0], [0, 1, 1]],//Z
    6: [[0, 1, 1], [1, 1, 0]],//S
}

//let Piece = { O: 0, I: 1, T: 2, J: 3, L: 4, Z: 5, S: 6 }

let Block = {
    t: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    j: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    l: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    i: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    s: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    o: [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
    IndexOf:
        function (n) {
            let block;
            switch (n) {
                case 0: block = this.o; break;
                case 1: block = this.i; break;
                case 2: block = this.t; break;
                case 3: block = this.j; break;
                case 4: block = this.l; break;
                case 5: block = this.z; break;
                case 6: block = this.s; break;

            }
            return block;
        },
    ColorOf:
        function (m) {
            return this.colors[m];
        },
    colors: ['#f7d40c', '#03e4d1', '#d615dc', '#1a5ae4', '#faa70a', '#f0200d', '#85bc3c', '#dcdcdc']
};

let blockCanvas = document.createElement('canvas');
//document.body.append(blockCanvas);
blockCanvas.width = 19 * 10;
blockCanvas.height = 19;

function getPixelRatio(context) {
    let backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
};

function drawblock() {
    let blockCtx = blockCanvas.getContext('2d');
    /*let ratio = getPixelRatio(blockCtx );
    blockCanvas.style.width = blockCanvas.width + 'px';
    blockCanvas.style.height = blockCanvas.height + 'px';
    blockCanvas.width = blockCanvas.width * ratio;
    blockCanvas.height = blockCanvas.height * ratio;
    blockCtx.scale(ratio, ratio);*/

    //blockCtx.width = 19 * 10;
    //blockCtx.height = 19;

    let gridArea = 19;
    for (let i = 0; i < Block.colors.length; i++) {
        let draw_x = i * 19 + i, draw_y = 0;
        let color = Block.ColorOf(i);
        let _gridArea = gridArea - 2
        blockCtx.fillStyle = colorHandle.getLightColor(color, 0.2)
        blockCtx.fillRect(draw_x, 0, gridArea, gridArea);
        /*blockCtx.fillStyle = ldc(color, 10);
        blockCtx.fillRect(draw_x + 1, 0 + 1, _gridArea, _gridArea);*/

        //blockCtx.fillStyle = color

        //上梯形渐变
        let a = colorHandle.getDarkColor(color, 0.1)
        let grd = blockCtx.createLinearGradient(draw_x, 0, draw_x + gridArea, gridArea);
        grd.addColorStop(1, color);
        grd.addColorStop(0, a);
        blockCtx.fillStyle = grd;

        //上梯形
        blockCtx.lineWidth = 1
        blockCtx.beginPath();
        blockCtx.moveTo(draw_x + 1, draw_y + 1);
        blockCtx.lineTo(draw_x + 1, draw_y + 1 + parseInt((_gridArea) / 100 * 78));
        blockCtx.lineTo(draw_x + 1 + _gridArea, draw_y + 1 + parseInt((_gridArea) / 100 * 35));
        blockCtx.lineTo(draw_x + 1 + _gridArea, draw_y + 1);
        blockCtx.fill();

        //下梯形渐变
        let a1 = colorHandle.getLightColor(color, 0.15)
        let a2 = colorHandle.getLightColor(a1, 0.1)
        let grd1 = blockCtx.createLinearGradient(draw_x, 0, draw_x + gridArea, gridArea);
        grd1.addColorStop(1, a1);
        grd1.addColorStop(0, a2);
        blockCtx.fillStyle = grd1

        //下梯形
        blockCtx.beginPath();
        blockCtx.moveTo(draw_x + 1, draw_y + 1 + parseInt((_gridArea) / 100 * 78));
        blockCtx.lineTo(draw_x + 1, draw_y + 1 + parseInt((_gridArea) / 100 * 100));
        blockCtx.lineTo(draw_x + 1 + _gridArea, draw_y + 1 + parseInt((_gridArea) / 100 * 100));
        blockCtx.lineTo(draw_x + 1 + _gridArea, draw_y + 1 + parseInt((_gridArea) / 100 * 35));
        blockCtx.fill();

    }
}
drawblock();

class Random {
    constructor() {
        this.bag = new Array();
        this.displayBag = new Array();
        this.randomSeed = {
            seed: 1,
            random: function () {
                this.seed = (this.seed * 9301 + 49297) % 233280;
                return this.seed / 233280.0;
            }
        }
        let date = new Date();
        this.randomSeed.seed = Math.floor(date.getMilliseconds());
    }

    getBag() {
        //this.bag = new Array(7).fill(3);
        //this.bag=new Array(1,6);
        //this.bag = [3, 1, 6, 4, 2, 0, 0]
        //return;
        do {
            let num = parseInt(this.randomSeed.random() * 10) % 7;
            if (this.bag.includes(num)) {
                continue;
            }
            else {
                this.bag.push(num);
            }
        } while (this.bag.length != 7)
    }

    getOne() {
        if (!this.bag.length) { //[0,1,2,3,4,5,6]
            this.getBag();
            if (!this.displayBag.length)
                this.displayBag = this.bag.slice();
            this.bag = new Array();
            this.getBag();
        }
        if (this.displayBag.length < 7) {
            this.displayBag.push(this.bag.shift());
        }
        let num = this.displayBag.shift()
        this.getNextdraw(tetris.nextCanvasCtx);
        return num;
    }

    getNextdraw = function (ctx) {
        ctx.clearRect(0, 0, 80, 400);
        let size = 18;
        for (let m = 0; m < this.displayBag.length; m++) {
            let kind = this.displayBag[m];
            let block = displayBlock[this.displayBag[m]];
            ctx.fillStyle = Block.colors[this.displayBag[m]];
            for (let i = 0; i < block.length; i++)
                for (let j = 0; j < block[0].length; j++) {
                    if (block[i][j]) {
                        ctx.drawImage(blockCanvas, kind * 19 + kind, 0, 19, 19, j * size + j + 2,
                            i * size + m * 50 + i, size, size);
                        //ctx.fillRect(j * size + j, i * size + m * 50 + i, size, size);
                    }
                }
        }
    }
}


class Tetro {
    constructor(index) {
        this.pos = new Pos(3, 0);
        this.rotateState = 0;
        this.block = Block.IndexOf(index);
        this.kind = index;
        this.gridArea = 20;
    }

    copy = () => {
        var newT = new Tetro(this.kind);
        newT.pos = new Pos(this.pos.x, this.pos.y);
        newT.kind = this.kind;
        newT.block = [];
        for (let x = 0; x < this.block.length; x++) {
            newT.block[x] = []
            for (let y = 0; y < this.block[0].length; y++)
                newT.block[x][y] = this.block[x][y];
        }
        return newT;
    }

    qb = () => {
        let a = `x${this.pos.x}y${this.pos.y}r${this.rotateState}`
        return a
    }
    qbb = () => {
        let a = "";
        for (let i = 0; i < this.block.length; i++)
            for (let j = 0; j < this.block[0].length; j++) {
                if (this.block[i][j]) {
                    let b = "";
                    b = `(${this.pos.y + i},${this.pos.x + j})`;
                    a += b;
                }
            }
        //a=`x${this.pos.x}y${this.pos.y}$r${this.rotateState}`
        //a+="r"
        // a+=this.rotateState
        return a;
    }
    /*this.animate = new Pos(0, 0);
    this.resetAnimate = function () {
        this.animate = new Pos(this.pos.x * this.gridArea, this.pos.y * this.gridArea);
        this.tween=new TWEEN.Tween(this.animate);
        this.tween.easing(TWEEN.Easing.Linear.None);
    }
    this.tween = null;
    this.resetAnimate();
    rotateSys.reset(this);*/
}

class Pos {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Hold {
    constructor(m_ctx) {
        this.tetro = -1;
        this.able = true;
        //this.times = 0;
        this.ctx = m_ctx;
        this.ctx.clearRect(0, 0, 80, 80);
    }
    resetTimes() {
        this.able = true;
    }
    exchange() {
        //console.log('exchange: ' + this.times);
        if (this.able) {
            if (this.tetro == -1) {
                this.tetro = tetris.tetro.kind;
                tetris.tetro = new Tetro(tetris.randomSys.getOne());
            }
            else {
                let n = tetris.tetro.kind;
                tetris.tetro = new Tetro(this.tetro);
                this.tetro = n
            }
            this.draw();
            tetris.tetro.pos = new Pos(3, 0);
            this.able = !this.able;
        }
    }
    draw = () => {
        this.ctx.fillStyle = Block.ColorOf(this.tetro);
        let block = displayBlock[this.tetro];
        let kind = this.tetro;
        let size = 18;
        this.ctx.clearRect(0, 0, 80, 80);
        for (let i = 0; i < block.length; i++)
            for (let j = 0; j < block[0].length; j++) {
                if (block[i][j])
                    this.ctx.drawImage(blockCanvas, kind * 19 + kind, 0, 19, 19, j * size + j,
                        i * size + i, size, size);
            }
    }
}


function gaoqing(canvas) {
    let ctx = canvas.getContext('2d');
    let ratio = getPixelRatio(ctx);
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width = canvas.width * ratio;
    canvas.height = canvas.height * ratio;
    ctx.scale(ratio, ratio);
}

class Tetris {
    constructor() {
        this.tetro; //当前块
        this.board; //场地
        this.colorboard; //颜色场地
        this.rows = 24; //行数
        this.columns = 10; //列数
        this.gridArea = 20; //格子大小
        this.drawCtx = document.getElementById('drawCanvas').getContext('2d'); //绘画环境
        this.nextCanvasCtx = document.getElementById('nextCanvas').getContext('2d'); //序列绘画环境
        this.holdSys; //暂存对象
        this.randomSys; //随机序列对象
        this.fix = 0; //锁定
        this.fixCount = 120; //锁定时间
        this.clearlines = 0; //清除的行数
        this.startTime; //开始的时间
        this.time; //时间
        this.restart = 0; //是否重新开始
        this.timer; //绘画句柄
        this.pauseState = 0; //是否暂停
        this.pauseTime; //暂停的时间点
        this.frame = 0; //当前帧数
        this.allFrameCount = 0; //所有帧数统计 
        this.lastTime = Date.now(); //上个时间
        this.lastFameTime = Date.now(); //上一帧的时间
        this.recordTime = 0; //录像时间
        this.isReplay = 0; //是否播放录像
        this.startReplay = 0; //开始播放录像
        this.seed; //当前序列种子
        this.botworking = false; //是否开启bot
        this.putArray = new Array();
        this.freshPut = 0;
        this.lastControl = 0;//最后一步操作，1为旋转
        this.Zen_num = 0;//处于连击的数量
        this.b2b = 0;//b2b状态
        this.preTime = 0;
        this.count = 0;
        //this.animate = { x: 0 };
        //this.tween = null;
        this.label = {
            clearline: document.querySelector('#clearline'),
            time: document.querySelector('#time')
        }
        this.particle = new Particle(this.drawCtx);
        /*this.tween.onUpdate(function (object) {
            console.log(object.x);
        });*/
    }

    bg() { //b:0 l:21 b:22 l:43 b:44 
        this.drawCtx.lineWidth = 0.5;
        this.drawCtx.strokeStyle = 'rgba(0,0,0,1)';
        this.drawCtx.strokeRect(0.5, 0.5, 200, 400);
        this.drawCtx.strokeStyle = 'rgba(0,0,0,0.2)';
        for (let i = 1; i < 10; i++) {
            this.drawCtx.beginPath();
            this.drawCtx.moveTo(i * 20 + 0.5, 0);
            this.drawCtx.lineTo(i * 20 + 0.5, 401)
            this.drawCtx.stroke();

        }
        for (let i = 1; i < 20; i++) {
            this.drawCtx.beginPath();
            this.drawCtx.moveTo(0, i * 20 + 0.5);
            this.drawCtx.lineTo(201, i * 20 + 0.5)
            this.drawCtx.stroke();
        }
    }


    placeBlock() {//画场地块
        for (let i = 4; i < tetris.rows; i++)
            for (let j = 0; j < tetris.columns; j++) {
                let i1 = i - 4;
                if (tetris.board[i][j]) {
                    let draw_x = j * tetris.gridArea;
                    let draw_y = i1 * tetris.gridArea;
                    let kind = tetris.colorboard[i][j];
                    this.drawCtx.drawImage(blockCanvas, kind * 19 + kind, 0, 19, 19, draw_x + 1, draw_y + 1, tetris.gridArea - 1, tetris.gridArea - 1);
                    //this.drawCtx.fillStyle=this.drawCtx.StringRGBA()
                }
            }
    }

    activeBlock() {//画控制块
        for (let i = 0; i < tetris.tetro.block.length; i++)
            for (let j = 0; j < tetris.tetro.block[0].length; j++) {
                if (tetris.tetro.block[i][j]) {
                    let x = i + tetris.tetro.pos.y;
                    let y = j + tetris.tetro.pos.x;
                    let kind = this.tetro.kind;
                    //let color = Block.ColorsValueOf(tetris.tetro.kind);
                    if (x > 3) {
                        let draw_x = y * tetris.gridArea;
                        //let draw_x = j * tetris.gridArea;
                        //let draw_x = tetris.tetro.animate.x + j * tetris.gridArea;
                        let draw_y = (x - 4) * tetris.gridArea;
                        if (tetris.fix) {
                            let count = 20;
                            let m = parseInt(tetris.fix / count);
                            let n = m % 2, alpha;
                            if (n)
                                alpha = (tetris.fix) % count / count;
                            else
                                alpha = 1 - (tetris.fix) % count / count;
                            this.drawCtx.globalAlpha = alpha;
                        }
                        this.drawCtx.drawImage(blockCanvas, kind * 19 + kind, 0, 19, 19, draw_x + 1, draw_y + 1, tetris.gridArea - 1, tetris.gridArea - 1);
                        this.drawCtx.globalAlpha = 1;
                    }
                }
            }
    }

    shadowBlock() {//画阴影
        let block = tetris.tetro.block;
        let pos = tetris.tetro.pos;
        let bottomX = tetris.getHarddropHeight();
        if (bottomX == 0) return;
        for (let i = 0; i < block.length; i++)
            for (let j = 0; j < block[0].length; j++) {
                if (block[i][j] && tetris.checkCrossBorder(pos.x + j, pos.y + i + bottomX)) {
                    let y = pos.y + i + bottomX;
                    let x = pos.x + j;
                    let color = Block.ColorOf(tetris.tetro.kind);
                    if (y > 3) {
                        this.drawCtx.lineWidth = 1;
                        let draw_x = x * tetris.gridArea + 0.5 + 1;
                        //let draw_x = j * tetris.gridArea + 0.1 + 1;
                        //let draw_x = this.tetro.animate.x + j * tetris.gridArea + 0.1 + 1;
                        let draw_y = (y - 4) * tetris.gridArea + 0.5 + 1;
                        this.drawCtx.strokeStyle = color;
                        this.drawCtx.strokeRect(draw_x, draw_y, tetris.gridArea - 2, tetris.gridArea - 2);
                    }
                }
            }
    }

    draw() {
        this.drawCtx.clearRect(0, 0, 201, 401);
        //this.drawCtx.fillStyle="rgba(0,0,0,0.1)"
        //this.drawCtx.fillRect(0,0,201,401)
        this.placeBlock();
        this.activeBlock();
        this.shadowBlock();
        this.bg();
        this.drawPutFresh();
    }

    drawPutFresh() {
        let freshCount = 30
        this.freshPut++;
        if (this.freshPut == freshCount) {
            this.freshPut = 0;
            this.putArray.splice(0);
        }
        if (this.putArray.length == 0) {
            return;
        }
        //let test = `rgba(${255}, ${255}, ${255}, ${(10 - this.freshPut) / 20})`;
        let test = `rgba(${255}, ${255}, ${255}, ${0})`;
        //console.log(test)
        this.drawCtx.fillStyle = test
        //this.drawCtx.fillStyle = "black"

        let minP = { x: 999, y: 999 }
        let maxP = { x: -999, y: -999 }



        this.putArray.forEach(t => {
            //console.log(t)

            //if (draw_x < xM) xM = draw_x;
            //if (draw_y < yM) yM = draw_y;
            if (minP.x >= t.x) minP.x = t.x
            if (minP.y >= t.y) minP.y = t.y
            if (maxP.x <= t.x) maxP.x = t.x
            if (maxP.y <= t.y) maxP.y = t.y

            let draw_x = t.y * tetris.gridArea;
            let draw_y = (t.x - 4) * tetris.gridArea;
            this.drawCtx.rect(draw_x + 1, draw_y + 1, tetris.gridArea - 1, tetris.gridArea - 1);

            //this.drawCtx.fillRect(draw_x + 1, draw_y + 1, tetris.gridArea - 1, tetris.gridArea - 1);
        })
        //console.log("宽度:", (maxP.y - minP.y + 1), "高度:", (maxP.x - minP.x + 1))


        this.drawCtx.save()
        this.drawCtx.clip();

        let _x = minP.y * tetris.gridArea;
        let _y = (minP.x - 4) * tetris.gridArea;
        let _width = (maxP.y - minP.y + 1) * tetris.gridArea;
        let _height = (maxP.x - minP.x + 1) * tetris.gridArea;

        let grd1 = this.drawCtx.createLinearGradient(0, 0,
            20, 0);
        grd1.addColorStop(0, 'rgba(255,255,255,0.72)');
        grd1.addColorStop("0.5", 'rgba(255,255,255,1)');
        grd1.addColorStop(1, 'rgba(255,255,255,0.72)');
        this.drawCtx.fillStyle = grd1

        ///  this.drawCtx.transform(1, 0, -Math.sin(30 * Math.PI / 180), 1,
        //      _x + (this.freshPut / freshCount) * (_width + 20), _y);
        ///  this.drawCtx.transform(1, 0, -Math.sin(30 * Math.PI / 180), 1,
        //      _x + (this.freshPut / freshCount) * (_width + 20), _y);
        this.drawCtx.transform(1, 0, -Math.sin(25 * Math.PI / 180), 1,
            _x + (this.freshPut / freshCount) * (_width + 40), _y);
        //  this.drawCtx.fillRect(_x + (this.freshPut / freshCount) * (_width), _y, 20, _height)
        //this.drawCtx.fillStyle="rgba(255,255,255,.9)"
        this.drawCtx.fillRect(0, 0, 20, _height)
        this.drawCtx.restore()
        /*this.drawCtx.save()
        this.drawCtx.globalCompositeOperation = "source-atop";
       // 
        this.drawCtx.fillStyle = "yellow"
        this.drawCtx.fillRect(xM, yM, 5, 40)
        this.drawCtx.restore()*/
    }

    drawPutBorder() {

    }

    transTime(timeDeltaA) {//信息
        let min = parseInt(timeDeltaA / 60000);
        let sec = parseInt((timeDeltaA - min * 60000) / 1000);
        let ms = timeDeltaA - sec * 1000 - min * 60000;
        /*let sec = timeDeltaA.getSeconds();
        let min = timeDeltaA.getMinutes();
        let ms = timeDeltaA.getMilliseconds();*/
        let mil = parseInt(ms / 100) * 100;
        ms = ms < 100 ? '0' + parseInt(ms / 10) : String(parseInt(ms / 100)) + String(parseInt((ms - mil) / 10));
        let x = (min > 0 ? min + ':' : "") + sec + '.' + ms;
        return x;
    }

    tag() {
        this.label.clearline.innerHTML = this.clearlines.toString();
        let nowtime = new Date();
        let timeDelta = nowtime - this.startTime;
        //this.time = new Date(0, 0, 0, 0, 0, 0, timeDelta);
        //let timeDeltaA = transTime(this.time);
        let timeDeltaA = this.transTime(timeDelta);
        this.label.time.innerHTML = timeDeltaA.toString();
    }

    loop = (_time) => {
        this.draw();
        this.keyResponse();
        this.tag();
        this.recordTime += 0.1;
        if (this.isReplay) {
            record.play(this.recordTime);
            if (record.isEnd())
                this.isReplay = false
        }
        /*if (this.restart) {
            cancelAnimationFrame(this.timer);
            let r = this.startReplay;
            tetris = new Tetris();
            if (r)
                tetris.isReplay = 1;
            tetris.init();
            return;
        }*/
        document.querySelector("#t").innerHTML = `${this.tetro.pos.x},${this.tetro.pos.y}`
        //this.particle.rms = _time;
        this.particle.update(_time - this.preTime);
        //console.log(_time-this.preTime)
        this.preTime = _time;
        if (this.botworking)
            this.botcall();
        this.timer = requestAnimationFrame(this.loop);
    }

    newStart = () => {
        cancelAnimationFrame(this.timer);
        tetris = new Tetris();
        tetris.init();
    }

    replay = () => {
        cancelAnimationFrame(this.timer);
        tetris = new Tetris();
        tetris.isReplay = 1;
        tetris.init();
    }

    init() {
        this.holdSys = new Hold(document.getElementById('holdCanvas').getContext('2d'));
        this.randomSys = new Random();

        this.recordTime = 0;
        if (this.isReplay) {
            console.log(record.seed);
            this.randomSys.randomSeed.seed = record.seed;
            record.playIndex = 0;
        }
        else {
            record.seed = this.randomSys.randomSeed.seed;
        }
        this.seed = this.randomSys.randomSeed.seed;
        this.tetro = new Tetro(this.randomSys.getOne());
        let initArrayBoard = function () {
            let arr = new Array(tetris.rows);
            for (let row = 0; row < arr.length; row++) {
                arr[row] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            }
            return arr;
        }
        this.board = initArrayBoard();
        this.colorboard = initArrayBoard();
        //this.test_map();
        initKeyMenu();
        this.startTime = new Date();
        let div = document.querySelector('.message');
        div.style.display = 'none';
        let t = this;
        this.bg();
        this.timer = requestAnimationFrame(this.loop);
    }

    test_map() {

        let t = this;
        let o = function (t) {
            for (let x = 0; x < t.board.length; x++)
                for (let y = 0; y < t.board[0].length; y++) {
                    t.colorboard[x][y] = t.board[x][y] ? 7 : 0;
                }
        }

        //this.board[7] = [0, 1, 1, 1, 1, 1, 1, 0, 1, 0];
        //this.board[8] = [0, 1, 1, 1, 1, 1, 1, 0, 1, 0];
        //this.board[9] = [0, 1, 1, 1, 1, 1, 1, 0, 1, 0];
        //this.board[10] = [0, 1, 1, 1, 1, 1, 1, 0, 1, 0];
        //this.board[11] = [0, 1, 1, 1, 1, 1, 1, 0, 1, 0];
        /*this.board[8] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
        this.board[9] = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
        this.board[10] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
        this.board[11] = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
        this.board[12] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
        this.board[13] = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
        this.board[14] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
        this.board[15] = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
        this.board[16] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
        this.board[17] = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
        this.board[18] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
        this.board[19] = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
        this.board[20] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
        this.board[21] = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
        this.board[22] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
        this.board[23] = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];*/
        /*let lastnum = -1;
        for (let i = 1; i < 15; i++) {
            this.board[this.rows - i] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
            let num
            do {
                num = parseInt(t.randomSys.randomSeed.random() * 10)
            } while (num == lastnum)
            lastnum = num;
            this.board[this.rows - i][num] = 0;
        }*/

        this.board[21] = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1];
        this.board[22] = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1];
        this.board[23] = [1, 1, 1, 1, 1, 0, 1, 1, 1, 1];
        o(t);
    }

    test_map_() {
        let t = this;
        let o = function (t) {
            for (let x = 0; x < t.board.length; x++)
                for (let y = 0; y < t.board[0].length; y++) {
                    t.colorboard[x][y] = t.board[x][y] ? 7 : 0;
                }
        }

        this.board[7] = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
        this.board[8] = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0];
        this.board[9] = [1, 1, 1, 1, 0, 1, 1, 1, 1, 1];
        this.board[10] = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1];
        this.board[11] = [1, 1, 1, 1, 1, 0, 0, 1, 1, 1];
        this.board[12] = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1];
        this.board[13] = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1];
        this.board[14] = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1];
        this.board[15] = [1, 1, 1, 1, 0, 1, 1, 1, 1, 1];
        this.board[16] = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1];
        this.board[17] = [1, 1, 1, 1, 1, 0, 0, 1, 1, 1];
        this.board[18] = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1];
        this.board[19] = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1];
        this.board[20] = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1];
        this.board[21] = [1, 1, 1, 1, 0, 1, 1, 1, 1, 1];
        this.board[22] = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1];
        this.board[23] = [1, 1, 1, 1, 1, 0, 1, 1, 1, 1];
        o(t);
    }

    checkCrossBorder(x, y) {
        let num = 1;
        if (x < 0 || y < 0 || y > this.rows - 1 || x > this.columns - 1)
            num = 0;
        return num;
    }

    moveValid(n, m) {
        let block = this.tetro.block;
        let pos = this.tetro.pos;
        for (let i = 0; i < block.length; i++)
            for (let j = 0; j < block[0].length; j++) {
                if (block[i][j] && !this.checkCrossBorder(pos.x + j + n, pos.y + i + m))
                    return false;
                else if (block[i][j] && this.board[pos.y + i + m][pos.x + j + n]) {
                    return false;
                }
            }
        return true;
    }

    put(pos, tetro) {
        //this.particle.delete();
        this.putArray.splice(0);
        this.freshPut = 0;
        let block = tetro.block;
        for (let i = 0; i < block.length; i++)
            for (let j = 0; j < block[0].length; j++) {
                if (block[i][j]) {
                    if (pos.y + i < 0) continue
                    if (pos.y + i >= this.rows) continue
                    if (pos.x + j < 0) continue
                    if (pos.x + j >= this.cols) continue
                    this.board[pos.y + i][pos.x + j] = 1;
                    this.colorboard[pos.y + i][pos.x + j] = tetro.kind;
                    let _y = pos.y + i;
                    let _x = pos.x + j;
                    this.putArray.push({ x: _y, y: _x });
                    //console.log(pos.y * this.gridArea)
                    this.particle.generate({
                        amount: 1,
                        x: _x * 19,
                        y: -4,
                        xRange: 19,
                        yRange: (pos.y - 4) * this.gridArea,
                        xVelocity: 0,
                        yVelocity: 3,
                        xVariance: 1,
                        yVariance: 3,
                        xDampening: 1.03,
                        yDampening: 1.05,
                        lifeVariance: 100,
                        type: "square"
                    });
                }
            }
        this.count += 4;
    }


    isFull(j) {
        let num = 1, board = this.board;
        for (let i = 0; i < this.columns; i++) {
            if (board[j][i] == 0) {
                num = 0;
            }
        }
        return num;
    }

    //[0,0,0]
    //[二,0,三]
    //[0,一,0]
    checkSpin() {
        let pos = this.tetro.pos;
        let kind = this.tetro.kind;
        let lastControl = this.lastControl;
        let block = this.tetro.block;
        let sum = 0;
        let ifspin = 0, ifmini = 0;
        if (kind == 2)
            if (lastControl == 1) {
                let _x = pos.y;
                let _y = pos.x;
                let mini = 0;
                if (!this.checkCrossBorder(_y + 1, _x + 2) || (!block[2][1] && this.board[_x + 2][_y + 1]))
                    mini++;
                if (!this.checkCrossBorder(_y + 0, _x + 1) || (!block[1][0] && this.board[_x + 1][_y + 0]))
                    mini++;
                if (!this.checkCrossBorder(_y + 2, _x + 1) || (!block[1][2] && this.board[_x + 1][_y + 2]))
                    mini++;
                if (!this.checkCrossBorder(_y + 1, _x + 0) || (!block[0][1] && this.board[_x + 0][_y + 1]))
                    mini++;

                if (!this.checkCrossBorder(_y, _x) || this.board[_x][_y]) sum++;
                if (!this.checkCrossBorder(_y + 2, _x) || this.board[_x][_y + 2]) sum++;
                if (!this.checkCrossBorder(_y, _x + 2) || this.board[_x + 2][_y]) sum++;
                if (!this.checkCrossBorder(_y + 2, _x + 2) || this.board[_x + 2][_y + 2]) sum++;

                if (sum > 2) {
                    ifspin = 1;
                }
                if (mini == 1) {
                    ifmini = 1;
                }
            }
        return { spin: ifspin, mini: ifmini }
    }

    SpecialClearType(_summary, _Ts) {
        let summary = _summary; //消行数
        let Tetris = 0, Tspin = 0, Zen = 0; //各种类型
        let clearFlag = "";
        let ifSpin = _Ts.spin, tspinmini = _Ts.mini;
        let Oldkind = this.tetro.kind;
        let b2bText = `<br/><span style="font-size:17px">b2b</span>`
        let at = "general"

        if (Oldkind == 1)
            Tetris = 1;
        else if (Oldkind == 2) {
            if (ifSpin) {
                Tspin = 1;
            }

        }

        if (summary) {
            this.Zen_num++;
        }
        else if (summary == 0)
            this.Zen_num = 0;
        if (this.Zen_num > 1)
            Zen = 1;

        /*if (Zen) {
            if (!Tspin && !(Tetris && summary == 4)) {
                clearFlag = "zen " + (this.Zen_num - 1);
            }
        }*/

        if (Tspin) {
            at = "spin"
            switch (summary) {
                case 0:
                    clearFlag = `<span style="color:${'rgba(148,0,211)'}">t-spin</span>`; break;
                case 1:
                    if (tspinmini) {
                        clearFlag = `<span style="color:${'rgba(123,104,238)'}">t-spin mini</span>`;
                        //clearFlag = "t-spin mini";
                        if (this.b2b) {
                            clearFlag += b2bText
                            //b2b_tspin_mini
                        }
                        else {
                            //tspin_mini
                        }

                    }
                    else {
                        clearFlag = `<span style="color:${'rgba(255,20,147)'}">t-spin single</span>`;
                        //clearFlag = "t-spin single";
                        if (this.b2b) {
                            clearFlag += b2bText
                            //b2b_tspin_single
                        }
                        else {
                            //tspin_single.wav
                        }

                    }
                    break;
                case 2:
                    clearFlag = `<span style="color:${'rgba(25,25,112)'}">t-spin double</span>`;
                    //clearFlag = "t-spin double";
                    if (this.b2b) {
                        clearFlag += b2bText
                        //b2b_tspin_double
                    }
                    else {
                        //tspin_double.wav
                    }
                    break;
                case 3:
                    clearFlag = `<span style="color:${'rgba(255,127,80)'}">t-spin triple</span>`;
                    //clearFlag = "t-spin triple";
                    if (this.b2b) {
                        clearFlag += b2bText
                        //tspin_triple
                    }
                    else {
                        //tspin_triple.wav
                    }
                    break;
            }
        }

        // if (!Tspin && !Zen) {
        if (!Tspin) {
            //console.log("进来了",summary)
            if (summary == 1) {
                clearFlag = "single";
            }
            else if (summary == 2) {
                clearFlag = "double";
            }
            else if (summary == 3) {
                clearFlag = "triple"
            }

        }

        if (Tetris) {
            if (summary == 4) {
                at = "tetris"
                clearFlag = `<span style="color:${'rgba(85,107,47)'}">tetris</span>`;
                //clearFlag = "tetris";
                if (this.b2b) {
                    clearFlag += b2bText
                    // clearFlag = "b2bTetris";
                }
                else {
                    //clearFlag = "Tetris";
                }

            }
        }

        if (Zen) {

            let str;
            if (!Tspin && !(Tetris && summary == 4)) {
                at = "ren"
                str = `</br>ren ${(this.Zen_num - 1)}`;
            }
            else {
                str = `<br/>ren ${(this.Zen_num - 1)}`;
            }
            clearFlag += str;
        }

        if (summary > 0)
            this.b2b = (Tspin || (Tetris && summary == 4));

            //console.log(this.count)
        if(this.count==0){
            at="perfectclear"
            clearFlag = `<span style="color:${'rgba(145,17,247)'}">perfect clear</span>`;
        }

        if (Tspin || Zen || summary > 0) {
            var div = document.createElement('div');
            document.querySelector(".paint").appendChild(div);
            div.addEventListener("animationend", function () { //动画结束时事件 
                if (div.parentNode != null)
                    div.parentNode.removeChild(div);
            }, false);
            div.innerHTML = clearFlag;
          
            div.classList.add("test1");
            div.classList.add(`anime${at}`);
            //console.log(clearFlag)
        }
        return 1;
    }

    clear() {
        let lines = new Array(), board = this.board;
        let newRow = Array(tetris.columns).fill(0);
        let ts = this.checkSpin();
        for (let i = 0; i < this.rows; i++) {
            if (this.isFull(i)) {
                lines.push(i);
            }
        }
        this.count -= this.columns * lines.length;
        this.clearlines += lines.length;
        this.SpecialClearType(lines.length, ts)

        if (!lines.length) return;
        // this.label.clearline.innerHTML = this.clearlines.toString();


        lines.forEach(m => {
            board.splice(m, 1);
            this.colorboard.splice(m, 1);
            board.unshift(newRow.slice());
            this.colorboard.unshift(newRow.slice());
        });
        if (this.clearlines >= 40)
            this.success();
    }

    getHarddropHeight() {
        for (let m = 0; ; m++) {
            if (!this.moveValid(0, m)) {
                return m - 1;
            }
        }
    }

    keyResponse() {
        //this.fixCheck();
    }

    fixCheck() {
        if (!this.moveValid(0, 1)) {
            this.fix++;
        }
        else
            this.fix = 0;
        if (this.fix >= this.fixCount) {
            this.fix = 0;
            this.tetro.pos.y += this.getHarddropHeight();
            this.put(this.tetro.pos, this.tetro);
            this.clear();
            this.tetro = new Tetro(this.randomSys.getOne());
            this.holdSys.resetTimes();
        }
    }

    resetFix() {
        this.fix = 0;
    }

    newGame() {
        tetris = null;
        tetris = new Tetris();
    }

    success() {
        return;
        let div = document.querySelector('.message');
        let div1 = document.querySelector('#score');
        div.style.display = 'block';
        div1.innerHTML = '成绩：' + document.querySelector('#time').innerHTML;
    }

    pause() {
        if (this.pauseState) {
            this.pauseState = 0;
            let nowtime = new Date();
            let deleta = nowtime - this.pauseTime.getTime();
            let newStart = this.startTime.getTime() + deleta;
            this.startTime.setTime(newStart);
            let t = this;
            this.timer = requestAnimationFrame(() => {
                this.loop()
            });
        }
        else {
            this.pauseState = 1;
            this.pauseTime = new Date();
            cancelAnimationFrame(this.timer);
        }

    }

    botcall = () => {
        let nexts = [], workerNexts = [];
        let hold, workerHold;

        if (tetris.holdSys.tetro != -1) {
            //hold = new Tetro(tetris.holdSys.tetro);
            workerHold = tetris.holdSys.tetro
        }
        else {
            //hold = new Tetro(tetris.randomSys.displayBag[0]);
            workerHold = -1
        }

        nexts.push(new Tetro(tetris.randomSys.displayBag[0]));
        nexts.push(new Tetro(tetris.randomSys.displayBag[1]));
        nexts.push(new Tetro(tetris.randomSys.displayBag[2]));
        workerNexts.push(tetris.randomSys.displayBag[0])
        workerNexts.push(tetris.randomSys.displayBag[1])
        workerNexts.push(tetris.randomSys.displayBag[2])
        workerNexts.push(tetris.randomSys.displayBag[3])
        workerNexts.push(tetris.randomSys.displayBag[4])
        workerNexts.push(tetris.randomSys.displayBag[5])
        //nexts.push(new Tetro(tetris.randomSys.displayBag[3]));
        //console.log(next);




        worker.postMessage({
            str: "zbsj", data: {
                board: tetris.board, thisBlock: tetris.tetro.kind,
                nexts: workerNexts, hold: workerHold, combo: tetris.Zen_num, b2b: tetris.b2b
            }
        })
        worker.postMessage({ str: "tz", data: { x: tetris.tetro.pos.x, y: tetris.tetro.pos.y, rs: tetris.tetro.rotateState } })
        worker.postMessage({ str: "go" })
        /*worker.postMessage({str:"board",data:tetris.board})
        worker.postMessage({str:"nexts",data:workerNexts})
        worker.postMessage({str:"thisBlock",data:tetris.tetro.kind})*/
        worker.onmessage = function (e) {
            // console.log(e.data)
            let str = e.data.str
            if (str == "complete") {
                let res = e.data.result;
                let move = convertoBotOper(res.move)
                console.log(res.move)
                playaction(move, 0)

                //console.log(res)
            }
            // e.data === 'some message'
        };

        return
        bot.setParam(tetris.board, tetris.tetro, nexts, hold);
        let result = bot.test();
        // console.log(result)
        //let result = bot.getResult();
        //botOper(1)
        function playaction(move, index) {
            if (index > move.length) {
                botOper(5)
                tetris.timerB = setTimeout(tetris.botcall, 1);
                return;
            }
            let i = move[index];
            if (i != 2)
                botOper(i);
            else {
                move.splice(index, 1);
                let hd = tetris.getHarddropHeight();
                for (let i = 0; i <= hd; i++)
                    move.splice(index, 0, 8)
                //console.log(move)
            }
            let tm = move[index + 1] == 8 ? 13 : 20;
            tetris.timerA = setTimeout(() => {
                playaction(move, index + 1)
            }, tm)
        }
        playaction(result.move, 0)
        // tetris.tetro.pos = new Pos(result.pos.x, result.pos.y);

    }

}

function convertoBotOper(arr) {
    let arr1 = [];
    for (let i of arr) {
        if (i == "v") arr1.push(6)
        else if (i == "z") arr1.push(4)
        else if (i == "c") arr1.push(3)
        else if (i == "l") arr1.push(0)
        else if (i == "r") arr1.push(1)
        else if (i == "d") arr1.push(8)
        else if (i == "D") arr1.push(2)
        //else if (i == "V") arr1.push(5)
    }
    return arr1;
}

let botOper = function (operKind) {
    switch (operKind) {
        case 0: option.leftFunc(); break;
        case 1: option.rightFunc(); break;
        case 2: break;
        case 3: option.rotateFunc(); break;
        case 4: option.rotateRightFunc(); break;
        case 5: option.dropFunc(); break;
        case 6: option.holdFunc(); break;
        case 7: option.rotate180Func(); break;
        case 8: option.downFunc(); break;
    }
}

let oper = function (operKind) {
    switch (operKind) {
        case option.keyCodeEncode.left: option.leftFunc(); break;
        case option.keyCodeEncode.right: option.rightFunc(); break;
        case option.keyCodeEncode.down: option.downFunc(); break;
        case option.keyCodeEncode.rotate: option.rotateFunc(); break;
        case option.keyCodeEncode.rotateRight: option.rotateRightFunc(); break;
        case option.keyCodeEncode.drop: option.dropFunc(); break;
        case option.keyCodeEncode.hold: option.holdFunc(); break;
        case option.keyCodeEncode.rotate180: option.rotate180Func(); break;
    }
}

function videoRecord() {
    document.querySelector('#Hotkey').style.display = 'none';
    let str = document.querySelector('#videoInput').value;
    x = window.decodeURIComponent(window.atob(str))
    //x = JSON.parse(str);
    //record.decode(x.str);
    if (record.decode(x) != -1) {
        console.log(record);
        tetris.replay();
    }
    //record.seed=tetris.seed;
}

gaoqing(document.getElementById('drawCanvas'))
gaoqing(document.getElementById('nextCanvas'));
gaoqing(document.getElementById('holdCanvas'));
let tetris = new Tetris()
let keymanager = new KeyManager(option);
let record = new Recorder(0, oper);
tetris.init();

let str = x.toString().match(/^\s*function\s*\(\s*\)\s*\{(([\s\S](?!\}$))*[\s\S])/)[1]
//console.log(str)
var blob = new Blob([str]);
var url = window.URL.createObjectURL(blob);
let worker = new Worker(url);
//let bot = new Bot();