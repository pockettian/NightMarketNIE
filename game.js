// global score
var g_Score = 0;
var g_LevelTime = 60000; // how long for each level in ms

/////////////////
// HOME PAGE
/////////////////
class HomePage extends Phaser.Scene {
  constructor() {
    super('HomePage')
  }

  create() {
    this.add.image(config.width / 2, config.height / 2, "HomePageBG");

    this.FoodStoreBtn = this.add.image(200, 380, "FoodStore").setScale(0.7, 0.7);
    this.FoodStoreBtn.alpha = 0.5;

    this.CarnivalGamesBtn = this.add.image(600, 380, "CarnivalGames").setScale(0.7, 0.7);
    this.CarnivalGamesBtn.alpha = 0.5;

    //this.RidesBtn = this.add.image(635, 380, "Rides");
    //this.RidesBtn.alpha = 0.5;

    // navigate to the food store scene
    if (!this.scene.get("FoodStoreScene").visited) {
      this.FoodStoreBtn.alpha = 1.0;
      this.FoodStoreBtn.setInteractive();
      this.FoodStoreBtn.once('pointerdown', this.buttonAnimEffect.bind(this, this.FoodStoreBtn, () => {
        this.sound.play("FoodStoresWord_SFX"); 
        this.time.delayedCall(700, function () { this.scene.start('FoodStoreScene'); }, [], this);       
      }));
    }

    if (!this.scene.get("CarnivalGamesScene").visited) {
      this.CarnivalGamesBtn.alpha = 1.0;
      this.CarnivalGamesBtn.setInteractive();
      this.CarnivalGamesBtn.once('pointerdown', this.buttonAnimEffect.bind(this, this.CarnivalGamesBtn, () => {
        this.sound.play("CarnivalGamesWord_SFX"); 
        this.scene.start('CarnivalGamesScene');
      }));
    }

    // if (!this.scene.get("RidesScene").visited) {
    //   this.RidesBtn.alpha = 1.0;
    //   this.RidesBtn.setInteractive();
    //   this.RidesBtn.once('pointerdown', this.buttonAnimEffect.bind(this, this.RidesBtn, () => {
    //     this.sound.play("RidesWord_SFX"); 
    //     this.scene.start('RidesScene');
    //   }));
    // }

    this.starIcons = this.createGameProgressUI(this);
    this.updateGameProgressUI(this.starIcons);

    if (this.checkEntireGameOverCondition()) {

      // Create for when entire game is over
      this.maskUnderlay = this.add.image(config.width / 2, config.height / 2, "WhiteBox").setScale(config.width, config.height);
      this.maskUnderlay.tint = 0x000000;
      this.maskUnderlay.alpha = 0.0;
      this.maskUnderlay.visible = false;
      this.maskUnderlay.setInteractive();
      this.gameOverSplash = this.add.image(config.width / 2, -300, "GameOverSplash");
      this.multiplyIcon = this.add.image(config.width / 2, config.height / 2 + 50, "MultiplyIcon");
      this.summaryStarIcon = this.add.image(config.width / 2 - 50, config.height / 2 + 50, "StarIcon");
      this.numberSprite = this.add.sprite(config.width / 2 + 50, config.height / 2 + 50, "Numbers");
      this.multiplyIcon.visible = false;
      this.summaryStarIcon.visible = false;
      this.numberSprite.visible = false;

      this.starIconScaleTween = this.add.tween({
        targets: this.summaryStarIcon,
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 200,
        yoyo: true,
        repeat: -1
      });

      this.anims.create({
        key: "SummaryCountScoreAnim",
        frames: this.anims.generateFrameNumbers('Numbers',
          { start: 0, end: g_Score }),
        frameRate: 10
      });

      this.numberSprite.on('animationcomplete', this.rollupSummaryComplete, this);

      this.anims.create({
        key: "FireworksEmit",
        frames: this.anims.generateFrameNumbers('Fireworks',
          { start: 0, end: 30 }),
        frameRate: 20,
        repeat: -1
      });

      // create fireworks
      this.fireworksArray = [];
      for (var index = 0; index < 5; ++index) {
        let fireworksSprite = this.add.sprite(Phaser.Math.Between(0, config.width), Phaser.Math.Between(0, config.height), "Fireworks");
        fireworksSprite.setScale(2.5);
        this.fireworksArray.push(fireworksSprite);
      }

      this.entireGameOver();
    }
  }

