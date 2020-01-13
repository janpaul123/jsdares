# jsdares [![Dependency Status](https://gemnasium.com/janpaul123/jsdares.svg)](https://gemnasium.com/janpaul123/jsdares)

[jsdares](http://www.jsdares.com) is an experimental learning environment, created by [Jan Paul Posma](http://www.janpaulposma.nl) for a masters dissertation at the [University of Oxford](http://www.cs.ox.ac.uk). The code is available under the [MIT license](http://opensource.org/licenses/MIT).

## Features
- Collaborative platform for anyone to create and solve programming puzzles: "dares".
- Custom parser for a subset of Javascript: "js--".
- Runtime that saves *everything*, and allows moving through the program execution with ease, inspired by [Omniscient Debugger](https://github.com/OmniscientDebugger/LewisOmniscientDebugger).
- Advanced interface for making games that allows going back in time, visualises how the code maps to the output, and makes it easy to tinker with the code, inspired by [Bret Victor](http://www.worrydream.com).
- Robot environment for learning the basics of programming, based on the [Logo turtle](http://el.media.mit.edu/logo-foundation) and [Karel the Robot](http://karel.sourceforge.net).
- Canvas and console environments based on the standard browser components.
- Extensive set of code examples.
- Basic set of dares which challenge learners to make shorter programs using the concepts they are learning, inspired by [Code Golf](http://codegolf.com/).
- Cohesively designed experience.

## Installation
1. Install dependencies: `npm install`.
2. Run grunt: `node_modules/.bin/grunt`.
3. Done! Serve using some webserver, on the root domain.

To load the default dares, register a user with username **janpaul123** and restart the server. Automatically dares will be created for this user, and the user will get admin rights.

## Spinoff projects
- [Clayer](https://github.com/janpaul123/clayer), a direct interaction library based on [BVlayer](http://worrydream.com/Home2011/Script/LayerScript/).
- [Robot](https://github.com/janpaul123/robot), a robot applet based on the robot environment.

## Contributing
PRs and bug reports are always welcome! :)
