var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { 
    preload: preload, create: create, update: update });

// Declare the sprites globally so we can modify them later
var background;
var cloud;
var balloon;
var popping;
var projectiles;
var meteorite;
var powerUp;

// Declare the text fields
var gameInfoText;
var altitudeText;
var loseText;
var lose;

// Declare our score trackers;
// Set our starting altitude
var altitude = 1000;
var dodged = 0;

// Declare the game timers
var time;

// Declare our sound effects
var popSound;

// Declare our background music
var music;

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
    game.load.spritesheet('popping', 'assets/sprites/popping.png', 64, 64, 7);
    game.load.spritesheet('meteorite', 'assets/sprites/meteorite.png', 32, 32, 4);

    // Load sound effects
    game.load.audio('pop', 'assets/sounds/pop.wav');

    // Load music
    game.load.audio('music', 'assets/sounds/music.mp3');
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

    // Add our background music
    music = game.add.audio('music');
    music.play();

    // Assign our keyboard keys
    keys = game.input.keyboard.createCursorKeys();

    // Initialize our group of "enemies"
    generateProjectiles();

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
    } else if (paused === true && gameOver === true) {
        game.world.remove(altitudeText);
        // Display losing text
        if (balloon.scale.x >= 2) {
            loseText = "You grew too large and popped!\nYou made it up to " + altitude.toFixed(0) + " feet,\nand dodged " + dodged + " meteors!";
            lose = game.add.text(game.world.centerX - 360, game.world.centerY - 70, loseText, style);
        } else if (altitude >= 28000) {
            loseText = "The atmosphere got too thin and you popped!\nYou made it up to " + altitude.toFixed(0) + " feet,\nand dodged " + dodged + " meteors!";
            lose = game.add.text(game.world.centerX - 360, game.world.centerY - 70, loseText, style);
        } else {
            loseText = "You were struck by a meteor!\nYou made it up to " + altitude.toFixed(0) + " feet,\nand dodged " + dodged + " meteors!";
            lose = game.add.text(game.world.centerX - 330, game.world.centerY - 90, loseText, style);
        }
    } else {
        checkInput();
        checkCollision();
        updateAltitude();
        updateProjectiles();
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
    } else if (keys.right.isDown && balloon.x < 768) {
        if (balloon.angle < 20) {
            balloon.angle += 1;
        }
        balloon.x += 3;
    } else {
        // Reset the angle over time if no buttons are pressed
        if (balloon.angle < 0) {
            balloon.angle += 1;
        } else if (balloon.angle > 0) {
            balloon.angle -= 1;
        }
    }
}

// Check to see if we've made contact with a projectile
// TODO: Add powerups (like shrinking the balloon)
function checkCollision() {
    game.physics.arcade.overlap(projectiles, balloon, popBalloon, null, this);
}

// Generate a randomly-colored balloon for our player
function spawnBalloon() {
    balloon = game.add.sprite(400, 400, 'balloon');
    balloon.tint = Math.random() * 0xffffff;
    var fly = balloon.animations.add('fly');
    balloon.animations.play('fly', 7, true);
    game.physics.enable(balloon, Phaser.Physics.ARCADE);
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
        } else {
            currentCloud.y++;
        }
    }, this);
}

// Increase our altitude and modify the game accordingly
function updateAltitude() {
    if (altitude < 28000 && balloon.scale.x < 2) {
        // Should rise at about 8ft./second
        altitude += 0.1;
        altitudeText.text = altitude.toFixed(0) + ' ft.';
        // The balloon gets larger as the altitude increases
        balloon.scale.x += 0.0001;
        balloon.scale.y += 0.00005;
    } else if (altitude >= 28000) {
        popBalloon();
    } else if (balloon.scale.x >= 2) {
        popBalloon();
    }
}

// Add our enemies
function generateProjectiles() {
    projectiles = game.add.group();
    for (var i = 0; i < 10; i++) {
        meteorite = projectiles.create(Math.random() * 800, Math.floor(Math.random() * 1000) - 1100, 'meteorite');
        meteorite.tint = Math.random() * 0xffffff;
        var burn = meteorite.animations.add('burn');
        meteorite.animations.play('burn', Math.random() * 7, true);
    }
    game.physics.enable(projectiles, Phaser.Physics.ARCADE);
}

// Move our enemies
function updateProjectiles() {
   projectiles.forEach(function(currentProjectile) {
        if (currentProjectile.y > 632) {
            currentProjectile.y = Math.floor(Math.random() * 400) - 400;
            currentProjectile.x = Math.random() * 800;
            currentProjectile.tint = Math.random() * 0xffffff;
            dodged++;
        } else {
            currentProjectile.y += 8;
        }
   }, this);
}

// Pop the balloon
function popBalloon() {
    popSound.play();
    // Switch to our popping sprite sheet and animate
    balloon.loadTexture('popping');
    var dying = balloon.animations.add('dying');
    balloon.animations.play('dying', 20, false);
    game.world.remove('balloon');
    // Set our gamestate accordingly
    gameOver = true;
    paused = true;
}
