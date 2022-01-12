
var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function BootScene ()
        {
            Phaser.Scene.call(this, { key: 'BootScene' });
        },

    preload: function ()
    {

        // map tiles
        //this.load.image('tiles', 'assets/map/castle-tileset.png');
        this.load.image("tiles", "Castle-tileset.png");

        // map in json format
        //this.load.tilemapTiledJSON('map', 'assets/map/map.json');
        this.load.tilemapTiledJSON("map", "map.json");


        this.load.spritesheet('player', 'DinoSpritesGreen.png', { frameWidth: 24, frameHeight: 18 });
    },

    create: function ()
    {
        // start the WorldScene
        this.scene.start('titleScreen');

    }
});

var titleScreen  = new Phaser.Class ({
    Extends: Phaser.Scene,

    initialize:

        function WorldScene ()
        {
            Phaser.Scene.call(this, { key: 'titleScreen' });
        },

    preload: function ()
    {
        this.load.image('backgroundPicture', 'background.png');
    },

    create: function ()
    {

        var bgPicture = this.add.image(0, 0, 'backgroundPicture').setOrigin(0, 0);
    },

    update: function (time, delta)
    {

    }

});

var WorldScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function WorldScene ()
        {
            Phaser.Scene.call(this, { key: 'WorldScene' });
        },

    preload: function ()
    {

    },

    create: function ()
    {
        // create the map
        const map = this.make.tilemap({ key: 'map' });

        // first parameter is the name of the tilemap in tiled
        const tileset = map.addTilesetImage('tiles', 'tiles');

        // creating the layers
        background = map.createStaticLayer('background', tileset, 0, 0);
        ground = map.createDynamicLayer('floor', tileset, 0, 0);
        platforms = map.createStaticLayer('platforms', tileset, 0, 0);
        objects = map.createStaticLayer('objects', tileset, 0, 0);

        // make all tiles in obstacles collidable
        ground.setCollisionByExclusion([-1]);

        shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // Create a simple graphic that can be used to show which tile the mouse is over
        marker = this.add.graphics();
        marker.lineStyle(5, 0xffffff, 1);
        marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);
        marker.lineStyle(3, 0xff4f78, 1);
        marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);


        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 2]}),
            frameRate: 10,
            repeat: -1
        });

        // this.anims.create({
        //     key: 'running',
        //     frames: this.anims.generateFrameNumbers('player', { frames: [3, 4, 5, 6, 7, 8, 9]}),
        //     frameRate: 10,
        //     repeat: -1
        // });
        this.anims.create({
            key: 'running',
            frames: this.anims.generateFrameNumbers('player', { start: 3, end: 9 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'falling',
            frames: this.anims.generateFrameNumbers('player', { frames: [10, 11, 12]}),
            frameRate: 10,
            repeat: -1
        });

        // our player sprite created through the physics system
        this.player = this.physics.add.sprite(20, 580, 'player', 6);

        // don't go out of the map
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.player.setCollideWorldBounds(true);

        // don't walk on trees
        this.physics.add.collider(this.player, ground);

        // limit camera to map
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true; // avoid tile bleed

        // user input
        this.cursors = this.input.keyboard.createCursorKeys();
    },
    update: function (time, delta)
    {
        // // When mouse is down, put a colliding tile at the mouse location
        // const pointer = this.input.activePointer;
        // const worldPoint = pointer.positionToCamera(this.cameras.main);
        //
        // if (pointer.isDown) {
        //     const tile = ground.putTileAtWorldXY(6, worldPoint.x, worldPoint.y);
        //     tile.setCollision(true);
        // }

        // Convert the mouse position to world position within the camera
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

        // Place the marker in world space, but snap it to the tile grid. If we convert world -> tile and
        // then tile -> world, we end up with the position of the tile under the pointer
        const pointerTileXY = ground.worldToTileXY(worldPoint.x, worldPoint.y);
        const snappedWorldPoint = ground.tileToWorldXY(pointerTileXY.x, pointerTileXY.y);
        marker.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);

        // Draw or erase tiles (only within the groundLayer)
        if (this.input.manager.activePointer.isDown) {
            if (shiftKey.isDown) {
                ground.removeTileAtWorldXY(worldPoint.x, worldPoint.y);
            } else {
                //ground.putTileAtWorldXY(353, worldPoint.x, worldPoint.y);
                const tile = ground.putTileAtWorldXY(6, worldPoint.x, worldPoint.y);
                tile.setCollision(true);
            }
        }

        //    this.controls.update(delta);

        //this.player.body.setVelocity(0);

        // Horizontal movement
        if (this.cursors.left.isDown)
        {
            this.player.body.setVelocityX(-80);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.body.setVelocityX(80);
        }
        else {
            this.player.body.setVelocityX(0);
        }

        // Vertical movement
        if (this.cursors.up.isDown && this.player.body.onFloor())
        {
            this.player.body.setVelocityY(-160);
        }
        else if (this.cursors.down.isDown)
        {
            //this.player.body.setVelocityY(80);
        }

        // Update the animation last and give falling animation precedence over left/right animations
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            //this.player.anims.play('up', true);
        }
        if (!this.player.body.touching.down) {
            this.player.anims.play('falling', true);
            this.player.flipX = this.cursors.left.isDown;
        }
        if (this.cursors.left.isDown)
        {
            this.player.anims.play('running', true);
            this.player.flipX = true;
        }
        else if (this.cursors.right.isDown)
        {
            this.player.anims.play('running', true);
            this.player.flipX = false;
        }
        else
        {
            this.player.anims.play('idle', true);
        }
    }

});

var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 320,
    height: 240,
    zoom: 2,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false // set to true to view zones
        }
    },
    scene: [
        BootScene,
        WorldScene
    ]
};
var game = new Phaser.Game(config);
var background = null;
var ground = null;
var platforms = null;
var objects = null;
var shiftKey;
var marker;


