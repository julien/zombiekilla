(function (exports) {
  'use strict';

  var zk = exports.zk || (exports.zk = {});

  function CameraShake(game, camera) {
    this.game = game;
    this.camera = camera;
    this.duration = 0;
    this.intensity = 0;
    this.offset = new Phaser.Point(0, 0);
    this.onComplete = null;
    this.prevX = 0;
    this.prevY = 0;
    this.active = false;
  }

  CameraShake.prototype.start = function (opts) {
    opts = opts || {};

    if (this.offset.x === 0 && this.offset.y === 0) {
      this.prevX = this.camera.x;
      this.prevY = this.camera.y;
    }
    this.intensity = opts.intensity || 0.05;
    this.duration = opts.duration || 50;
    this.onComplete = opts.onComplete;
    this.offset.setTo(0, 0);
    this.active = true;
  };

  CameraShake.prototype.update = function () {

    var screenView = this.camera.screenView;

    if (this.duration > 0) {
      this.duration -= this.game.time.elapsed;

      if (this.game.math.roundTo(this.duration, -2) <= 0) {
        this.duration = 0;
        this.offset.setTo(0, 0);
        this.camera.view.x = this.prevX;
        this.camera.view.y = this.prevY;

        this.active = false;
        if (!!this.onComplete) {
          this.onComplete();
        }
      } else {
        this.offset.x = (this.game.rnd.integer * this.intensity * screenView.width * 2 - this.intensity * screenView.width);
        this.offset.y = (this.game.rnd.integer * this.intensity * screenView.height * 2 - this.intensity * screenView.height);
        this.camera.view.x = this.prevX + this.offset.x;
        this.camera.view.y = this.prevY + this.offset.y;
      }
    }
  };

  zk.CameraShake = CameraShake;

}(this));
