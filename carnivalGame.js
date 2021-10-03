//////////////////////
// Carnival Game Scene
//////////////////////
class CarnivalGamesScene extends Phaser.Scene {
  constructor() {
    super('CarnivalGamesScene')
  }

  preload() {
  }

  create() {
    this.balloonExploded = 0;
    this.ringTossed = 0;

    this.add.image(config.width / 2, config.height / 2, "HomePageBG");

    // store BG
    this.add.image(200, config.height - 220, "CarnivalGamesStore");
    this.add.image(600, config.height - 220, "CarnivalGamesStore");

    // prepare store name wording
    let shootBalloonWord = this.add.image(200, config.height - 415, "ShootBalloonWord");
    let ringTossWord = this.add.image(600, config.height - 415, "RingTossWord");

    let shootBalloonWordAudioBtn = this.add.image(shootBalloonWord.x + 120, shootBalloonWord.y, "AudioButton").setScale(0.6, 0.6).setInteractive();
    shootBalloonWordAudioBtn.on('pointerdown', this.scene.get('HomePage').buttonAnimEffect.bind(this, shootBalloonWordAudioBtn, () => this.sound.play('ShootBalloonWord_SFX')));
  
    let ringTossWordAudioBtn = this.add.image(ringTossWord.x + 120, ringTossWord.y, "AudioButton").setScale(0.6, 0.6).setInteractive();
    ringTossWordAudioBtn.on('pointerdown', this.scene.get('HomePage').buttonAnimEffect.bind(this, ringTossWordAudioBtn, () => this.sound.play('RingTossGameWord_SFX')));

    // prepare rng indices
    let tempBufferBalloonsArray = [];
    let starRNGIndices = [];
    for (var index = 0; index < this.totalBalloons; ++index) {
      tempBufferBalloonsArray.push(index);
    }
    for (var index = 0; index < this.starsToBeAwarded; ++index) {
      let selectedIndex = Phaser.Utils.Array.RemoveRandomElement(tempBufferBalloonsArray);
      starRNGIndices.push(selectedIndex);
    }

    this.createBalloons();

    this.createTossBottles();

    //create common scene essentials
    this.scene.get('HomePage').createSceneEssentials(this);
  }

  createTossBottles() {
    let maxRow = 2;
    let maxCol = 4;
    let starPosX = 490;
    let starPosY = 350;
    let xGap = 80;
    let yGap = 125;
    this.totalTossBottles = maxRow * maxCol;

    // create a grid of ring toss
    for (var row = 0; row < maxRow; ++row) {
      for (var col = 0; col < maxCol; ++col) {

        let currPosX = starPosX + col * xGap;
        let currPosY = starPosY + row * yGap;

        // create hidden star
        var hiddenStar = this.add.image(currPosX, currPosY, "StarIcon");
        hiddenStar.visible = false;

        // adding balloon sprite element
        var tossBottle = this.add.image(currPosX, currPosY,"TossBottleStatic").setInteractive();
        tossBottle.hiddenStar = hiddenStar;

        // attach some toss rings
        var tossRing = this.add.sprite(currPosX, currPosY - 60,"TossRings");
        tossRing.visible = false;
        tossBottle.tossRing = tossRing;

        // create the toss animation
        this.anims.create({
          key: "tossRingToBottle",
          frames: this.anims.generateFrameNumbers('TossRings',
            { start: 0, end:  5}),
          frameRate: 20,
        });

        tossBottle.once('pointerup', this.onTossBottlePressed, { targetSprite: tossBottle, owner: this });
      }
    }
  }

