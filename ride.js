
/////////////////
// RidesScene
/////////////////

class RidesScene extends Phaser.Scene {
  constructor() {
    super('RidesScene')
    this.ferrisWheelRotSpeed = 0.005;
    this.bumperCarSpeed = 4500;

    // hard coded tired
    this.starsToCollect = 4;

  }

  create() {
    this.add.image(config.width / 2, config.height / 2, "HomePageBG");

    this.createTrain();

    this.createFerrisWheel();

    this.createBumperCar();

    this.createSwingChair();

    this.scene.get('HomePage').createSceneEssentials(this);
  }

  createSwingChair() {
    let swingChairBase = this.add.image(450, 500, "SwingChair_BaseAnchor").setScale(2);

    // swing chair header
    let swingChairHeader = this.add.sprite(swingChairBase.x, swingChairBase.y - 130, "SwingChair_Header").setScale(2);

    // create the swing chair header animation
    this.anims.create({
      key: "SwingChairHeaderAnim",
      frames: this.anims.generateFrameNumbers('SwingChair_Header'),
      frameRate: 5,
      repeat: -1
    });

    swingChairHeader.play("SwingChairHeaderAnim");

    // how far away are the chairs from centerPt
    let radius = 10;

    // how much to rotate from extreme left to extreme right
    var maxChairSwingRotSpan = 100;

    // how many chairs
    var maxSwingChairCount = 4;

    // angle diff between each chair
    var angleSpacing = maxChairSwingRotSpan / maxSwingChairCount;

    let centerPt = new Phaser.Math.Vector2(swingChairHeader.x, swingChairHeader.y);
    let currChairPos = centerPt.add(Phaser.Math.Vector2.DOWN.scale(radius));
    let startIndex = -(maxSwingChairCount / 2);

    // creat the swing chairs
    for (var index = startIndex; index <= maxSwingChairCount / 2; ++index) {
      let swingChair = this.add.image(swingChairHeader.x, swingChairHeader.y, "SwingChair");
      swingChair.setOrigin(0.5, -0.5);

      let rotAngle = index * angleSpacing;
      swingChair.angle += rotAngle;

      this.add.tween({
        targets: swingChair,
        angle: { from: swingChair.angle + 20, to: swingChair.angle - 20 },
        duration: 700,
        repeat: -1,
        yoyo: true
      });
    }

    // create the star for swing chair
    this.swingChairStar = this.add.image(swingChairBase.x, swingChairBase.y - 180, "StarIcon").setInteractive();
    // starIcon pulse
    let swingChairTween = this.add.tween({
      targets: this.swingChairStar,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // star on click
    this.swingChairStar.once('pointerup',
      () => {
        // stop the idle pulse
        swingChairTween.stop();
        this.sound.play('Correct_SFX');
        this.sound.play('SwingChair_SFX');
        --this.starsToCollect;
        this.scene.get("HomePage").attainStar(this.swingChairStar.x, this.swingChairStar.y, this.swingChairStar, this, false);
      });

    // create bumper car word
    let swingChairWord = this.add.image(swingChairBase.x + 230, swingChairBase.y + 45, "SwingChairWord");
    let currAudioBtn = this.add.image(swingChairWord.x + 60, swingChairWord.y, "AudioButton").setScale(0.6, 0.6).setInteractive();
    currAudioBtn.on('pointerdown', this.scene.get('HomePage').buttonAnimEffect.bind(this, currAudioBtn, () => this.sound.play('SwingChair_SFX')));
  }

  createBumperCar() {
    let collisionPt = new Phaser.Math.Vector2(config.width / 2 + 250, config.height / 2);
    let carA = this.add.image(0, collisionPt.y, "BumperCar_A");
    let carB = this.add.image(config.width, collisionPt.y, "BumperCar_B");

    // create bumper car word
    let bumperCarWord = this.add.image(collisionPt.x, collisionPt.y - 30, "BumperCarWord");
    let currAudioBtn = this.add.image(bumperCarWord.x + 60, bumperCarWord.y, "AudioButton").setScale(0.6, 0.6).setInteractive();
    currAudioBtn.on('pointerdown', this.scene.get('HomePage').buttonAnimEffect.bind(this, currAudioBtn, () => this.sound.play('BumperCar_SFX')));

    // create the hidden star
    let bumperCarStar = this.add.image(collisionPt.x, collisionPt.y + 30, "StarIcon").setInteractive();
    bumperCarStar.visible = false;

    // show star upon first collision
    this.time.delayedCall(this.bumperCarSpeed * 0.4, function () { bumperCarStar.visible = true; }, [], this);

    // starIcon pulse
    let bumperCarStarTween = this.add.tween({
      targets: bumperCarStar,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    bumperCarStar.once('pointerup',
      () => {
        // stop the idle pulse
        bumperCarStarTween.stop();
        this.sound.play('Correct_SFX');
        this.sound.play('BumperCar_SFX');
        --this.starsToCollect;
        this.scene.get("HomePage").attainStar(bumperCarStar.x, bumperCarStar.y, bumperCarStar, this, false);
      });

    this.add.tween({
      targets: carA,
      x: collisionPt.x - carA.width / 2,
      duration: this.bumperCarSpeed,
      ease: 'Bounce.easeOut'
    });

    this.add.tween({
      targets: carB,
      x: collisionPt.x + carB.width / 2,
      duration: this.bumperCarSpeed,
      ease: 'Bounce.easeOut'
    });

  }

  createTrain() {

    this.trainGroup = this.add.group();

    let train = this.trainGroup.create(-200, config.height / 2 - 50, "Train").setScale(1);
    this.trainGroup.create(train.x, train.y + 30, "TrainWheels").setScale(1);

    // add the word tag
    let trainWord = this.trainGroup.create(train.x, train.y - 50, "TrainWord");
    // offset the origin so it follows train nicely
    trainWord.setOrigin(1.2, 0.6);

    let currAudioBtn = this.trainGroup.create(trainWord.x, trainWord.y, "AudioButton").setScale(0.6, 0.6).setInteractive();
    currAudioBtn.on('pointerdown', this.scene.get('HomePage').buttonAnimEffect.bind(this, currAudioBtn, () => this.sound.play('TrainWord_SFX')));
    currAudioBtn.setOrigin(2.0, 0.6);

    // add star icon last
    let starIcon = this.trainGroup.create(train.x, train.y - 50, "StarIcon").setInteractive();

    // starIcon pulse
    let trainStarIconTween = this.add.tween({
      targets: starIcon,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // star on click
    starIcon.once('pointerup',
      () => {
        // stop the idle pulse
        trainStarIconTween.stop();
        this.sound.play('Correct_SFX');
        this.sound.play('TrainWord_SFX');
        --this.starsToCollect;
        this.scene.get("HomePage").attainStar(starIcon.x, starIcon.y, starIcon, this, false);
      });

    // train drive from left to right
    this.add.tween({
      targets: this.trainGroup.getChildren(),
      x: config.width + 200,
      duration: 30000,
      repeat: -1,
      repeatDelay: 1000
    });

    // move up down train effect
    this.add.tween({
      targets: train,
      y: '-=5',
      duration: 200,
      yoyo: true,
      repeat: -1
    });
  }

  //Create ferris wheel and it's carriages
  createFerrisWheel() {
    let ferrisWheelBase = this.add.image(150, 320, "FerrisWheel_Base");

    // adding wheel and spinning it      
    this.ferrisWheel = this.add.image(ferrisWheelBase.x, ferrisWheelBase.y - 100, "FerrisWheel_Wheel");
    this.ferrisWheelRotCenter = new Phaser.Math.Vector2(this.ferrisWheel.x, this.ferrisWheel.y + 30);

    var maxCarriageCount = 5;
    let angleSpacing = 360 / maxCarriageCount;

    this.carriageGroup = this.add.group();

    // adding ferris wheel word and audio btn
    let wordTag = this.add.image(150, 420, "FerrisWheelWord");
    let currAudioBtn = this.add.image(wordTag.x + 60, wordTag.y, "AudioButton").setScale(0.6, 0.6).setInteractive();
    currAudioBtn.on('pointerdown', this.scene.get('HomePage').buttonAnimEffect.bind(this, currAudioBtn, () => this.sound.play('FerrisWheelWord_SFX')));

    for (var index = 0; index < maxCarriageCount; ++index) {
      let radius = 0.1;

      // rotate dir along circle to create the carriages
      var offsetDir = new Phaser.Math.Vector2(radius, 0);
      let rotAngle = index * angleSpacing * Math.PI / 180;
      offsetDir.rotate(rotAngle);

      let carriagePos = new Phaser.Math.Vector2(this.ferrisWheel.x, this.ferrisWheel.y + 30);

      offsetDir.scale(radius);
      carriagePos = carriagePos.add(offsetDir);

      // preparing a group for carriages
      this.carriageGroup.create(carriagePos.x, carriagePos.y, 'FerrisWheel_Carriage').setScale(0.7);

      // add hidden star
      if (index == 0) {
        this.ferrisWheelStarIcon = this.carriageGroup.create(carriagePos.x, carriagePos.y, "StarIcon").setInteractive().setScale(1);
        this.ferrisWheelStarIcon.once('pointerup',
          () => {
            this.carriageGroup.remove(this.ferrisWheelStarIcon);

            // stop the idle pulse
            this.starIconTween.stop();
            this.sound.play('Correct_SFX');
            this.sound.play('FerrisWheelWord_SFX');
            --this.starsToCollect;
            this.scene.get("HomePage").attainStar(this.ferrisWheelStarIcon.x, this.ferrisWheelStarIcon.y, this.ferrisWheelStarIcon, this, false);
          });

        // pulse
        this.starIconTween = this.add.tween({
          targets: this.ferrisWheelStarIcon,
          scaleX: this.ferrisWheelStarIcon.scaleX * 1.1,
          scaleY: this.ferrisWheelStarIcon.scaleY * 1.1,
          duration: 300,
          yoyo: true,
          repeat: -1
        });
      }
    }
  }

  update() {

    this.scene.get("HomePage").genericGameSceneUpdate(this);

    // rotate the ferris wheel
    Phaser.Actions.RotateAroundDistance(this.carriageGroup.getChildren(), this.ferrisWheelRotCenter, this.ferrisWheelRotSpeed, 122);
    this.ferrisWheel.angle += this.ferrisWheelRotSpeed * 50;
  }

  // game timer expired
  onTimerExpired() {
    this.scene.get("HomePage").gameOver(this);
  }

  checkGameOverCondition() {
    if (this.starsToCollect <= 0) {
      this.scene.get("HomePage").gameOver(this);
    }
  }
}
