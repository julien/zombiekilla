(function (exports) {
  'use strict';

  var zk = exports.zk || (exports.zk = {});

  function Skull(game, opts) {
    opts = opts || {};
    opts.x = opts.x || 0;
    opts.y = opts.y || 0;
    opts.key = opts.key || 'skull';
    opts.url = opts.url || '/assets/skull.png';
    opts.scale = opts.scale || 1;
    opts.tweenDuration = opts.tweenDuration || 600 * Math.random() * 400 - 150;

    Phaser.Sprite.call(this, game, opts.x, opts.y, opts.key);

    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo(opts.scale, opts.scale);
    this.angle = Math.random() * 360;
  }

  Skull.prototype = Object.create(Phaser.Sprite.prototype);
  Skull.prototype.constructor = Skull;

  Skull.prototype.create = function () {
    var tween, that = this;
    this.game.add.existing(this);

    tween = this.game.add.tween(this)
      .to({
        y: (-this.height * this.scale.y),
        alpha: 0.5,
        angle: Math.random() * 360
      }, 600 + (Math.random() * 400 - 200), Phaser.Easing.Linear.InOut)
      .start()
      .onComplete.add(function () {
        that.destroy();
      }, tween);
  };

  zk.Skull = Skull;

}(this));
