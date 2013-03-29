/*jshint node:true jquery:true*/
"use strict";

var applet = require('../jsmm-applet');
var dares = require('../dares');
var $f = require('./client.page.blog.froogaloop');

var MoviePlayer = function() { return this.init.apply(this, arguments); };
MoviePlayer.prototype = {
	init: function($div, picturePath, id) {
		this.$div = $div;
		this.id = id;

		this.$div.addClass('movie-player');

		if ('ontouchstart' in document.documentElement) {
			this.$iframe = $('<iframe class="movie-player-iframe" id="movie-player-iframe-' + id + '" src="http://player.vimeo.com/video/' + id + '?title=0&byline=0&portrait=0&api=1&player_id=movie-player-iframe-' + id + '" width="287" height="165" frameborder="0"></iframe>');
			this.$div.addClass('movie-player-touch');
		} else {
			this.$iframe = $('<iframe class="movie-player-iframe" id="movie-player-iframe-' + id + '" src="http://player.vimeo.com/video/' + id + '?title=0&byline=0&portrait=0&api=1&player_id=movie-player-iframe-' + id + '" width="485" height="278" frameborder="0"></iframe>');
			this.player = $f(this.$iframe[0]);
			this.player.addEvent('ready', _(this.addEvents).bind(this));

			var $picture = $('<img src="' + picturePath + '"></img>');
			var $pictureContainer = $('<div class="movie-player-picture-container"></div>');
			$pictureContainer.append($picture);
			$pictureContainer.append('<div class="movie-player-play"></div>');
			$pictureContainer.on('click', _(this.onPictureClick).bind(this));
			this.$div.append($pictureContainer);
		}

		// this.$div.append('<div class="movie-player-overlay"></div>');
		this.$div.append(this.$iframe);
	},

	remove: function() {
		this.$div.html('');
		this.$div.removeClass('movie-player');
		this.$div.removeClass('movie-player-active');
		this.$div.off('click');
	},

	addEvents: function() {
		this.player.addEvent('play',   _(this.onPlay).bind(this));
		this.player.addEvent('pause',  _(this.onPause).bind(this));
		this.player.addEvent('finish', _(this.onPause).bind(this));
	},

	onPlay: function() {
		this.$div.addClass('movie-player-active');
	},

	onPause: function() {
		this.$div.removeClass('movie-player-active');
	},

	onPictureClick: function() {
		// this.player.api('seekTo', 0);
		this.player.api('play');
		return false;
	}
};

