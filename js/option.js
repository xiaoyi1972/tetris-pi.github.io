var option = {
	leftFunc: function () {
		if (tetris.moveValid(-1, 0)) {
			tetris.tetro.pos.x--;
			/*tetris.tetro.tween.stop();
			tetris.tetro.tween.to({ x: tetris.tetro.pos.x * 20 }, 35);
			tetris.tetro.tween.start();*/
		}
		if (!tetris.isReplay) record.add(option.keyCodeEncode.left, tetris.recordTime);
	},
	leftEndFunc: function () {
	},
	rightFunc: function () {
		if (tetris.moveValid(1, 0)) {
			tetris.tetro.pos.x++;
			/*tetris.tetro.tween.stop();
			tetris.tetro.tween.to({ x: tetris.tetro.pos.x * 20 }, 35);
			tetris.tetro.tween.start();*/
		}
		if (!tetris.isReplay) record.add(option.keyCodeEncode.right, tetris.recordTime);
	},
	rightEndFunc: function () {
	},
	downFunc: function () {
		if (tetris.moveValid(0, 1)) {
			tetris.tetro.pos.y++;
		}
		if (!tetris.isReplay) record.add(option.keyCodeEncode.down, tetris.recordTime);
	},
	downEndFunc: function () {
	},
	rotateFunc: function () {
		//tetris.tetro.tween.stop();
		tetris.lastControl = 1;
		rotateSys.srsRot(0, tetris.tetro);
		//tetris.tetro.resetAnimate();
		if (!tetris.isReplay) record.add(option.keyCodeEncode.rotate, tetris.recordTime);


	},
	dropFunc: function () {
		tetris.fix = 0;
		let hd = tetris.getHarddropHeight();
		if (hd) tetris.lastControl = 0;
		tetris.tetro.pos.y += hd;
		tetris.put(tetris.tetro.pos, tetris.tetro);
		tetris.clear();
		tetris.tetro = new Tetro(tetris.randomSys.getOne());
		tetris.holdSys.resetTimes(tetris.tetro);
		if (!tetris.isReplay) record.add(option.keyCodeEncode.drop, tetris.recordTime);
	},
	rotateRightFunc: function () {
		//tetris.tetro.tween.stop();
		tetris.lastControl = 1;
		rotateSys.srsRot(1, tetris.tetro);
		//tetris.tetro.resetAnimate();
		if (!tetris.isReplay) record.add(option.keyCodeEncode.rotateRight, tetris.recordTime);

	},
	rotate180Func: function () {
		//tetris.tetro.tween.stop();
		tetris.lastControl = 1
		rotateSys.Rot180(1, tetris.tetro);
		//tetris.tetro.resetAnimate();
		if (!tetris.isReplay) record.add(option.keyCodeEncode.rotate180, tetris.recordTime);
	},
	holdFunc: function () {
		//tetris.tetro.tween.stop();

		tetris.holdSys.exchange();
		//tetris.tetro.resetAnimate();
		if (!tetris.isReplay) record.add(option.keyCodeEncode.hold, tetris.recordTime);
	},
	keyboard: {
		left: 37,
		right: 39,
		down: 40,
		drop: 32,
		rotate: 88,
		rotateRight: 90,
		rotate180: 65,
		hold: 67,
		dasDelay: 91,
		moveDelay: 20,
		downDelay: 12,
		timeLimit: 80
	},
	keyCodeEncode: {
		left: 33,
		right: 34,
		down: 35,
		drop: 36,
		rotate: 37,
		rotateRight: 38,
		rotate180: 39,
		hold: 40
	}
}