  createBalloons() {

    let maxRow = 2;
    let maxCol = 4;
    let balloonStartPosX = 80;
    let balloonStartPosY = 350;
    let xGap = 80;
    let yGap = 120;
    this.totalBalloons = maxRow * maxCol;

    let maxFrames = 6;
    let startFrameIndex = 0;
    let startFrameIndices = [0, 6, 12];

    // create a grid of balloons
    for (var row = 0; row < maxRow; ++row) {
      for (var col = 0; col < maxCol; ++col) {

        let balloonPosX = balloonStartPosX + col * xGap;
        let balloonPosY = balloonStartPosY + row * yGap;

        // randomly assign balloon color
        startFrameIndex = Phaser.Utils.Array.GetRandom(startFrameIndices);

        // create hidden star
        var hiddenStar = this.add.image(balloonPosX, balloonPosY, "StarIcon");
        hiddenStar.visible = false;

        // adding balloon sprite element
        var balloonSprite = this.add.sprite(balloonPosX, balloonPosY,"BalloonSprites").setInteractive();

        balloonSprite.hiddenStar = hiddenStar;
        balloonSprite.explodeAnim = "BalloonExplode" + startFrameIndex;
        balloonSprite.setFrame(startFrameIndex);

        this.anims.create({
          key: balloonSprite.explodeAnim,
          frames: this.anims.generateFrameNumbers('BalloonSprites',
            { start: startFrameIndex, end: startFrameIndex + maxFrames - 1 }),
          frameRate: 15
        });

        balloonSprite.once('pointerup', this.onBalloonPressed, { targetSprite: balloonSprite, owner: this });
      }
    }
  }

  onTossBottlePressed() {

    this.owner.sound.play('RingTossBottle_SFX');

    this.targetSprite.tossRing.visible = true;
    this.targetSprite.tossRing.play("tossRingToBottle");

    // simple scale click effect
    this.owner.add.tween({
      targets: this.targetSprite,
      scaleX: 1.22,
      scaleY: 1.22,
      duration: 75,
      yoyo: true
    });

    // update counter scores
    ++this.owner.ringTossed;

    // the last click
    if (this.owner.ringTossed == this.owner.totalTossBottles) {
      let targetFlyOverStar = this.targetSprite.hiddenStar;

      this.owner.sound.play('RingTossGameWord_SFX');

      targetFlyOverStar.visible = true;
      // pulse
      this.owner.add.tween({
        targets: targetFlyOverStar,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        delay: 600,
        yoyo: true
      });

      // fly up to star bar, specifically the next star
      this.owner.add.tween({
        targets: targetFlyOverStar,
        duration: 420,
        y: this.owner.starIcons[g_Score].y,
        x: this.owner.starIcons[g_Score].x,
        delay: 920,
        onCompleteScope: this.owner,
        onComplete: function () {
          targetFlyOverStar.destroy();
          this.scene.get("HomePage").increaseGlobalScore(this);
          this.checkGameOverCondition();
          this.sound.play('CollectStar_SFX');
        }
      });
    }
  }

  // when balloon is pressed, play explosion 
  onBalloonPressed() {

    this.owner.sound.play('BalloonPop_SFX');

    this.targetSprite.play(this.targetSprite.explodeAnim);
    this.targetSprite.on('animationcomplete', () => this.targetSprite.destroy());

    // simple scale click effect
    this.owner.add.tween({
      targets: this.targetSprite,
      scaleX: 1.22,
      scaleY: 1.22,
      duration: 75,
      yoyo: true
    });

    // update counter scores
    ++this.owner.balloonExploded;

    // the last click
    if (this.owner.balloonExploded == this.owner.totalBalloons) {
      let targetFlyOverStar = this.targetSprite.hiddenStar;

      this.owner.sound.play('ShootBalloonWord_SFX');

      targetFlyOverStar.visible = true;
      // pulse
      this.owner.add.tween({
        targets: targetFlyOverStar,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        delay: 500,
        yoyo: true
      });

      // fly up to star bar, specifically the next star
      this.owner.add.tween({
        targets: targetFlyOverStar,
        duration: 300,
        y: this.owner.starIcons[g_Score].y,
        x: this.owner.starIcons[g_Score].x,
        delay: 800,
        onCompleteScope: this.owner,
        onComplete: function () {
          targetFlyOverStar.destroy();
          this.scene.get("HomePage").increaseGlobalScore(this);
          this.checkGameOverCondition();
          this.sound.play('CollectStar_SFX');
        }
      });
    }
  }

  checkGameOverCondition()
  {
    if (this.balloonExploded >= this.totalBalloons && this.ringTossed >= this.totalTossBottles) {
      this.scene.get("HomePage").gameOver(this);
    }
  }

  // game timer expired
  onTimerExpired() {
    this.scene.get("HomePage").gameOver(this);
  }

  update() {
    this.scene.get("HomePage").genericGameSceneUpdate(this);
  }
}

