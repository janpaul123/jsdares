module.exports = (editor) ->

  class editor.Code

    constructor: (text) ->
      @text = '' + text
      @errorLine = null

    getText: ->
      @text

    getLine: (line) ->
      @makeLines()
      @lines[line - 1] ? null

    lineColumnToOffset: (line, column) ->
      @makeOffsets()
      (if @offsets[line - 1]? then @offsets[line - 1] + column else null)

    posToOffset: (loc) ->
      @lineColumnToOffset loc.line, loc.column

    rangeToText: (textLoc) ->
      @text.substring @lineColumnToOffset(textLoc.line, textLoc.column),
        @lineColumnToOffset(textLoc.line2, textLoc.column2)

    offsetToLoc: (offset) ->
      @makeOffsets()
      
      # TODO: implement binary search
      for line, i in @lines
        if offset < @offsets[i]
          return {
            line: i
            column: offset - (@offsets[i - 1] or 0)
          }

      line: @lines.length
      column: offset - @offsets[@lines.length - 1]

    insertAtOffset: (offset, text) ->
      @text.substring(0, offset) + text + @text.substring(offset)

    removeOffsetRange: (offset1, offset2) ->
      @text.substring(0, offset1) + @text.substring(offset2)

    replaceOffsetRange: (offset1, offset2, text) ->
      @text.substring(0, offset1) + text + @text.substring(offset2)

    blockToLeftColumn: (line1, line2) ->
      @makeLines()
      result = Infinity
      for i in [line1..line2]
        result = Math.min(result, @lines[i - 1].match(/^ */)[0].length)
        return result if result <= 0
      result

    blockToRightColumn: (line1, line2) ->
      @makeLines()
      result = 0
      for i in [line1..line2]
        result = Math.max(result, @lines[i - 1].length)
      result
    
    ## INTERNAL FUNCTIONS ##
    makeLines: ->
      return if @lines?
      @lines = @text.split(/\n/)

    makeOffsets: ->
      return if @offsets?
      @makeLines()
      @offsets = [0]

      for i in [1...@lines.length]
        # add one for the actual newline character
        @offsets[i] = @offsets[i - 1] + @lines[i - 1].length + 1
