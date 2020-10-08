class KeyState {
   constructor(manager, func, endFunc, isDown = false, noDas = false) {
      this.manager = manager;
      this.func = func;
      this.endFunc = endFunc;
      this.noDas = noDas;
      this.isDown = isDown;
      this.press = false;
      this.das = false;
      this.dasHandle = null;
      this.moveHandle = null;
   }

   keyDown = () => {
      if (!this.press) {
         this.press = true;
         this.func();
         if (this.noDas) {
            return true;
         }
         if (this.isDown) {
            this.moveCall(this.manager.downDelay)
         } else {
            this.dasHandle = setTimeout(this.dasCall, this.manager.dasDelay);
         }
         return true;
      } else {
         return false;
      }
   }

   dasCall = () => {
      this.das = true;
      this.moveCall(this.manager.moveDelay);
   }

   moveCall = (delay) => {
      if (delay === 0) {
         this.endFunc();
      } else {
         this.func();
         this.moveHandle = setInterval(this.func, delay);
      }
   }

   keepMove() {
      if (this.das && this.manager.moveDelay === 0) {
         this.endFunc();
      }
   }

   keepDown() {
      if (this.press && this.manager.downDelay === 0) {
         this.endFunc();
      }
   }

   keyUp() {
      this.press = false;
      if (!this.noDas) {
         this.das = false;
         this.stop();
      }
   }

   stop_() {
      if (this.dasHandle != null) {
         clearTimeout(this.dasHandle);
         this.dasHandle = null;
      }
      if (this.moveHandle != null) {
         clearInterval(this.moveHandle);
         this.dasHandle = null;
      }
   }

   stop() {
         clearTimeout(this.dasHandle);
         clearInterval(this.moveHandle);
   }
}

