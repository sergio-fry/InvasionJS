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
			me.game.HUD.updateItemValue("score", 10);
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
		// call the parent constructor
		this.parent(x, y, {image: "ship"});

		// set the default horizontal & vertical speed (accel vector)
		this.setVelocity(3, 3);

		// init variables
		this.gravity = 0;

		// enable collision
		this.collidable = true;
	},

	/*
	 * update the player pos
	 */
	update: function()
	{
		// move left
		if (me.input.isKeyPressed("left"))
		{
			// update the entity velocity
			this.vel.x -= this.accel.x * me.timer.tick;
			if (this.pos.x < 0)
				this.pos.x = 0;
		}
		// move right
		else if (me.input.isKeyPressed("right"))
		{
			// update the entity velocity
			this.vel.x += this.accel.x * me.timer.tick;
			if (this.pos.x > me.video.getWidth() - this.image.width)
				this.pos.x = me.video.getWidth() - this.image.width;
		}
		else
			this.vel.x = 0;

		// move up
		if (me.input.isKeyPressed("up"))
		{
			// update the entity velocity
			this.vel.y -= this.accel.y * me.timer.tick;
			if (this.pos.y < 0)
				this.pos.y = 0;
		}
		// move down
		else if (me.input.isKeyPressed("down"))
		{
			// update the entity velocity
			this.vel.y += this.accel.y * me.timer.tick;
			if (this.pos.y > me.video.getHeight() - this.image.height)
				this.pos.y = me.video.getHeight() - this.image.height;
		}
		else
			this.vel.y = 0;

		// fire
		if (me.input.isKeyPressed("fire"))
		{
			// play sound
			me.audio.play("missile");

			// create a missile entity
			var missile = new MissileEntity(this.pos.x + 34, this.pos.y + 15);
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
	/*
	 * constructor
	 */
	init: function(x, y)
	{
		// enemy entity settings
		var settings = {};
		settings.image = "enemy";
		settings.spritewidth = 45;
		settings.spriteheight = 42;
		settings.type = me.game.ENEMY_OBJECT;

		// call parent constructor
		this.parent(x, y, settings);

		// add animation with all sprites
		this.addAnimation("flying", null);
		this.animationspeed = 0.2;
		this.setCurrentAnimation("flying");

		// init variables
		this.gravity = 0;

		// set the default horizontal speed (accel vector)
		this.setVelocity(3, 0);

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

		// if the enemy object goes out from the screen,
		// remove it from the game manager
		if (this.pos.x < 0)
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
		// remove this entity
		me.game.remove(this, true);

		// play sound
		me.audio.play("implosion");

		// init implosion
		var implosion = new Implosion(this.pos.x, this.pos.y);
		me.game.add(implosion, 15);
		me.game.sort();
	}
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
		this.fps = 0;
		this.maxY = (me.video.getHeight() / 10) - 5;
	},

	/*
	 * update function
	 */
	update: function()
	{
		// every 1/12 second
		if ((this.fps++) % 12 == 0)
		{
			var x = me.video.getWidth() + 10;
			var y = Number.prototype.random(0, this.maxY) * 10;

			// add an enemy
			me.game.add(new EnemyEntity(x, y), 10);
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

		// add animation with all sprites
		this.addAnimation("implosion", null);
		this.animationspeed = 0.4;

		// set animation
		this.setCurrentAnimation("implosion", function() {
			me.game.remove(this);
			me.game.sort();
		});
	}
});
