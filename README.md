# About
[jsdares](http://www.jsdares.com) is an experimental learning environment, created by [Jan Paul Posma](http://www.janpaulposma.nl) for a masters dissertation at the [University of Oxford](http://www.cs.ox.ac.uk). The code is available under the [MIT license](http://opensource.org/licenses/MIT).

# Features
- Collaborative platform for anyone to create and solve programming puzzles: "dares".
- Custom parser for a subset of Javascript: "js--".
- Runtime that saves *everything*, and allows moving through the program execution with ease, inspired by [Omniscient Debugger](http://www.lambdacs.com/debugger/).
- Advanced interface for making games that allows going back in time, visualises how the code maps to the output, and makes it easy to tinker with the code, inspired by [Bret Victor](http://www.worrydream.com).
- Robot environment for learning the basics of programming, based on the [Logo turtle](http://el.media.mit.edu/logo-foundation) and [Karel the Robot](http://karel.sourceforge.net).
- Canvas and console environments based on the standard browser components.
- Extensive set of code examples.
- Basic set of dares which challenge learners to make shorter programs using the concepts they are learning, inspired by [Code Golf](http://codegolf.com/).
- Cohesively designed experience.

# Installation
1. Install [node.js](http://nodejs.org).
2. Install [mongodb](http://www.mongodb.org).
3. Install dependencies: `npm install`.
4. Start mongodb: `mongod`.
5. Start the jsdares server `node server-entry.js`.
6. Open your webbrowser at `localhost:3000`.
7. Register a user with username **janpaul123**.
8. Restart the server and reload the page.
9. Done!

# Spinoff projects
- [Clayer](https://github.com/janpaul123/clayer), a direct interaction library based on [BVlayer](http://worrydream.com/Home2011/Script/LayerScript/).
- [Robot](https://github.com/janpaul123/robot), a robot applet based on the robot environment.

# Contributing
First of all, reporting [issues](https://github.com/janpaul123/jsdares/issues) and fixing bugs is always great!

Right now the focus is on refactoring the codebase to make it more modular, so we can easily extract components to other projects and integrate new functionality. If you want to use functionality from jsdares in your own project, you can help extracting it. And integrating your own and new functionality into jsdares is of course also very welcome! Just drop me a line at <jp@jsdares.com>.
