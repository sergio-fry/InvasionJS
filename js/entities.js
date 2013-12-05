/*
 * missile entity
 */
var MissileEntity = me.ObjectEntity.extend(
{
	/*
	 * constructor
	 */
	init: function(x, y)
	{
		// call the parent constructor
		this.parent(x, y, {image: "missile"});

		// set the default horizontal speed (accel vector)
		this.setVelocity(7, 0);
		this.anchorPoint.set(0.0, 0.0);
	},

	/*
	 * update function
	 */
	update: function()
	{
		// calculate missile velocity
		this.vel.x += this.accel.x * me.timer.tick;

		// if the missile object goes out from the screen,
		// remove it from the game manager
		if (!this.visible)
			me.game.remove(this);

		// check & update missile movement
		this.computeVelocity(this.vel);
		this.pos.add(this.vel);

		// collision detection
		var res = me.game.collide(this);
		if (res && res.obj.type == me.game.ENEMY_OBJECT)
		{
			// remove enemy
			res.obj.remove();
			// remove missile
			me.game.remove(this);

			// update score
			me.game.HUD.updateItemValue("score", res.obj.score);

      if(res.obj.finale) {
				me.state.change(me.state.GAMEOVER,
					me.game.HUD.getItemValue("score"), true);
				return;
      }
		}

		return true;
	}
});

/*
 * player entity
 */
var PlayerEntity = me.ObjectEntity.extend(
{
	/*
	 * constructor
	 */
	init: function(x, y)
	{
		// player entity settings
		var settings = {};
		settings.image = me.loader.getImage("ship");
		settings.spritewidth = 36;
		settings.spriteheight = 36;

		// call the parent constructor
		this.parent(x, y, settings);

		// set the default horizontal & vertical speed (accel vector)
		this.setVelocity(3, 3);
		this.anchorPoint.set(0.0, 0.0);

		// init variables
		this.gravity = 0;
		this.alwaysUpdate = true;

		// enable collision
		this.collidable = true;
	},

	/*
	 * update the player pos
	 */
	update: function()
	{
		// accel vectors
		this.vel.x = 0;
		this.vel.y = 0;

		// move left
		if (me.input.isKeyPressed("left") && !me.input.isKeyPressed("right"))
		{
			// update the entity velocity
			this.vel.x -= this.accel.x * me.timer.tick;
			if (this.pos.x < 0)
				this.pos.x = 0;
		}
		// move right
		if (me.input.isKeyPressed("right") && !me.input.isKeyPressed("left"))
		{
			// update the entity velocity
			this.vel.x += this.accel.x * me.timer.tick;
			if (this.pos.x > me.video.getWidth() - this.renderable.width)
				this.pos.x = me.video.getWidth() - this.renderable.width;
		}
		// move up
		if (me.input.isKeyPressed("up") && !me.input.isKeyPressed("down"))
		{
			// update the entity velocity
			this.vel.y -= this.accel.y * me.timer.tick;
			if (this.pos.y < 0)
				this.pos.y = 0;
		}
		// move down
		if (me.input.isKeyPressed("down") && !me.input.isKeyPressed("up"))
		{
			// update the entity velocity
			this.vel.y += this.accel.y * me.timer.tick;
			if (this.pos.y > me.video.getHeight() - this.renderable.height)
				this.pos.y = me.video.getHeight() - this.renderable.height;
		}

		// fire
		if (me.input.isKeyPressed("fire"))
		{
			// play sound
			me.audio.play("missile");

			// create a missile entity
			var missile = new MissileEntity(this.pos.x + this.width,
												this.pos.y + this.height / 2 - 3);
			me.game.add(missile, this.z);
			me.game.sort();
		}

		// check & update player movement
		this.computeVelocity(this.vel);
		this.pos.add(this.vel);
		this.checkCollision();

		// update animation if necessary
		var updated = (this.vel.x != 0 || this.vel.y != 0);
		return updated;
	},

	/*
	 * check collision
	 */
	checkCollision: function()
	{
		var res = me.game.collide(this);

		// if collided object is an enemy
		if (res && res.obj.type == me.game.ENEMY_OBJECT)
		{
			// play sound
			me.audio.play("clash");

			// update life indicator
			me.game.HUD.updateItemValue("life", -1);

			// if no more lives
			if (me.game.HUD.getItemValue("life") <= 0)
			{
				// game over
				me.state.change(me.state.GAMEOVER,
					me.game.HUD.getItemValue("score"));
				return;
			}

			// enemy3 killed
			if (me.game.HUD.getItemValue("level_cleared"))
			{
				// game over
				me.state.change(me.state.GAMEOVER,
					me.game.HUD.getItemValue("score"));
				return;
			}

			// remove enemy
			res.obj.remove();
		}
	}
});

/*
 * enemy entity
 */