  rollupSummaryComplete()
  {
    this.starIconScaleTween.stop();
  }

  checkEntireGameOverCondition()
  {
    return this.scene.get("FoodStoreScene").visited && this.scene.get("CarnivalGamesScene").visited && this.scene.get("RidesScene").visited;
    //return true;
  }

  entireGameOver() {
    this.sound.play("CombinedCelebration_SFX");   
    this.sound.play("LevelComplete_SFX");

    // due to dragging we need to rearrage the summary box to show up on top
    this.maskUnderlay.visible = true;
    this.children.bringToTop(this.maskUnderlay);
    this.children.bringToTop(this.gameOverSplash);
    this.children.bringToTop(this.multiplyIcon);
    this.children.bringToTop(this.summaryStarIcon);
    this.children.bringToTop(this.numberSprite);

    for (var index = 0; index < this.fireworksArray.length; ++index) {
      
      let targetFireworkSprite = this.fireworksArray[index];
      targetFireworkSprite.visible = false;
      // random delay call
      this.time.delayedCall(index * 1000, function() { targetFireworkSprite.visible = true;
        targetFireworkSprite.play("FireworksEmit");}, [], targetFireworkSprite);

      this.children.bringToTop(this.fireworksArray[index]);
    }

    // fade in the mask underlay
    this.add.tween({
      targets: this.maskUnderlay,
      alpha: 0.8,
      duration: 200
    });

    // drop down tween anim
    this.add.tween({
      targets: this.gameOverSplash,
      y: config.height / 2,
      ease: "Quad.easeInOut",
      onCompleteScope: this,
      onComplete: function() 
      { 
        this.multiplyIcon.visible = true;
        this.summaryStarIcon.visible = true;
        this.numberSprite.visible = true;
        this.numberSprite.play("SummaryCountScoreAnim");
      },
      duration: 1000
    });
  }

  /***************************/
  // Generic Btn Click Effect
  /***************************/
  buttonAnimEffect(img, callback) {
    this.tweens.add({
      targets: img,
      scaleX: img.scaleY * 1.2,
      scaleY: img.scaleX * 1.2,
      duration: 80,
      onComplete: callback,
      yoyo: true
    });

    this.sound.play('ButtonClick_SFX');
  }

  /************************************/
  // used by scenes to update new score
  /************************************/
  increaseGlobalScore(ownerScene) {
    ++g_Score;
    this.updateGameProgressUI(ownerScene.starIcons, ownerScene);
  }

  /*******************************************/
  // Create the stars used by multiple scenes
  /*******************************************/
  createGameProgressUI(target) {
    let starIcons = [];
    var maxStars = 8;
    var widthSpace = 60;
    var xStartOffset = 200;
    var yStartOffset = 60;

    for (var index = 0; index < maxStars; ++index) {
      var texName = 'StarIconBase';

      // create the highlighted stars
      if (index < g_Score) {
        texName = 'StarIcon';
      }

      let newStarIcon = target.add.image(xStartOffset + widthSpace * index, yStartOffset, texName);
      newStarIcon.setScale(0.8, 0.8);
      starIcons.push(newStarIcon);
    }

    return starIcons;
  }

  /*******************************************/
  // update star progress generic
  /*******************************************/
  updateGameProgressUI(starIcons, ownerScene) {

    // set the star icons according to score
    for (var index = 0; index < starIcons.length; ++index) {
      if (index == g_Score - 1) {
        let targetStarIcon = starIcons[index];
        targetStarIcon.setTexture('StarIcon');

        // optional for children scenes to show scale pulse
        if (ownerScene) {
          // Scale Pulse Effect
          ownerScene.add.tween({
            targets: targetStarIcon,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true
          });
        }
      }
    }
  }

