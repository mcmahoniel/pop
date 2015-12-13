var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { 
    preload: preload, create: create, update: update });

// Declare the sprites globally so we can modify them later
var background;
var cloud;
var balloon;
var tack;
var bird;
var meteorite;
var powerUp;

// Declare the text fields
var gameInfoText;
var altitudeText;

// Declare our score trackers;
var altitude = 1000;

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
    game.load.spritesheet('clouds', 'assets/sprites/clouds.png', 200, 150, 5);
    game.load.spritesheet('balloon', 'assets/sprites/balloon.png', 32, 64, 5);
    
    // Load sound effects
    game.load.audio('pop', 'assets/sounds/pop.wav');
}

function create() {
    // Enable the physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Apply the background sprite
    background = game.add.sprite(0, 0, 'background');

    // Spawn the clouds
    generateClouds();

    // Add our player/balloon
    spawnBalloon();

    // Add our sound effects
    popSound = game.add.audio('pop');

    // Assign our keyboard keys
    keys = game.input.keyboard.createCursorKeys();

    // Add and configure our game info text
    var description = 'Slip the surly bonds of Earth...\nDodge left and right to survive.';
    style = { font: '50px Arial', align: 'center', fill: '#3B5A75' };
    gameInfoText = game.add.text(game.world.centerX - 330, game.world.centerY - 50, description, style);
    gameInfoText.bringToTop();

    // Add and configure our altitude status text
    altitudeText = game.add.text(10, 0, '', style);
    altitudeText.bringToTop();
}

function update() {
    if (paused && gameOver === false) {
        if (keys.left.isDown || keys.right.isDown) {
            // Delete our info text
            game.world.remove(gameInfoText);
            // Start the game
            paused = false;
        }
    } else {
        checkInput();
        checkCollision();
        updateAltitude();
    }

    updateClouds();
}

// Move the balloon left and right
// TODO: Double-tap to boost 
function checkInput() {
    if (keys.left.isDown && balloon.x > 0) {
        if (balloon.angle > -20) {
            balloon.angle -= 1;
        }
        balloon.x -= 3;
    }
    else if (keys.right.isDown && balloon.x < 768) {
        if (balloon.angle < 20) {
            balloon.angle += 1;
        }
        balloon.x += 3;
    }
}

// Check to see if we've made contact with a projectile or powerup
function checkCollision() {
}

// Generate a randomly-colored balloon for our player
function spawnBalloon() {
    balloon = game.add.sprite(400, 400, 'balloon');
    balloon.tint = Math.random() * 0xffffff;
    var fly = balloon.animations.add('fly');
    balloon.animations.play('fly', 7, true);
}

// Create and position our clouds
function generateClouds() {
    // Generate our group of clouds
    cloud = game.add.group();
    for (var i = 0; i < 5; i++) {
        // Position randomly inside our viewport
        x = Math.random() * 800;
        y = Math.random() * 600;
        currentCloud = cloud.create(x, y, 'clouds');
        // Randomly pick which cloud to be
        cloudType = Math.floor(Math.random() * 5);
        currentCloud.frame = cloudType;
    }
}

// Update the position of our clouds
function updateClouds() {
    cloud.forEach(function(currentCloud) {
        if (currentCloud.y > 632) {
            currentCloud.y = -200;
            currentCloud.x = Math.random() * 800;
        }
        else {
            currentCloud.y++;
        }
    }, this);
}

// Increase our altitude and modify the game accordingly
function updateAltitude() {
    // Should rise at about 8ft./second
    altitude += 0.1;
    altitudeText.text = 'Altitude: ' + altitude.toFixed(0) + ' ft.';
    // The balloon gets larger as the altitude increases
    // TODO: Pop the balloon at ~28k ft.
    balloon.scale.x += 0.0001;
    balloon.scale.y += 0.0001;
}
