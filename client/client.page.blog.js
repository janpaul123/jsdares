/*jshint node:true jquery:true*/
"use strict";

var applet = require('../jsmm-applet');
var dares = require('../dares');

module.exports = function(client) {
	client.PageBlog = function() { return this.init.apply(this, arguments); };
	client.PageBlog.prototype = {
		type: 'PageBlog',

		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $div;

			this.$blog = $('<div class="blog"></div>');
			this.$blog.html(this.blogHTML.join(''));
			this.$div.append(this.$blog);

			this.exampleUI = new applet.UI(this.$blog.find('.blog-intro-example-game'), {hideTabs: true});
			var exampleText = '// Adapted from billmill.org/static/canvastutorial\n// This code is still relatively complicated -- if you\n// can come up with a nice game for on the front page\n// which is fun, simple, and shows off the capabilities\n// of the interface, then contact me at jp@jsdares.com :)\n\nvar context = canvas.getContext("2d");\n\nvar bricks = [];\nvar paddleWidth, paddleHeight, bricksNumX, bricksNumY;\nvar brickWidth, brickHeight, brickMargin, paddleX;\nvar ballX, ballY, ballVx, ballVy, ballDirx, ballDiry;\nvar restart = true;\n\nfor (var y=0; y<20; y++) {\n  bricks[y] = [];\n  for (var x=0; x<20; x++) {\n    bricks[y][x] = true;\n  }\n}\n\nfunction setValues() {\n  paddleWidth = 80;\n  paddleHeight = 12;\n  bricksNumX = 7;\n  bricksNumY = 5;\n  brickWidth = canvas.width / bricksNumX;\n  brickHeight = 20;\n  brickMargin = 4;\n  ballVx = 7;\n  ballVy = 12;\n}\n\nfunction init() {\n  restart = false;\n  paddleX = canvas.width/2;\n  ballX = 40;\n  ballY = 150;\n  ballDirx = 1;\n  ballDiry = 1;\n  for (var y=0; y<13; y++) {\n    for (var x=0; x<13; x++) {\n      bricks[y][x] = true;\n    }\n  }\n}\n\nfunction clear() {\n  context.clearRect(0, 0, canvas.width, canvas.height);  \n}\n\nfunction circle(x, y) {\n  context.beginPath();\n  context.arc(x, y, 10, 0, 2*Math.PI);\n  context.fill();\n}\n\nfunction drawPaddle() {\n  var x = paddleX - paddleWidth/2;\n  var y = canvas.height - paddleHeight;\n  context.fillRect(x, y, paddleWidth, paddleHeight);\n}\n\nfunction mouseMove(event) {\n  paddleX = event.layerX;\n}\n\nfunction hitHorizontal() {\n  if (ballX < 0) {\n    ballDirx = -ballDirx;\n  } else if (ballX >= canvas.width) {\n    ballDirx = -ballDirx;\n  }\n}\n\nfunction hitVertical() {\n  if (ballY < 0) {\n    ballDiry = -ballDiry;\n  } else if (ballY < brickHeight*bricksNumY) {\n    var bx = Math.floor(ballX/brickWidth);\n    var by = Math.floor(ballY/brickHeight);\n    \n    if (bx >= 0 && bx < bricksNumX) {\n      if (bricks[by][bx]) {\n        bricks[by][bx] = false;\n        ballDiry = -ballDiry;\n      }\n    }\n  } else if (ballY >= canvas.height-paddleHeight) {\n    var paddleLeft = paddleX-paddleWidth/2;\n    var paddleRight = paddleX+paddleWidth/2;\n    if (ballX >= paddleLeft && ballX <= paddleRight) {\n      ballDiry = -ballDiry;\n    } else {\n      restart = true;\n      return false;\n    }\n  }\n  return true;\n}\n\nfunction drawBricks() {\n  for (var by=0; by<bricksNumY; by++) {\n    for (var bx=0; bx<bricksNumX; bx++) {\n      if (bricks[by][bx]) {\n        var x = bx * brickWidth + brickMargin/2;\n        var y = by * brickHeight + brickMargin/2;\n        var width = brickWidth - brickMargin;\n        var height = brickHeight - brickMargin;\n        context.fillRect(x, y, width, height);\n      }\n    }\n  }\n}\n\nfunction tick() {\n  if (restart) {\n    init();\n    return;\n  }\n  setValues();\n  clear();\n  drawPaddle();\n  \n  ballX += ballVx*ballDirx;\n  ballY += ballVy*ballDiry;\n  \n  hitHorizontal();\n  if (hitVertical()) {\n    circle(ballX, ballY);\n    drawBricks();\n  } else {\n    clear();\n  }\n}\n\ncanvas.onmousemove = mouseMove;\nwindow.setInterval(tick, 30);';
			this.exampleEditor = this.exampleUI.addEditor({text: exampleText});
			this.exampleUI.loadOutputs({ canvas: {enabled: true}, events: {enabled: true, mouseObjects: ['canvas']}, math: {enabled: true} });
			this.exampleUI.selectTab('canvas');

			this.robotUI = new applet.UI(this.$blog.find('.blog-robots-example'), {hideTabs: true});
			var robotText = 'while(!robot.detectGoal()) {\n  robot.turnLeft();\n  while(robot.detectWall()) {\n    robot.turnRight();\n  }\n  robot.drive(1);\n}';
			this.robotEditor = this.robotUI.addEditor({text: robotText});
			this.robotUI.loadOutputs({ robot: {enabled: true, state: '{"columns": 5, "rows": 5, "initialX": 2, "initialY": 4, "initialAngle": 90, "mazeObjects": 17, "verticalActive": [[false,false,false,false,false],[false,true,true,false,false],[true,false,false,false,false],[false,true,false,false,true],[false,true,true,true,false]], "horizontalActive": [[false,false,false,false,false],[false,false,true,true,true],[false,true,true,true,true],[false,true,false,false,false],[false,false,false,false,false]], "blockGoal": [[false,false,false,false,false],[false,false,false,false,false],[true,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]] }' }, math: {enabled: true} });
			this.robotUI.selectTab('robot');
		},

		remove: function() {
			this.$blog.remove();
		},

		blogHTML: [
			'<div class="blog-box blog-intro">',
			'<h1>Peeking through<br/><span class="victor">Bret Victor&rsquo;s</span> blindfold</h1>',
			'<p><em>&ldquo;Maybe we don&rsquo;t need a silver bullet. We just need to take off our blindfolds to see where we&rsquo;re firing.&rdquo;</em></p>',
			'<p>With these words Bret Victor&rsquo;s ends his awe-inspiring essay <a href="">Learnable Programming</a>, referring to the fact that programming tools barely give any visual insight in the behaviour of the code. In the article, he proposes a number of guidelines for educational programming environments, in addition to his earlier examples in <a href="">Inventing on Principle</a>.</p>',
			'<p>Bret Victor&rsquo;s work is largely prototypical, and leaves one question wide open.<br/><strong>How are we going to implement such a &ldquo;Victorian&rdquo; programming interface?</strong></p>',
			'<p>So, here&rsquo;s an attempt:</p>',
			'<div class="blog-intro-example-game"></div>',
			'<p>After about a year of working on this, I&rsquo;m presenting for the first time a relatively complete implementation of the Victorian ideas, along with some established and some novel ideas. The vehicle for these ideas is <strong>jsdares</strong>, or &ldquo;Javascript dares&rdquo;, best described as a collaborative programming course. Anyone can make programming puzzles, or &ldquo;dares&rdquo;, which students can solve by writing programs. Ultimately, the goal is to learn how to create games.</p>',
			'</div>',
			'<div class="blog-box blog-games">',
			'<h2>Games!</h2>',
			'<img src="/img/blog/ani.gif">',
			'<p>From years of volunteering at a youth hackerspace, I&rsquo;ve learned something: children love making games. Having that as a grand goal when learning programming is hugely motivating. <em>What is cooler than knowing you are soon able to create games?</em></p>',
			'<p>Actually, many Victorian ideas work really well with creating games. Let&rsquo;s look at a few.</p>',
			'<p><strong>Live updating.</strong> The game immediately starts playing on the left side, with the code on the right. When changing the code, the game uses the new code immediately, in real-time. In small-scale field trials, I&rsquo;ve found that even students who had never touched any code in their lives, immediately started playing with values. The game immediately responds to these changes, which is hugely gratifying. <em>Is programming really that easy?</em></p>',
			'<img src="/img/blog/manipulation.png">',
			'<p><strong>Value manipulation.</strong> To facilitate playing with values, I&rsquo;ve implemented value manipulation. When hovering over a line, all the numbers in that line light up, and can easily be changed by dragging the number left or right. Of course, the game responds right away.</p>',
			'<p><strong>Rewinding time.</strong> To understand how a program works, students must be able to see what happens in a single event. By going back in time each individual event can be inspected. When editing the code, the events are then replayed with the new code. This way students can discover what would have happened with the new code, thus gaining insight into the behaviour of a program.</p>',
			'<img src="/img/blog/highlighting.png" style="margin-top: -90px">',
			'<p><strong>Highlighting.</strong> Making a visual connection between the code and its output is vital for understanding what is going on. We should not have to simulate the code in our heads to discover which statement renders which line of output. It should just be there. By hovering over a statement the corresponding element of the canvas is highlighted, and vice versa.</p>',
			'<img src="/img/blog/time.png" style="margin-top: 190px">',
			'<p><strong>Abstracting over time.</strong> Behaviour of games is inherently time-based. The code must contain statements that render the current state, but also statements for transitioning to a new state (the <em>next tick</em>). An example is moving a ball to a new position based on its velocity, or changing its velocity when bouncing off surfaces. This kind of behaviour can be visualised by rendering the parts of the state on top of each other for each new event. Because rendering a state is often separated into methods, I&rsquo;ve made it easy to abstract one such method over time, by clicking a bar next to a method.</p>',
			'<p><strong>Stepping.</strong> Javascript programs are executed sequentially, line by line. Programmers often walk through the code in the same was as a computer does, to understand what is happening. Most programming environments offer a debugger, which allows users to walk through the program step by step, from or to a certain point. Much more useful is to just see the flow of a program, and quickly move through it to discover interesting parts, which can then be inspected in greater detail. I&rsquo;ve implemented a step bar at the bottom, which immediately shows the student a certain step of the program, allowing to quickly move through all steps. By clicking, the bar is fixed in-place, so the student can look at what&rsquo;s happening in greater detail, for example by changing the code to see how it affects the flow. On top of the code, circles representing the flow of execution are drawn, which are instantly updated when changing the code.</p>',
			'<p>In order to do all this, a lot of data needs to be stored, just as with the <a href="">Omniscient Debugger</a>. Only part of what is actually generated is now visualised: when stepping we should show return values, and thumbnails of canvas commands, as suggested in Learnable Programming. We can experiment with different ways of visualising program behaviour using all this data.</p>',
			'<p>For creating games the standard <a href="">HTML5 canvas</a> is used. This means that students learn a real-world vocabulary. They can use what they have learned about the HTML5 canvas immediately in web applications.</p>',
			'</div>',
			'<div class="blog-robots-example"></div>',
			'<div class="blog-box blog-robots">',
			'<h2>Robots!</h2>',
			'<p>Learning how to make games is cool and all, but students have to start somewhere. Also, the HTML5 canvas does not provide an intuitive metaphor for newcomers.</p>',
			'<p>A particularly strong metaphor for learning programming has been described by Seymour Papert. In his landmark book <a href="">Mindstorms: Children, Computers, and Powerful Ideas</a>, he describes how children learn to program physical robots, called turtles. They can easily understand how the commands to drive and rotate work, by relating to the robots.</p>',
			'<p>Today, many schools teach programming classes using <a href="">LEGO Mindstorms</a> robots &mdash; guess where that name came from. So some students may already have some experience with driving around robots.</p>',
			'<p>In jsdares I&rsquo;ve implemented this metaphor in the form of a robot maze. The robot can be driven around the maze with simple commands, by programming in Javascript. The goal is to drive the robot to the green square. For each green square that the robot visits, the student gets points.</p>',
			'<p>Of course, all the tools for better understanding and creating programs work with the robot as well. Even interactive programs which involve time can be inspected in the same way as with the canvas.</p>',
			'</div>',
			'<div class="blog-box blog-points">',
			'<h2>Points!</h2>',
			'<p>When students start out with programming robots, they don&rsquo;t know about loops and functions yet. It&rsquo;s quite hard to introduce these kinds of concepts without some way of explanation on how they work. However, students (especially children) might not be interested in reading lots of instructions.</p>',
			'<p>I&rsquo;ve thought of an incentive to learn about such programming concepts, and to use them. Each dare has a maximum number of lines that the program can have. By lowering this maximum we can force students to find ways of shortening the program. If we introduce concepts such as functions while doing this, we provide a natural way of discovering how to use these to make the program shorter.</p>',
			'<p>In my field trials I&rsquo;ve found that most students have no problem learning about functions completely on their own, with no instruction whatsoever. Many students enjoy the challenge of scoring bonus points, while other prefer to play around in the highly interactive and visual environment.</p>',
			'<p>With the robot maze students get points for visited squares. With the HTML5 canvas, I&rsquo;ve thought of another way of awarding scores: by comparing the student&rsquo;s canvas with the predefined example.</p>',
			'</div>',
			'<div class="blog-box blog-vision">',
			'<h2>Vision!</h2>',
			'<p>Bret Victor points out that we should not ask how to apply his ideas to real-world programming, but rather to change programming. I completely agree with this: we need to change our programming languages, and our programming tools. Still, we live in a world in which there are widely used programming languages, and widely used programming tools. <strong>What is the path we need to take for a better world?</strong></p>',
			'<p>I&rsquo;ve consciously chosen to work on education. This is based on the ideas of <a href="">Clayton Christensen</a> of disruptive innovation. This is <em>&ldquo;a process by which a product or service takes root initially in simple applications at the bottom of a market and then relentlessly moves up market, eventually displacing established competitors.&rdquo;</em> A disruptive innovation <em>&ldquo;allows a whole new population of consumers at the bottom of a market access to a product or service.&rdquo;</em></p>',
			'<p><strong>Here is what we need to do.</strong> We need to apply Victorian programming to a &ldquo;low-end&rdquo; domain, such as programming education. Since programs of novices are small, we can get away with inefficiencies, and do not have to support large existing codebases. Building an online platform allows students who are not receiving formal education to learn in a better way than they would traditionally (e.g. reading tutorials).</p>',
			'<p>When tools for Victorian programming will gradually get better, and more and more students will learn this way, they will start building real-world projects using Victorian programming. Then, at a certain point, it will be so much better than traditional programming, that it will take over completely. That is what we should be aiming for, and jsdares is just a small step into that direction.</p>',
			'</div>',
			'<div class="blog-box blog-now-what">',
			'<h2>Now what?</h2>',
			'<p>It&rsquo;s pretty clear that jsdares is just an example of how to improve programming. We should create a larger ecosystem of tools that work like this. Practically, this means two things: improving jsdares itself further, and using functionality from jsdares in as many other projects as possible.</p>',
			'<p>One problem with improving jsdares further, is that it&rsquo;s currently a big pile of technical debt. It started out as a prototypical research project, and needs quite a bit of work to get into shape again before some serious collaboration can take place. Still, there is a huge backlog of ideas and improvements &mdash; even many simple Victorian interactions have not yet been implemented.</p>',
			'<p>My preference would be to extract pieces from jsdares step-by-step, for inclusion in other projects. This would also help with refactoring jsdares itself in order to improve and experiment further with it.</p>',
			'<p>It would be amazing if there are any companies or individuals out there who would like to put some time into extracting components. I would love to work with anyone who&rsquo;s prepared to invest time into bringing Victorian interactions to real-world programming.</p>',
			'<p>As physicist Max Plank said, <em>&ldquo;A new scientific truth does not triumph by convincing its opponents and making them see the light, but rather because its opponents eventually die, and a new generation grows up that is familiar with it.&rdquo;</em></p>',
			'<p>We should not blindfold the next generation of programmers.</p>',
			'<p><em>Jan Paul Posma is a programmer, teacher at a youth hackerspace, and devout Victorian. When not working on educational programming interfaces, he&rsquo;s busy curbing misinformation at Factlink, and improving the way we learn in general at Versal.</em></p>'
		]
	};
};