module.exports = function(client) {
	client.PageBlog = function() { return this.init.apply(this, arguments); };
	client.PageBlog.prototype = {
		type: 'PageBlog',

		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $div;

			$('.main-wrapper').addClass('main-wrapper-blog');

			this.$blog = $('<article class="blog"></article>');
			this.$blog.html(this.blogHTML.join(''));
			this.$div.append(this.$blog);

			this.robotUI = new applet.UI(this.$blog.find('.blog-robots-example'), {hideTabs: true});
			var robotText = 'while(!robot.detectGoal()) {\n  robot.turnLeft();\n  while(robot.detectWall()) {\n    robot.turnRight();\n  }\n  robot.drive(1);\n}';
			this.robotEditor = this.robotUI.addEditor({text: robotText});
			this.robotUI.loadOutputs({ robot: {enabled: true, state: '{"columns": 5, "rows": 5, "initialX": 2, "initialY": 4, "initialAngle": 90, "mazeObjects": 17, "verticalActive": [[false,false,false,false,false],[false,true,true,false,false],[true,false,false,false,false],[false,true,false,false,true],[false,true,true,true,false]], "horizontalActive": [[false,false,false,false,false],[false,false,true,true,true],[false,true,true,true,true],[false,true,false,false,false],[false,false,false,false,false]], "blockGoal": [[false,false,false,false,false],[false,false,false,false,false],[true,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]] }' }, math: {enabled: true} });
			this.robotUI.selectTab('robot');

			var mp1 = new MoviePlayer(this.$blog.find('.movie-games-1'), '/img/blog/fr-manipulation-small.png', 62291930);
			var mp2 = new MoviePlayer(this.$blog.find('.movie-games-2'), '/img/blog/fr-time-small.png', 62319512);
			var mp3 = new MoviePlayer(this.$blog.find('.movie-games-3'), '/img/blog/fr-time-highlighting-small.png', 62319511);
			var mp4 = new MoviePlayer(this.$blog.find('.movie-games-4'), '/img/blog/fr-stepping-small.png', 62319510);

			this.collection = new dares.Collection(this, this.$blog.find('.blog-collection'));

			this.$blog.find('.blog-about').on('click', _(function() { this.delegate.navigateTo('/about'); return false; }).bind(this));

			this.$blog.find('.blog-intro-example-buttons-movie').on('click', _(this.showMovie).bind(this));
			this.$blog.find('.blog-intro-example-buttons-game').on('click', _(this.showGame).bind(this));

			if ('ontouchstart' in document.documentElement) {
				this.$blog.find('.blog-intro-example').addClass('blog-intro-example-touch');
			}

			var $mazeLink = this.$blog.find('.blog-dares-maze');
			var $mazeArrow = this.$blog.find('.blog-arrow-maze');
			$mazeLink.on('click', function() { $mazeArrow.removeClass('arrow-animate'); window.setTimeout(function() { $mazeArrow.addClass('arrow-animate'); }, 0); return false; });
			$mazeLink.on('mouseenter', function() { $mazeArrow.addClass('arrow-active'); });
			$mazeLink.on('mouseleave', function() { $mazeArrow.removeClass('arrow-active arrow-animate'); });

			var $animalLink = this.$blog.find('.blog-dares-animal');
			var $animalArrow = this.$blog.find('.blog-arrow-animal');
			$animalLink.on('click', function() { $animalArrow.removeClass('arrow-animate'); window.setTimeout(function() { $animalArrow.addClass('arrow-animate'); }, 0); return false; });
			$animalLink.on('mouseenter', function() { $animalArrow.addClass('arrow-active'); });
			$animalLink.on('mouseleave', function() { $animalArrow.removeClass('arrow-active arrow-animate'); });

			var $collaborate = this.$blog.find('.blog-collaborate');
			$collaborate.attr('href', $collaborate.attr('href') + 'res.com');

			this.introMoviePlayer = $f(this.$blog.find('.blog-intro-example-movie-iframe')[0]);

			this.showMovie();
			this.updateCollection();
		},

		remove: function() {
			this.$blog.remove();
			$('.main-wrapper').removeClass('main-wrapper-blog');
		},

		showMovie: function() {
			this.$blog.find('.blog-intro-example').removeClass('blog-intro-example-active-game');
			this.$blog.find('.blog-intro-example').addClass('blog-intro-example-active-movie');

			if (this.exampleUI) {
				this.exampleUI.remove();
				this.exampleUI = null;
			}
		},

		showGame: function() {
			if (this.exampleUI) return;

			this.introMoviePlayer.api('pause');

			this.$blog.find('.blog-intro-example').removeClass('blog-intro-example-active-movie');
			this.$blog.find('.blog-intro-example').addClass('blog-intro-example-active-game');

			this.exampleUI = new applet.UI(this.$blog.find('.blog-intro-example-game'), {hideTabs: true});
			var exampleText = '// Adapted from billmill.org/static/canvastutorial\n// This code is still relatively complicated -- if you\n// can come up with a nice game for on the front page\n// which is fun, simple, and shows off the capabilities\n// of the interface, then contact me at jp@jsdares.com :)\n\nvar context = canvas.getContext("2d");\n\nvar bricks = [];\nvar paddleWidth, paddleHeight, bricksNumX, bricksNumY;\nvar brickWidth, brickHeight, brickMargin, paddleX;\nvar ballX, ballY, ballVx, ballVy, ballDirx, ballDiry;\nvar restart = true;\n\nfor (var y=0; y<20; y++) {\n  bricks[y] = [];\n  for (var x=0; x<20; x++) {\n    bricks[y][x] = true;\n  }\n}\n\nfunction setValues() {\n  paddleWidth = 80;\n  paddleHeight = 12;\n  bricksNumX = 7;\n  bricksNumY = 5;\n  brickWidth = canvas.width / bricksNumX;\n  brickHeight = 20;\n  brickMargin = 4;\n  ballVx = 7;\n  ballVy = 12;\n}\n\nfunction init() {\n  restart = false;\n  paddleX = canvas.width/2;\n  ballX = 40;\n  ballY = 150;\n  ballDirx = 1;\n  ballDiry = 1;\n  for (var y=0; y<13; y++) {\n    for (var x=0; x<13; x++) {\n      bricks[y][x] = true;\n    }\n  }\n}\n\nfunction clear() {\n  context.clearRect(0, 0, canvas.width, canvas.height);  \n}\n\nfunction circle(x, y) {\n  context.beginPath();\n  context.arc(x, y, 10, 0, 2*Math.PI);\n  context.fill();\n}\n\nfunction drawPaddle() {\n  var x = paddleX - paddleWidth/2;\n  var y = canvas.height - paddleHeight;\n  context.fillRect(x, y, paddleWidth, paddleHeight);\n}\n\nfunction mouseMove(event) {\n  paddleX = event.layerX;\n}\n\nfunction hitHorizontal() {\n  if (ballX < 0) {\n    ballDirx = -ballDirx;\n  } else if (ballX >= canvas.width) {\n    ballDirx = -ballDirx;\n  }\n}\n\nfunction hitVertical() {\n  if (ballY < 0) {\n    ballDiry = -ballDiry;\n  } else if (ballY < brickHeight*bricksNumY) {\n    var bx = Math.floor(ballX/brickWidth);\n    var by = Math.floor(ballY/brickHeight);\n    \n    if (bx >= 0 && bx < bricksNumX) {\n      if (bricks[by][bx]) {\n        bricks[by][bx] = false;\n        ballDiry = -ballDiry;\n      }\n    }\n  } else if (ballY >= canvas.height-paddleHeight) {\n    var paddleLeft = paddleX-paddleWidth/2;\n    var paddleRight = paddleX+paddleWidth/2;\n    if (ballX >= paddleLeft && ballX <= paddleRight) {\n      ballDiry = -ballDiry;\n    } else {\n      restart = true;\n      return false;\n    }\n  }\n  return true;\n}\n\nfunction drawBricks() {\n  for (var by=0; by<bricksNumY; by++) {\n    for (var bx=0; bx<bricksNumX; bx++) {\n      if (bricks[by][bx]) {\n        var x = bx * brickWidth + brickMargin/2;\n        var y = by * brickHeight + brickMargin/2;\n        var width = brickWidth - brickMargin;\n        var height = brickHeight - brickMargin;\n        context.fillRect(x, y, width, height);\n      }\n    }\n  }\n}\n\nfunction tick() {\n  if (restart) {\n    init();\n    return;\n  }\n  setValues();\n  clear();\n  drawPaddle();\n  \n  ballX += ballVx*ballDirx;\n  ballY += ballVy*ballDiry;\n  \n  hitHorizontal();\n  if (hitVertical()) {\n    circle(ballX, ballY);\n    drawBricks();\n  } else {\n    clear();\n  }\n}\n\ncanvas.onmousemove = mouseMove;\nwindow.setInterval(tick, 30);';
			this.exampleEditor = this.exampleUI.addEditor({text: exampleText});
			this.exampleUI.loadOutputs({ canvas: {enabled: true}, events: {enabled: true, mouseObjects: ['canvas']}, math: {enabled: true} });
			this.exampleUI.selectTab('canvas');
		},

		updateCollection: function() {
			this.delegate.getSync().getCollectionAndDaresAndInstances('5009684ce78955fbcf405844', _(function(content) {
				this.collection.update(content, this.delegate.getUserId(), this.delegate.getAdmin());
			}).bind(this));
		},

		navigateTo: function(splitUrl) {
			if (splitUrl[0] === 'dare' || splitUrl[0] === 'edit') {
				if (this.exampleUI) {
					this.exampleEditor.disable();
				}
			} else {
				if (this.exampleUI) {
					this.exampleEditor.enable();
				}
				this.updateCollection();
			}
		},

		viewDare: function(_id) {
			this.delegate.navigateTo('/blindfold/dare/' + _id);
		},

		editDare: function(_id) {
			this.delegate.navigateTo('/blindfold/edit/' + _id);
		},

		blogHTML: [
			'<div class="blog-box blog-intro">',
			'<h1>Peeking through<br/><span class="victor">Bret Victor&rsquo;s</span> blindfold</h1>',
			'<p><em>&ldquo;Maybe we don&rsquo;t need a silver bullet. We just need to take off our blindfolds to see where we&rsquo;re firing.&rdquo;</em></p>',
			'<p>With these words Bret Victor ends his awe-inspiring essay <a href="http://worrydream.com/LearnableProgramming">Learnable Programming</a>, referring to the fact that programming tools barely give any visual insight in the behaviour of the code. His main point is that in order to make programming understandable, we should change <em>programming itself</em>. Programming languages should be designed for humans, not for machines. Programming tools should be designed for creating and understanding programs.</p>',
			'<p>In his essay, Bret Victor presents a coherent set of interactions designed around these ideas, aimed in particular at learning programming. However, his work is largely prototypical, and leaves one question wide open:</p>',
			'<p><strong>How are we going to implement such a <a href="http://worrydream.com">Victorian</a> programming environment?</strong></p>',
			'<p>So, here&rsquo;s an attempt:</p>',
			'<div class="blog-intro-example">',
			'<div class="blog-intro-example-movie"><iframe class="blog-intro-example-movie-iframe" id="blog-intro-example-movie-iframe" src="http://player.vimeo.com/video/62745777?title=0&byline=0&portrait=0&api=1&player_id=blog-intro-example-movie-iframe" width="1100" height="630" frameborder="0"></iframe></div>',
			'<div class="blog-intro-example-game"></div>',
			'<div class="blog-intro-example-buttons"><span class="blog-intro-example-buttons-movie"><i class="icon icon-white icon-film"></i> Video</span><span class="blog-intro-example-buttons-game"><i class="icon icon-white icon-star" style="margin-top: 1px"></i> Game</span></div>',
			'</div>',
			'<p>I am presenting a programming environment designed for creating and understanding programs. The focus of the design is on <strong>learning programming</strong>, with tools that visualise the behaviour of programs, reinforce the connection between the code and its output, and encourage tinkering. It currently runs a stripped-down version of Javascript<span class="blog-star">*</span><span class="blog-sidenote">* I&rsquo;ve tried to contain some of Javascript&rsquo;s bad parts by writing a <a href="http://www.eric.ed.gov/ERICWebPortal/search/detailmini.jsp?_nfpb=true&_&ERICExtSearch_SearchValue_0=ED388228&ERICExtSearch_SearchType_0=no&accno=ED388228">sub-language</a> called <strong>js--</strong>. Overall though I&rsquo;ve taken a <a href="http://osteele.com/posts/2004/11/ides">tools first</a> approach.</span>, but it is designed to support any programming language.',
			'<p>Around this programming environment I&rsquo;ve built an educational platform called <strong>jsdares</strong>, for &ldquo;Javascript dares&rdquo;. On this platform, anyone can write programming puzzles, which students can solve by writing programs.</p>',
			'<p>The educational part of jsdares is designed in tandem with the programming environment, to give a cohesive experience for learning programming. Students start out with simple tasks, such as driving a robot through a maze. Then they advance to more complicated puzzles, such as painting an image on the screen in as few lines of code as possible. The goal for them is learning to make simple games.</p>',
			'<p>In this article, I&rsquo;ll show some of the ideas used in jsdares, and how they are implemented. At the end we&rsquo;ll look at bringing Victorian programming to mainstream software development.</p>',
			'</div>',
			'<div class="blog-box blog-games">',
			'<img src="/img/blog/ani.gif" class="blog-games-ani">',
			'<a name="games"></a>',
			'<h2>Games!</h2>',
			'<p>From years of volunteering at a <a href="http://stichting-scn.nl">youth hackerspace</a>, I&rsquo;ve learned one thing: kids love making games!<span class="blog-star">*</span><span class="blog-sidenote">* Pro-tip: not only kids love making games.</span> Therefore jsdares has been designed with the goal of teaching how to make simple games. <em>What is cooler than knowing you are soon able to create games?</em></p>',
			'<p>In order to build an environment that supports creating and understanding games, I have basically taken the Victorian ideas from Learnable Programming, and implemented them. Let&rsquo;s look at some of those ideas.</p>',
			'<div class="movie-games-1" style="margin-top: 8px"></div>',
			'<p><strong>Immediate connection.</strong> On the left side of the screen a game runs. On the right side of the screen the code driving that game is shown. Whenever the code is changed, even one character, the game immediately runs the new code. No compiling, linking, or publishing. The game even continues running while changing the code.</p>',
			'<p>In small-scale field trials, I&rsquo;ve found that even children who had never touched any code in their lives, started playing it straight away. <em>Is programming really that easy?</em> To facilitate playing with the code, students can drag numbers from left to right to change them.</p>',
			'<div class="movie-games-2" style="margin-top: 8px"></div>',
			'<p><strong>Manipulating time.</strong> To understand how a program works, students must be able to see what happens at a single point in time. Therefore, time can be paused and rewinded. When time is paused, the code can be inspected more thoroughly. Hovering over an element in the canvas shows which line of code has drawn that item, and vice versa.</p>',
			'<p>Traditionally, a student would have to simulate how a program works in her head. <em>This was drawn here, that there.</em> This should not be necessary. Computers can just <em>show</em> us how programs work.</p>',
			'<div class="movie-games-3" style="margin-top: 2px"></div>',
			'<p><strong>Abstracting over time.</strong> Inspecting a single point in time is powerful, but time consists of many subsequent points. A Victorian idea is to visualise what happens at each of these points at once. Clicking on a bar next to a function reveals what is drawn by that function over time.</p>',
			'<p>Of course, it is still possible to change the program. When doing that, the program is re-run for the last couple of seconds. This way, students can discover how the program behaves over time.</p>',
			'<div class="movie-games-4" style="margin-top: 18px"></div>',
			'<p><strong>Following the flow.</strong> Sometimes programs have to be inspected in detail to understand how they work. Traditional environments already allow programmers to go through a program step by step, which means that they don&rsquo;t have to simulate everything in their heads. However, usually only stepping forward is allowed, making it impossible to skip back a few steps, to check what happened before.</p>',
			'<p>In jsdares, a bar is shown at the bottom of the programming environment, which allows students to jump to any step in the program. By moving the mouse they can skip back and forth through the program. At each step the programming environment shows exactly what happened.</p>',
			'<div class="blog-line"></div>',
			'<p>The programming environment has to store a lot of data to make these interactions work.<span class="blog-star">*</span><span class="blog-sidenote">* This is similar to the <a href="http://www.lambdacs.com/debugger/">Omniscient Debugger</a>, which provides a visual interface to effectively track down bugs in multi-threaded programs.</span> It is possible to visualise a lot more with all this data. For example, instead of showing circles we could show variable contents and thumbnails of shapes on the canvas, as suggested in Learnable Programming. Experimenting with different visualisations should reveal which ones support creation and discovery best.</p>',
			'<p>Even though my implementation only works with simple games, it shows that it is actually possible to implement Victorian interactions in a real-world context. In fact, the canvas on the left is a <a href="https://developer.mozilla.org/nl/docs/HTML/Canvas">standard web component</a>, which has only been slightly modified to support these interactions. A good start to bringing Victorian programming to the world would be to adapt more web components like this.</p>',
			'</div>',
			'<div class="blog-robots-example"></div>',
			'<div class="blog-box blog-robots">',
			'<a name="robots"></a>',
			'<h2>Robots!</h2>',
			'<p>Learning how to make games is awesome, that goes without saying. However, the standard canvas component used for drawing shapes is not that easy to use. In order to just draw a circle one has to select a &ldquo;drawing context&rdquo;, create a path, draw shapes on that path, close the path, and fill the path. When learning programming for the first time, users should be able to jump in right away.</p>',
			'<p>A particularly successful method for teaching basic programming has been invented by Seymour Papert. In his landmark book <a href="http://books.google.nl/books/about/Mindstorms.html?id=HhIEAgUfGHwC">Mindstorms: Children, Computers, and Powerful Ideas</a>, he describes how children learn to program robots, called <em>turtles</em>. Papert found that children easily relate to these robots, by physically imitating how they drive forward, turn left, drive again, and so on. They <em>feel</em> what is going on.</p>',
			'<p>Another advantage of using robots is that many students are already familiar with them. This is because nowadays many schools teach robot classes, using <a href="http://mindstorms.lego.com">LEGO Mindstorms</a>.</p>',
			'<p>In jsdares I&rsquo;ve implemented this idea in the form of a robot maze. The robot can be driven around the maze with simple commands, such as driving, turning, and detecting walls. The goal is to drive the robot to the green square.</p>',
			'<p>A maze is a familiar kind of puzzle, and leaves lots of room for creativity. When learning more about programming, students can revisit already completed mazes with even smarter solutions.</p>',
			'<img src="/img/blog/mindstorms-small.png" class="blog-robots-mindstorms">',
			'<p>When removing all the walls, students can drive the robot around to make pretty shapes, just as with Papert&rsquo;s original turtles. These could drive around on sheets of paper, with a pen attached to it. Papert has shown that even complex mathematical ideas such as differential equations can be discovered naturally by driving around robots to create shapes.',
			'<p>Of course, all the Victorian interactions work with the robot as well. Even interactive programs involving time can be inspected in the same way as with the canvas.</p>',
			'</div>',
			'<a name="dares"></a>',
			'<div class="blog-box blog-dares">',
			'<div class="blog-collection-container"><div class="blog-collection"></div><div class="arrow arrow-left blog-arrow-maze"><div class="arrow-head"></div><div class="arrow-body"></div></div><div class="arrow arrow-left blog-arrow-animal"><div class="arrow-head"></div><div class="arrow-body"></div></div></div>',
			'<h2>Dares!</h2>',
			'<p>Novice students need to learn a lot of concepts, such as functions, variables, loops, and so on. I believe that formally explaining these concepts is boring and largely unnecessary. Students are perfectly capable of discovering these ideas on their own, given the right tools and incentives.</p>',
			'<p>I have thought of a way to teach a concept like &ldquo;functions&rdquo;. Each puzzle, or &ldquo;dare&rdquo;, has a maximum number of lines that the program can have, similarly to <a href="http://codegolf.com/">Code Golf</a>. By lowering this maximum we can force students to find ways of shortening the program. And by using functions in the example programs, we show students the syntax of functions, which they can then copy.</p>',
			'<p>For example, in the <a href="#" class="blog-dares-maze arrow-link">Maze dare</a> we have already filled in part of the program with an example of a function, which the student needs to complete. In the next dare, we provide no example, and we lower the maximum number of lines so that students have to figure out some way of keeping the program short. This is a natural way of discovering how to use functions. My field trials support this, as most students had no problems learning about functions this way, with no instruction whatsoever.</p>',
			'<p>The danger of using program length as a scoring tool is that it becomes an incentive for writing obfuscated programs. I have taken some measures against this, such as not counting empty lines, and forcing newlines between statements. Limiting program length works pretty well, but there are also many variations that could be tried, such as a maximum number of loops allowed, only allowing certain statements, or limiting the total number of steps.</p>',
			'<p><span class="blog-sidenote" style="margin-top: 22px">When actually learning how to make games an automated grading system will not be desirable. I believe it is better to stop testing and trust on students&rsquo; creativity. Peer reviewing may help to learn students write better code.</span>Scoring the robot dares is simple. The robot needs to visit enough green squares to complete the dare, or some more for bonus points. But it gets more complicated when transitioning to making games. Students learn about the <a href="#" class="blog-dares-animal arrow-link">canvas</a> by copying the provided images on the canvas. They must match 95% of the original image, which is visualised by overlaying the original image with red and green pixels when submitting the solution.</p>',
			'</div>',
			'<div class="blog-box blog-disruption">',
			'<a name="disruption"></a>',
			'<h2>Disruption!</h2>',
			'<div class="blog-disruption-left">',
				'<p>Bret Victor points out that we should not ask ourselves how his ideas apply to real-world programming, but rather how we can redesign programming itself to become inherently visualisable. Still, we live in a world in which there are widely used programming languages and tools. <strong>What is the path we need to take for a better world?</strong></p>',
				'<p>I&rsquo;ve consciously chosen to work on education, based on the ideas of <a href="http://www.claytonchristensen.com/">Clayton Christensen</a> of disruptive innovation. This is <em>&ldquo;a process by which a product or service takes root initially in simple applications at the bottom of a market and then relentlessly moves up market, eventually displacing established competitors.&rdquo;</em> A disruptive innovation <em>&ldquo;allows a whole new population of consumers at the bottom of a market access to a product or service.&rdquo;</em></p>',
			'</div>',
			'<div class="blog-disruption-right">',
				'<p><strong>Here is what we need to do.</strong> We need to apply Victorian programming to a &ldquo;low-end&rdquo; domain, such as programming education. Since programs of novices are small, we can get away with inefficiencies, and do not have to support large existing codebases. Building an online platform allows students who are not receiving formal education to learn in a better way than they would traditionally, such as by reading tutorials.</p>',
				'<p>Gradually these Victorian programming tools will get better, and they will become more capable of handling real-world projects. At the same time, more and more students will learn this way, and they will start building real-world projects using Victorian programming. It will slowly take over, until after a while it is <em>so much better</em>, that people will switch over completely. That is what we should be aiming for, and jsdares is just a small step into that direction.</p>',
			'</div>',
			'</div>',
			'<div class="blog-box blog-now-what">',
			'<a name="now-what"></a>',
			'<h2>Now what?</h2>',
			'<p>With jsdares I want to show that it is possible to implement Bret Victor&rsquo;s ideas about programming in a real-world environment. Now we should create a larger ecosystem of Victorian programming tools. There are already projects out there that we can use, such as IDEs, editors, and languages. We should also adapt components to support interactions such as rewinding and replaying time.</p>',
			'<p>I have focused on education, but there are more domains in which Victorian programming can be implemented relatively easily, such as spreadsheets, artistic programming, markup languages, and software prototyping. We can extract components from jsdares for reuse in other projects.</p>',
			'<p>To me, education is close to my heart. It would be great to keep improving jsdares, especially since there is a <a href="https://github.com/janpaul123/jsdares/issues">huge backlog</a> of exciting ideas.</p>',
			'<p>I would love to <a href="mailto:jp@jsda" class="blog-collaborate">collaborate</a> with anyone who&rsquo;s prepared to invest time into bringing Victorian interactions to real-world programming.</p>',
			'<div class="blog-line"></div>',
			'<p>As physicist Max Plank said, <em>&ldquo;A new scientific truth does not triumph by convincing its opponents and making them see the light, but rather because its opponents eventually die, and a new generation grows up that is familiar with it.&rdquo;</em></p>',
			'<p>We should not blindfold the next generation of programmers.</p>',
			'</div>',
			'<div class="blog-box blog-author">',
			'<p>Huge thanks to Arno van der Vegt, Mark IJbema, Jens Kanis, Martijn Russchen, Frans Schreuder, Martin Nørgaard Gregersen, and Femke Hoornveld for their helpful comments. Thanks again to the authors of <a href="/about" class="blog-about">libraries</a>, sources of <a href="/about" class="blog-about">inspiration</a>, and those who contributed to my <a href="http://thesis.jsdares.com">thesis</a>.</p>',
			'<div class="blog-line"></div>',
			'<a href="http://twitter.com/janpaul123" class="btn janpaul123"><img src="https://en.gravatar.com/userimage/7626980/caf975f52288bcac2b54655d45a48ea0.jpeg"/><span><i class="icon icon-twitter-blue"></i> @JanPaul123</span></a>',
			'<p><em><a href="http://janpaulposma.nl">Jan Paul Posma</a> is a programmer, teacher at a <a href="http://stichting-scn.nl">youth hackerspace</a>, and devout Victorian. When not working on programming interfaces, he&rsquo;s curbing misinformation at <a href="http://factlink.com">Factlink</a>, and improving education at <a href="http://versal.com">Versal</a>.</em></p>',
			'<p>April 2013. Code: <a href="http://en.wikipedia.org/wiki/MIT_License">MIT license</a>. Text and videos: <a href="http://creativecommons.org/licenses/by/3.0/deed.en_GB">CC BY 3.0</a>.</p>',
			'</div>'
		]
	};
};