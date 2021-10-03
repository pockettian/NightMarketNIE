////////////////////
// Food Store Scene
////////////////////
class FoodStoreScene extends Phaser.Scene {
  constructor() {
    super('FoodStoreScene')
  }

  create() {
    // declare this choices array first!
    this.foodItemChoices = [];
    this.foodItemSprites = [];
    this.foodItemVoiceOverSFXTable = ["Eat_Sausage_SFX", "Eat_Popcorn_SFX", "Eat_TutuKueh_SFX", 
                                      "Eat_CandyFloss_SFX", "Eat_ChickenWing_SFX", "Eat_SkeweredMeat_SFX"];

    // Create food Store BG
    var BG = this.add.image(config.width / 2, config.height / 2, "FoodStoreBG");
    let scaleX = this.cameras.main.width / BG.width;
    let scaleY = this.cameras.main.height / BG.height;
    let scale = Math.max(scaleX, scaleY);
    BG.setScale(scale);

    // load customer first
    this.FoodCustomer = this.add.image(250, config.height - 100, "FoodCustomerIdle");
    this.FoodCustomer.setInteractive();

    // create the wrong answer x icon
    this.CrossX = this.add.image(this.FoodCustomer.x, this.FoodCustomer.y, "CrossX");
    this.CrossX.visible = false;

    // chat bubble
    let chatBubble = this.add.image(this.FoodCustomer.x + 260, this.FoodCustomer.y - 50, "ChatBubble").setScale(1.2, 1.05);

    // audio button
    this.audioBtn = this.add.image(chatBubble.x + 120, chatBubble.y + 60, "AudioButton").setScale(0.7, 0.7).setInteractive();

    // manual home btn
    this.manualHomeBtn = this.add.image(config.width * 0.9, config.height * 0.9, "HomeBtn");
    this.manualHomeBtn.setInteractive();
    this.manualHomeBtn.visible = false;
    this.manualHomeBtn.once('pointerdown', this.scene.get('HomePage').buttonAnimEffect.bind(this, this.manualHomeBtn, () => {
      this.scene.get("HomePage").gameOver(this);
    }));

    // load customer request array
    this.customerRequest = this.add.sprite(500, config.height - 180, "FoodItemsWord");

    // //  A drop zone for customer
    var zone = this.add.zone(this.FoodCustomer.x, this.FoodCustomer.y, 450, 300).setRectangleDropZone(300, 250);
    // // DEBUG
    // //  Just a visual display of the drop zone
    // var graphics = this.add.graphics();
    // graphics.lineStyle(2, 0xffff00);
    // graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);

    ////////////////////
    // Set up drag stuff
    ////////////////////
    this.input.on('dragstart', this.onDragStart, this);
    this.input.on('drag', this.onItemDragged);
    this.input.on('dragend', this.onItemDragRelease);
    this.input.on('drop', this.onItemDroppedInZone, this);
    this.input.on('dragenter', this.onItemDropZoneEnter, this);
    this.input.on('dragleave', this.onItemDropZoneLeave, this);

    /////////////////
    // Creating Food
    ////////////////

    // create array of choices
    this.maxFoodItemCount = 6;
    let foodItemStartX = 90;
    let foodItemStartY = 250;
    let foodItemXGap = 120;
    for (var index = 0; index < this.maxFoodItemCount; ++index) {

      this.createFoodItem(foodItemStartX + index * foodItemXGap, foodItemStartY, index);

      // save the index
      this.foodItemChoices.push(index);
    }

    // After creating the food items we register the audio voice over
    this.audioBtn.on('pointerdown', this.scene.get('HomePage').buttonAnimEffect.bind(this, this.audioBtn, () => this.sound.play(this.foodItemSprites[this.customerChoice].voiceOver)));

    // create a hidden star
    this.hiddenStar = this.add.image(0, 0, "StarIcon");
    this.hiddenStar.visible = false;

    // call this last after foodItemChoices is populated!
    this.setupNextRound(0);

    //create common scene essentials
    this.scene.get('HomePage').createSceneEssentials(this);
  }

  // Helper to create a food item
  createFoodItem(xPos, yPos, foodItemIndex) {

    // depending on which foodItemID, we need to interate start the sprite sheet accordingly
    let maxFrame = 7;
    let spriteSheetIterStart = foodItemIndex * maxFrame;

    var foodItem = this.add.sprite(xPos, yPos, "FoodItems").setInteractive();
    foodItem.foodItemID = foodItemIndex;
    foodItem.eatenAnim = 'eaten' + foodItemIndex;
    foodItem.idlePulseAnim = 'idlePulse' + foodItemIndex;
    foodItem.staticAnim = 'static' + foodItemIndex;
    foodItem.initialSpriteFrame = spriteSheetIterStart;
    foodItem.sceneOwner = this;
    foodItem.eatenFlag = false;
    foodItem.voiceOver = this.foodItemVoiceOverSFXTable[foodItemIndex];
    foodItem.AwardedStar = 0;

    this.foodItemSprites.push(foodItem);

    this.input.setDraggable(foodItem);

    // eaten animation
    this.anims.create({
      key: foodItem.eatenAnim,
      frames: this.anims.generateFrameNumbers("FoodItems",
        { start: spriteSheetIterStart + 2, end: spriteSheetIterStart + maxFrame - 1 }),
      frameRate: 5
    });

    //foodItem.on('animationcomplete', this.animComplete.bind(this, foodItem));

    // idle pulse animation
    this.anims.create({
      key: foodItem.idlePulseAnim,
      frames: this.anims.generateFrameNumbers("FoodItems",
        { start: spriteSheetIterStart, end: spriteSheetIterStart + 1 }),
      frameRate: 2,
      repeat: -1
    });

    // static
    this.anims.create({
      key: foodItem.staticAnim,
      repeat: 1,
      frames: this.anims.generateFrameNumbers("FoodItems",
        { start: spriteSheetIterStart, end: spriteSheetIterStart }),
    });

    foodItem.play(foodItem.idlePulseAnim);
  }

