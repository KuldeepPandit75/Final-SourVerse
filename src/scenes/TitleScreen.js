import Phaser from "phaser";
import io from "socket.io-client";

class TitleScreen extends Phaser.Scene {
  constructor() {
    super("TitleScreen");
    this.socket = null;
    this.players = new Map();
    this.playerInStallContact = false;
    this.hoverBox = null;
  }

  preload() {
    this.load.image("player", "https://i.postimg.cc/ncSC2btS/idleChar.png");
    this.load.image("background", "https://i.postimg.cc/P5M1TFGm/background.webp");
    this.load.image("stall", "assets/sprites/idleChar.png"); // Use a different image for stalls
  }

  create() {
    // Create background
    this.background = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "background"
    );
    const scaleX = this.cameras.main.width / this.background.width;
    const scaleY = this.cameras.main.height / this.background.height;
    const scale = Math.max(scaleX, scaleY);
    this.background.setScale(scale);

    // Create stalls group
    this.stalls = this.physics.add.staticGroup();

    // Connect to the server
    this.socket = io("http://localhost:5000");

    // Handle current players and stalls
    this.socket.on("currentState", ({ players, stalls }) => {
      stalls.forEach(stall => this.addStall(stall));
      players.forEach(player => this.addPlayer(player));
    });

    // Handle new player
    this.socket.on("newPlayer", (player) => {
      this.addPlayer(player);
    });

    // Handle player movement
    this.socket.on("playerMoved", (playerInfo) => {
      const player = this.players.get(playerInfo.id);
      if (player) {
        player.setPosition(playerInfo.x, playerInfo.y);
      }
    });

    // Handle player disconnection
    this.socket.on("playerDisconnected", (playerId) => {
      const player = this.players.get(playerId);
      if (player) {
        player.destroy();
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

    this.input.on('gameobjectup', (pointer, gameObject) => {
      if (gameObject.type === 'Text' && gameObject.text === 'X') {
        this.closeHoverBox();
      }
    });
  }

  addStall(stallInfo) {
    const stall = this.stalls.create(stallInfo.x, stallInfo.y, "stall");
    stall.setScale(0.2);
  }

  addPlayer(playerInfo) {
    const player = this.physics.add.sprite(playerInfo.x, playerInfo.y, "player");
    player.setScale(0.2, 0.2);
    player.setCollideWorldBounds(true);
    this.players.set(playerInfo.id, player);

    if (playerInfo.id === this.socket.id) {
      this.cameras.main.startFollow(player);
      this.physics.add.overlap(player, this.stalls, this.handleStallContact, null, this);
    }
  }

  update() {
    const player = this.players.get(this.socket.id);
    if (!player) return;

    const speed = 160;
    let velocityChanged = false;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      player.setVelocityX(-speed);
      velocityChanged = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      player.setVelocityX(speed);
      velocityChanged = true;
    } else {
      player.setVelocityX(0);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      player.setVelocityY(-speed);
      velocityChanged = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      player.setVelocityY(speed);
      velocityChanged = true;
    } else {
      player.setVelocityY(0);
    }

    if (velocityChanged) {
      this.socket.emit("playerMovement", { x: player.x, y: player.y });
    }
  }

  handleStallContact(player, stall) {
    if (!this.playerInStallContact && !this.hoverBox) {
      this.playerInStallContact = true;
      this.showStallInfo(stall);
    }
  }

  showStallInfo(stall) {
    // Create a speech bubble background
    const bubble = this.add.graphics({ fillStyle: { color: 0xffffff } });
    bubble.fillRoundedRect(stall.x - 150, stall.y - 100, 300, 150, 15);
    bubble.setDepth(1);

    // Create content text inside the bubble
    const stallInfo = this.add.text(
      stall.x - 140,
      stall.y - 90,
      "Solar Project: Clean energy for the future.",
      {
        fontSize: "16px",
        fill: "#000000",
        wordWrap: { width: 280 },
        fontStyle: "bold",
      }
    ).setDepth(2);

    // Add "Read More" button with a link
    const readMore = this.add.text(
      stall.x - 120,
      stall.y - 40,
      "Read More",
      {
        fontSize: "14px",
        fill: "#0000EE",
        fontStyle: "underline",
      }
    ).setDepth(2).setInteractive();

    readMore.on("pointerup", () => {
      window.open("https://your-link.com", "_blank");
    });

    // Create "Pay" button
    const payButton = this.add.text(
      stall.x - 120,
      stall.y - 10,
      "Pay",
      {
        fontSize: "14px",
        fill: "#ffffff",
        backgroundColor: "#FF0000",
        padding: { x: 10, y: 5 },
      }
    ).setDepth(2).setInteractive();

    payButton.on("pointerup", () => {
      console.log("Pay button clicked!");
      // Add your payment logic here
    });

    // Create "Video" button (now inside the box)
    const videoButtonPhaser = this.add.text(
      stall.x + 20,
      stall.y - 10,
      "Video",
      {
        fontSize: "14px",
        fill: "#ffffff",
        backgroundColor: "#0000FF", // Blue background for button look
        padding: { x: 10, y: 5 },
      }
    ).setDepth(2).setInteractive();

    videoButtonPhaser.on("pointerup", () => {
      console.log("Video button clicked!");
      // Add your video logic here
    });

    // Remove the speech bubble, buttons, and avatar after 3 seconds
    this.time.delayedCall(10, () => {
      stallInfo.destroy();
      bubble.destroy();
      readMore.destroy();
      payButton.destroy();
      videoButtonPhaser.destroy();
      this.playerInStallContact = false; // Reset the contact flag after interaction
    });
  } 
}

export default TitleScreen;