var EnemyEntity = me.ObjectEntity.extend(
{
  image: "enemy",
  width: 45,
  height: 42,
	/*
	 * constructor
	 */
	init: function(x, y, options)
	{
		// enemy entity settings
		var settings = options || {};
		settings.image = me.loader.getImage(this.image);
		settings.spritewidth = this.width;
		settings.spriteheight = this.height;
		settings.type = me.game.ENEMY_OBJECT;

		// call parent constructor
		this.parent(x, y, settings);

		// add animation with all sprites
		this.renderable.addAnimation("flying", null, 3.5);
		this.renderable.setCurrentAnimation("flying");

		// init variables
		this.gravity = 0;
		this.alwaysUpdate = true;

		// set the default horizontal speed (accel vector)
		this.setVelocity(2.5, 0);
		this.anchorPoint.set(0.0, 0.0);

		// enable collision
		this.collidable = true;
	},

	/*
	 * update function
	 */
	update: function()
	{
		// call parent constructor
		this.parent(this);

		// calculate velocity
		this.vel.x -= this.accel.x * me.timer.tick;

    if(this.accel.y > 0) {
      this.vel.y -= this.accel.y * me.timer.tick;
    } else {
      this.vel.y += this.accel.y * me.timer.tick;
    }

		// if the enemy object goes out from the screen,
		// remove it from the game manager
		if (!this.visible)
			me.game.remove(this);

		// check & update missile movement
		this.computeVelocity(this.vel);
		this.pos.add(this.vel);

		return true;
	},

	/*
	 * remove function
	 */
	remove: function()
	{
		// init implosion
		var implosion = new Implosion(this.pos.x, this.pos.y);
		me.game.add(implosion, 15);
		me.game.sort();

		// remove this entity
		me.game.remove(this);
	},
  score: 10,
  finale: false
});

var Enemy2Entity = EnemyEntity.extend({
  image: "enemy2",
  width: 45,
  height: 58,
	/*
	 * constructor
	 */
	init: function(x, y, options)
	{
		// call parent constructor
		this.parent(x, y, options);
    
    if(Math.random() > 0.5) {
      this.setVelocity(3.5, 1.5);
    } else {
      this.setVelocity(3.5, -1.5);
    }
  },

  score: 20,
  finale: false
});

var Enemy3Entity = EnemyEntity.extend({
  image: "enemy3",
  width: 71,
  height: 55,
	/*
	 * constructor
	 */
	init: function(x, y, options)
	{
		// call parent constructor
		this.parent(x, y, options);
    
    if(Math.random() > 0.5) {
      this.setVelocity(6.5, 1.5);
    } else {
      this.setVelocity(6.5, -1.5);
    }
  },

  score: 100,
  finale: true
});

/*
 * enemy fleet
 */
var EnemyFleet = Object.extend(
{
	/*
	 * constructor
	 */
	init: function()
	{
		// init variables
		this.round = 0;
		this.alwaysUpdate = true;
	},

	/*
	 * update function
	 */
	update: function()
	{
    var seed = this.round++;

    var score = me.game.HUD.getItemValue("score");

    var level;

    if(score < 50) {
      level = 1;
    } else if(score >= 50 && score < 200) {
      level = 2;
    } else if(score >= 200) {
      level = 3;
    }
    

		// every 1/N round
		if ((seed) % Math.round(50/level) == 0)
		{
			var x = me.video.getWidth();
			var y = parseInt(Math.random() * (me.video.getHeight() - 42));

			// add an enemy
			me.game.add(new EnemyEntity(x, y), 10);
			me.game.sort();
		}

		// every 1/N round
		if (level >= 2 && (seed) % Math.round(100/level) == 0)
		{
			var x = me.video.getWidth();
			var y = parseInt(Math.random() * (me.video.getHeight() - 42));

			// add an enemy
			me.game.add(new Enemy2Entity(x, y), 10);
			me.game.sort();
		}

		// every 1/N round
		if (level >= 3 && (seed) % 100 == 0)
		{
			var x = me.video.getWidth();
			var y = parseInt(Math.random() * (me.video.getHeight() - 42));

			// add an enemy
			me.game.add(new Enemy3Entity(x, y), 10);
			me.game.sort();
		}

		return true;
	}
});

/*
 * implosion animation
 */
var Implosion = me.AnimationSheet.extend(
{
	/*
	 * constructor
	 */
	init: function(x, y)
	{
		// call parent constructor
		var image = me.loader.getImage("implosion");
		this.parent(x, y, image, 45, 42);

		// play sound
		me.audio.play("implosion");

		// add animation with all sprites
		this.addAnimation("implosion", null, 0.4);

		// set animation
		this.setCurrentAnimation("implosion", (function() {
			me.game.remove(this);
			return false;
		}).bind(this));
	}
});
