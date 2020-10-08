var KeyManager = function(options) {
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

    this.onKeyDown = function(key) {
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

    this.onKeyUp = function(key) {
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
        else if(key ===82) {
            this.reset();
            clearTimeout(tetris.timerB)
            clearTimeout(tetris.timerA)
            tetris.newStart();
            record = new Recorder(tetris.seed, oper);
        }
        else if(key ===87) {
            //tetris.botworking=!tetris.botworking;
            tetris.botcall();
        }
        else if(key ===27) tetris.pause();
        else if(key ===81) {
            clearTimeout(tetris.timerA)
            clearTimeout(tetris.timerB)
            let str = record.encode();
            console.log('str',str)
            record.decode(str);
            tetris.replay();
        }
        else if(key === 85){
            ToclipBoard(record.encode());
        }
    };
    this.updateInput=function() {
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
     this.reset=function() {
        this.left.stop();
        this.right.stop();
        this.down.stop();
     };
    this.keyDown = function(event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        var key = e && e.keyCode;
        t.onKeyDown(key);
       // if (document.querySelector('#Hotkey').style.display == 'none')
        //e.preventDefault();
    };

    this.keyUp = function(event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        var key = e && e.keyCode;
        t.onKeyUp(key);
    }

    var t = this;
    document.body.addEventListener('keydown', t.keyDown,false);
    document.body.addEventListener('keyup', t.keyUp,false);
};

function restartGame(){
    let ev = new KeyboardEvent('keyup', {
        keyCode: 82
    });
    document.body.dispatchEvent(ev);
}

function botButton(){
    let ev = new KeyboardEvent('keyup', {
        keyCode: 87
    });
    document.body.dispatchEvent(ev);
}