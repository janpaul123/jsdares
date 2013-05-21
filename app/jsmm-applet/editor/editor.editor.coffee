clayer = require('../clayer')

module.exports = (editor) ->
  
  class editor.Editor

    constructor: (options, language, $div, $toolbar, $stepbar) ->
      @language = language
      @eventHandlers = []
      
      @surface = new editor.Surface($div, this)
      
      if options.hideToolbar
        $toolbar.hide()
        @toolbar = null
      else
        $toolbar.show()
        @toolbar = new editor.Toolbar($toolbar, this)
      
      if options.hideStepbar
        $stepbar.hide()
        @stepbar = null
      else
        $stepbar.show()
        @stepbar = new editor.Stepbar($stepbar, this)
      
      @currentEditableLine = 0
      @previousEditableLine = 0
      @editables = []
      @editablesByLine = []
      
      @highlighting = false
      @currentHighlightNode = null
      @currentHighlightLine = 0
      @surface.enableMouse()
      
      @activeTimeHighlights = []
      
      @autoCompletionEnabled = false
      
      @updateTimeout = null
      
      @runner = null
      @textChangeCallback = ->

      @surface.setText options.text || ''

    remove: ->
      @removeEditables()
      @surface.remove()
      @toolbar.remove()
      @stepbar.remove()

    updateSettings: (runner, outputs) ->
      @runner = runner
      @outputs = outputs
      @update()
      @refreshEditables()

    getText: ->
      @code.text

    setText: (text) ->
      @surface.setText text
      @surface.resetCursor()
      @update()
      @refreshEditables()

    setTextChangeCallback: (callback) ->
      @textChangeCallback = callback

    bindEventHandler: (eventHandler) ->
      @eventHandlers.push eventHandler

    callEventHandlers: (funcName) ->
      for eventHandler in @eventHandlers
        eventHandler[funcName].apply eventHandler, [].slice.call(arguments, 1)

    callOutputs: (funcName) ->
      for outputName of @outputs
        @outputs[outputName][funcName].apply @outputs[outputName], [].slice.call(arguments, 1)  if @outputs[outputName][funcName] isnt `undefined`

    enable: ->
      @surface.enable()
      @update()

    disable: ->
      @surface.hideAutoCompleteBox()
      @update()
      @runner.disable()
      @callEventHandlers 'disable'
      @surface.disable()

    delayedUpdate: ->
      @code = new editor.Code(@surface.getText())
      unless @updateTimeout?
        @updateTimeout = setTimeout (=> @update()), 5

    update: ->
      if @updateTimeout?
        clearTimeout @updateTimeout
        @updateTimeout = null

      @code = new editor.Code(@surface.getText())
      @tree = new @language.Tree(@code.text)

      if @tree.hasError()
        @handleCriticalError @tree.getError()
      else
        @run()

    run: ->
      @runner.enable()
      @runner.newTree @tree
      @updateHighlighting()

    runTemp: (text) ->
      @tree = new @language.Tree(text)
      unless @tree.hasError()
        @runner.newTree @tree
        @updateHighlighting()
        @refreshEditables()
        true
      else
        @callOutputs 'outputSetError', true
        false

    canRun: ->
      !@tree.hasError() && !@autoCompletionEnabled

    canHighlight: ->
      @canRun() && @runner.isStatic()

    canHighlightTime: ->
      @runner && @runner.isInteractive() && @canHighlight()

    canShowEditables: ->
      @canRun()

    handleCriticalError: (error) ->
      @handleError error
      @runner.disable()
      @callEventHandlers 'disable'
      @updateHighlighting()
      @updateEditables()
      @highlightFunctionNode null
      @callOutputs 'outputSetError', true

    handleError: (error) ->
      @surface.hideAutoCompleteBox()
      @surface.showMessage 'error', @makeMessageLoc(error), error.getHTML()

    makeMessageLoc: (message) ->
      @makeLoc message.getLoc(@tree)

    makeLoc: (loc) ->
      output = {}
      if loc.line2?
        output.line = loc.line
        output.line2 = loc.line2 + 1
        output.column = @code.blockToLeftColumn(loc.line, loc.line2)
        output.column2 = @code.blockToRightColumn(loc.line, loc.line2)
      else
        output.line = loc.line
        output.line2 = loc.line + 1
        output.column = loc.column
        output.column2 = loc.column2 or loc.column
      output

    callTextChangeCallback: ->
      @textChangeCallback @code.text

    scrollToError: -> # callback
      @handleError @runner.getError()
      @surface.scrollToLine @runner.getError().getLoc(@tree).line

    userChangedText: -> # callback
      @update() # refreshEditables uses this.tree
      @refreshEditables()
      @callTextChangeCallback()

    outputRequestsRerun: -> #callback
      if @canRun()
        @runner.selectBaseEvent()
        true
      else
        false

    getContentLines: ->
      @tree.getNodeLines()

    ## RUNNER CALLBACKS ##
    startEvent: (context) ->
      @callOutputs 'outputStartEvent', context

    endEvent: (context) ->
      @callOutputs 'outputEndEvent', context

    clearReload: ->
      @callOutputs 'outputClearReload'

    clearAllEvents: ->
      @callOutputs 'outputClearAllEvents'

    popFirstEvent: ->
      @callOutputs 'outputPopFirstEvent'

    clearEventsToEnd: ->
      @callOutputs 'outputClearEventsToEnd'

    clearEventsFrom: (context) ->
      @callOutputs 'outputClearEventsFrom', context

    runnerChanged: -> # runner callback
      unless @autoCompletionEnabled
        @surface.hideAutoCompleteBox()
        if @runner.isStepping()
          message = @runner.getMessage()
          if message?
            @surface.showMessage message.type.toLowerCase(), @makeMessageLoc(message), message.getHTML()
            if @runner.getEventNum() != @lastEventNum || @runner.getStepNum() != @lastStepNum
              @surface.scrollToLine message.getLoc(@tree).line
          
          @lastEventNum = @runner.getEventNum()
          @lastStepNum = @runner.getStepNum()
        else
          delete @lastEventNum
          delete @lastStepNum

          if @runner.hasError()
            @handleError @runner.getError()
          else
            @surface.hideMessage()

        @callEventHandlers 'update', @runner
      
      @callOutputs 'outputSetError', @runner.hasError()
      @updateHighlighting()
      @updateEditables()
      @callOutputs 'outputSetEventStep', @runner.getEventNum(), @runner.getStepNum()

    runnerChangedEvent: ->
      @callOutputs 'outputSetEventStep', @runner.getEventNum(), @runner.getStepNum()
    
    ## EDITABLES METHODS AND CALLBACKS ##
    refreshEditables: ->
      if @canShowEditables()
        @removeEditables()
        @editables = @language.editor.editables.generate(@tree, editor.editables, @surface, this)

        for editable in @editables
          line = editable.loc.line
          unless @editablesByLine[line]?
            @editablesByLine[line] = []
          @editablesByLine[line].push editable
          
        @updateEditables()
      else
        @removeEditables()

    removeEditables: ->
      editable.remove() for editable in @editables
      @editables = []
      @editablesByLine = []
      @previousEditableLine = 0

    updateEditables: ->
      if @canShowEditables()
        if @currentEditableLine != @previousEditableLine
          @hideEditables @previousEditableLine
          @previousEditableLine = @currentEditableLine
          if @editablesByLine[@currentEditableLine]
            for editable in @editablesByLine[@currentEditableLine]
              editable.show()

      else if @previousEditableLine > 0
        @hideEditables @previousEditableLine
        @previousEditableLine = 0

    hideEditables: (line) ->
      if @editablesByLine[line]
        for editable in @editablesByLine[line]
          editable.hide()

    getEditablesText: (node) -> #callback
      @code.rangeToText node.textLoc

    editableReplaceCode: (line, column, column2, newText) -> # callback
      return unless @editablesByLine[line]?
      
      offset1 = @code.lineColumnToOffset(line, column)
      offset2 = @code.lineColumnToOffset(line, column2)
      
      @surface.setText @code.replaceOffsetRange(offset1, offset2, newText)
      
      changeOffset = newText.length - (column2 - column)
      
      if changeOffset isnt 0
        for editable in @editablesByLine[line]
          editable.offsetColumn column, changeOffset

      @delayedUpdate()
      @surface.restoreCursor offset2, changeOffset
    
    ## HIGHLIGHTING METHODS AND CALLBACKS ##
    updateHighlighting: ->
      if @canHighlight()
        @highlighting = true
        node = @tree.getNodeByLine(@currentHighlightLine)
        
        if node != @currentHighlightNode
          @currentHighlightNode = node
          
          if node?
            @surface.showHighlight @makeLoc(node.blockLoc)
            nodeIds = @tree.getNodeIdsByRange(node.blockLoc.line, node.blockLoc.line2)
            @callOutputs 'highlightNodes', nodeIds
            @callOutputs 'highlightCallIds', @runner.getCallIdsByNodeIds(nodeIds)
          else
            @surface.hideHighlight()
            @callOutputs 'highlightNodes', null
            @callOutputs 'highlightCallIds', null

        @updateTimeHighlighting()
        @callOutputs 'enableHighlighting' # don't check for !this.highlighting, but always call this
      
      else if @highlighting
        @highlighting = false
        @surface.hideTimeHighlights()
        @surface.hideHighlight()
        @callOutputs 'disableHighlighting'
        @currentHighlightNode = null

    # *only* call from updateHighlighting!!
    updateTimeHighlighting: ->
      if @canHighlightTime()
        timeHighlights = @language.editor.timeHighlights.getTimeHighlights(@tree)

        @activeTimeHighlights = _.filter @activeTimeHighlights, (highlight) ->
          timeHighlights[highlight]?

        @surface.showTimeHighlights timeHighlights
        @updateActiveTimeHighlights()
      else
        @surface.hideTimeHighlights()
        @callOutputs 'highlightTimeIds', null

    updateActiveTimeHighlights: ->
      if @activeTimeHighlights.length > 0
        size = @runner.getEventTotal()
        timeIds = ([] for i in [0..size])

        highlightsFromTree = @language.editor.timeHighlights.getTimeHighlights(@tree)
        
        for activeTimeHighlight in @activeTimeHighlights
          timeHighlight = highlightsFromTree[activeTimeHighlight]
          nodeIds = @tree.getNodeIdsByRange(timeHighlight.line, timeHighlight.line2)
          idsPerContext = @runner.getAllCallIdsByNodeIds(nodeIds)

          for ids, i in idsPerContext
            for id in ids
              unless id in timeIds[i]
                timeIds[i].push id

        @callOutputs 'highlightTimeIds', timeIds
      else
        @callOutputs 'highlightTimeIds', null

    timeHighlightHover: (name) ->

    timeHighlightActivate: (name) ->
      @activeTimeHighlights.push name
      @updateActiveTimeHighlights()
      @callOutputs 'enableHighlighting'

    timeHighlightDeactivate: (name) ->
      position = @activeTimeHighlights.indexOf(name)

      if position >= 0
        @activeTimeHighlights.splice position, 1
        @updateActiveTimeHighlights()
        @callOutputs 'enableHighlighting'

    highlightNode: (node) -> # callback
      if node?
        @surface.showHighlight @makeLoc(node.lineLoc)
        @surface.scrollToLine node.lineLoc.line
      else
        @surface.hideHighlight()

    highlightNodeId: (nodeId) -> # callback
      @highlightNode @tree.getNodeById(nodeId)

    highlightNodeIds: (nodeIds) -> # callback
      @surface.removeHighlights()

      for nodeId in nodeIds
        node = @tree.getNodeById(nodeId)
        @surface.addHighlight @makeLoc(node.lineLoc)

    highlightContentLine: (line) -> # used for dare line count
      if line?
        @highlightNode @tree.getNodeByLine(line)
      else
        @highlightNode null

    highlightFunctionNode: (node, scroll) -> # toolbar callback
      if node?
        @surface.showFunctionHighlight @makeLoc(node.blockLoc)
        @surface.scrollToLine node.blockLoc.line  if scroll
        @callOutputs 'enableEventHighlighting'
      else
        @surface.hideFunctionHighlight()
        @callOutputs 'disableEventHighlighting'
    
    # internal method
    mouseMove: (event, line, column) -> # callback
      line = 0 if column < -1

      if @currentHighlightLine != line
        @currentHighlightLine = line
        @updateHighlighting()

      if @currentEditableLine != line
        @currentEditableLine = line
        @updateEditables()

    mouseLeave: (event) -> #callback
      @currentHighlightLine = 0
      @updateHighlighting()
      @currentEditableLine = 0
      @updateEditables()
    
    ## KEYBOARD CALLBACKS ##
    tabIndent: (event, offset1, offset2) -> # callback
      # 9 == TAB
      if event.keyCode == 9
        code = new editor.Code(@surface.getText())
        pos1 = code.offsetToLoc(offset1)
        pos2 = pos1
        pos2 = code.offsetToLoc(offset2) if offset2 != offset1
        
        newText = code.text.substring(0, code.lineColumnToOffset(pos1.line, 0))
        
        totalOffset1 = 0
        totalOffset2 = 0

        for i in [pos1.line...pos2.line]
          startOffset = code.lineColumnToOffset(i, 0)
          line = code.getLine(i)
          unless event.shiftKey
            # insert spaces
            newText += '  ' + line + '\n'
            totalOffset1 += 2  if i is pos1.line
            totalOffset2 += 2
          else
            # remove spaces
            spaces = Math.min(code.getLine(i).match(/^ */)[0].length, 2)
            newText += line.substring(spaces) + '\n'
            
            if i == pos1.line
              totalOffset1 -= Math.min(spaces, pos1.column)
            
            if i == pos2.line
              totalOffset2 -= Math.min(spaces, pos2.column)
            else
              totalOffset2 -= spaces
        
        finalOffset = code.lineColumnToOffset(pos2.line + 1, 0)
        newText += code.text.substring(finalOffset) if finalOffset?
        
        @surface.setText newText
        @surface.restoreCursorRange totalOffset1, totalOffset2
        
        event.preventDefault()
        true
      else
        false
    
    # TODO: use http://archive.plugins.jquery.com/project/fieldselection
    autoIndent: (event, offset) -> # callback
      # 13 == enter, 221 = } or ]
      if event.keyCode in [13, 221]
        code = new editor.Code @surface.getText()
        
        pos = code.offsetToLoc(offset)
        if pos.line > 1
          prevLine = code.getLine(pos.line - 1)
          curLine = code.getLine(pos.line)
          
          # how many spaces are there on the previous line (reference), and this line
          spaces = prevLine.match(/^ */)[0].length
          spacesAlready = curLine.match(/^ */)[0].length
          
          # '{' on previous line means extra spaces, '}' on this one means less
          spaces += 2 if prevLine.match(/\{ *$/)?
          spaces -= 2 if curLine.match(/^ *\}/)?
          
          # also, since we are returning an offset, remove the number of spaces we have already
          spaces -= spacesAlready

          startOffset = code.lineColumnToOffset(pos.line, 0)
          if spaces < 0
            # don't delete more spaces that there are on this line
            spaces = Math.max(spaces, -spacesAlready)
            @surface.setText code.removeOffsetRange(startOffset, startOffset - spaces)
          else
            @surface.setText code.insertAtOffset(startOffset, new Array(spaces + 1).join(' '))
          @surface.restoreCursor startOffset, spaces

    autoComplete: (event, offset) -> # callback
      # undefined: click event, 48-90 == alpha-num, 190 == ., 8 == backspace
      keycode = keycode ? null
      if 48 <= event.keyCode <= 90 || event.keyCode in [190, 8, null]
        @code = new editor.Code(@surface.getText())
        pos = @code.offsetToLoc(offset)
        if pos.line > 0
          line = @code.getLine(pos.line)
          match = /([A-Za-z][A-Za-z0-9]*[.])+([A-Za-z][A-Za-z0-9]*)?$/.exec(line.substring(0, pos.column))
          if match?
            examples = @runner.getExamples(match[0])
            if examples?
              @autoCompletionEnabled = true
              @surface.showAutoCompleteBox pos.line, pos.column - examples.width, offset - examples.width, examples
              return
      @disableAutoCompletion()

    previewExample: (offset1, offset2, example) -> # callback
      @autoCompletionEnabled = true
      @disableEditables() if @editablesEnabled
      
      text = @surface.getText()
      @runTemp text.substring(0, offset1) + example + text.substring(offset2)

    insertExample: (offset1, offset2, example) -> # callback
      if @autoCompletionEnabled
        text = @surface.getText()
        @surface.setText text.substring(0, offset1) + example + text.substring(offset2)
        @surface.setCursor offset1 + example.length, offset1 + example.length
        @disableAutoCompletion()
        @refreshEditables()
        @callTextChangeCallback()

    disableAutoCompletion: -> # callback
      if @autoCompletionEnabled
        @autoCompletionEnabled = false
        @surface.hideAutoCompleteBox()
        @update()
        @refreshEditables()

    addEvent: (type, funcName, args) ->
      @runner.addEvent type, funcName, args

    makeInteractive: (signature) ->
      @runner.makeInteractive signature
