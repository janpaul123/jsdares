dev:
	node_modules/.bin/supervisor server-dev.js

all: assets-dev home

# assets-dev
assets-dev: assets-dev/js/browser.js assets-dev/css/style.css assets-dev/js/jquery.ui.colorPicker.js

assets-dev/js/browser.js: browser.js
	cp browser.js assets-dev/js/browser.js

assets-dev/css/style.css: style.css
	cp style.css assets-dev/css/style.css

browser.js: cli-assets-dev.js dares/*.js jsmm-applet/*.js jsmm-applet/*/*.js jsmm-applet/*/*.jison jsmm-applet/*/*.coffee
	cd jsmm-applet && $(MAKE) && cd ..
	node_modules/.bin/browserify cli-assets-dev.js -d -o browser.js

style.css: cli-assets-dev.less dares/*.less jsmm-applet/*.less jsmm-applet/*/*.less bootstrap/less/*.less
	node_modules/.bin/lessc cli-assets-dev.less > style.css

# home
home: home/home.css

home/home.css: home/*.less
	node_modules/.bin/lessc home/home.less > home/home.css	

# color picker
assets-dev/js/jquery.ui.colorPicker.js: browser.js jsmm-applet/colorpicker/jquery.ui.colorPicker.js
	cp jsmm-applet/colorpicker/jquery.ui.colorPicker.js assets-dev/js/jquery.ui.colorPicker.js

clean:
	rm -f assets-dev/js/browser.js browser.js style.css assets-dev/css/style.css
	cd jsmm-applet && $(MAKE) clean && cd ..

# deploy
deploy: assets-dev home
	rm -rf deploy
	cp -r home deploy
	cp -r assets-dev deploy/super-secret-preview
	node_modules/.bin/browserify cli-assets-dev.js -o production.js
	node_modules/.bin/uglifyjs -o deploy/super-secret-preview/js/browser.js production.js

.PHONY: clean assets-dev home deploy dev