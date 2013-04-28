/*jshint node:true*/
"use strict";

var editor = {};

require('./editor.code')(editor);
require('./editor.editables')(editor);
require('./editor.surface')(editor);
require('./editor.toolbar')(editor);
require('./editor.stepbar')(editor);
require('./editor.editor')(editor);

module.exports = editor;