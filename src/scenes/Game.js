import { Scene } from 'phaser';

const WIDTH = 800;
const HEIGHT = 600;

let player;
let ground;
let clouds;

function gameOver(){
    this.physics.pause();
    this.timer = 0;
    this.player.setTexture('dino-die')
    this.isGameRunning = false;
    this.anims.pauseAll();
    this.sound.play('hit');
    this.frameCounter;
    this.gameOverContainer.setAlpha(1);
}

export class Game extends Scene {
    constructor() {
        super('Game');
        this.player = null;
    }

    preload() {
        this.load.image('dino-die', "assets/dino-hurt.png")
        this.score = 0;
        this.load.audio('jump', 'assets/jump.m4a');
        this.load.audio('hit', 'assets/hit.m4a')
        this.frameCounter = 0;
        this.load.spritesheet('dino', 'assets/dino-run.png', {frameWidth: 88, frameHeight: 94});
        this.load.image('ground', 'assets/ground.png');
        this.load.image('cloud', 'assets/cloud.png');
        for (let i = 0; i < 6; i++) {
            const cactusNum = i + 1;
            this.load.image(`obstacle-${cactusNum}`, `assets/cactuses_${cactusNum}.png`);
        }
        this.load.image('game-over', 'assets/game-over.png');
        this.load.image('restart', 'assets/restart.png');
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.isGameRunning = true;

        this.scoreText = this.add.text(700, 50, "00000", {
            fontSize: 30,
            fontFamily: 'Arial',
            color: '#535353',
            resolution: 5
        }).setOrigin(1, 0); 

        this.gameSpeed = 10;
        this.groundCollider = this.physics.add.staticSprite(0, 500, 'ground').setOrigin(0, 1).setVisible(false)
        this.groundCollider.body.setSize(1000, 30);
        this.player = this.physics.add.sprite(20, 20, 'dino').setDepth(1).setOrigin(0).setGravityY(5000).setCollideWorldBounds(true).setBodySize(44, 92);
        this.ground = this.add.tileSprite(0, 500, 1000, 30, 'ground').setOrigin(0, 1);
        this.clouds = this.add.group();

        this.gameOverText = this.add.image(-(WIDTH/2.7), HEIGHT/8, 'game-over').setOrigin(0, 0);
        this.restartText = this.add.image(-(WIDTH/6), HEIGHT/4, 'restart').setOrigin(0, 0).setInteractive();
        this.gameOverContainer = this.add.container(1000 / 2, (300 / 2) - 50).add([this.gameOverText, this.restartText]).setAlpha(0);

        this.clouds = this.clouds.addMultiple([
            this.add.image(150, 100, 'cloud'),
            this.add.image(350, 130, 'cloud'),
            this.add.image(600, 80, 'cloud')
        ]);

        this.obstacles = this.physics.add.group({
            allowGravity: false
        })
        
        this.physics.add.collider(this.player, this.groundCollider);
        this.physics.add.collider(this.obstacles, this.player, gameOver, null, this);
        

        this.timer = 0;
    }

    update(time, delta) {
        if (!this.isGameRunning) {
            return; // Stop execution if the game is not running
        }
    
        this.anims.create({
            key: "dino-run",
            frames: this.anims.generateFrameNames('dino', {start: 2, end: 3}),
            frameRate:10,
            repeat: -1
        });
        if (this.player.body.deltaAbsY() > 4) {
            this.player.anims.stop();
            this.player.setTexture('dino', 0);
        } else {
            this.player.play("dino-run", true);
        } 
    
        this.frameCounter++;
        if (this.frameCounter > 100) {
            this.score += 100;
            const formattedScore = String(Math.floor(this.score));
            this.scoreText.setText(formattedScore);
            this.frameCounter -= 100;
    
            // Incrementally increase game speed
            this.gameSpeed += 1; // Adjust the increment value as needed
        }
    
        this.ground.tilePositionX += this.gameSpeed;
        this.timer += delta;
        console.log(this.timer);
    
        const { space, up } = this.cursors;
    
        if ((Phaser.Input.Keyboard.JustDown(space) || Phaser.Input.Keyboard.JustDown(up)) && this.player.body.onFloor()) {
            this.player.setVelocityY(-1600);
            this.sound.play('jump');
        }
    
        if (this.timer > 1000) {
            this.obstacleNum = Math.floor(Math.random() * 6) + 1;
            this.obstacles.create(750, 500, `obstacle-${this.obstacleNum}`).setOrigin(0, 1);
            this.timer -= 1000;
        }
        Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);
    
        this.obstacles.getChildren().forEach(obstacle => {
            if (obstacle.getBounds().right < 0) {
                this.obstacles.remove(obstacle);
                obstacle.destroy();
            }
        });
    
        this.restartText.on('pointerdown', () => {
            this.physics.resume();
            this.player.setVelocityY(0);
            this.anims.resumeAll();
            this.obstacles.clear(true, true);
            this.gameOverContainer.setAlpha(0);
            this.frameCounter = 0;
            this.score = 0;
            this.gameSpeed = 10; // Reset game speed
            const formattedScore = String(Math.floor(this.score)).padStart(5, '0');
            this.scoreText.setText(formattedScore);
            this.isGameRunning = true;
        });
    }

}