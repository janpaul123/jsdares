all: widget home

# widget
widget: widget/js/browser.js widget/css/style.css widget/js/jquery.ui.colorPicker.js

widget/js/browser.js: browser.js
	cp browser.js widget/js/browser.js

widget/css/style.css: style.css
	cp style.css widget/css/style.css

browser.js: cli-widget.js dares/*.js jsmm-applet/*.js jsmm-applet/*/*.js jsmm-applet/*/*.jison jsmm-applet/*/*.coffee
	cd jsmm-applet && $(MAKE) && cd ..
	node_modules/.bin/browserify cli-widget.js -d -o browser.js

style.css: cli-widget.less dares/*.less jsmm-applet/*.less jsmm-applet/*/*.less bootstrap/less/*.less
	node_modules/.bin/lessc cli-widget.less > style.css

# home
home: home/home.css

home/home.css: home/*.less
	node_modules/.bin/lessc home/home.less > home/home.css	

# color picker
widget/js/jquery.ui.colorPicker.js: browser.js jsmm-applet/colorpicker/jquery.ui.colorPicker.js
	cp jsmm-applet/colorpicker/jquery.ui.colorPicker.js widget/js/jquery.ui.colorPicker.js

clean:
	rm widget/js/browser.js browser.js style.css widget/css/style.css

# deploy
deploy: widget home
	rm -rf deploy
	cp -r home deploy
	cp -r widget deploy/super-secret-preview
	node_modules/.bin/browserify cli-widget.js -o production.js
	node_modules/.bin/uglifyjs -o deploy/super-secret-preview/js/browser.js production.js

.PHONY: clean widget home deploy