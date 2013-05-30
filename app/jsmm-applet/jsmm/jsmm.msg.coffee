module.exports = (jsmm) ->

  jsmm.msg = {}

  class Message
    getMessage: ->
      @msg.replace(/<var>/g, '')
          .replace(/<\/var>/g, '')

    getHTML: ->
      @msg.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/&lt;var&gt;/g, '<var>')
          .replace(/&lt;\/var&gt;/g, '</var>')

    getLoc: (tree) ->
      if @loc?
        @loc
      else if @nodeId != 0
        tree.getNodeById(@nodeId)[@locType]
      else
        line: 1
        column: 0

  class jsmm.msg.Inline extends Message
    constructor: (nodeId, msg, locType) ->
      @type = 'Inline'
      @nodeId = nodeId
      @msg = msg
      @locType = locType || 'lineLoc'

  class jsmm.msg.Error
    constructor: (nodeId, msg, orig, locType) ->
      @type = 'Error'
      @nodeId = nodeId || 0
      @msg = msg
      @locType = locType || 'lineLoc'
      @orig = orig || null
  
  class jsmm.msg.CriticalError
    constructor: (loc, msg, orig) ->
      @type = 'Error'
      @loc = loc
      @msg = msg
      @orig = orig || null
