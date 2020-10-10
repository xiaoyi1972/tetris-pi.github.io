let x = function () {
    function deepcopyArr(arr) {
        let outarr = [], len = arr.length;
        for (let i = 0; i < len; i++) {
            outarr[i] = new Array();
            for (let j = 0; j < arr[i].length; j++) {
                outarr[i][j] = arr[i][j];
            }
        }
        return outarr;
    }

    let TSpinType = { TSpin: 1, TSpinMini: 0, None: -1 }

    function BitCount(n) {
        // HD, Figure 5-2
        n = n - ((n >> 1) & 0x55555555);
        n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
        n = (n + (n >> 4)) & 0x0f0f0f0f;
        n = n + (n >> 8);
        n = n + (n >> 16);
        return n & 0x3f;
    }

    let Evaluation_Attack = {
        eval_land_polet(node, map, clear) {
            let LandHeight = map.height - (node.status.y + node.height);
            let Middle = Math.abs((node.status.x + 1) * 2 - map.width);
            let EraseCount = clear;

            /*let count = 0;
            for (let j = 0; j < map.height; j++) {
                for (i = 0; i < map.width; i++) {
                    if (map.full(i, j))
                        count++;
                }
            }*/
            let value = 0
                - LandHeight / map.height * -40
                + Middle * 0.2
                + (EraseCount * 6)
            //- count * 5
            return value
        },
        eval_map: function (_map, history) {
            //行列变换
            let map = _map.clone();
            map.row.reverse();
            let ColTrans = 0;
            let RowTrans = 0;

            //let ColTrans = 2 * (map.height - map.roof);
            //let RowTrans = map.roof == map.height ? 0 : map.width;
            for (let j = 1; j <= map.height; j++) {
                //对该行和该行右移一格进行异或运算
                let LineTrans = (map.row[j] ^ (map.row[j] >> 1));
                //厉遍宽度
                for (i = 0; i <= map.width; i++) {
                    //如果最右为真（左右方块不同）则列变换加一
                    ColTrans += LineTrans & 1;
                    //变换行右移
                    LineTrans >>= 1;
                }
            }

            for (j = 0; j <= map.height - 1; j++) {
                //对该行和上一行进行异或运算
                let LineTrans = (map.row[j] ^ map.row[j + 1]);
                //厉遍宽度
                for (i = 1; i <= map.width; i++) {
                    //如果最右为真（上下方块不同）则行变换加一
                    RowTrans += LineTrans & 1;
                    //变换行右移
                    LineTrans >>= 1;
                }
            }
            /*let Row0Bits = ~map.row[0];
            let Row1Bits = map.roof == map.height ? ~map.row[map.roof - 1] : map.row[map.roof - 1];
            for (let x = 0; x < map.width; ++x) {
                if ((Row0Bits >> x) & 1) {
                    ++RowTrans;
                }
                if ((Row1Bits >> x) & 1) {
                    ++RowTrans;
                }
            }*/

            let v =
            {
                //洞数
                ct: ColTrans,
                rt: RowTrans,
                HoleCount: 0,
                //洞行数
                HoleLine: 0,
                //最高洞行数
                HolePosy: 0,
                //最高洞上方块数
                HolePiece: 0,

                //洞深,井深
                HoleDepth: 0,
                WellDepth: 0,

                //洞计数,井计数
                HoleNum: new Array(map.width).fill(0),
                WellNum: new Array(map.width).fill(0),

                //当前块行数
                LandHeight: 0,
                //设置左中右平衡破缺参数
                Middle: 0,
                //消行数
                EraseCount: 0,

                LineCoverBits: 0,
                TopHoleBits: 0
            }

            for (let y = map.height - 1; y > 0; --y) {
                v.LineCoverBits |= map.row[y];
                let LineHole = v.LineCoverBits ^ map.row[y];
                if (LineHole != 0) {
                    v.HoleLine++;
                    if (v.HolePosy == 0) {
                        v.HolePosy = y + 1;
                        v.TopHoleBits = LineHole;
                    }
                }
                for (let x = 0; x < map.width; ++x) {
                    if ((LineHole >> x) & 1) {
                        ++v.HoleCount;
                        ++v.HoleNum[x];
                    }
                    else {
                        v.HoleNum[x] = 0;
                    }
                    v.HoleDepth += v.HoleNum[x];
                    if (
                        !((v.LineCoverBits >> x) & 1)
                        &&
                        (x == 0 || ((v.LineCoverBits >> (x - 1)) & 1))
                        &&
                        (x == map.width - 1 || ((v.LineCoverBits >> (x + 1)) & 1))
                    ) {
                        ++v.WellNum[x];
                        v.WellDepth += v.WellNum[x];
                    }
                }
            }
            if (v.HolePosy != 0) {
                //从最高有洞行上一行开始往上厉遍
                for (let y = v.HolePosy; y < map.height; ++y) {
                    let CheckLine = v.TopHoleBits & map.row[y];
                    if (CheckLine == 0) {
                        break;
                    }
                    for (let x = 0; x < map.width; ++x) {
                        if ((CheckLine >> x) & 1) {
                            v.HolePiece += y + 1;
                        }
                    }
                }
            }

            let BoardDeadZone = this.map_in_danger_(map)

            let land_polet_value = 0;
            let clearN = 0;
            let check_line_1 = [], check_line_2 = [];
            let full = (1 << _map.width) - 1
            let attackDepth = 0;

            let low_x = map.height;
            let top = new Array(map.width).fill(0)
            for (let x = 0; x < map.width; x++)
                for (let y = map.height - 1; y > 0; y--) {
                    if (map.full(x, y)) {
                        top[x] = y;
                        break;
                    }
                }
            top.sort((n, m) => {
                if (n != m) {
                    return n - m;
                }
            })
            let low_y = top[0];
            for (let x = 0; x < map.width; x++) {
                check_line_1.push(full & ~(1 << x))
                if (x < map.width - 1)
                    check_line_2.push(full & ~(3 << x))
            }

            for (let y = map.height - 2; y >= low_y; --y) {
                if (check_line_1.findIndex((i) => { return i == map.row[y] }) != -1) {
                    if (y + 1 < map.height && check_line_2.findIndex((i) => { return i == map.row[y + 1] }) != -1) {
                        attackDepth += 20;
                    }
                    else {
                        attackDepth += 16;
                    }
                    for (--y; y >= low_y; --y) {
                        if (check_line_1.findIndex((i) => { return i == map.row[y] }) != -1) {
                            attackDepth += 3;
                        }
                        else {
                            attackDepth -= 3;
                        }
                    }
                    break;
                }
                else {
                    attackDepth -= 2;
                }
            }

            let z = 0;
            let length_rate = 10 / 6;
            for (i of history) {
                land_polet_value += i.value;
                switch (i.clear) {
                    case 0: break;
                    case 1:
                    case 2: break;
                    case 3: break;
                    default: clearN += (i.clear * 10 + (history.length - z)) * (1 + (history.length - z) * length_rate); break;
                }
                //clearN += i.clear;
                z++;
            }


            let value = (0
                + land_polet_value / history.length//(history.length > 0) ? land_polet_value / history.length : 0
                - ColTrans * 32
                - RowTrans * 32
                - v.HoleCount * 400
                - v.HoleLine * 38
                - v.WellDepth * 16
                - v.HoleDepth * 4
                - v.HolePiece * 2
                - BoardDeadZone * 5000
                + clearN * 100
                + attackDepth * 100
            )
            return { value: value, v: v };
        },
        map_in_danger_: function (_map) {
            //let map = _map.clone();
            //map.row.reverse();

            let map_danger_data_ = (1 << _map.width) - 1
            let danger = 0;
            // for (let i = 0; i < map.height; ++i) {
            if (map_danger_data_ & _map.row[_map.height - 6]
                || map_danger_data_ & _map.row[_map.height - 5]
                || map_danger_data_ & _map.row[_map.height - 4]
                || map_danger_data_ & _map.row[_map.height - 3]) { //{
                danger++;
            }
            //}
            //}
            return danger;
        }
    }

    let Evaluation_TOJ = {
        config: {
            table: [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, -1],
            table_max: 14
        },
        eval_map_origin: function (_map, node, clear) {
            let map = _map.clone();
            map.row.reverse();
            let result = new Object();
            result.eval = 0;
            result.count = 0;
            let width = map.width;
            for (let x = 0; x < width; ++x) {
                result.count += map.top[x];
                for (let y = 0; y < map.roof; ++y) {
                    if (map.full(x, y)) {
                        result.eval -= 2 * (y + 1);
                        continue;
                    }
                    if (x == width - 1 || map.full(x + 1, y)) {
                        result.eval -= 3 * (y + 1);
                    }
                    if (x == 0 || map.full(x - 1, y)) {
                        result.eval -= 3 * (y + 1);
                    }
                    if (map.full(x, y + 1)) {
                        result.eval -= 10 * (y + 1);
                        if (map.full(x, y + 2)) {
                            result.eval -= 4;
                            if (map.full(x, y + 3)) {
                                result.eval -= 3;
                                if (map.full(x, y + 4)) {
                                    result.eval -= 2;
                                }
                            }
                        }
                    }
                }
            }

            result.clear = clear;
            let line;
            for (line = map.height - 1; line > 0; --line) {
                if (map.row[line] & danger_data_) {
                    break;
                }
            }
            result.safe = danger_line_ - (line + 1);
            //result.safe = 1;
            if (clear > 0 && node.lastRotate) {
                if (clear == 1 && node.mini) {

                    node.type = TSpinType.TSpinMini;
                }
                else if (node.spin) {

                    node.type = TSpinType.TSpin;
                }
                else {
                    node.type = TSpinType.None;
                }
            }
            result.t_spin = node.type;
            result.t2_value = 0;
            result.t3_value = 0;
            let finding2 = true;
            let finding3 = true;
            for (let y = 0, roof = map.roof; (finding2 || finding3) && y < roof - 2; ++y) {
                let row0 = map.row[y];
                let row1 = map.row[y + 1];
                let row2 = y + 2 < map.height ? map.row[y + 2] : 0;
                let row3 = y + 3 < map.height ? map.row[y + 3] : 0;
                let row4 = y + 4 < map.height ? map.row[y + 4] : 0;
                for (let x = 0; finding2 && x < map.width - 2; ++x) {
                    if (((row0 >> x) & 7) == 5 && ((row1 >> x) & 7) == 0) {
                        if (BitCount(row0) == map.width - 1) {
                            result.t2_value += 1;
                            if (BitCount(row1) == map.width - 3) {
                                result.t2_value += 2;
                                let row2_check = (row2 >> x) & 7;
                                if (row2_check == 1 || row2_check == 4) {
                                    result.t2_value += 2;
                                }
                                finding2 = false;
                            }
                        }
                    }
                }
                for (let x = 0; finding3 && x < map.width - 3; ++x) {
                    if (((row0 >> x) & 15) == 11 && ((row1 >> x) & 15) == 9) {
                        let t3_value = 0;
                        if (BitCount(row0) == map.width - 1) {
                            t3_value += 1;
                            if (BitCount(row1) == map.width - 2) {
                                t3_value += 2;
                                if (((row2 >> x) & 15) == 11) {
                                    t3_value += 1;
                                    if (BitCount(row2) == map.width - 1) {
                                        t3_value += 1;
                                    }
                                }
                                let row3_check = ((row3 >> x) & 15);
                                if (row3_check == 8 || row3_check == 0) {
                                    t3_value += 1;
                                    let row4_check = ((row4 >> x) & 15);
                                    if (row4_check == 4 || row4_check == 12) {
                                        t3_value += 1;
                                    }
                                }
                                else {
                                    t3_value = 0;
                                }
                            }
                        }
                        result.t3_value += t3_value;
                        if (t3_value > 3) {
                            finding3 = false;
                        }
                    }
                    if (((row0 >> x) & 15) == 13 && ((row1 >> x) & 15) == 9) {
                        let t3_value = 0;
                        if (BitCount(row0) == map.width - 1) {
                            t3_value += 1;
                            if (BitCount(row1) == map.width - 2) {
                                t3_value += 2;
                                if (((row2 >> x) & 15) == 13) {
                                    t3_value += 1;
                                    if (BitCount(row2) == map.width - 1) {
                                        t3_value += 1;
                                    }
                                }
                                let row3_check = ((row3 >> x) & 15);
                                if (row3_check == 1 || row3_check == 0) {
                                    t3_value += 1;
                                    let row4_check = ((row4 >> x) & 15);
                                    if (row4_check == 3 || row4_check == 1) {
                                        t3_value += 1;
                                    }
                                }
                                else {
                                    t3_value = 0;
                                }
                            }
                        }
                        result.t3_value += t3_value;
                        if (t3_value > 3) {
                            finding3 = false;
                        }
                    }
                }
            }
            return result;
        },
        eval_map: (_map, node, clear) => {
            let map = _map.clone();
            map.row.reverse();
            let roof = map.roof;
            let result = new Object();
            result.eval = 0;
            result.count = 0;
            let width = map.width;
            let col_mask_ = ((1 << map.width) - 1) & ~1;
            let row_mask_ = ((1 << map.width) - 1);
            for (let x = 0; x < width; ++x) {
                for (let y = 0; y < roof; ++y) {
                    if (map.full(x, y)) {
                        result.count++;
                    }
                }
            }

            let width_m1 = map.width - 1;
            let ColTrans = 2 * (map.height - roof);
            let RowTrans = roof == map.height ? 0 : map.width;
            for (let y = 0; y < roof; ++y) {
                if (!map.full(0, y)) {
                    ++ColTrans;
                }
                if (!map.full(width_m1, y)) {
                    ++ColTrans;
                }
                ColTrans += BitCount((map.row[y] ^ (map.row[y] << 1)) & col_mask_);
                if (y != 0) {
                    RowTrans += BitCount(map.row[y - 1] ^ map.row[y]);
                }
            }
            RowTrans += BitCount(row_mask_ & ~map.row[0]);
            RowTrans += BitCount(roof == map.height ? row_mask_ & ~map.row[roof - 1] : map.row[roof - 1]);
            let v =
            {
                HoleCount: 0,
                HoleLine: 0,
                HoleDepth: 0,
                WellDepth: 0,
                HoleNum: new Array(32).fill(0),
                WellNum: new Array(32).fill(0),
                LineCoverBits: 0,
                HolePosyIndex: 0,
            };
            let a = new Array(40).fill({ ClearWidth: 0 });
            for (let y = roof - 1; y >= 0; --y) {
                v.LineCoverBits |= map.row[y];
                let LineHole = v.LineCoverBits ^ map.row[y];
                if (LineHole != 0) {
                    ++v.HoleLine;
                    a[v.HolePosyIndex].ClearWidth = 0;
                    for (let hy = y + 1; hy < roof; ++hy) {
                        let CheckLine = LineHole & map.row[hy];
                        if (CheckLine == 0) {
                            break;
                        }
                        a[v.HolePosyIndex].ClearWidth += (hy + 1) * BitCount(CheckLine);
                    }
                    ++v.HolePosyIndex;
                }
                for (let x = 1; x < width_m1; ++x) {
                    if ((LineHole >> x) & 1) {
                        v.HoleDepth += ++v.HoleNum[x];
                    }
                    else {
                        v.HoleNum[x] = 0;
                    }
                    if (((v.LineCoverBits >> (x - 1)) & 7) == 5) {
                        v.WellDepth += ++v.WellNum[x];
                    }
                }
                if (LineHole & 1) {
                    v.HoleDepth += ++v.HoleNum[0];
                }
                else {
                    v.HoleNum[0] = 0;
                }
                if ((v.LineCoverBits & 3) == 2) {
                    v.WellDepth += ++v.WellNum[0];
                }
                if ((LineHole >> width_m1) & 1) {
                    v.HoleDepth += ++v.HoleNum[width_m1];
                }
                else {
                    v.HoleNum[width_m1] = 0;
                }
                if (((v.LineCoverBits >> (width_m1 - 1)) & 3) == 1) {
                    v.WellDepth += ++v.WellNum[width_m1];
                }
            }

            result.value = (0.
                - roof * 128
                - ColTrans * 160
                - RowTrans * 160
                - v.HoleCount * 80
                - v.HoleLine * 380
                - v.WellDepth * 100
                - v.HoleDepth * 40
            );

            let line
            for (line = map.height - 1; line > 0; --line) {
                if (map.row[line] & Evaluation.danger_data_) {
                    break;
                }
            }
            result.safe = Evaluation.danger_line_ - (line + 1);

            let rate = 32, mul = 1.0 / 4;
            for (let i = 0; i < v.HolePosyIndex; ++i, rate *= mul) {
                result.value -= a[i].ClearWidth * rate;
            }
            result.clear = clear;

            if (clear > 0 && node.lastRotate) {
                if (clear == 1 && node.mini && node.spin) {
                    node.type = TSpinType.TSpinMini;
                }
                else if (node.spin) {
                    node.type = TSpinType.TSpin;
                }
                else {
                    node.type = TSpinType.None;
                }
            }
            result.t_spin = node.type;
            result.t2_value = 0;
            result.t3_value = 0;
            let finding2 = true;
            let finding3 = true;
            for (let y = 0; (finding2 || finding3) && y < roof - 2; ++y) {
                let row0 = map.row[y];
                let row1 = map.row[y + 1];
                let row2 = y + 2 < map.height ? map.row[y + 2] : 0;
                let row3 = y + 3 < map.height ? map.row[y + 3] : 0;
                let row4 = y + 4 < map.height ? map.row[y + 4] : 0;
                for (let x = 0; finding2 && x < map.width - 2; ++x) {
                    if (((row0 >> x) & 7) == 5 && ((row1 >> x) & 7) == 0) {
                        if (BitCount(row0) == map.width - 1) {
                            result.t2_value += 1;
                            if (BitCount(row1) == map.width - 3) {
                                result.t2_value += 2;
                                let row2_check = (row2 >> x) & 7;
                                if (row2_check == 1 || row2_check == 4) {
                                    result.t2_value += 2;
                                }
                                finding2 = false;
                            }
                        }
                    }
                }
                for (let x = 0; finding3 && x < map.width - 3; ++x) {
                    if (((row0 >> x) & 15) == 11 && ((row1 >> x) & 15) == 9) {
                        let t3_value = 0;
                        if (BitCount(row0) == map.width - 1) {
                            t3_value += 1;
                            if (BitCount(row1) == map.width - 2) {
                                t3_value += 1;
                                if (((row2 >> x) & 15) == 11) {
                                    t3_value += 2;
                                    if (BitCount(row2) == map.width - 1) {
                                        t3_value += 2;
                                    }
                                }
                                let row3_check = ((row3 >> x) & 15);
                                if (row3_check == 0 || row3_check == 8) {
                                    t3_value += !!row3_check;
                                    let row4_check = ((row4 >> x) & 15);
                                    if (row4_check == 4 || row4_check == 12) {
                                        t3_value += 1;
                                    }
                                    else {
                                        t3_value -= 2;
                                    }
                                }
                                else {
                                    t3_value = 0;
                                }
                            }
                        }
                        result.t3_value += t3_value;
                        if (t3_value > 3) {
                            finding3 = false;
                        }
                    }
                    if (((row0 >> x) & 15) == 13 && ((row1 >> x) & 15) == 9) {
                        let t3_value = 0;
                        if (BitCount(row0) == map.width - 1) {
                            t3_value += 1;
                            if (BitCount(row1) == map.width - 2) {
                                t3_value += 1;
                                if (((row2 >> x) & 15) == 13) {
                                    t3_value += 2;
                                    if (BitCount(row2) == map.width - 1) {
                                        t3_value += 2;
                                    }
                                }
                                let row3_check = ((row3 >> x) & 15);
                                if (row3_check == 0 || row3_check == 1) {
                                    t3_value += !!row3_check;
                                    let row4_check = ((row4 >> x) & 15);
                                    if (row4_check == 2 || row4_check == 3) {
                                        t3_value += 1;
                                    }
                                    else {
                                        t3_value -= 2;
                                    }
                                }
                                else {
                                    t3_value = 0;
                                }
                            }
                        }
                        result.t3_value += t3_value;
                        if (t3_value > 3) {
                            finding3 = false;
                        }
                    }
                }
            }
            return result;
        },
        get: (eval_result, depth, status, hold, nexts) => {
            let result = new Object();
            let full_count_ = 20 * 10;
            result.value = eval_result.value;
            result.map_rise = 0;
            {
                result.like = status.like;
                result.attack = status.attack;
                result.combo = status.combo;
                result.under_attack = 0;
                result.b2b = status.b2b;
                result.max_combo = status.max_combo;
                result.max_attack = status.max_attack;
            }
            if (eval_result.safe <= 0) {
                result.value -= 99999;
            }
            switch (eval_result.clear) {
                case 0:
                    if (status.combo > 0 && status.combo < 3) {
                        result.like -= 2;
                    }
                    result.combo = 0;
                    /*if(status.under_attack > 0)
                    {
                        result.map_rise += Math.max(0, let(status.under_attack) - status.attack);
                        if(result.map_rise >= eval_result.safe)
                        {
                            result.value -= 99999;
                        }
                        result.under_attack = 0;
                    }*/
                    result.under_attack = 0;
                    break;
                case 1:
                    if (eval_result.t_spin == TSpinType.TSpinMini) {
                        result.attack += status.b2b ? 2 : 1;
                    }
                    else if (eval_result.t_spin == TSpinType.TSpin) {
                        result.attack += status.b2b ? 3 : 2;
                    }
                    result.attack += Evaluation_TOJ.config.table[Math.min(Evaluation_TOJ.config.table_max - 1, ++result.combo)];
                    result.b2b = eval_result.t_spin != TSpinType.None;
                    break;
                case 2:
                    if (eval_result.t_spin != TSpinType.None) {
                        result.like += 8;
                        result.attack += status.b2b ? 5 : 4;
                    }
                    result.attack += Evaluation_TOJ.config.table[Math.min(Evaluation_TOJ.config.table_max - 1, ++result.combo)];
                    result.b2b = eval_result.t_spin != TSpinType.None;
                    break;
                case 3:
                    if (eval_result.t_spin != TSpinType.None) {
                        result.like += 12;
                        result.attack += status.b2b ? 8 : 6;
                    }
                    result.attack += Evaluation_TOJ.config.table[Math.min(Evaluation_TOJ.config.table_max - 1, ++result.combo)] + 2;
                    result.b2b = eval_result.t_spin != TSpinType.None;
                    break;
                case 4:
                    result.like += 8;
                    result.attack += Evaluation_TOJ.config.table[Math.min(Evaluation_TOJ.config.table_max - 1, ++result.combo)] + (status.b2b ? 5 : 4);
                    result.b2b = true;
                    break;
            }
            if (result.combo < 5) {
                result.like -= 1.5 * result.combo;
            }
            if (eval_result.count == 0 && result.map_rise == 0) {
                result.like += 20;
                result.attack += 6;
            }
            if (status.b2b && !result.b2b) {
                result.like -= 2;
            }
            let t_expect = function (next) {
                if (hold == Piece.T) {
                    return 0;
                }
                for (let i = 0; i < next; ++i) {
                    if (next[i] == Piece.T) {
                        return i;
                    }
                }
                return 14;
            };
            switch (hold) {
                case Piece.T:
                    if (eval_result.t_spin == TSpinType.None) {
                        result.like += 4;
                    }
                    break;
                case Piece.I:
                    if (eval_result.clear != 4) {
                        result.like += 2;
                    }
                    break;
            }
            let rate = 1 / (nexts.length > 0 ? (depth + 1) : 1) + 3;// nexts.length + 1 -
            result.max_combo = Math.max(result.combo, result.max_combo);
            result.max_attack = Math.max(result.attack, result.max_attack);
            result.value += ((0
                + result.max_attack * 40
                + result.attack * 256 * rate
                + (eval_result.t2_value) * (t_expect(nexts) < 8 ? 512 : 320) * 1.5
                + (eval_result.safe >= 12 ? eval_result.t3_value * (t_expect(nexts) < 4 ? 10 : 8) * (result.b2b ? 512 : 256) / (6 + result.under_attack) : 0)
                + (result.b2b ? 512 : 0)
                + result.like * 64
            ) * Math.max(0.05, (full_count_ - eval_result.count - result.map_rise * (10)) / (full_count_))
                + result.max_combo * (result.max_combo - 1) * 40
            );
            return result;
        }
    }

    let Evaluation = Evaluation_TOJ;
    let Search_Simple = {
        make_path: function (node, land_point, map) {
            let path = [];
            let land_node = land_point.node
            if (node.status.t != land_node.status.t/* || node.status.y < land_node.status.y*/) {
                return path;
            }
            while (node.status.r != land_node.status.r && node.rotate_counterclockwise && node.rotate_counterclockwise.check(map)) {
                path.push('z');
                node = node.rotate_counterclockwise;
            }
            while (node.status.x < land_node.status.x && node.move_right && node.move_right.check(map)) {
                path.push('r');
                node = node.move_right;
            }
            while (node.status.x > land_node.status.x && node.move_left && node.move_left.check(map)) {
                path.push('l');
                node = node.move_left;
            }
            path.push('V')
            /*if (node.drop(map).eq != land_node.eq) {
                return path;
            }*/
            return path;
        },
        search: function (map, node) {
            let land_point_cache = new Array();
            land_point_cache.length == 0;
            let rotate = node;
            do {
                land_point_cache.push(rotate);
                let left = rotate.move_left;
                while (left != null && left.check(map)) {
                    land_point_cache.push(left);
                    left = left.move_left;
                }
                let right = rotate.move_right;
                while (right != null && right.check(map)) {
                    land_point_cache.push(right);
                    right = right.move_right;
                }
                rotate = rotate.rotate_counterclockwise;
            } while (rotate != null && rotate.eq != node.eq && rotate.check(map));

            let lpc = [];
            {
                for (let i_node of land_point_cache) {
                    let i_node_ex = new TetrisNodeEx(i_node.drop(map))
                    lpc.push(i_node_ex)
                }
            }
            return lpc;
        }
    }

    let Search_TSpin = {
        make_path: function (node, land_point, map) {
            if (land_point.type == TSpinType.TSpinMini) {
                return Search_TSpin.make_path_t(node, land_point, map);
            }

            let node_search = [];
            let node_mark = new Map();
            let land_node = land_point.node;
            node_mark.clear();
            node_search.length == 0;

            node_mark.mark = (value, n) => {
                if (!node_mark.has(value)) {
                    node_mark.set(value, n)
                    return true;
                }
                else
                    return false;
            }


            function build_path(lp) {
                let path = [];
                let node = lp;
                while (true) {
                    let result = node_mark.get(node.eq);
                    if (result == undefined)
                        break;
                    node = result.node;
                    if (node == null) {
                        break;
                    }
                    path.push(result.oper);
                    // console.log(result.oper)
                }
                path.reverse();
                while (path.length != 0 && (path[path.length - 1] == 'd' || path[path.length - 1] == 'D')) {
                    path.splice(path.length - 1, 1);
                }
                path.push('V');
                return path;
            };

            node_search.push(node);
            node_mark.mark(node.eq, { node: null, oper: '\0' });
            let cache_index = 0;
            let disable_d = land_node.open(map)
            do {
                for (let max_index = node_search.length; cache_index < max_index; ++cache_index) {
                    let node = node_search[cache_index];

                    if (disable_d) {
                        let node_D = node.drop(map);
                        if (node_mark.mark(node_D.eq, { node: node, oper: 'D' })) {
                            if (node_D.eq == land_node.eq) {
                                return build_path(land_node);
                            }
                        }
                    }

                    //z
                    if (node.rotate_counterclockwise != null && node.rotate_counterclockwise.check(map)) {
                        if (node_mark.mark(node.rotate_counterclockwise.eq, { node: node, oper: 'z' })) {
                            if (node.rotate_counterclockwise.eq == land_node.eq) {
                                return build_path(land_node);
                            }
                            else {
                                node_search.push(node.rotate_counterclockwise);
                            }
                        }
                    }
                    //逆时针踢墙
                    else {
                        for (let kick_node of node.ccwWallKick) {
                            if (kick_node != null) {
                                if (kick_node.check(map)) {
                                    if (node_mark.mark(kick_node.eq, { node: node, oper: 'z' })) {
                                        if (kick_node.eq == land_node.eq) {
                                            return build_path(land_node);
                                        }
                                        else {
                                            node_search.push(kick_node);
                                        }
                                    }
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                    }
                    //c
                    if (node.rotate_clockwise != null && node.rotate_clockwise.check(map)) {
                        if (node_mark.mark(node.rotate_clockwise.eq, { node: node, oper: 'c' })) {
                            if (node.rotate_clockwise.eq == land_node.eq) {
                                return build_path(land_node);
                            }
                            else {
                                node_search.push(node.rotate_clockwise);
                            }
                        }
                    }
                    //顺时针踢墙
                    else {
                        for (let kick_node of node.cwWallKick) {
                            if (kick_node != null) {
                                if (kick_node.check(map)) {
                                    if (node_mark.mark(kick_node.eq, { node: node, oper: 'c' })) {
                                        if (kick_node.eq == land_node.eq) {
                                            return build_path(land_node);
                                        }
                                        else {
                                            node_search.push(kick_node);
                                        }
                                    }
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                    }

                    //l
                    if (node.move_left != null
                        && node_mark.mark(node.move_left.eq, { node: node, oper: 'l' })
                        && node.move_left.check(map)) {
                        if (node.move_left.eq == land_node.eq) {
                            return build_path(land_node);
                        }
                        else {
                            node_search.push(node.move_left);
                        }
                    }
                    //r
                    if (node.move_right != null
                        && node_mark.mark(node.move_right.eq, { node: node, oper: 'r' })
                        && node.move_right.check(map)) {
                        if (node.move_right.eq == land_node.eq) {
                            return build_path(land_node);
                        }
                        else {
                            node_search.push(node.move_right);
                        }
                    }
                    /*//d
                    if (node.move_down != null
                        && node_mark.mark(node.move_down.eq, { node: node, oper: 'd' })
                        && node.move_down.check(map)) {
                        if (node.move_down.eq == land_node.eq) {
                            return build_path(land_node);
                        }
                        else {
                            node_search.push(node.move_down);
                        }
                        //D
                        let node_D = node.drop(map);
                        if (node_mark.mark(node_D.eq, { node, oper: 'D' })) {
                            if (node_D.eq == land_node.eq) {
                                return build_path(land_node);
                            }
                            else {
                                node_search.push(node_D);
                            }
                        }
                    }*/

                    //D
                    if (!disable_d) {
                        let node_D = node.drop(map);
                        if (node_mark.mark(node_D.eq, { node: node, oper: 'D' })) {
                            if (node_D.eq == land_node.eq) {
                                return build_path(land_node);
                            }
                            else {
                                node_search.push(node_D);
                            }
                        }
                    }
                }
            } while (node_search.length > cache_index);
            game.node = land_node;
            game.draw();
            console.log("空的路径" + `t:${land_node.status.t},x${land_node.status.x},y${land_node.status.y},r${land_node.status.r}`)
            return [];
        },

        make_path_t: function (node, land_point, map) {
            let node_search = [];
            let node_mark = new Map();
            let last = land_point.last;
            node_mark.clear();
            node_search.length == 0;
            node_mark.mark = (value, n) => {
                if (!node_mark.has(value)) {
                    node_mark.set(value, n)
                    return true;
                }
                else
                    return false;
            }

            function build_path(lp) {
                let path = [];
                let node = lp;
                while (true) {
                    let result = node_mark.get(node.eq);
                    if (result == undefined)
                        break;
                    node = result.node;
                    if (node == null) {
                        break;
                    }
                    path.push(result.oper);
                }
                path.reverse();
                let land_node = land_point.node;

                //逆时针踢墙
                for (let kick_node of last.ccwWallKick) {
                    if (kick_node != null) {
                        if (kick_node.check(map)) {
                            if (kick_node.eq == land_node.eq) {
                                path.push('z')
                                while (path.length != 0 && (path[path.length - 1] == 'd' || path[path.length - 1] == 'D')) {
                                    path.splice(path.length - 1, 1);
                                }
                                path.push('V');
                                return path;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }

                //顺时针踢墙
                for (let kick_node of last.cwWallKick) {
                    if (kick_node != null) {
                        if (kick_node.check(map)) {
                            if (kick_node.eq == land_node.eq) {
                                path.push('c')
                                while (path.length != 0 && (path[path.length - 1] == 'd' || path[path.length - 1] == 'D')) {
                                    path.splice(path.length - 1, 1);
                                }
                                path.push('V');
                                return path;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
                while (path.length != 0 && (path[path.length - 1] == 'd' || path[path.length - 1] == 'D')) {
                    path.splice(path.length - 1, 1);
                }
                path.push('V');
                return path;
            };

            node_search.push(node);
            node_mark.mark(node.eq, { node: null, oper: '\0' });
            let cache_index = 0;
            // let disable_d = land_point.open(map)
            do {
                for (let max_index = node_search.length; cache_index < max_index; ++cache_index) {
                    let node = node_search[cache_index];

                    /*if (disable_d) {
                        let node_D = node.drop(map);
                        if (node_mark.mark(node_D.eq, { node: node, oper: 'D' })) {
                            if (node_D.eq == last.eq) {
                                return build_path(last);
                            }
                        }
                    }*/

                    //z
                    if (node.rotate_counterclockwise != null && node.rotate_counterclockwise.check(map)) {
                        if (node_mark.mark(node.rotate_counterclockwise.eq, { node: node, oper: 'z' })) {
                            if (node.rotate_counterclockwise.eq == last.eq) {
                                return build_path(last);
                            }
                            else {
                                node_search.push(node.rotate_counterclockwise);
                            }
                        }
                    }
                    //逆时针踢墙
                    else {
                        for (let kick_node of node.ccwWallKick) {
                            if (kick_node != null) {
                                if (kick_node.check(map)) {
                                    if (node_mark.mark(kick_node.eq, { node: node, oper: 'z' })) {
                                        if (kick_node.eq == last.eq) {
                                            return build_path(last);
                                        }
                                        else {
                                            node_search.push(kick_node);
                                        }
                                    }
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                    }
                    //c
                    if (node.rotate_clockwise != null && node.rotate_clockwise.check(map)) {
                        if (node_mark.mark(node.rotate_clockwise.eq, { node: node, oper: 'c' })) {
                            if (node.rotate_clockwise.eq == last.eq) {
                                return build_path(last);
                            }
                            else {
                                node_search.push(node.rotate_clockwise);
                            }
                        }
                    }
                    //顺时针踢墙
                    else {
                        for (let kick_node of node.cwWallKick) {
                            if (kick_node != null) {
                                if (kick_node.check(map)) {
                                    if (node_mark.mark(kick_node.eq, { node: node, oper: 'c' })) {
                                        if (kick_node.eq == last.eq) {
                                            return build_path(last);
                                        }
                                        else {
                                            node_search.push(kick_node);
                                        }
                                    }
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                    }

                    //l
                    if (node.move_left != null
                        && node_mark.mark(node.move_left.eq, { node: node, oper: 'l' })
                        && node.move_left.check(map)) {
                        if (node.move_left.eq == last.eq) {
                            return build_path(last);
                        }
                        else {
                            node_search.push(node.move_left);
                        }
                    }
                    //r
                    if (node.move_right != null
                        && node_mark.mark(node.move_right.eq, { node: node, oper: 'r' })
                        && node.move_right.check(map)) {
                        if (node.move_right.eq == last.eq) {
                            return build_path(last);
                        }
                        else {
                            node_search.push(node.move_right);
                        }
                    }
                    /*//d
                    if (node.move_down != null
                        && node_mark.mark(node.move_down.eq, { node: node, oper: 'd' })
                        && node.move_down.check(map)) {
                        if (node.move_down.eq == last.eq) {
                            return build_path(last);
                        }
                        else {
                            node_search.push(node.move_down);
                        }
                        //D
                        let node_D = node.drop(map);
                        if (node_mark.mark(node_D.eq, { node, oper: 'D' })) {
                            if (node_D.eq == last.eq) {
                                return build_path(last);
                            }
                            else {
                                node_search.push(node_D);
                            }
                        }
                    }*/

                    //D
                    //  if (!disable_d) {
                    let node_D = node.drop(map);
                    if (node_mark.mark(node_D.eq, { node: node, oper: 'D' })) {
                        if (node_D.eq == last.eq) {
                            return build_path(last);
                        }
                        else {
                            node_search.push(node_D);
                        }
                    }
                    // }
                }
            } while (node_search.length > cache_index);
            game.node = land_point.node;
            game.draw();
            console.log("空的路径" + `t:${land_point.status.t},x${land_point.status.x},y${land_point.status.y},r${land_point.status.r}`)
            return [];
        },

        search: function (map, node) {
            let node_search = [];
            let node_mark = new Map();
            let land_point_cache = new Array();
            node_mark.mark = (value, n) => {
                if (!node_mark.has(value)) {
                    node_mark.set(value, n)
                    return true;
                }
                else
                    return false;
            }

            node_mark.clear();
            node_search.length = 0;
            land_point_cache.length = 0;

            node_search.push(node);
            //node_mark.mark(node);
            let cache_index = 0;
            do {
                for (let max_index = node_search.length; cache_index < max_index; ++cache_index) {
                    node = node_search[cache_index];
                    if ((node.move_down == null) || !node.move_down.check(map)) {
                        land_point_cache.push(node);
                    }
                    //z
                    if (node.rotate_counterclockwise != null && node.rotate_counterclockwise.check(map)) {
                        if (node_mark.mark(node.rotate_counterclockwise.eq, { node: node, oper: 'r' }))
                            node_search.push(node.rotate_counterclockwise);
                    }

                    //逆时针踢墙
                    else {
                        //if (node.rotate_counterclockwise != null && !node.rotate_counterclockwise.check(map))
                        for (let kick_node of node.ccwWallKick) {
                            if (kick_node != null) {
                                if (kick_node.check(map)) {
                                    if (node_mark.mark(kick_node.eq, { node: node, oper: 'r' })) {//&& !kick_node.open(map)
                                        node_search.push(kick_node);
                                    }
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                    }

                    //c
                    if (node.rotate_clockwise != null && node.rotate_clockwise.check(map)) {
                        if (node_mark.mark(node.rotate_clockwise.eq, { node: node, oper: 'r' }))
                            node_search.push(node.rotate_clockwise);
                    }

                    //顺时针踢墙
                    else {
                        //if (node.rotate_clockwise != null && node.rotate_clockwise.check(map))
                        for (let kick_node of node.cwWallKick) {
                            if (kick_node != null) {
                                if (kick_node.check(map)) {
                                    if (node_mark.mark(kick_node.eq, { node: node, oper: 'r' })) {//&& !kick_node.open(map)
                                        node_search.push(kick_node);
                                    }
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                    }
                    //l
                    if (node.move_left != null
                        && node_mark.mark(node.move_left.eq, { node: node, oper: ' ' })
                        && node.move_left.check(map)) {
                        node_search.push(node.move_left);
                    }
                    //r
                    if (node.move_right != null
                        && node_mark.mark(node.move_right.eq, { node: node, oper: ' ' })
                        && node.move_right.check(map)) {
                        node_search.push(node.move_right);
                    }
                    /*//d
                    if (node.move_down != null
                        && node_mark.mark(node.move_down.eq)
                        && node.move_down.check(map)) {
                        node_search.push(node.move_down);
                    }*/

                    //D
                    let drop = node.drop(map);
                    // if (drop != null && node_mark.mark(drop.eq) && drop.check(map)) {
                    if (node_mark.mark(drop.eq, { node: node, oper: ' ' })) {
                        node_search.push(drop);
                    }
                }
            } while (node_search.length > cache_index);
            let lpc = [];
            {
                for (let i_node of land_point_cache) {
                    let result = node_mark.get(i_node.eq)
                    let i_node_ex = new TetrisNodeEx(i_node)
                    if (node.status.t == Piece.T)
                        if (result.oper == 'r') {
                            let rs = i_node_ex.node.corner3(map);
                            i_node_ex.last = result.node;
                            i_node_ex.lastRotate = true;
                            i_node_ex.mini = rs.mini;
                            i_node_ex.spin = rs.spin;
                        }
                    lpc.push(i_node_ex)
                }
            }
            return lpc;
            // return land_point_cache;
        }
    }

    class TetrisNodeEx {
        constructor(_node) {
            this.node = _node;
            this.type = TSpinType.None;
            this.mini = false;
            this.spin = false;
            this.last = null;
            this.lastRotate = false;
        }
        get tn() {
            return this.node;
        }
    }

    let land_point_search = Search_TSpin

    let TetrisMinoStyle = {
        rs: [
            [0, 6, 6, 0],//O
            [0, 15, 0, 0],//I
            [2, 7, 0],//T
            [4, 7, 0],//J
            [1, 7, 0],//L
            [6, 3, 0],//Z
            [3, 6, 0],//S
        ],
        kickdatas: {
            NomalkickData: [
                [-1, 0, -1, 1, 0, -2, -1, -2],//0->R
                [1, 0, 1, -1, 0, 2, 1, 2],  //R->0
                [1, 0, 1, -1, 0, 2, 1, 2], //R->2
                [-1, 0, -1, 1, 0, -2, -1, -2],  //2->R
                [1, 0, 1, 1, 0, -2, 1, -2], //2->L
                [-1, 0, -1, -1, 0, 2, -1, 2], //L->2
                [-1, 0, -1, -1, 0, 2, -1, 2], //L->0
                [1, 0, 1, 1, 0, -2, 1, -2]], //0->L
            //----I
            IkickData: [
                [-2, 0, 1, 0, -2, -1, 1, 2], //0->R
                [2, 0, -1, 0, 2, 1, -1, -2],  //R->0
                [-1, 0, 2, 0, -1, 2, 2, -1], //R->2
                [1, 0, -2, 0, 1, -2, -2, 1],  //2->R
                [2, 0, -1, 0, 2, 1, -1, -2], //2->L
                [-2, 0, 1, 0, -2, -1, 1, 2], //L->2
                [1, 0, -2, 0, 1, -2, -2, 1], //L->0
                [-1, 0, 2, 0, -1, 2, 2, -1]], //0->L

            getOffset: function (r1, r2, kind) { //r2:0 normal 1 reverse index:0 1 2 3 4 kind:0 1
                let posOffset = new Array(), i;
                if (r1 == 0) {
                    switch (r2) {
                        case 1: i = 0; break; //0->R
                        case 3: i = 7; break; //0->L
                    }
                }
                else if (r1 == 1) {
                    switch (r2) {
                        case 0: i = 1; break; //R->0
                        case 2: i = 2; break; //R->2
                    }
                }
                else if (r1 == 2) {
                    switch (r2) {
                        case 1: i = 3; break;//2->R
                        case 3: i = 4; break;//2->L
                    }
                }
                else if (r1 == 3) {
                    switch (r2) {
                        case 2: i = 5; break;//L->2
                        case 0: i = 6; break;//L->0
                    }
                }
                if (kind != Piece.I) {
                    posOffset = this.NomalkickData[i];
                }
                else {
                    posOffset = this.IkickData[i];
                }
                return posOffset;
            },
        }
    }

    class TetrisEngine {
        constructor(_width, _height) {
            this.width = _width;
            this.height = _height;
            this.node_cache = new Map();
            this.Rotates = new Map();
            this.tetrisOpertion = new TetrisOpertion(this)
            this.initR();
            this.prepare(_width, _height);
            this.init_dangers();
        }

        rot(block) {
            let lh = block.length;
            let newLayout = new Array(lh).fill(0);
            for (let x = 0; x < lh; x++) {//顺时针旋转
                for (let y = 0; y < lh; y++) {
                    let yuanY = lh - 1 - y;
                    let rx = lh - 1 - x
                    let ry = lh - 1 - y
                    if ((block[yuanY] & (1 << rx)) > 0)
                        newLayout[x] |= (1 << ry)
                    else
                        newLayout[x] &= ~(1 << ry)
                }
            }
            return newLayout;
        }

        initR() {
            for (let p = 0; p < 7; p++) {
                let i = 0;
                let sArr = [];
                let origin = TetrisMinoStyle.rs[p];
                do {
                    sArr.push(origin);
                    origin = this.rot(origin);
                    i++;
                } while (i < 4)
                this.Rotates.set(p, sArr);
            }
        }

        prepare = (w, h) => {
            if (w > 30 || h > 30) {
                return false;
            }
            this.node_cache.clear();
            let D = (node, str) => {
                do {
                    let copy = node.clone();
                    if (this.tetrisOpertion[str](copy, map)) {
                        if (!this.node_cache.has(copy.status.str())) {
                            this.node_cache.set(copy.status.str(), copy);
                        }
                        let result = this.node_cache.get(copy.status.str());
                        if (node[str] == null) {
                            redo = true;
                            node[str] = result;
                        }
                    }
                } while (false);
            }

            let E = (node, str) => {
                let copy = node.clone();
                if (this.tetrisOpertion[str](copy)) {
                    let offsets = TetrisMinoStyle.kickdatas.getOffset(node.status.r, copy.status.r, node.status.t)
                    for (let i = 0; i < 4; i++) {
                        let status = copy.status.clone();
                        status.y -= offsets[i * 2 + 1];
                        status.x += offsets[i * 2];
                        if (this.node_cache.has(status.str())) {
                            let kick_node = this.node_cache.get(status.str());
                            node[str].push(kick_node);
                        }
                    }
                }
            }

            let map = new TetrisMap(w, h);
            for (let i = 0; i < 7; ++i) {
                let node = this.tetrisOpertion.generate_template(map, i);
                this.node_cache.set(node.status.str(), node);
            }
            let redo;
            do {
                redo = false;
                for (let i of this.node_cache.values()) {
                    let node = i;
                    D(node, "rotate_clockwise");
                    D(node, "rotate_counterclockwise");
                    D(node, "move_left");
                    D(node, "move_right");
                    D(node, "move_down");
                }
            } while (redo);

            for (let l of this.node_cache.values()) {
                E(l, "cwWallKick");
                E(l, "ccwWallKick");
            }
            return true;
        }

        init_dangers() {
            Evaluation.danger_line_ = this.height
            Evaluation.danger_data_ = 0;
            for (let i = 0; i < 7; ++i) {
                let node1 = this.tetrisOpertion.generate_template_t(i);
                let matrix = node1.matrix;
                Evaluation.danger_line_ = Math.min(Evaluation.danger_line_, this.height - node1.status.y);
                for (let x = node1.status.x; x < node1.status.x + matrix.length; ++x) {
                    Evaluation.danger_data_ |= 1 << x;
                }
            }
        }

    }

    class TetrisMap {
        constructor(_width = 10, _height = 20) {
            this.row = new Array(_height).fill(0);
            this.top_ = new Array(_width).fill(0);
            this.roof_ = 0;
            this.width = _width;//宽度
            this.height = _height;//高度
            this.count;
        }

        get top() {
            for (let x = 0; x < this.width; x++)
                for (let y = this.height - 1; y > 0; y--) {
                    if (this.full(x, y)) {
                        this.top_[x] = y + 1;
                        break;
                    }
                }
            return this.top_;
        }

        get roof() {
            let maxY = 0;
            for (let y = this.height - 1; y + 1 > 0; y--) {
                if (this.row[y] > 0) {
                    maxY = y + 1;
                    break;
                }
            }
            return maxY;
        }

        full(x, y) {
            return (this.row[y] & (1 << (this.width - 1 - x))) > 0;
        }

        set(x, y, n) {
            if (n == 0)
                this.row[y] &= ~(1 << (this.width - 1 - x));
            else
                this.row[y] |= (1 << (this.width - 1 - x));
        }

        clone() {
            let new_map = new TetrisMap();
            new_map.row = this.row.concat();
            new_map.width = this.width;
            new_map.height = this.height;
            new_map.count = this.count;
            return new_map;
        }
    }

    class TetrisBlockStatus {
        constructor() {
            this.x; //横坐标
            this.y; //纵坐标
            this.r; //旋转状态
            this.t;//方块类型
        }
        clone() {
            let new_status = new TetrisBlockStatus();
            new_status.x = this.x;
            new_status.y = this.y;
            new_status.r = this.r;
            new_status.t = this.t;
            return new_status;
        }
        str() {
            let s = `t${this.t}x${this.x}y${this.y}r${this.r}`
            return s;
        }
    }

    class TetrisOpertion {
        constructor(_TetrisEngine) {
            this.TetrisContext = _TetrisEngine
        }

        get(_status) {
            let node = new TetrisNode();
            node.status = _status;
            node.datas = this.TetrisContext.Rotates.get(node.status.t);
            return node;
        }

        generate_template(map, _t) {
            let s = new TetrisBlockStatus();
            s.t = _t;
            s.x = 3;
            s.y = 0;
            s.r = 0;
            return this.get(s);
        }

        generate_template_t(_t) {
            let s = new TetrisBlockStatus();
            s.t = _t;
            s.x = 3;
            s.y = 0;
            s.r = 0;
            return this.TetrisContext.node_cache.get(s.str());
        }
        rotate_clockwise(node, map) {
            if (node.status.t == Piece.O) return false;
            let originR = node.status.r
            node.status.r += 1;
            node.status.r %= 4;
            if (!node.check(map)) {
                node.status.r = originR;
                return false;
            }
            return true;
        }

        rotate_counterclockwise(node, map) {
            if (node.status.t == Piece.O) return false;
            let originR = node.status.r
            node.status.r -= 1;
            if (node.status.r < 0) node.status.r += 4;
            node.status.r %= 4;
            if (!node.check(map)) {
                node.status.r = originR;
                return false;

            }
            return true;
        }

        cwWallKick(node) {
            if (node.status.t == Piece.O) return false;
            node.status.r += 1;
            node.status.r %= 4;
            return true;
        }

        ccwWallKick(node) {
            if (node.status.t == Piece.O) return false;
            node.status.r -= 1;
            if (node.status.r < 0) node.status.r += 4;
            node.status.r %= 4;
            return true;
        }

        move_left(node, map) {
            node.status.x--;
            if (!node.check(map)) {
                node.status.x++;
                return false
            }
            return true;
        }

        move_right(node, map) {
            node.status.x++;
            if (!node.check(map)) {
                node.status.x--;
                return false
            }
            return true;
        }

        move_down(node, map) {
            node.status.y++;
            if (!node.check(map)) {
                node.status.y--;
                return false
            }
            return true;
        }
    }

    class TetrisNode {
        constructor() {
            this.status = new TetrisBlockStatus();
            //this.op = TetrisOpertion;
            this.datas = null;
            this.rotate_clockwise = null;
            this.rotate_counterclockwise = null;
            this.rotate_opposite = null;
            this.move_left = null;
            this.move_right = null;
            this.move_down = null;
            this.cwWallKick = [];
            this.ccwWallKick = [];
            this.type = -1;
            this.is_mini_ready = 0;
            this.is_ready = 0;
            this.is_check = 0;
        }

        clone() {
            let new_node = new TetrisNode();
            new_node.status.x = this.status.x;
            new_node.status.y = this.status.y;
            new_node.status.r = this.status.r;
            new_node.status.t = this.status.t;
            new_node.datas = this.datas;
            return new_node;
        }

        get eq() {
            return this.status.str();
        }

        get matrix() {
            return this.datas[this.status.r];
        }

        get height() {
            return this.datas[0].length;
        }

        get data() {
            let a = this.datas[this.status.r].concat();
            for (let i = 0, len = a.length; i < len; i++) {
                if (this.status.x >= 0)
                    a[i] <<= this.status.x;
                else
                    a[i] >>= Math.abs(this.status.x);
            }
            return a;
        }

        get dataCheck() {
            let a = this.datas[this.status.r].concat();
            for (let i = 0, len = a.length; i < len; i++) {
                a[i] <<= this.status.x;
            }
            return a;
        }

        get row() {
            return this.status.y;
        }

        drop = (map) => {
            let node = this;
            while (node.move_down != null && node.move_down.check(map)) {
                node = node.move_down;
            }
            return node;
        }

        dropDis = (map) => {
            let node = this, i = 0;
            while (node.move_down != null && node.move_down.check(map)) {
                node = node.move_down;
                i++
            }
            return i;
        }

        open = (map) => {
            let len = this.matrix.length;
            for (let j = 0; j < len; j++)
                for (let i = 0; i < len; i++) {
                    let mx = this.status.x + j;
                    let my = this.status.y + i;
                    if (this.full(j, i)) {
                        for (let myy = my - 1; myy > 0; myy--) {
                            if (map.full(mx, myy))
                                return false;
                        }
                        break;
                    }
                }
            return true;
        }

        check(map) {
            let len = this.matrix.length;
            for (let i = 0; i < len; i++)
                for (let j = 0; j < len; j++) {
                    let mx = this.status.x + j;
                    let my = this.status.y + i;
                    if (this.full(j, i)) {
                        if (mx < 0 || mx > (map.width - 1) || my < 0 || my > (map.height - 1))
                            return false
                        if (map.full(mx, my)) {
                            return false
                        }
                    }
                }
            return true;
        }

        attach(map) {
            let full = (1 << map.width) - 1;
            let len = this.matrix.length;
            let clear = 0;
            /*this.data.forEach((i, index) => {
                this.attach_row(this.row + index, i, map);
            })*/
            for (let i = 0; i < len; i++)
                for (let j = 0; j < len; j++) {
                    let mx = this.status.x + j;
                    let my = this.status.y + i;
                    if (this.full(j, i)) {
                        map.set(mx, my, 1)
                    }
                }
            clear = this.clear(map, full);
            return clear;
        }

        clear(map, full) {
            let clear = 0
            for (let i = 0; i < map.height; i++) {
                if (map.row[i] == full) {
                    map.row.splice(i, 1)
                    map.row.unshift(0)
                    clear++;
                }
            }
            return clear;
        }

        attach_row(row, data_row, map) {
            if (row >= 0 && row < map.height) {
                map.row[row] |= data_row;
            }
        }

        full(x, y) {
            let len = this.matrix.length;
            return (this.matrix[y] & (1 << (len - 1 - x))) > 0;
        }

        corner3(map) {
            function checkCrossBorder(mx, my) {
                let res = 1;
                if (mx < 0 || mx > (map.width - 1) || my < 0 || my > (map.height - 1))
                    res = 0;
                return res;
            }
            let _x = this.status.x;
            let _y = this.status.y;
            let ifspin = 0, ifmini = 0, mini = 0, sum = 0;
            //[<>,[],<>]
            //[[],<>,[]]
            //[<>,[],<>]
            if (!checkCrossBorder(_x + 2, _y + 1) || (!this.full(2, 1) && map.full(_x + 2, _y + 1)))
                mini++;
            if (!checkCrossBorder(_x + 1, _y + 0) || (!this.full(1, 0) && map.full(_x + 1, _y + 0)))
                mini++;
            if (!checkCrossBorder(_x + 1, _y + 2) || (!this.full(1, 2) && map.full(_x + 1, _y + 2)))
                mini++;
            if (!checkCrossBorder(_x + 0, _y + 1) || (!this.full(0, 1) && map.full(_x + 0, _y + 1)))
                mini++;

            if (!checkCrossBorder(_x, _y,) || map.full(_x, _y)) sum++;
            if (!checkCrossBorder(_x, _y + 2,) || map.full(_x, _y + 2)) sum++;
            if (!checkCrossBorder(_x + 2, _y) || map.full(_x + 2, _y)) sum++;
            if (!checkCrossBorder(_x + 2, _y + 2) || map.full(_x + 2, _y + 2)) sum++;

            if (sum > 2) {
                ifspin = 1;
            }
            if (mini == 1) {
                ifmini = 1;
            }
            return { spin: ifspin, mini: ifmini }
        }
    }

    class Context {
        constructor(_TetrisOpertion) {
            this.level = [];//保存每一个等级层
            this.width = 2;
            this.is_open_hold = true;
            this.tetrisOpertion = _TetrisOpertion
        }

        create = () => {//创建个一个树节点
            let tree = new TetrisTree();
            tree.context = this;
            return tree;
        }
    }

    class EvalParm {
        constructor(_map) {
            this.map = _map;
            this.value;
            this.land_node = null;
            this.clear;
        }
    }

    class TetrisTree {
        constructor() {
            this.parent = null;//父节点
            this.context = null;//公用的层次对象
            this.land_point = [];//落点
            this.nexts;//预览队列
            this.nextIndex;//第几个Next
            this.children = [];//子节点
            this.value = null;//评分
            this.node = null;//当前块
            this.map = null;
            this.evalParm = new EvalParm(this.map);//落点信息
            this.extended = false;//是否拓展
            this.is_hold = false;
            this.is_hold_lock = false;
            this.hold = -1;
            this.status = { combo: 0, b2b: 0, attack: 0, like: 0, max_combo: 0, max_attack: 0, value: 0 };
        }

        search = (hold_opposite = false) => {
            if (this.context.is_open_hold && !this.is_hold_lock && (this.hold != -1 || this.nexts.length != 0)) {
                this.search_hold();
                return;
            }
            if (this.land_point.length == 0) {
                this.land_point.push(this.node);
                //if (this.map != null && this.node != null)
                let land_points = land_point_search.search(this.map, this.node);
                for (let i_node of land_points) {
                    let new_tree = this.context.create();
                    let next_node = this.context.tetrisOpertion.generate_template_t(this.nexts[this.nextIndex]);
                    new_tree.parent = this;
                    new_tree.node = next_node;
                    new_tree.nexts = this.nexts;
                    new_tree.nextIndex = this.nextIndex + 1;
                    new_tree.hold = this.hold;
                    new_tree.is_hold = false ^ hold_opposite;
                    let map_copy = this.map.clone();
                    new_tree.map = map_copy;
                    new_tree.evalParm.clear = i_node.tn.attach(map_copy);
                    new_tree.evalParm.land_node = i_node;
                    this.children.push(new_tree)
                }
            }
        }

        search_hold = (hold_opposite = false) => {
            if (this.hold == -1 || this.nexts.length == 0) {
                let hold_save = this.hold;
                let nexts_save = this.nexts.slice(0, this.nexts.length)
                if (this.hold == -1) {
                    this.hold = this.node.status.t;
                    this.node = this.context.tetrisOpertion.generate_template_t(this.nexts.shift());
                    this.search_hold(true);
                }
                else {
                    this.nexts.push(this.hold)
                    this.hold = -1;
                    this.is_hold_lock = true;
                    this.search(true);
                }
                this.hold = hold_save;
                this.nexts = nexts_save;
                this.is_hold_lock = false;
                return;
            }
            if (this.node.status == this.hold) {
                if (this.land_point.length == 0) {
                    this.land_point.push(this.node);
                    //if (this.map != null && this.node != null)
                    let land_points = land_point_search.search(this.map, this.node);
                    for (let i_node of land_points) {
                        let new_tree = this.context.create();
                        let next_node = this.context.tetrisOpertion.generate_template_t(this.nexts[this.nextIndex]);
                        new_tree.parent = this;
                        new_tree.node = next_node;
                        new_tree.nexts = this.nexts;
                        new_tree.nextIndex = this.nextIndex + 1;
                        new_tree.hold = this.hold;
                        new_tree.is_hold = false ^ hold_opposite;
                        let map_copy = this.map.clone();
                        new_tree.map = map_copy;
                        new_tree.evalParm.clear = i_node.tn.attach(map_copy);
                        new_tree.evalParm.land_node = i_node;
                        this.children.push(new_tree)
                    }
                }
            }
            else if (this.node.status != this.hold) {
                let hold_node = this.context.tetrisOpertion.generate_template_t(this.hold);
                if (this.land_point.length == 0) {
                    this.land_point.push(this.node);
                    this.land_point.push(hold_node);
                    //if (this.map != null && this.node != null)
                    let land_points = land_point_search.search(this.map, this.node);
                    for (let i_node of land_points) {
                        let new_tree = this.context.create();
                        let next_node = this.context.tetrisOpertion.generate_template_t(this.nexts[this.nextIndex]);
                        new_tree.parent = this;
                        new_tree.node = next_node;
                        new_tree.nexts = this.nexts;
                        new_tree.nextIndex = this.nextIndex + 1;
                        new_tree.hold = this.hold;
                        new_tree.is_hold = false ^ hold_opposite;
                        let map_copy = this.map.clone();
                        new_tree.map = map_copy;
                        new_tree.evalParm.clear = i_node.tn.attach(map_copy);
                        new_tree.evalParm.land_node = i_node;
                        this.children.push(new_tree)
                    }
                    //if (this.map != null && hold_node != null)
                    let hold_land_points = land_point_search.search(this.map, hold_node);
                    for (let i_node of hold_land_points) {
                        let new_tree = this.context.create();
                        let next_node = this.context.tetrisOpertion.generate_template_t(this.nexts[this.nextIndex]);
                        new_tree.parent = this;
                        new_tree.node = next_node;
                        new_tree.nexts = this.nexts;
                        new_tree.nextIndex = this.nextIndex + 1;
                        new_tree.hold = this.node.status.t;
                        new_tree.is_hold = true ^ hold_opposite;
                        let map_copy = this.map.clone();
                        new_tree.map = map_copy;
                        new_tree.evalParm.clear = i_node.tn.attach(map_copy);
                        new_tree.evalParm.land_node = i_node;
                        this.children.push(new_tree)
                    }
                }
            }
        }

        eval = () => {
            if (this.extended == true)
                return false
            if (this.children.length == 0) {
                this.search();
                this.extended = true;
            }

            for (let child of this.children) {
                let eval_result = Evaluation.eval_map(child.map, child.evalParm.land_node, child.evalParm.clear);
                let p = Evaluation.get(eval_result, child.nextIndex, this.status, child.hold, child.nexts)
                child.status = p;
                child.value = p.value;
            }
            return true;
        }

        run() {
            let i = 0;
            let prune_hold = (++this.context.width);
            let prune_hold_max = prune_hold * 3;
            let next_length_max = this.nexts.length + 1;
            if (this.context.is_open_hold && this.hold == -1) {
                --next_length_max;
            }
            do {
                //let level_prune_hold = Math.floor((prune_hold_max) * (next_length_max - i) / next_length_max) + prune_hold;
                let level_prune_hold = prune_hold;
                //console.log(i, level_prune_hold)
                let _deepIndex = i;
                let levelSets = this.context.level[_deepIndex];
                if (!(levelSets instanceof Array)) return;
                let presentLevelNodeSets = [];
                let pi = 0;
                for (let iLevelTree of levelSets) {
                    if (pi == level_prune_hold) break;
                    if (!iLevelTree.eval()) continue;
                    presentLevelNodeSets.push(...iLevelTree.children);
                    pi++;
                }

                let level = this.context.level[i + 1]
                if (level instanceof Array) {
                    level.push(...presentLevelNodeSets);
                }
                else
                    this.context.level.push(presentLevelNodeSets);
                i++;
                this.context.level[i].sort((a, b) => {
                    {
                        if (a.value != b.value)
                            return b.value - a.value;
                    }
                })
            } while (i < next_length_max)
        }

        getBest() {
            let deepestLevelSets = this.context.level[this.context.level.length - 1]
            let maxValueTree = deepestLevelSets[0];
            //console.log(strMap(maxValueTree.map))
            while (maxValueTree.parent.parent != null) {
                maxValueTree = maxValueTree.parent;
            }
            return { best: maxValueTree.evalParm.land_node, is_hold: maxValueTree.is_hold };
        }

        dealloc = () => {
            //let context=this.context;
            for (let level of this.context.level) {
                for (let nlevel of level) {
                    nlevel.parent = null;//父节点
                    nlevel.context = null;//公用的层次对象
                    nlevel.land_point = null;//落点
                    nlevel.nexts = null;//预览队列
                    nlevel.nextIndex;//第几个Next
                    nlevel.children = null;//子节点
                    nlevel.map = null;//地图
                    nlevel.value = null;//评分
                    nlevel.node = null;//当前块
                    nlevel.evalParm.clear = null;//落点信息
                    nlevel.map = null;
                    nlevel.evalParm.value = null;
                    nlevel.evalParm.map = null;
                    nlevel.evalParm.land_node = null;
                    nlevel.evalParm = null;
                }
            }
            this.context = null;
        }
    }



    let Piece = { O: 0, I: 1, T: 2, J: 3, L: 4, Z: 5, S: 6 }

    let core = new TetrisEngine(10, 24);

    function strMap(map) {
        if (map instanceof TetrisMap) {
            let str = ""
            for (let i = 0; i < map.height; i++) {
                let str1 = "";
                for (let j = 0; j < map.width; j++) {
                    if (map.full(j, i)) {
                        str1 += '■'
                    }
                    else
                        str1 += '□'
                }
                str += `${str1}\n`
            }
            return str;
        }
    }

    function run(core, status, nexts, hold, holdEnable, holdLock, combo, b2b, map, limit) {
        let nContext = new Context(core.tetrisOpertion);
        nContext.is_open_hold = holdEnable;
        let initTree = null;
        let n = core.node_cache.get(status.str());
        let bag = nexts;
        let startTime = new Date().getTime() + parseInt(limit, 10);
        if (initTree instanceof TetrisTree)
            initTree.dealloc();
        initTree = nContext.create();
        initTree.is_hold_lock = holdLock;
        initTree.status.combo = combo;
        initTree.status.b2b = b2b;
        nContext.level = null;
        nContext.level = [];
        nContext.level.push([initTree])
        initTree.hold = hold;
        // initTree.is_hold_lock = !game.holdSys.able;
        initTree.node = n;
        initTree.nexts = bag;
        initTree.map = map;
        initTree.nextIndex = 0;
        while (new Date().getTime() < startTime) {
            initTree.run();
        }
        let best = initTree.getBest();
        initTree.dealloc();
        return best;
    }

    function getResult(x, y, t, r, nexts, hold, holdEnable, holdLock, combo, b2b, map, limit) {
        //let core = new TetrisEngine(10, 20);
        let status = new TetrisBlockStatus();
        status.x = x;
        status.y = y;
        status.t = t;
        status.r = r;
        let bag = nexts.slice(0, nexts.length)
        let result = run(core, status, bag, hold, holdEnable, holdLock, combo, b2b, map, limit);
        let node_n = result.best;
        if (result.is_hold) {
            status.x = 3;
            status.y = 0;
            status.r = 0;
            if (hold == -1)
                status.t = nexts.shift();
            else
                status.t = hold
        }
        let n = core.node_cache.get(status.str());
        let path = land_point_search.make_path(n, node_n, map)
        /*let map1 = map.clone();
        node_n.tn.attach(map1);
        for (let i = 0; i < map1.height; i++) {
            let str = []
            for (let j = 0; j < map1.width; j++) {
                if (map1.full(j, i)) {
                    str.push(1)
                }
                else
                    str.push(0)
            }
            console.log(str)
        }*/
        if (result.is_hold)
            path.unshift('v');
        return path;
    }

    let nexts = [];
    let tetro_t;
    let board;
    let hold;
    let map = new TetrisMap(10, 24);
    let status = new TetrisBlockStatus();
    let bag;
    let holdEnable = true;
    let holdLock = false;
    let combo;
    let b2b;
    self.onmessage = function (e) {
        if (e.data.str == "zbsj") {
            let data = e.data.data
            for (let i = 0, len = data.nexts.length; i < len; i++) {
                nexts.push(data.nexts[i]);
            }
            let len = data.nexts.length;
            nexts = data.nexts.slice(0, len)
            combo = data.combo;
            b2b = data.b2b;
            /*nexts.push(new Tetro(data.nexts[0]));
            nexts.push(new Tetro(data.nexts[1]));
            nexts.push(new Tetro(data.nexts[2]));*/
            tetro_t = data.thisBlock
            hold = data.hold
            board = deepcopyArr(data.board)

            map = new TetrisMap(10, 24)
            for (let j = 0; j < 24; j++) {
                map.row[j] = 0;
                for (let i = 0; i < 10; i++) {
                    if (board[j][i] == 0) {
                        map.set(i, j, 0)
                    }
                    else {
                        map.set(i, j, 1)
                    }
                }
            }
            // console.log(map.row)
            bag = nexts.slice(0, nexts.length);
            /*status.x = 0;
            status.y = 0;
            status.r = 0;
            status.t = tetro_t;*/
        }
        if (e.data.str == "tz") {
            let data = e.data.data
            status.x = data.x;
            status.y = data.y;
            status.r = data.rs;
            status.t = tetro_t;
        }
        if (e.data.str == "go") {
            let path = getResult(status.x, status.y, status.t, status.r,
                bag, hold, holdEnable, holdLock, combo, b2b, map, 80)
            self.postMessage({ str: 'complete', result: { move: path } });
            //self.close();
        }
        // self.postMessage(e.data);
    }


}



