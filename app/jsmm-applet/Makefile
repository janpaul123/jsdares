all: colorpicker/jquery.ui.colorPicker.js jsmm/jsmmparser.js test

# color picker
colorpicker/jquery.ui.colorPicker.js: colorpicker/jquery.ui.colorPicker.coffee
	node_modules/.bin/coffee -c colorpicker/jquery.ui.colorPicker.coffee

# back end
jsmm/jsmmparser.js: jsmm/jsmmparser.jison
	cd jsmm; ../../node_modules/.bin/jison jsmmparser.jison

test: test.js jsmm/jsmmparser.js jsmm/*.js
	node test.js

clean:
	rm jsmm/jsmmparser.js

.PHONY: all clean test

	#"nomnom"         : "0.4.3",
    #"reflect"        : "0.0.2",
    #"JSONSelect"     : "0.4.0"