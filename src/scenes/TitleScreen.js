import Phaser from "phaser";
import io from "socket.io-client";

class TitleScreen extends Phaser.Scene {
  constructor() {
    super("TitleScreen");
    this.socket = null;
    this.players = new Map();
    this.playerCreated = false;
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

    // Connect to the server
    this.socket = io("http://localhost:5000");

    this.socket.on("currentPlayers", (players) => {
      Object.values(players).forEach((player) => {
        if (player.id === this.socket.id && !this.playerCreated) {
          this.addPlayer(player);
          this.playerCreated = true;
          // Add collision detection after player is created
          this.physics.add.collider(this.player, this.stalls, this.handleStallContact, null, this);
        } else if (player.id !== this.socket.id) {
          this.addPlayer(player);
        }
      });
    });

    this.socket.on("newPlayer", (player) => {
      if (player.id !== this.socket.id) {
        this.addPlayer(player);
      }
    });

    this.socket.on("playerMoved", (player) => {
      const playerSprite = this.players.get(player.id);
      if (playerSprite) {
        playerSprite.setPosition(player.x, player.y);
      }
    });

    this.socket.on("playerDisconnected", (playerId) => {
      const playerSprite = this.players.get(playerId);
      if (playerSprite) {
        playerSprite.destroy();
        this.players.delete(playerId);
      }
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.playerInStallContact = false;
  }

  addPlayer(player) {
    if (!this.players.has(player.id)) {
      const playerSprite = this.physics.add.sprite(player.x, player.y, "player");
      playerSprite.setScale(0.2, 0.2);
      playerSprite.setCollideWorldBounds(true);
      this.players.set(player.id, playerSprite);

      if (player.id === this.socket.id) {
        this.player = playerSprite;
        this.cameras.main.startFollow(this.player);
      }
    }
  }

  update() {
    if (this.player) {
      const speed = 160;
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.left.isDown || this.wasd.left.isDown) {
        velocityX = -speed;
      } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        velocityX = speed;
      }

      if (this.cursors.up.isDown || this.wasd.up.isDown) {
        velocityY = -speed;
      } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
        velocityY = speed;
      }

      this.player.setVelocity(velocityX, velocityY);

      // Emit player movement
      const { x, y } = this.player;
      if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
        this.socket.emit("playerMovement", { x, y });
      }

      // Save old position data
      this.player.oldPosition = { x, y };
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
