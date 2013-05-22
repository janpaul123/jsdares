#jshint node:true
"use strict"
module.exports = (jsmm) ->
  jsmm.msg = {}
  jsmm.msg.addCommonMessageMethods = (msg) ->
    msg.getMessage = ->
      @msg.replace(/<var>/g, "").replace /<\/var>/g, ""

    msg.getHTML = ->
      html = @msg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</span>"
      html.replace(/&lt;var&gt;/g, "<var>").replace /&lt;\/var&gt;/g, "</var>"

    msg.getLoc = (tree) ->
      if @loc isnt `undefined`
        @loc
      else if @nodeId isnt 0
        tree.getNodeById(@nodeId)[@locType]
      else
        line: 1
        column: 0

    msg

  jsmm.msg.Inline = ->
    @init.apply this, arguments

  jsmm.msg.Inline:: = jsmm.msg.addCommonMessageMethods(init: (nodeId, msg, locType) ->
    @type = "Inline"
    @nodeId = nodeId
    @msg = msg
    @locType = locType or "lineLoc"
  )
  jsmm.msg.Error = ->
    @init.apply this, arguments

  jsmm.msg.Error:: = jsmm.msg.addCommonMessageMethods(init: (nodeId, msg, orig, locType) ->
    @type = "Error"
    @nodeId = (if nodeId then nodeId else 0)
    @msg = msg
    @locType = locType or "lineLoc"
    @orig = orig or null
  )
  jsmm.msg.CriticalError = ->
    @init.apply this, arguments

  jsmm.msg.CriticalError:: = jsmm.msg.addCommonMessageMethods(init: (loc, msg, orig) ->
    @type = "Error"
    @loc = loc
    @msg = msg
    @orig = orig or null
  )
