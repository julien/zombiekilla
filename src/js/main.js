(function () {

  var game
    , width  = 800
    , height = 400
    , floor = Math.floor
    , rand = Math.random

    , tiles
    , platform

    , player
    , playerTxt

    , bullets
    , shootDelay
    , shootTime

    , zombies
    , spawnDelay
    , spawnTime

    , keyboard
    , cursors

    , score
    , statusTxt

    , shootSnd
    , splatterSnd
    , cameraShake;

  game = this.game = new Phaser.Game(width, height, Phaser.AUTO, 'game', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  // game methods
  function preload () {
    game.load.atlas('entities', 'assets/entities.png', 'assets/entities.txt');
    game.load.bitmapFont('minecraftia', 'assets/minecraftia.png', 'assets/minecraftia.xml');
    game.load.image('skull', 'assets/skull.png');
    game.load.image('brick', 'assets/brick.png');
    game.load.spritesheet('splatter', 'assets/splatter.png', 64, 64, 6);
    game.load.audio('hurt', ['assets/hurt.mp3', 'assets/hurt.ogg']);
    game.load.audio('shotgun-fire', ['assets/shotgun-fire.mp3', 'assets/shotgun-fire.ogg']);
  }

  function create() {
    shootDelay = 150;
    shootTime = 0;
    spawnDelay = 2000;
    spawnTime = 0;
    score = 0;

    game.onPause.add(onPause);
    game.onResume.add(onResume);
    game.stage.backgroundColor = '#2d2d2d';

    keyboard = game.input.keyboard;
    cursors = keyboard.createCursorKeys();
    game.cursors = cursors;

    createMap();

    createPlayer();
    game.camera.follow(player);

    cameraShake = new zk.CameraShake(game, game.camera);

    bullets = game.add.group();
    zombies = game.add.group();

    shootSnd = game.add.audio('shotgun-fire');
    shootSnd.volume = 0.1;
    splatterSnd = game.add.audio('hurt');
  }

  function update() {
    var canJump = true;
    game.physics.collide(player, tiles);


    if (cursors.right.isDown) {
      // move right
      player.animations.play('walk');
      player.scale.x = 1;
      player.body.velocity.x = 300;

    } else if (cursors.left.isDown) {
      // move left
      player.animations.play('walk');
      player.scale.x = -1;
      player.body.velocity.x = -300;


    } else if (keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      // shoot
      player.animations.play('fire');

      shootTime += game.time.elapsed;
      if (shootTime > shootDelay) {
        shootTime = 0;
        createBullet();
        
        player.body.velocity.x = 10 * (-player.scale.x);
        player.body.velocity.y = -150;

        if (!cameraShake.active) {
          cameraShake.start();
        }
      }

    } else if (cursors.up.isDown) {
      if (canJump) {
        canJump = false;
        player.animations.play('jump');
        player.body.velocity.y = -400;
      }
    } else if (cursors.up.isUp) {
      player.body.velocity.x = 0;
      player.animations.play('idle');
      canJump = true;
    } else {
      player.body.velocity.x = 0;
      player.animations.play('idle');
    }


    spawnZombies();
    updateZombies();
    cameraShake.update();

    game.paused = keyboard.isDown(Phaser.Keyboard.ESC);
  }

  function render() {
    playerTxt.x = player.x;
    playerTxt.y = player.y - 100;

    game.debug.renderCameraInfo(game.camera, 10, 10, 'rgb(255, 255, 255)');
    game.debug.renderSpriteBounds(player, 'rgb(255, 0, 0)');
  }

  // game callbacks
  function onPause() {
    showStatus('PAUSED');

    player.alpha = 0.45;
    playerTxt.setText('');
    bullets.alpha = 0.45;
    zombies.alpha = 0.45;
  }

  function onResume() {
    statusTxt.destroy();
    statusTxt = null;

    player.alpha  = 1.0;
    playerTxt.setText(score.toString());
    bullets.alpha = 1.0;
    zombies.alpha = 1.0;
  }

  // map
  function createMap() {
    var mapStr
      , tileWidth =  40
      , tileHeight = 40
      , cols
      , rows
      , col
      , row
      , w
      , h
      , x
      , y
      , tile;

    tiles = game.add.group();
    platform = { cols: [] };

    mapStr =
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      'TT     TTTTT    TTTTTTT      TTT   TTT   TTTT\n' +

      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      'TTTTTT     TTTTTTTTTTTTT     TTTTTTT         \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      'TTTTTTT        TTTTTTTTTT     TTTTTTT   TTTTT\n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '      TTTTTT        TTTTTTTTTT       TTTTTTTT\n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      'TTTTTT        TTTTTTTTTTTTTTTTTT   TTTTTT    \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      'TTTTTTTTT             TTTTTTTTTTT       TTTTT\n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '           TTTTTTTTTTT         TTTTTTTTT     \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      'TTTTT        TTTTTTTTTT             TTTTTTTTT\n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '       TTTTTTTTTT              TTTTTTTTTTTTTT\n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      '                                             \n' +
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT';

    mapStr = mapStr.split('\n');
    cols = mapStr[0].length;
    rows = mapStr.length;

    w = cols * tileWidth;
    h = rows * tileHeight;

    game.world.setBounds(0, 0, w, h);

    for (row = 0; row < rows; row += 1) {
      for (col  = 0; col < cols; col += 1) {
        x = col * tileWidth;
        y = row * tileHeight;
        tile = mapStr[row][col];

        if (tile === 'T') {
          addToPlatform(x, y);
          createTile(x, y);
        }
      }
    }
  }

  function addToPlatform(x, y) {
    var found = 0
      , idx
      , i
      , l
      , col
      , cols;

    if (!platform) {
      platform = {};
    }

    cols = platform.cols || (platform.cols = []);

    l = cols.length;
    for (i = 0; i < l; i += 1) {
      if (cols[i].y === y) {
        found = 1;
        col = cols[i];
      }
    }

    if (!found) {
      col = {y: y, x: []};
      cols.push(col);
    }

    idx = col.x.indexOf(x);
    if (idx === -1) {
      col.x.push(x);
    }

  }

  function createTile(x, y) {
    var tile = tiles.create(x, y, 'brick');
    tile.body.allowCollision.left = false;
    tile.body.allowCollision.right = false;
    tile.body.allowGravity = false;
    tile.body.immovable = true;
  }

  // player
  function createPlayer() {
    player = game.add.sprite(80, 80, 'entities');
    player.body.allowCollision = true;
    player.body.bounce.y = 0.5;
    player.body.gravity.y = 80;
    player.body.mass = 2;
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.body.maxVelocity.x = 300;
    player.body.maxVelocity.y = 500;
    player.body.collideWorldBounds = true;


    player.animations.add('idle', [
      'player-idle-1.png'
    ], 10, false, false);

    player.animations.add('jump', [
      'player-jump-0-00.png',
    ], 10, false, false);

    player.animations.add('fire', [
      'player-fire-1-00.png',
      'player-fire-1-01.png',
      'player-fire-1-02.png'
    ], 10, true, false);

    player.animations.add('walk', [
      'player-walk-1-00.png',
      'player-walk-1-01.png',
      'player-walk-1-02.png',
      'player-walk-1-03.png',
      'player-walk-1-04.png',
      'player-walk-1-05.png',
      'player-walk-1-06.png',
      'player-walk-1-07.png'
    ], 10, true, false);

    player.animations.play('jump');
    player.anchor.setTo(0.5, 1.0);

    playerTxt = game.add.bitmapText(player.x, player.y - 100, '0', {font: '16px minecraftia', align: 'center'});
    playerTxt.anchor.setTo(0.5, 0.5);
  }

  function killPlayer() {
    createSplatter(player.x, player.y - (player.height/2));

    if (score > 0) {
      score -= 1;
      playerTxt.setText(score.toString());
    }

    player.health -= 1;

    if (player.alive && player.health <= 0) {
      // reset player
      score = 0;
      playerTxt.setText(score.toString());
      player.x = rand() * (game.world.width - player.width);

      player.y = 0;
    }
  }

  // bullet
  function createBullet() {
    var x, y, bullet;
    x = player.position.x + (player.width / 2);
    y = player.position.y - (player.height / 2) - 10;

    bullet = bullets.create(x, y, 'entities');
    bullet.anchor.setTo(0.5, 0.5);
    bullet.scale.x = player.scale.x;

    // bullet.scale.x *= 2;
    // bullet.scale.y = 2;
    bullet.exists = true;
    bullet.lifespan = 800;
    bullet.body.velocity.x = bullet.scale.x * 600;
    bullet.body.allowCollisions = true;
    //  bullet.body.collideWorldBounds = true;
    bullet.animations.frameName = 'bullet-gun.png';
    bullet.events.onOutOfBounds.add(onOutOfBounds, this);
    shootSnd.play();
  }

  function onOutOfBounds(sprite) {
    if (sprite.alive) {
      sprite.kill();
    }
  }

  // zombies
  function createZombie() {
    var rnd
      , pos
      , numPos
      , rndPos
      , x
      , y
      , zombie
      , frameName
      , rndScale;

    rnd = rand() > 0.5 ? -1 : 1;
    rndScale = rnd * (1 + rand() * 3);

    pos = platform.cols.map(function (obj) {
      return {
        x: obj.x[floor(rand() * obj.x.length)],
        y: obj.y
      };
    });

    numPos = pos.length;
    rndPos = pos[floor(rand() * numPos)];
    x = rndPos.x;
    y = rndPos.y;

    if (x <= game.camera.view.left) {
      x = game.camera.view.left;
    } else if (x >= game.camera.view.right) {
      x = game.camera.view.right;
    }

    if (y <= game.camera.view.top) {
      y = game.camera.view.top;
    } else if (y >= game.camera.view.bottom - 40) {
      y = game.camera.view.bottom - 40;
    }

    zombie = zombies.create(x, y, 'entities');
    zombie.anchor.setTo(0.5, 1.0);
    zombie.body.gravity.y = 30;
    zombie.body.mass = 1;
    zombie.body.bounce.setTo(0.4, 0.4);
    zombie.scale.setTo(rnd, 1);
    zombie.body.velocity.x = (50 + rand() * 40) * rnd;
    zombie.health = 30;

    rnd = rand() > 0.5 ? 0 : 1;
    frameName = 'zombie-a-' + rnd;

    zombie.animations.add('walk', [
      frameName + '-00.png',
      frameName + '-01.png',
      frameName + '-02.png',
      frameName + '-03.png',
      frameName + '-04.png',
      frameName + '-05.png',
    ], 10, true, false);

    zombie.animations.play('walk');
    // zombie.events.onOutOfBounds.add(onOutOfBounds, this);
  }

  function killZombie(bullet, zombie) {
    var tmp, x1, y1, x2, y2;
    if (arguments.length < 2) {
      tmp = arguments[0];
      x1 = tmp.x;
      y1 = tmp.y - tmp.height;
      x2 = tmp.x + (tmp.width / 2);
      y2 = y1;
    } else {
      tmp = zombie;
      x1 = bullet.x;
      y1 = bullet.y;
      x2 = zombie.x + (zombie.width / 2);
      y2 = zombie.y - zombie.height;
    }

    createSplatter(x1, y1);
    score += 1;
    createSkull(x2, y2);
    playerTxt.setText(score.toString());
    tmp.kill();
  }

  function collidePlayerZombie(player, zombie) {
    var tolerance = 50;
    if (player.y <= zombie.y - zombie.height + tolerance) {
      killZombie(zombie);
    } else {
      killPlayer();
    }
  }

  function collideZombiesBullets(bullet, zombie) {
    var it = 1 + rand() * 5 - 2
      , x
      , y;

    zombie.body.velocity.x = (10 * zombie.scale.x);
    zombie.health -= 1;
    // zombie.alpha -= 0.1;

    if (zombie.health <= 0) {
      createSplatter(bullet.x, bullet.y);

      while ((it -= 1) >= 0) {
        x = 1 + rand() * 10;
        y = 1 + rand() * 10;
        createSkull(zombie.x + (zombie.width / 2) + x, zombie.y - (zombie.height) + y);
      }
      score += 1;
      playerTxt.setText(score.toString());
      zombie.kill();
    }


  }

  function collideZombiesTiles(zombie, tile) { }

  function spawnZombies() {
    var it;

    spawnTime += game.time.elapsed;
    if (spawnTime > spawnDelay) {
      spawnDelay = spawnDelay + floor(rand() * 5000 - 2000);
      spawnTime = 0;
      it = 1 + floor(rand() * (4 - 2));
      while ((it -= 1) >= 0) {
        createZombie();
      }
    }
  }

  function updateZombies() {
    if (zombies.total > 0) {
      if (bullets.total > 0) {
        game.physics.overlap(bullets, zombies, collideZombiesBullets, null, this);
      }
      game.physics.overlap(player, zombies, collidePlayerZombie, null, this);
      game.physics.collide(zombies, tiles, collideZombiesTiles, null, this);
    }
  }

  // splatter
  function createSplatter(x, y, scale) {
    var splatter = game.add.sprite(x, y, 'splatter');
    scale = scale || 1;
    splatter.anchor.setTo(0.5, 0.5);
    splatter.scale.setTo(scale, scale);
    splatter.animations.add('splatter');
    splatter.events.onAnimationComplete.add(onSplatterComplete, this);
    splatter.animations.play('splatter', 12, false);
    splatterSnd.play();
  }

  function onSplatterComplete(splatter) {
    splatter.kill();
  }

  // status
  function showStatus(msg) {
    var view = game.camera.view;
    if (!statusTxt) {
      statusTxt = game.add.bitmapText(view.centerX, view.centerY, msg, {font: '16px minecraftia', align: 'center'});
      statusTxt.anchor.setTo(0.5, 0.5);
      statusTxt.x -= statusTxt.width / 2;
    } else {
      statusTxt.setText(msg);
      statusTxt.x = view.centerX;
      statusTxt.y = view.centerY;
    }
  }

  // skull
  function createSkull(x, y) {
    var skull
      , rnd;

    rnd = rand() * 1 < 0.5 ? -1 : 1;
    skull = new zk.Skull(game, {
      x: x,
      y: y,
      scale: 1 + rand() * 2 - 0.5
    });
    skull.create();
  }

  window.game = game;

}(this));
