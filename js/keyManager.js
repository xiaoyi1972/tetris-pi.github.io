var KeyManager = function (options) {
    this.enable = true;
    this.socket = options.socket;
    var keyboard = options.keyboard;
    this.dasDelay = keyboard.dasDelay;
    this.moveDelay = keyboard.moveDelay;
    this.downDelay = keyboard.downDelay;
    this.leftKey = keyboard.left;
    this.leftFunc = options.leftFunc;
    this.leftEndFunc = options.leftEndFunc;
    this.rightKey = keyboard.right;
    this.rightFunc = options.rightFunc;
    this.rightEndFunc = options.rightEndFunc;
    this.downKey = keyboard.down;
    this.downFunc = options.downFunc;
    this.downEndFunc = options.downEndFunc;
    this.dropKey = keyboard.drop;
    this.dropFunc = options.dropFunc;
    this.rotateKey = keyboard.rotate;
    this.rotateFunc = options.rotateFunc;
    this.rotateRightKey = keyboard.rotateRight;
    this.rotateRightFunc = options.rotateRightFunc;
    this.rotate180Key = keyboard.rotate180;
    this.rotate180Func = options.rotate180Func;
    this.holdKey = keyboard.hold;
    this.holdFunc = options.holdFunc;
    this.left = new KeyState(this, this.leftFunc, this.leftEndFunc);
    this.right = new KeyState(this, this.rightFunc, this.rightEndFunc);
    this.down = new KeyState(this, this.downFunc, this.downEndFunc, true);
    this.drop = new KeyState(this, this.dropFunc, null, false, true);
    this.rotate = new KeyState(this, this.rotateFunc, null, false, true);
    this.rotateRight = new KeyState(this, this.rotateRightFunc, null, false, true);
    this.rotate180 = new KeyState(this, this.rotate180Func, null, false, true);

    this.onKeyDown = function (key) {
        if (!this.enable) return;
        var leftright = false;
        var isDown = false;
        if (key === this.leftKey) {
            if (this.left.keyDown()) {
                // gameManager.soundManager.move();
            }
            this.right.keyUp();
            leftright = true;
        }
        else if (key === this.rightKey) {
            if (this.right.keyDown()) {
                // gameManager.soundManager.move();
            }
            this.left.keyUp();
            leftright = true;
        }
        else if (key === this.downKey) {
            isDown = true;
            this.down.keyDown();
        }
        else if (key === this.dropKey) {
            this.drop.keyDown();
        }
        else if (key === this.rotateKey) {
            this.rotate.keyDown();
        }
        else if (key === this.rotateRightKey) {
            this.rotateRight.keyDown();
        }
        else if (key === this.rotate180Key) {
            this.rotate180.keyDown();
        }
        else if (key === this.holdKey) {
            this.holdFunc();
        }
        if (!leftright) {
            this.left.keepMove();
            this.right.keepMove();
        }
        if (!isDown) {
            this.down.keepDown();
        }
    };

    this.onKeyUp = function (key) {
        if (!this.enable) return;
        if (key === this.leftKey) {
            this.left.keyUp();
        }
        else if (key === this.rightKey) {
            this.right.keyUp();
        }
        else if (key === this.downKey) {
            this.down.keyUp();
        }
        else if (key === this.dropKey) {
            this.drop.keyUp();
        }
        else if (key === this.rotateKey) {
            this.rotate.keyUp();
        }
        else if (key === this.rotateRightKey) {
            this.rotateRight.keyUp();
        }
        else if (key === this.rotate180Key) {
            this.rotate180.keyUp();
        }
        else if (key === 82) {
            this.reset();
            clearTimeout(tetris.timerB)
            clearTimeout(tetris.timerA)
            tetris.newStart();
            record = new Recorder(tetris.seed, oper);
        }
        else if (key === 87) {
            //tetris.botworking=!tetris.botworking;
            tetris.botcall();
        }
        else if (key === 27) tetris.pause();
        else if (key === 81) {
            clearTimeout(tetris.timerA)
            clearTimeout(tetris.timerB)
            let str = record.encode();
            //console.log('str',str)
            record.decode(str);
            tetris.replay();
        }
        else if (key === 85) {
            ToclipBoard(record.encode());
        }
    };
    this.updateInput = function () {
        var keyboard = option.keyboard;
        if (!keyboard) return;
        this.leftKey = keyboard.left;
        this.rightKey = keyboard.right;
        this.downKey = keyboard.down;
        this.dropKey = keyboard.drop;
        this.rotateKey = keyboard.rotate;
        this.rotateRightKey = keyboard.rotateRight;
        this.rotate180Key = keyboard.rotate180;
        this.holdKey = keyboard.hold;
        this.dasDelay = keyboard.dasDelay;
        this.moveDelay = keyboard.moveDelay;
        this.downDelay = keyboard.downDelay;
    }
    this.reset = function () {
        this.left.stop();
        this.right.stop();
        this.down.stop();
    };
    this.keyDown = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        var key = e && e.keyCode;
        t.onKeyDown(key);
        // if (document.querySelector('#Hotkey').style.display == 'none')
        //e.preventDefault();
    };

    this.keyUp = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        var key = e && e.keyCode;
        t.onKeyUp(key);
    }

    var t = this;
    document.body.addEventListener('keydown', t.keyDown, false);
    document.body.addEventListener('keyup', t.keyUp, false);
};