  // game timer expired
  onTimerExpired() {
    this.scene.get("HomePage").gameOver(this);
  }

  setupNextRound(waitDelay) {
    setTimeout(() => {
      this.resetAllFoodItemsInteractive();
      this.FoodCustomer.setTexture('FoodCustomerIdle');

      // done with everything
      if (this.foodItemChoices.length == 0) {

        //this.scene.get("HomePage").gameOver(this);

        this.gameTimer.paused = true;
        this.timerBarContent.visible = false;
        this.timerBarBase.visible = false;

        // show end game button
        this.manualHomeBtn.visible = true;

        // more choices again
        for (var index = 0; index < this.maxFoodItemCount; ++index) {
          // save the index
          this.foodItemChoices.push(index);
        }
      }

      this.customerChoice = Phaser.Utils.Array.RemoveRandomElement(this.foodItemChoices);
      //console.log(this.customerChoice);
      this.customerRequest.setFrame(this.customerChoice);

      // play the audio right away
      this.sound.play(this.foodItemSprites[this.customerChoice].voiceOver);

    }, waitDelay);
  }

  // // customer has eaten an item
  // animComplete(animation, sprite, animTex, foodItem) {

  //   if (animation.key && animation.key == animTex.eatenAnim) {

  //     foodItem.visible = false;
  //     this.setupNextRound();
  //   }
  // }

  // Disable interaction for other non dragged food items
  disableNonDraggedFoodItemsInteractive(excludedFoodItem) {
    for (var index = 0; index < this.foodItemSprites.length; ++index) {
      let currIterFoodItem = this.foodItemSprites[index];
      currIterFoodItem.play(currIterFoodItem.staticAnim);

      if (currIterFoodItem != excludedFoodItem) {
        currIterFoodItem.alpha = 0.5;
        currIterFoodItem.disableInteractive();
      }
    }
  }

  // reset all the interaction mode
  resetAllFoodItemsInteractive() {
    for (var index = 0; index < this.foodItemSprites.length; ++index) {

      let currIterFoodItem = this.foodItemSprites[index];

      currIterFoodItem.alpha = 1.0;
      currIterFoodItem.setInteractive();
      currIterFoodItem.play(currIterFoodItem.idlePulseAnim);

      if (currIterFoodItem.eatenFlag) {

        currIterFoodItem.x = currIterFoodItem.input.dragStartX;
        currIterFoodItem.y = currIterFoodItem.input.dragStartY;

        currIterFoodItem.eatenFlag = false;
      }
    }
  }

  // Drag snap back
  onItemDragRelease(pointer, gameObject, dropped) {

    gameObject.setScale(1.0, 1.0);

    if (!dropped) {
      gameObject.sceneOwner.resetAllFoodItemsInteractive();

      gameObject.x = gameObject.input.dragStartX;
      gameObject.y = gameObject.input.dragStartY;
    }
  }

  onDragStart(pointer, gameObject) {

    // drag the "clone"
    this.children.bringToTop(gameObject);
    gameObject.setScale(1.3, 1.3);

    this.disableNonDraggedFoodItemsInteractive(gameObject);
  }

  // follow drag
  onItemDragged(pointer, gameObject, dragX, dragY) {
    gameObject.x = pointer.x;
    gameObject.y = pointer.y;
  }

  // dropping item in zone
  onItemDroppedInZone(pointer, gameObject, dropZone) {

    // check if this is the item we want

    // EATEN!
    if (gameObject.foodItemID == this.customerChoice) {

      this.sound.play('Correct_SFX');
      this.sound.play('Eat_SFX');
  
      gameObject.play(gameObject.eatenAnim);
      gameObject.disableInteractive();
      gameObject.eatenFlag = true;

      // fly star
      if (gameObject.AwardedStar == 0) {
        this.scene.get("HomePage").attainStar(this.FoodCustomer.x, this.FoodCustomer.y + 50, this.hiddenStar, this, true);
      }

      gameObject.AwardedStar++;

      // call this after duration
      this.setupNextRound(1300);
    }
    // wrong answer!
    else {
      this.sound.play('Wrong_SFX');

      gameObject.x = gameObject.input.dragStartX;
      gameObject.y = gameObject.input.dragStartY;

      this.CrossX.visible = true;
      // pulse
      this.add.tween({
        targets: this.CrossX,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 120,
        yoyo: true,
        completeDelay : 200,
        onCompleteScope: this,
        onComplete: function () {
          this.CrossX.visible = false;
        }
      });
      this.FoodCustomer.setTexture('FoodCustomerIdle');
      this.resetAllFoodItemsInteractive();
    }
  }

  // drop zone hover
  onItemDropZoneEnter(pointer, gameObject, dropZone) {
    this.FoodCustomer.setTexture('FoodCustomerOpen');
  }

  // drop zone leave
  onItemDropZoneLeave(pointer, gameObject, dropZone) {
    this.FoodCustomer.setTexture('FoodCustomerIdle');
  }

  checkGameOverCondition() {
  }

  update() {
    this.scene.get("HomePage").genericGameSceneUpdate(this);
  }
}
