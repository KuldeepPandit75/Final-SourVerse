import Phaser from "phaser";

class TitleScreen extends Phaser.Scene {
  constructor() {
    super("TitleScreen");
  }

  preload() {
    this.load.image("player", "https://i.postimg.cc/ncSC2btS/idleChar.png");
    // this.load.image("entryGate", "../assets/sprites/idleChar.png");
    // this.load.image("stall", "../assets/sprites/idleChar.png");
    // this.load.image("meetingRoom", "../assets/sprites/idleChar.png");
    this.load.image(
      "background",
      "https://i.postimg.cc/P5M1TFGm/background.webp"
    );
    this.load.image("avatar", "https://i.postimg.cc/BQhf1JGb/pop.webp");
  }

  create() {
    // create background
    this.background = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "background"
    );

    // Scale background to cover the entire screen
    const scaleX = this.cameras.main.width / this.background.width;
    const scaleY = this.cameras.main.height / this.background.height;
    const scale = Math.max(scaleX, scaleY);
    this.background.setScale(scale);

    // Create stalls group
    this.stalls = this.physics.add.staticGroup();
    const stallPositions = [
      { x: this.cameras.main.width * 0.25, y: this.cameras.main.height * 0.33 },
      { x: this.cameras.main.width * 0.75, y: this.cameras.main.height * 0.33 },
      { x: this.cameras.main.width * 0.25, y: this.cameras.main.height * 0.66 },
      { x: this.cameras.main.width * 0.75, y: this.cameras.main.height * 0.66 },
    ];
    stallPositions.forEach((pos) => {
      this.stalls.create(pos.x, pos.y, "stall");
    });

    // Create player
    this.player = this.physics.add.sprite(
      this.cameras.main.width / 2,
      this.cameras.main.height * 0.9,
      "player"
    );
    this.player.setScale(0.2,0.2)
    this.player.setCollideWorldBounds(true);

    // Add overlap detection between player and stalls
    this.physics.add.overlap(
      this.player,
      this.stalls,
      this.handleStallContact,
      null,
      this
    );

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Flag to track if player is in contact with a stall
    this.playerInStallContact = false;
  }

  update() {
    const speed = 160;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  handleStallContact(player, stall) {
    if (!this.playerInStallContact) {
      this.playerInStallContact = true;
      this.onStallContact(stall);
    }
  }

  onStallContact(stall) {
    console.log("Player has come in contact with a stall!");

    // Remove previous buttons
    const paymentButton = document.querySelector(".button-payment");
    const videoButton = document.querySelector(".button-video");
    paymentButton.style.display = "none";
    videoButton.style.display = "none";

    // Add avatar image
    // const avatar = this.add.image(150, 400, "avatar").setScale(2);

    // Create a speech bubble background
    const bubble = this.add.graphics({ fillStyle: { color: 0xffffff } });
    bubble.fillRoundedRect(stall.x - 20, stall.y - 90, 300, 120, 15); // Adjust bubble size
    bubble.setDepth(0); // Make sure it's behind the text and buttons

    // Create content text inside the bubble
    const stallInfo = this.add
      .text(
        stall.x,
        stall.y - 80,
        "Solar Project: Clean energy for the future. ",
        {
          fontSize: "16px",
          fill: "#000000",
          wordWrap: { width: 260 }, // Word wrap to fit inside bubble
          fontStyle: "bold",
          padding: { x: 10, y: 5 },
        }
      )
      .setDepth(1);

    // Add "Read More" button with a link
    const readMore = this.add
      .text(stall.x + 80, stall.y - 35, "Read More", {
        fontSize: "14px",
        fill: "#0000EE", // Blue text for link
        fontStyle: "underline",
      })
      .setDepth(1)
      .setInteractive();

    readMore.on("pointerup", () => {
      window.open("https://your-link.com", "_blank"); // Open link in a new tab
    });

    // Create "Pay" button
    const payButton = this.add
      .text(stall.x + 30, stall.y - 10, "Pay", {
        fontSize: "14px",
        fill: "#ffffff",
        backgroundColor: "#FF0000", // Red background for button look
        padding: { x: 10, y: 5 },
      })
      .setDepth(1)
      .setInteractive();

    payButton.on("pointerup", () => {
      console.log("Pay button clicked!");
      // Add your payment logic here
    });

    // Create "Video" button
    const videoButtonPhaser = this.add
      .text(stall.x + 150, stall.y - 10, "Video", {
        fontSize: "14px",
        fill: "#ffffff",
        backgroundColor: "#0000FF", // Blue background for button look
        padding: { x: 10, y: 5 },
      })
      .setDepth(1)
      .setInteractive();

    videoButtonPhaser.on("pointerup", () => {
      console.log("Video button clicked!");
      // Add your video logic here
    });

    // Remove the speech bubble, buttons, and avatar after 3 seconds
    this.time.delayedCall(10, () => {
      stallInfo.destroy();
      bubble.destroy();
    //   avatar.destroy();
      readMore.destroy();
      payButton.destroy();
      videoButtonPhaser.destroy();
      this.playerInStallContact = false; // Reset the contact flag after interaction
    });
  } 
}

export default TitleScreen;