var key = {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    16: 'Shift',
    17: 'Ctrl',
    18: 'Alt',
    19: 'Pause',
    20: 'Caps Lock',
    27: 'Esc',
    32: 'Space',
    33: 'PgUp',
    34: 'PgDn',
    35: 'End',
    36: 'Home',
    37: '←',
    38: '↑',
    39: '→',
    40: '↓',
    45: 'Insert',
    46: 'Delete',
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    59: ';',
    61: '=',
    65: 'A',
    66: 'B',
    67: 'C',
    68: 'D',
    69: 'E',
    70: 'F',
    71: 'G',
    72: 'H',
    73: 'I',
    74: 'J',
    75: 'K',
    76: 'L',
    77: 'M',
    78: 'N',
    79: 'O',
    80: 'P',
    81: 'Q',
    82: 'R',
    83: 'S',
    84: 'T',
    85: 'U',
    86: 'V',
    87: 'W',
    88: 'X',
    89: 'Y',
    90: 'Z',
    96: '0kpad',
    97: '1kpad',
    98: '2kpad',
    99: '3kpad',
    100: '4kpad',
    101: '5kpad',
    102: '6kpad',
    103: '7kpad',
    104: '8kpad',
    105: '9kpad',
    106: '*',
    107: '+',
    109: '-',
    110: '.',
    111: '/',
    112: 'F1',
    113: 'F2',
    114: 'F3',
    115: 'F4',
    116: 'F5',
    117: 'F6',
    118: 'F7',
    119: 'F8',
    120: 'F9',
    121: 'F10',
    122: 'F11',
    123: 'F12',
    173: '-',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '`',
    219: '[',
    220: '\\',
    221: ']',
    222: "'",
    undefined: "---",
    0: "---"
};

function getArrayKey(key) {
    var X = new Array();
    X.push(key.left);
    X.push(key.right);
    X.push(key.rotateLeft);
    X.push(key.rotateRight);
    X.push(key.rotate180);
    X.push(key.down);
    X.push(key.drop);
    X.push(key.hold);
    return X;
}

function LeftChangeKey(e) {
    var input = document.getElementById("leftInput");
    var keyArray = getArrayKey(option.keyboard);
    if (option.keyboard.leftKey != e.keyCode && keyArray.includes(e.keyCode))
        alert("与其他按键有重复!");
    else {
        option.keyboard.left = e.keyCode;
        input.value = key[e.keyCode];
    }
    input.blur();
}

function RightChangeKey(e) {
    var input = document.getElementById("rightInput");
    var keyArray = getArrayKey(option.keyboard);
    if (option.keyboard.rightKey != e.keyCode && keyArray.includes(e.keyCode))
        alert("与其他按键有重复!");
    else {
        option.keyboard.right = e.keyCode;
        input.value = key[e.keyCode];
    }
    input.blur();
}

function RotChangeKey(e) {
    var input = document.getElementById("rotInput");
    var keyArray = getArrayKey(option.keyboard);
    if (option.keyboard.rightrotateKey != e.keyCode && keyArray.includes(e.keyCode))
        alert("与其他按键有重复!");
    else {
        option.keyboard.rotateRight = e.keyCode;
        input.value = key[e.keyCode];
    }
    input.blur();
}

function LotChangeKey(e) {
    var input = document.getElementById("lotInput");
    var keyArray = getArrayKey(option.keyboard);
    if (option.keyboard.leftrotateKey != e.keyCode && keyArray.includes(e.keyCode))
        alert("与其他按键有重复!");
    else {
        option.keyboard.rotate = e.keyCode;
        input.value = key[e.keyCode];
    }
    input.blur();
}

function SoftdownChangeKey(e) {
    var input = document.getElementById("softdownInput");
    var keyArray = getArrayKey(option.keyboard);
    if (option.keyboard.downKey != e.keyCode && keyArray.includes(e.keyCode))
        alert("与其他按键有重复!");
    else {
        option.keyboard.down = e.keyCode;
        input.value = key[e.keyCode];
    }
    input.blur();
}

function DropChangeKey(e) {
    var input = document.getElementById("dropInput");
    var keyArray = getArrayKey(option.keyboard);
    if (option.keyboard.dropKey != e.keyCode && keyArray.includes(e.keyCode))
        alert("与其他按键有重复!");
    else {
        option.keyboard.drop = e.keyCode;
        input.value = key[e.keyCode];
    }
    input.blur();
}

function _180ChangeKey(e) {
    var input = document.getElementById("_180Input");
    var keyArray = getArrayKey(option.keyboard);
    if (option.keyboard.rotate180 != e.keyCode && keyArray.includes(e.keyCode))
        alert("与其他按键有重复!");
    else {
        option.keyboard.rotate180 = e.keyCode;
        input.value = key[e.keyCode];
    }
    input.blur();
}

function HoldChangeKey(e) {
    var input = document.getElementById("holdInput");
    var keyArray = getArrayKey(option.keyboard);
    if (option.keyboard.holdKey != e.keyCode && keyArray.includes(e.keyCode))
        alert("与其他按键有重复!");
    else {
        option.keyboard.hold = e.keyCode;
        input.value = key[e.keyCode];
    }
    input.blur();
}

function initKeyMenu() {
    document.getElementById("leftInput").value = key[option.keyboard.left];
    document.getElementById("rightInput").value = key[option.keyboard.right];
    document.getElementById("rotInput").value = key[option.keyboard.rotate];
    document.getElementById("lotInput").value = key[option.keyboard.rotateRight];
    document.getElementById("softdownInput").value = key[option.keyboard.down];
    document.getElementById("dropInput").value = key[option.keyboard.drop];
    document.getElementById("holdInput").value = key[option.keyboard.hold];
    document.getElementById("_180Input").value = key[option.keyboard.rotate180];
    document.getElementById("dasInput").value = option.keyboard.dasDelay;
    document.getElementById("arrInput").value = option.keyboard.moveDelay;
    document.getElementById("dasdownInput").value = option.keyboard.downDelay;
    document.getElementById("timeLimitInput").value = option.keyboard.timeLimit;
    //document.getElementById("returnInput").value=key[returnKey];
}

function BaseSelect() {
    var div = document.querySelector('#Hotkey');
    //console.log(div.style.display);
    if (div.style.display == 'none') {
        document.querySelector('#videoInput').value = "";
        div.style.display = 'block';
    }
    else {
        div.style.display = 'none';
        keymanager.reset();
        keymanager.updateInput();
    }
}


function ReturnChangeDas(e) {
    option.keyboard.dasDelay = parseInt(e);
}

function ReturnChangeArr(e) {
    option.keyboard.moveDelay = parseInt(e);
}

function ReturnChangeDasdown(e) {
    option.keyboard.downDelay = parseInt(e);
}

function ReturnChangeTimeLimit(e) {
    option.keyboard.timeLimit = parseInt(e);
}

function ToclipBoard(str) {
    //let x=JSON.stringify({'str':str})
    let x = window.btoa(window.encodeURIComponent(str));
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', x);
    input.select();
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        alert('复制成功')
        //console.log('复制成功');
    }
    document.body.removeChild(input);
}
/*function Ret
urnChangeKey(e) {
    var input = document.getElementById("returnInput");
    if (e.keyCode in option)
        alert("与其他按键有重复!");
    else {
        returnKey = e.keyCode;
        input.value = key[e.keyCode];
    }

}*/
