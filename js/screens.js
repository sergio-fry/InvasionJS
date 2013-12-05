/*
 * loading screen
 */
var LoadingScreen = me.ScreenObject.extend(
{
	/*
	 * constructor
	 */
	init: function()
	{
		this.parent(true);
		this.bg = new Image();
		this.bg.src = "img/bkg0.png";
		this.loading = new me.Font("Verdana", 20, "white");
	},

	/*
	 * drawing function
	 */
	draw: function(context)
	{
		// clear the screen
		me.video.clearSurface(context, "black");
		context.drawImage(this.bg, 0, 0);

		var loadingText = "Загрузка...";
		var loadingSize = this.loading.measureText(context, loadingText);
		this.loading.draw(context, loadingText,
			(me.video.getWidth() / 2) - (loadingSize.width / 2),
			(me.video.getHeight() / 2) - (loadingSize.height / 2));
	}
});

/*
 * menu screen
 */
var MenuScreen = me.ScreenObject.extend(
{
	/*
	 * constructor
	 */
	init: function()
	{
		// call parent constructor
		this.parent(true, true);

		// init stuff
		this.title = null;
		this.play = null;
		this.version = null;
	},

	/*
	 * reset function
	 */
	onResetEvent: function()
	{
		// add parallax background
		me.game.add(new BackgroundObject(), 1);

		// load title image
		this.title = me.loader.getImage("title");

		// play button
		this.play = new Button("play", me.state.PLAY, 280);

		// version
		this.version = new me.Font("Verdana", 20, "white");
	},

	/*
	 * drawing function
	 */
	draw: function(context)
	{
		// draw title
		context.drawImage(this.title, (me.video.getWidth() / 2 - this.title.width / 2), 100);

		// draw play button
		this.play.draw(context);

		// game version
		var versionText = "0.4";
		var versionSize = this.version.measureText(context, versionText);

		this.version.draw(context, versionText,
			me.video.getWidth() - versionSize.width - 2, me.video.getHeight() - versionSize.height);
	},

	/*
	 * destroy event function
	 */
	onDestroyEvent: function()
	{
		// release mouse event
		me.input.releasePointerEvent("mousedown", this.play);
	}
});

/*
 * play screen
 */
var PlayScreen = me.ScreenObject.extend(
{
	/*
	 * action to perform when game starts
	 */
	onResetEvent: function()
	{
		// add a default HUD
		me.game.addHUD(0, 0, me.video.getWidth(), 45);

    if(!me.game.HUD.getItemValue("theme_started")) {
      me.audio.play("theme");
    }

    me.game.HUD.updateItemValue("theme_started", true);

		// add a new HUD item
		me.game.HUD.addItem("life", new LifeObject(3));

		// add a new HUD item
		me.game.HUD.addItem("score", new ScoreObject());

		// add parallax background
		me.game.add(new BackgroundObject(), 1);

		// add main player
		me.game.add(new PlayerEntity(100, 205), 10);

		// add enemy fleet
		me.game.add(new EnemyFleet(), 10);

		// make sure everything is in the right order
		me.game.sort();
	},

    /*
     * action to perform when game is finished (state change)
     */
	onDestroyEvent: function()
	{
		// remove the HUD
		me.game.disableHUD();
	}
});

/*
 * game over screen
 */
var GameOverScreen = me.ScreenObject.extend(
{
	/*
	 * constructor
	 */
	init: function()
	{
		// call parent constructor
		this.parent(true, true);

		// init stuff
		this.end = null;
		this.score = null;
		this.restart = null;
		this.menu = null;
		this.finalScore = null;
	},

	/*
	 * reset function
	 */
	onResetEvent: function(score, boss_killed)
	{
		this.finalScore = score;
		this.boss_killed = boss_killed;

		// add parallax background
		me.game.add(new BackgroundObject(), 1);

		// labels
		this.end = new me.Font("Verdana", 25, "white");
		this.score = new me.Font("Verdana", 22, "white");
		this.share = new me.Font("Verdana", 22, "red");

		// buttons
		this.restart = new Button("restart", me.state.PLAY, 280);
		//this.menu = new Button("menu", me.state.MENU, 330);
	},

	/*
	 * drawing function
	 */
	draw: function(context)
	{
		// draw buttons
		this.restart.draw(context);
		//this.menu.draw(context);

		// draw end label
		var endText;
    if(this.boss_killed) {
      endText = "Поздравляем! Украина свободна!!!";
    } else {
      endText = "Постарайтесь подстрелить зека с косичкой.";
    }

		var endSize = this.end.measureText(context, endText);

		this.end.draw(context, endText,
			me.video.getWidth() / 2 - endSize.width / 2, 120);

		// draw score label
		var scoreText = "Очки : " + this.finalScore;
		var scoreSize = this.score.measureText(context, scoreText);

		this.score.draw(context, scoreText,
			me.video.getWidth() / 2 - scoreSize.width / 2, 150);

    var share_text = "Дай другу отстоять Украину-матушку! =)";
		var share_size = this.end.measureText(context, share_text);

		this.end.draw(context, share_text,
			me.video.getWidth() / 2 - share_size.width / 2, 220);
	},

	/*
	 * destroy event function
	 */
	onDestroyEvent: function()
	{
		// release mouse event
		me.input.releasePointerEvent("mousedown", this.restart);
		//me.input.releasePointerEvent("mousedown", this.menu);
	}
});
