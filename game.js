var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { 
    preload: preload, create: create, update: update });

// Declare the sprites globally so we can modify them later
var background;
var balloon;
var tack;
var bird;
var meteorite;
var powerUp;

// Declare the text fields
var gameInfoText;

// Declare the game timers
var time;

// Declare our sound effects
var popSound;

// Declare our game states
var paused = true;
var gameOver = false;

// Declare a variable to hold our keyboard keys
var keys;

function preload() {
    // Load the background image and game sprites
    game.load.image('background', 'assets/sprites/background.png');
    game.load.spritesheet('balloon', 'assets/sprites/balloon.png', 32, 64, 5);
    
    // Load sound effects
    game.load.audio('pop', 'assets/sounds/pop.wav');
}

function create() {
    // Enable the physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Apply the background sprite
    background = game.add.sprite(0, 0, 'background');

    // Spawn our balloon
    balloon = game.add.sprite(400, 400, 'balloon');
    var fly = balloon.animations.add('fly');
    balloon.animations.play('fly', 7, true);

    // Add our sound effects
    popSound = game.add.audio('pop');

    // Assign our keyboard keys
    keys = game.input.keyboard.createCursorKeys();

    // Add and configure our game info text
    var description = 'Slip the surly bonds...\nDodge left and right to survive.';
    style = { font: '50px Arial', align: 'center', fill: '#3B5A75' };
    gameInfoText = game.add.text(game.world.centerX - 330, game.world.centerY - 50, description, style);
    gameInfoText.bringToTop();
}

function update() {
    if (paused && gameOver === false) {
        if (game.input.activePointer.isDown) {
            // Delete our info text
            game.world.remove(gameInfoText);
            // Start the game
            paused = false;
        }
    } else {
        checkInput();
        checkCollision();
    }
}

// Move the balloon left and right, double-tap to boost 
function checkInput() {
    if (keys.left.isDown) {
        balloon.x -= 3;
    }
    else if (keys.right.isDown) {
        balloon.x += 3;
    }
}

// Check to see if we've made contact with a projectile
function checkCollision() {
}
