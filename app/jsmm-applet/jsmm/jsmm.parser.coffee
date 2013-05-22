#jshint node:true
"use strict"
module.exports = (jsmm) ->
  jsmm.parser = require("./jsmmparser").parser
  jsmm.parser.yy = {}
  jsmm.parser.yy.nodes = jsmm.nodes
  
  # function used by the parser to throw errors
  # also used below by catching tokenizer errors
  jsmm.parser.yy.parseError = (errStr, hash) ->
    hash = hash or {}
    token = hash.token or ""
    expected = hash.expected or []
    loc =
      line: jsmm.parser.lexer.yylloc.first_line or 1
      column: jsmm.parser.lexer.yylloc.first_column

    
    # if there are no newlines, give a range instead of a single position
    loc.column2 = loc.column + hash.text.length  if hash.text.match(/\n/) is null
    
    # entries are in the form "'FOR'", remove the extra quotes
    token = token.replace(/[']/g, "")
    i = 0

    while i < expected.length
      expected[i] = expected[i].replace(/[']/g, "")
      i++
    makeNear = (text, near) ->
      text = text.substring(0, text.indexOf("\n"))
      if text.replace(/\s*/, "").length > 0
        (near or " near ") + "<var>" + text + "</var>"
      else
        ""

    suggestionError = (suggestion, an) ->
      throw new jsmm.msg.CriticalError(loc, "Invalid syntax encountered" + makeNear(hash.text) + ", perhaps there is " + ((if an then "an" else "a")) + " <var>" + suggestion + "</var> missing", errStr)

    if token is "RESERVED"
      
      # special case: passing on the information that the word is reserved
      throw new jsmm.msg.CriticalError(loc, "Unfortunately <var>" + hash.text + "</var> is a reserved word, which means you cannot use it as a variable name", errStr)
    else if token is "INVALID"
      
      # special cases: passing on information about the used symbol
      if hash.text is "'"
        throw new jsmm.msg.CriticalError(loc, "Unfortunately <var>'</var> cannot be used, please use <var>\"</var> instead", errStr)
      else if ["~", "&", "|", "<<", ">>", ">>=", "<<="].indexOf(hash.text) >= 0
        throw new jsmm.msg.CriticalError(loc, "Unfortunately the bitwise operator <var>" + hash.text + "</var> cannot be used", errStr)
      else if ["===", "!=="].indexOf(hash.text) >= 0
        throw new jsmm.msg.CriticalError(loc, "Unfortunately the strict equality operator <var>" + hash.text + "</var> cannot be used", errStr)
      else if ["?", ":", "\\"].indexOf(hash.text) >= 0
        throw new jsmm.msg.CriticalError(loc, "Unfortunately the symbol <var>" + hash.text + "</var> cannot be used", errStr)
      else throw new jsmm.msg.CriticalError(loc, "Unfortunately the symbol <var>$</var>, often used for the jQuery library, cannot be used", errStr)  if hash.text is "$"
    else if token is "\""
      throw new jsmm.msg.CriticalError(loc, "This string has not been closed, please add another <var>\"</var> on this line", errStr)
    else if hash.token is null
      
      # lexer error
      loc =
        line: hash.line + 1
        column: 0

      throw new jsmm.msg.CriticalError(loc, "Invalid syntax encountered", errStr)
    else if expected.length is 1 and expected[0] is "NEWLINE"
      if token is "ELSE"
        
        # two or more else branches gives this situation
        throw new jsmm.msg.CriticalError(loc, "Invalid syntax encountered, perhaps the <var>else</var> branches are incorrect", errStr)
      else if token is "IF"
        
        # "else if" without the "else" gives this
        suggestionError "else", true
      else
        throw new jsmm.msg.CriticalError(loc, "Invalid syntax encountered, perhaps some code" + makeNear(hash.text) + " should be put on a new line", errStr)
    else if expected.length is 1
      
      # if only one thing can be expected, pass it on
      expected[0] = "variable name"  if expected[0] is "NAME"
      suggestionError expected[0]
    else if expected.indexOf(";") >= 0 and token is "NEWLINE"
      
      # ; expected before of newline is usually forgotten
      suggestionError ";"
    else if expected.indexOf("==") >= 0 and token is "="
      
      # ; expected before of newline is usually forgotten
      throw new jsmm.msg.CriticalError(loc, "Invalid syntax encountered" + makeNear(hash.text) + ", perhaps it should be <var>==</var> instead", errStr)
    else if expected.indexOf("}") >= 0 and ["FUNCTION", "ELSE", "EOF"].indexOf(token) >= 0
      
      # } expected before function declaration, else, eof is usually forgotten
      suggestionError "}"
    else if expected.indexOf(")") >= 0 and ["{", ";", "NEWLINE"].indexOf(token) >= 0
      
      # ) expected before { or ; is usually forgotten
      suggestionError ")"
    else if expected.indexOf("TRUE") >= 0 and token is "{"
      
      # expression expected, but { given, usually someone tries to make an object
      throw new jsmm.msg.CriticalError(loc, "You cannot use <var>{</var> here, only after <var>if</var>, <var>else</var>, <var>while</var>, <var>for</var>, and <var>function</var>", errStr)
    else if expected.indexOf("TRUE") >= 0 and token is "FUNCTION"
      
      # expression expected, but "FUNCTION" given, usually someone tries to make an inline function
      throw new jsmm.msg.CriticalError(loc, "You cannot use <var>function</var> here, only on a separate line", errStr)
    else
      throw new jsmm.msg.CriticalError(loc, "Invalid syntax encountered" + makeNear(hash.text), errStr)