function restartGame() {
    let ev = new KeyboardEvent('keyup', {
        keyCode: 82
    });
    document.body.dispatchEvent(ev);
}

function botButton() {
    let ev = new KeyboardEvent('keyup', {
        keyCode: 87
    });
    document.body.dispatchEvent(ev);
}


//定义变量，用于记录坐标和角度
let startx, starty, movex, movey, endx, endy, nx, ny, angle;
let movingCountx, movingCounty;
let cWidth = document.querySelector('#drawCanvas').width;
let softdropTriggered = false, operationTriggered = false;
let softdropPressed = false, softdropHandle = null;
let touchstartTime;
//开始触摸函数，event为触摸对象
function touchs(event) {
    //阻止浏览器默认滚动事件
    event.preventDefault();

    //通过if语句判断event.type执行了哪个触摸事件
    if (event.type == "touchstart") {
        touchstartTime = new Date();
        //console.log('开始');

        softdropPressed = true;
        //获取开始的位置数组的第一个触摸位置
        let touch = event.touches[0];

        //获取第一个坐标的X轴
        startx = Math.floor(touch.pageX);

        //获取第一个坐标的X轴
        starty = Math.floor(touch.pageY);

        movingCountx = startx;
        movingCounty = starty;


        //触摸中的坐标获取
    } else if (event.type == "touchmove") {

        //console.log('滑动中');
        let touch = event.touches[0];
        movex = Math.floor(touch.pageX);
        movey = Math.floor(touch.pageY);

        let x_delta = Math.abs(movex - movingCountx)
        let y_delta = Math.abs(movey - movingCounty)
        if (x_delta >= 20) {
            if (movex - movingCountx < 0) {
                operationTriggered = true;
                option.leftFunc()
                movingCountx = movex;
            }
            else if (movex - movingCountx > 0) {
                operationTriggered = true;
                option.rightFunc()
                movingCountx = movex;
            }
        }
        if (y_delta >= 20)
            if (movey - movingCounty > 0) {
                if (!softdropTriggered) {
                    softdropTriggered = true;
                    softdropHandle = setInterval(option.downFunc, 30);
                }
                movingCounty = movey;
            }
        //当手指离开屏幕或系统取消触摸事件的时候
    } else if (event.type == "touchend" || event.type == "touchcancel") {
        let canvas = document.querySelector("#drawCanvas");
        let box = canvas.getBoundingClientRect();
        let mouseX = (event.changedTouches[0].pageX - box.left) * canvas.width / box.width;

        let deltaTime = new Date() - touchstartTime;

        if (startx == Math.floor(event.changedTouches[0].pageX)) {
            if (mouseX < (cWidth / 2))
                option.rotateRightFunc();
            else if (mouseX > (cWidth / 2))
                option.rotateFunc();
        }

        //获取最后的坐标位置
        endx = Math.floor(event.changedTouches[0].pageX);
        endy = Math.floor(event.changedTouches[0].pageY);
        //console.log('结束');

        //获取开始位置和离开位置的距离
        nx = endx - startx;
        ny = endy - starty;

        clearInterval(softdropHandle)
        softdropPressed = false;


        if (ny > 0 && deltaTime < 800 && !operationTriggered && !softdropTriggered)
            option.dropFunc()

        softdropTriggered = false;

        if (ny < -20 && !operationTriggered)
            option.holdFunc()
        //通过坐标计算角度公式 Math.atan2(y,x)*180/Math.PI

        operationTriggered = false;

        /*
        angle = Math.atan2(ny, nx) * 180 / Math.PI;

        if (Math.abs(nx) <= 1 || Math.abs(ny) <= 1) {
            return false;
            //console.log('滑动距离太小');
        }

        //通过滑动的角度判断触摸的方向
        if (angle < 45 && angle >= -45) {
            //console.log('右滑动');
            return false;
        } else if (angle < 135 && angle >= 45) {
            //console.log('下滑动');
            return false;
        } else if ((angle <= 180 && angle >= 135) || (angle >= -180 && angle < -135)) {
            //console.log('左滑动');
            return false;
        } else if (angle <= -45 && angle >= -135) {
            //console.log('上滑动');
            return false;
        }
        */

    }
}

//添加触摸事件的监听，并直行自定义触摸函数
document.querySelector('#drawCanvas').addEventListener('touchstart', touchs, false);
document.querySelector('#drawCanvas').addEventListener('touchmove', touchs, false);
document.querySelector('#drawCanvas').addEventListener('touchend', touchs, false);