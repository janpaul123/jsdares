widget: widget/js/browser.js widget/css/style.css

widget/js/browser.js: browser.js
	cp browser.js widget/js/browser.js

widget/css/style.css: style.css
	cp style.css widget/css/style.css

browser.js: cli-widget.js jsmm/jsmmparser.js jsmm/*.js basiceditor/*.js clayer/*.js
	$(MAKE) test
	node_modules/.bin/browserify cli-widget.js -d -o browser.js

style.css: cli-widget.less basiceditor/basiceditor.less bootstrap/less/*.less
	node_modules/.bin/lessc cli-widget.less > style.css

jsmm/jsmmparser.js: jsmm/jsmmparser.jison
	cd jsmm; ../node_modules/.bin/jison jsmmparser.jison

clean:
	rm widget/js/browser.js browser.js jsmm/jsmmparser.js

test: srv-test.js jsmm/jsmmparser.js jsmm/*.js
	node srv-test.js

.PHONY: clean test widget