widget/js/browser.js: browser.js widget/css/basiceditor.css
	cp browser.js widget/js/browser.js

widget/css/basiceditor.css: basiceditor/basiceditor.css
	cp basiceditor/basiceditor.css widget/css/basiceditor.css

browser.js: cli-widget.js jsmm/jsmmparser.js jsmm/*.js basiceditor/*.js
	make test
	node_modules/.bin/browserify cli-widget.js -d -o browser.js

jsmm/jsmmparser.js: jsmm/jsmmparser.jison
	cd jsmm; ../node_modules/.bin/jison jsmmparser.jison

clean:
	rm widget/js/browser.js browser.js jsmm/jsmmparser.js

test: srv-test.js jsmm/jsmmparser.js jsmm/*.js
	node srv-test.js

.PHONY: clean test