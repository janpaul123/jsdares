# widget
widget: widget/js/browser.js widget/css/style.css widget/js/jquery.ui.colorPicker.js

widget/js/browser.js: browser.js
	cp browser.js widget/js/browser.js

widget/css/style.css: style.css
	cp style.css widget/css/style.css

browser.js: cli-widget.js */*.js jsmm/jsmmparser.js
	$(MAKE) test
	node_modules/.bin/browserify cli-widget.js -d -o browser.js

style.css: cli-widget.less global.less */*.less bootstrap/less/*.less
	node_modules/.bin/lessc cli-widget.less > style.css

# color picker
colorpicker/jquery.ui.colorPicker.js: colorpicker/jquery.ui.colorPicker.coffee
	node_modules/.bin/coffee -c colorpicker/jquery.ui.colorPicker.coffee

widget/js/jquery.ui.colorPicker.js: colorpicker/jquery.ui.colorPicker.js
	cp colorpicker/jquery.ui.colorPicker.js widget/js/jquery.ui.colorPicker.js

# back end
jsmm/jsmmparser.js: jsmm/jsmmparser.jison
	cd jsmm; ../node_modules/.bin/jison jsmmparser.jison

test: srv-test.js jsmm/jsmmparser.js jsmm/*.js
	node srv-test.js

clean:
	rm widget/js/browser.js browser.js jsmm/jsmmparser.js

.PHONY: clean test widget