  /*******************************************/
  // spawn hidden star and fly over to next slot and increase global score
  /*******************************************/
  attainStar(spawnX, spawnY, hiddenStar, ownerScene, startDelay) {

    hiddenStar.x = spawnX;
    hiddenStar.y = spawnY;
    hiddenStar.visible = true;

    let flyDelay = 920;
    if (!startDelay) {
      flyDelay = 0;
    }

    // pulse
    ownerScene.add.tween({
      targets: hiddenStar,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      delay: 600,
      yoyo: true
    });

    // fly up to star bar, specifically the next star
    ownerScene.add.tween({
      targets: hiddenStar,
      duration: 420,
      y: ownerScene.starIcons[g_Score].y,
      x: ownerScene.starIcons[g_Score].x,
      delay: flyDelay,
      onCompleteScope: ownerScene,
      onComplete: function () {
        ownerScene.sound.play("CollectStar_SFX");
        hiddenStar.visible = false;
        ownerScene.scene.get("HomePage").increaseGlobalScore(ownerScene);
        ownerScene.checkGameOverCondition();
      }
    });
  }

  /*******************************************/
  // Create Home Btn, timer bar, game over splash etc
  /*******************************************/
  createSceneEssentials(ownerScene) {
    // populate stars
    ownerScene.starIcons = this.createGameProgressUI(ownerScene);

    // create timer bar
    ownerScene.timerBarBase = ownerScene.add.image(config.width / 2 - 150, 120, "TimerBar").setOrigin(0, 0.5);
    ownerScene.timerBarContent = ownerScene.add.image(ownerScene.timerBarBase.x + 53, ownerScene.timerBarBase.y, "TimerBarContent").setOrigin(0, 0.5);
    ownerScene.gameTimer = ownerScene.time.delayedCall(g_LevelTime, ownerScene.onTimerExpired, [], ownerScene);

    // create mask white box
    ownerScene.maskUnderlay = ownerScene.add.image(config.width / 2, config.height / 2, "WhiteBox").setScale(config.width, config.height);
    ownerScene.maskUnderlay.tint = 0x000000;
    ownerScene.maskUnderlay.alpha = 0.0;
    ownerScene.maskUnderlay.visible = false;
    ownerScene.maskUnderlay.setInteractive();

    // GameoverSplash
    ownerScene.gameOverSplash = ownerScene.add.image(config.width / 2, -300, "GameOverSplash");

    // home btn over splash screen
    ownerScene.homeBtn = ownerScene.add.image(config.width / 2, config.height / 2 + 100, "HomeBtn");
    ownerScene.homeBtn.alpha = 0.0;
    ownerScene.homeBtn.once('pointerup', this.buttonAnimEffect.bind(ownerScene, ownerScene.homeBtn, () => ownerScene.scene.start('HomePage')));

    // mark this scene as visited
    ownerScene.visited = true;
  }

  /*******************************************/
  // Generic behavior to deal with game over
  /*******************************************/
  gameOver(ownerScene) {

    ownerScene.sound.play("LevelComplete_SFX");
    // due to dragging we need to rearrage the summary box to show up on top
    ownerScene.maskUnderlay.visible = true;
    ownerScene.children.bringToTop(ownerScene.maskUnderlay);

    ownerScene.children.bringToTop(ownerScene.gameOverSplash);
    ownerScene.children.bringToTop(ownerScene.homeBtn);

    // fade in the mask underlay
    ownerScene.add.tween({
      targets: ownerScene.maskUnderlay,
      alpha: 0.8,
      duration: 200
    });

    // drop down tween anim
    ownerScene.add.tween({
      targets: ownerScene.gameOverSplash,
      y: config.height / 2,
      ease: "Quad.easeInOut",
      onComplete: function () {
        // stop timer 
        ownerScene.gameTimer.paused = true;

        ownerScene.homeBtn.alpha = 1;
        ownerScene.homeBtn.setInteractive();
      },
      duration: 1000
    });
  }

  /*******************************************/
  // Common update stuff for all scenes
  /*******************************************/
  genericGameSceneUpdate(ownerScene) {
    ownerScene.timerBarContent.setScale(1 - ownerScene.gameTimer.getOverallProgress(), 1);
  }
}

var config =
{
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: 0x000000,
  scene: [LoadingScene, HomePage, FoodStoreScene, RidesScene, CarnivalGamesScene]
}

var game = new Phaser.Game(config);
game.scene.start('LoadingScene');
