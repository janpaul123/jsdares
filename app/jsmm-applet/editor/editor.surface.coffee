clayer = require('../clayer')

module.exports = (editor) ->

  class editor.StepBubbles

    constructor: ($div, surface, ed) ->
      @$div = $div
      @surface = surface
      @editor = ed
      
      @editor.bindEventHandler(this)
      
      @$bubblesContainer = $('<div class="editor-step-bubbles-container"></div>')
      @$div.append @$bubblesContainer
      
      @$bubblesLine = $('<div class="editor-step-bubbles-line"></div>')
      @$bubblesContainer.append @$bubblesLine

    remove: ->

    update: (runner) ->
      if runner.isStepping()
        @render runner
      else
        @disable()

    disable: ->
      @$bubblesContainer.hide()

    render: (runner) ->
      stepNum = runner.getStepNum()
      stepTotal = runner.getStepTotal()
      
      visibleSteps = (@$div.outerWidth() / 10)
      start = Math.max(0, stepNum - visibleSteps / 2)
      end = Math.min(stepTotal, start + visibleSteps)
      
      @renderBubbleRange runner.getAllSteps(), @editor.tree, start, end, stepNum
      @positionLineByStepNum runner.getStepNum() - start
      
      @$bubblesContainer.show()

    renderBubbleRange: (steps, tree, start, end, current) ->
      if @lastSteps != steps || @lastTree != tree || @lastStart != start || @lastEnd != end || @lastCurrent != current
        @lastSteps = steps
        @lastTree = tree
        @lastStart = start
        @lastEnd = end
        @lastCurrent = current

        @$bubblesContainer.children('.editor-step-bubbles-bubble').remove()
        
        for i in [start...end]
          $bubble = @addBubble(steps[i], tree, i - start)
          if i is current
            $bubble.addClass 'editor-step-bubbles-bubble-active'

    addBubble: (step, tree, number) ->
      $bubble = $('<div class="editor-step-bubbles-bubble"></div>')
      loc = step.getLoc(tree)
      top = @surface.lineToY(loc.line)
      
      $bubble.css 'top', top
      $bubble.css 'left', number * 10
      @$bubblesContainer.append $bubble
      
      $bubble

    positionLineByStepNum: (stepNum) ->
      @$bubblesLine.css 'left', stepNum * 10
      @$bubblesLine.css 'height', @surface.lineToY(@editor.tree.programNode.blockLoc.line2)

  class editor.Box

    constructor: ->
      @$element = $('<div class="editor-box"></div>')
      @$element.hide()
      @$arrow = $('<div class="editor-box-arrow"></div>')
      @$element.append @$arrow
      @$message = $('<div class="editor-box-message"></div>')
      @$element.append @$message

    getElement: ->
      @$element

    updatePosition: (css) ->
      left = css.left + css.width / 2
      newLeft = Math.max(-8, left - @$element.outerWidth() / 2)
      @$element.css 'left', newLeft
      @$arrow.css 'left', left - newLeft
      @$element.css 'top', css.top + css.height

    html: (html, css) ->
      # first place in top-left corner, so text wrapping etc. wont happen due to being at a border
      @$element.css 'left', 0
      @$element.css 'top', 0
      @$message.html html
      @updatePosition css
      
      # now force re-rendering at the new location
      @$message.html ''
      @$message.html html

    remove: ->
      @$element.remove()


  class editor.Message

    constructor: (surface, hover) ->
      @surface = surface
      @$marginIcon = $('<div class="editor-margin-icon"></div>')
      @surface.addElementToMargin @$marginIcon
      @$marking = $('<div class="editor-marking"></div>')
      @surface.addElementToTop @$marking
      @$marking.hide()
      @box = new editor.Box()
      @surface.addElementToTop @box.getElement()

      if hover
        @$marginIcon.on 'mouseenter', _(@openMessage).bind(this)
        @$marginIcon.on 'mouseleave', _(@closeMessage).bind(this)
        @messageOpen = false
      else
        @messageOpen = true
      @visible = false
      @location = null
      @html = ''
      @isCurrentlyShown = false
      @type = ''

    showAtLocation: (type, location, html) ->
      @switchType type
      unless @visible
        @visible = true
        @$marginIcon.addClass 'editor-margin-icon-visible'
      @$marginIcon.css 'top', @surface.lineToY(location.line)
      @location = location
      @html = html
      @updateMessage()

    openMessage: ->
      @messageOpen = true
      @updateMessage()

    closeMessage: ->
      @messageOpen = false
      @updateMessage()

    hide: ->
      if @visible
        @visible = false
        @$marginIcon.removeClass 'editor-margin-icon-visible'
      @updateMessage()

    remove: ->
      @$marginIcon.remove()
      @$marking.remove()
      @box.remove()

    ## INTERNAL FUNCTIONS ##
    switchType: (type) ->
      if @type != type
        @$marginIcon.removeClass 'editor-margin-message-icon-' + @type
        @type = type
        @$marginIcon.addClass 'editor-margin-message-icon-' + @type

    toggleMesssage: ->
      @messageOpen = !@messageOpen
      @updateMessage()

    updateMessage: ->
      if @visible && @messageOpen && @location?
        unless @isCurrentlyShown
          @isCurrentlyShown = true
          @$marking.show()
          @box.getElement().show()
        css = @surface.makeElementLocationRange(@location)
        @box.html @html, css
        @$marking.css css
      else
        if @isCurrentlyShown
          @isCurrentlyShown = false
          @$marking.hide()
          @box.getElement().hide()


  class editor.AutoCompleteBox

    constructor: (surface, delegate, line, column, offset) ->
      @$element = $('<div class="editor-autocomplete-box"><div class="editor-autocomplete-arrow"></div></div>')
      surface.addElementToTop @$element
      
      @$content = $('<div class="editor-autocomplete-content"></div>')
      @$element.append @$content
      
      @$element.append '<div class="editor-autocomplete-hint"><i class="icon icon-keyboard icon-white"></i> press <strong>enter</strong> to insert, hold <strong>shift</strong> to insert only names</div>'
      
      @$marginIcon = $('<div class="editor-margin-icon editor-margin-message-icon-preview"></div>')
      surface.addElementToMargin @$marginIcon
      @$marginIcon.css 'top', surface.lineToY(line)
      @$marginIcon.hide()
      @$marginIcon.fadeIn 150
      
      @line = line
      @column = column
      @offset = offset
      @$element.css surface.makeElementLocation(line + 1, column)

      @delegate = delegate
      @width = 0
      @offset = offset
      @selected = -1
      @examples = []
      @previousExample = ''
      @shiftPressed = false

    setExamples: (examples, text) ->
      @storePreviousExample()
      @examples = examples.examples
      @prefix = examples.prefix
      @width = examples.width
      @text = text
      @updateExamples()

    remove: ->
      @$element.remove()
      @$marginIcon.remove()

    up: ->
      if @examples.length > 0
        if @selected > 0
          @select @selected - 1
        else
          @select @examples.length - 1
        @scrollToSelected()

    down: ->
      if @examples.length > 0
        if @selected < @examples.length - 1
          @select @selected + 1
        else
          @select 0
        @scrollToSelected()

    shift: (value) ->
      scrollTop = @$content.scrollTop()
      @shiftPressed = value
      @storePreviousExample()
      @updateExamples()
      @$content.stop().scrollTop scrollTop

    enter: ->
      if 0 <= @selected < @examples.length
        @insert()
      else
        @cancel()

    cancel: ->
      @delegate.disableAutoCompletion()

    ## INTERNAL FUNCTIONS ##
    storePreviousExample: ->
      if @examples[@selected]?
        @previousExample = @examples[@selected][0]

    updateExamples: ->
      @$content.children('.editor-autocomplete-line').remove() # prevent $.data leaks
      @$lines = []
      selected = 0
      @selected = -1
      if @examples.length > 0
        @$element.show()

        for exampleContainer, i in @examples
          $line = $('<div class="editor-autocomplete-line"></div>')
          example = exampleContainer[0]
          suffix = exampleContainer[1]
          $line.html @prefix + '<strong>' + example.substring(0, @width) + '</strong>' + example.substring(@width) + ((if not @shiftPressed then suffix else ''))
          $line.on 'mousemove', _(@mouseMove).bind(this)
          $line.on 'click', _(@click).bind(this)
          $line.data 'example-number', i
          @$content.append $line
          @$lines.push $line
          selected = i  if example is @previousExample
        
        @select selected
        @scrollToSelected()
      else
        @$element.hide()

    select: (number) ->
      if @selected != number
        @$content.children('.editor-autocomplete-line').removeClass 'editor-autocomplete-selected'
        @selected = number

        previewExample = ''
        if @selected >= 0
          @$lines[@selected].addClass 'editor-autocomplete-selected'
          example = @examples[@selected]
          previewExample = example[0]
          previewExample += example[1] unless @shiftPressed
        
        @delegate.previewExample @offset, @offset + @width, previewExample

    scrollToSelected: ->
      if @selected >= 0
        # the offset is weird since .position().top changes when scrolling
        y = @$lines[@selected].position().top + @$content.scrollTop()
        y = Math.max(0, y - @$content.height() / 2)
        @$content.stop(true).animate {scrollTop: y}, 150, 'linear'
      else
        @$content.stop(true).animate {scrollTop: 0}, 150, 'linear'

    insert: (number) ->
      number = number or @selected
      example = @examples[number]

      insertExample = example[0]
      insertExample += example[1] unless @shiftPressed
      @delegate.insertExample @offset, @offset + @width, insertExample

    mouseMove: (event) ->
      @select $(event.delegateTarget).data('example-number')

    click: (event) ->
      event.preventDefault() # e.g. selecting stuff
      @insert $(event.delegateTarget).data('example-number')

  class editor.Surface

    constructor: ($div, delegate) ->
      @$div = $div
      @$div.addClass 'editor'
      @delegate = delegate
      
      # setting up bottom
      @$bottom = $('<div class="editor-bottom"></div>')
      @$div.append @$bottom
      
      # setting up textarea
      @$textarea = $('<textarea class="editor-code" autocorrect="off" autocapitalize="off" spellcheck="false" wrap="off"></textarea>')
      @$div.append @$textarea
      
      @$textarea.on 'keydown', _(@keyDown).bind(this)
      @$textarea.on 'keyup', _(@keyUp).bind(this)
      @$textarea.on 'blur', _(@lostFocus).bind(this)
      @$textarea.on 'click', _(@click).bind(this)
      
      # setting up top for steps
      @$topStepBubbles = $('<div class="editor-step-bubbles"></div>')
      @$div.append @$topStepBubbles
      @stepBubbles = new editor.StepBubbles(@$topStepBubbles, this, @delegate)
      
      # setting up top
      @$top = $('<div class="editor-top"></div>')
      @$div.append @$top
      
      # setting up margin
      @$margin = $('<div class="editor-margin"></div>')
      @$div.append @$margin
      
      # setting up messages
      @errorMessage = new editor.Message(this, true)
      @stepMessage = new editor.Message(this, false)
      
      @updateSize = _(@updateSize).bind(this)
      $(window).on 'resize', @updateSize
      
      @initOffsets()
      
      @text = ''
      @userChangedText = false
      @autoCompleteBox = null
      @$timeHighlights = {}
      @showElementsTimeout = null

    remove: ->
      $(window).off 'resize', @updateSize
      @hideAutoCompleteBox()
      @errorMessage.remove()
      @stepMessage.remove()
      @$bottom.children('.editor-time-highlight').remove()
      @$top.children('.editor-time-highlight').remove()
      @$margin.remove()
      @$bottom.remove()
      @stepBubbles.remove()
      @$topStepBubbles.remove()
      @$top.remove()
      @$textarea.remove()
      @$div.html ''
      @$div.removeClass 'editor editor-error editor-step'
      @$mirrorContainer.remove()

    getText: ->
      @text

    setText: (newText) ->
      @lastSelectionStart = @$textarea[0].selectionStart
      @lastSelectionEnd = @$textarea[0].selectionEnd
      @$textarea.val newText
      @text = newText
      @userChangedText = false
      @updateSize()
      @$textarea[0].selectionStart = @lastSelectionStart
      @$textarea[0].selectionEnd = @lastSelectionStart

    enable: ->
      @$textarea.removeAttr 'readonly'

    disable: ->
      @$textarea.attr 'readonly', 'readonly'

    columnToX: (column) ->
      Math.max 0, Math.min(column * @charWidth, @$top.css('width').replace('px', '') - 7)

    lineToY: (line) ->
      Math.max 0, (line - 1) * @lineHeight

    addElement: ($element) ->
      @addElementToTop $element

    addElementToBottom: ($element) ->
      @$bottom.append $element

    addElementToMargin: ($element) ->
      @$margin.append $element

    addElementToTop: ($element) ->
      @$top.append $element

    enableMouse: ->
      @$div.on 'mousemove', _(@mouseMove).bind(this)
      @$div.on 'mouseleave', _(@mouseLeave).bind(this)

    disableMouse: ->
      @$div.off 'mousemove mouseleave'

    showMessage: (type, location, html) ->
      if type == 'error'
        @stepMessage.hide()
        @showError location, html
      else
        @showStep location, html

    showError: (location, html) ->
      @errorMessage.showAtLocation 'error', location, html
      @$div.removeClass 'editor-step'
      @$div.addClass 'editor-error'

    showStep: (location, html) ->
      @stepMessage.showAtLocation 'inline', location, html
      @$div.removeClass 'editor-error'
      @$div.addClass 'editor-step'

    hideMessage: ->
      @$div.removeClass 'editor-error editor-step'
      @errorMessage.hide()
      @stepMessage.hide()

    addHighlight: (location) ->
      $highlightMarking = $('<div class="editor-marking editor-highlight"></div>')
      @addElementToBottom $highlightMarking
      $highlightMarking.css @makeElementLocationRange(location)

    showHighlight: (location) ->
      @removeHighlights()
      @addHighlight location

    removeHighlights: ->
      @$bottom.children('.editor-highlight').remove()

    hideHighlight: ->
      @removeHighlights()

    showFunctionHighlight: (location) ->
      @hideFunctionHighlight()
      $highlightMarking = $('<div class="editor-marking editor-highlight-function"></div>')
      @addElementToBottom $highlightMarking
      $highlightMarking.css @makeElementLocationRange(location)

    hideFunctionHighlight: ->
      @$bottom.children('.editor-highlight-function').remove()

    showTimeHighlights: (timeHighlights) ->
      @$margin.children('.editor-time-highlight').addClass 'editor-time-highlight-remove'
      for name of timeHighlights
        unless @$timeHighlights[name]?
          @$timeHighlights[name] = $('<div class="editor-time-highlight editor-time-highlight-inactive"></div>')
          @$timeHighlights[name].on
            click: _(@timeHighlightClick).bind(this)
            mousemove: _(@timeHighlightMouseMove).bind(this)
            mouseleave: _(@timeHighlightMouseLeave).bind(this)

          @$timeHighlights[name].data 'name', name
          @addElementToMargin @$timeHighlights[name]

        @$timeHighlights[name].removeClass 'editor-time-highlight-remove'
        y = @lineToY(timeHighlights[name].line)
        @$timeHighlights[name].css 'top', y
        @$timeHighlights[name].height @lineToY(timeHighlights[name].line2 + 1) - y
        @$timeHighlights[name].show()
      
      $timeHighlights = @$timeHighlights
      @$margin.children('.editor-time-highlight-remove').each ->
        $this = $(this)
        delete $timeHighlights[$this.data('name')]
        $this.remove()

    timeHighlightMouseMove: (event) ->
      $target = $(event.delegateTarget)
      if $target.hasClass('editor-time-highlight-inactive')
        $target.removeClass 'editor-time-highlight-inactive'
        $target.addClass 'editor-time-highlight-hover'
        @delegate.timeHighlightHover $target.data('name')
        @delegate.timeHighlightActivate $target.data('name')

    timeHighlightMouseLeave: (event) ->
      $target = $(event.delegateTarget)
      if $target.hasClass('editor-time-highlight-hover')
        $target.removeClass 'editor-time-highlight-hover'
        $target.addClass 'editor-time-highlight-inactive'
        @delegate.timeHighlightDeactivate $target.data('name')

    timeHighlightClick: (event) ->
      $target = $(event.delegateTarget)
      if $target.hasClass('editor-time-highlight-active')
        $target.removeClass 'editor-time-highlight-active'
        $target.addClass 'editor-time-highlight-hover'
        @delegate.timeHighlightHover $target.data('name')
      else if $target.hasClass('editor-time-highlight-hover')
        $target.removeClass 'editor-time-highlight-hover'
        $target.addClass 'editor-time-highlight-active'
      else
        $target.removeClass 'editor-time-highlight-inactive'
        $target.addClass 'editor-time-highlight-active'
        @delegate.timeHighlightActivate $target.data('name')

    hideTimeHighlights: ->
      @$margin.children('.editor-time-highlight').hide()

    hideInactiveTimeHighlights: ->
      for name of @$timeHighlights
        if @$timeHighlights[name].hasClass('editor-time-highlight-hover')
          @$timeHighlights[name].removeClass 'editor-time-highlight-hover'
          @$timeHighlights[name].addClass 'editor-time-highlight-inactive'
          @delegate.timeHighlightDeactivate name
      @$margin.children('.editor-time-highlight-inactive').hide()

    scrollToLine: (line) ->
      @scrollToY @lineToY(line)

    makeElementLocation: (line, column) ->
      left: @columnToX(column)
      top: @lineToY(line)

    makeElementLocationRange: (location) ->
      x = @columnToX(location.column)
      y = @lineToY(location.line)

      left: x
      top: y
      width: @columnToX(location.column2) - x
      height: @lineToY(location.line2) - y

    restoreCursor: (from, offset) ->
      if @lastSelectionStart? && @lastSelectionEnd?
        if @lastSelectionStart >= from
          @$textarea[0].selectionStart = @lastSelectionStart + offset
        if @lastSelectionEnd >= from
          @$textarea[0].selectionEnd = @lastSelectionEnd + offset

    restoreCursorRange: (offset1, offset2) ->
      if @lastSelectionStart? && @lastSelectionEnd?
        @$textarea[0].selectionStart = @lastSelectionStart + offset1
        @$textarea[0].selectionEnd = @lastSelectionEnd + offset2

    setCursor: (start, end) ->
      @$textarea[0].selectionStart = start
      @$textarea[0].selectionEnd = end

    resetCursor: ->
      @lastSelectionStart = null
      @lastSelectionEnd = null

    showAutoCompleteBox: (line, column, offset, examples) ->
      if @autoCompleteBox?
        if @autoCompleteBox.offset != offset
          @autoCompleteBox.remove()
          @autoCompleteBox = new editor.AutoCompleteBox(this, @delegate, line, column, offset)
      else
        @autoCompleteBox = new editor.AutoCompleteBox(this, @delegate, line, column, offset)
      @autoCompleteBox.setExamples examples, @text
      @hideMessage()

    hideAutoCompleteBox: ->
      if @autoCompleteBox?
        @autoCompleteBox.remove()
        @autoCompleteBox = null

    autoCompleteNavigateDown: (event) ->
      switch event.keyCode 
        when 38 # 38 == up
          @autoCompleteBox.up()
          event.preventDefault()
        when 40 # 40 == down
          @autoCompleteBox.down()
          event.preventDefault()
        when 16 # 16 == shift
          @autoCompleteBox.shift true
          event.preventDefault()
        when 13, 9 # 13 == enter, 9 == tab
          @autoCompleteBox.enter()
          event.preventDefault()
        when 27 # 27 == escape
          @autoCompleteBox.cancel()
          event.preventDefault()

    autoCompleteNavigateUp: (event) ->
      if event.keyCode == 16 # 16 == shift
        @autoCompleteBox.shift false
        event.preventDefault()

    getTextArea: -> # only for editables to add classes
      @$textarea

    
    ## INTERNAL FUNCTIONS ##
    initOffsets: ->
      # setting up mirror
      @$mirror = $('<div class="editor-mirror"></div>')
      @$mirrorContainer = $('<div class="editor-mirror-container"></div>')
      @$mirrorContainer.append @$mirror
      $('body').append @$mirrorContainer
      
      @$mirror.text 'a'
      @textOffset =
        x: @$mirror.outerWidth()
        y: @$mirror.outerHeight()
      
      # this trick of measuring a long string especially helps Firefox get an accurate character width
      @$mirror.text 'a' + new Array(100 + 1).join('a')
      @charWidth = (@$mirror.outerWidth() - @textOffset.x) / 100
      
      @$mirror.text 'a\na'
      @lineHeight = @$mirror.outerHeight() - @textOffset.y
      
      # this works assuming there is no padding on the right or bottom
      @textOffset.x -= @charWidth
      @textOffset.y -= @lineHeight
      
      # the offset is weird since .position().top changes when scrolling
      textAreaOffset =
        x: (@$textarea.position().left + @$div.scrollLeft())
        y: (@$textarea.position().top + @$div.scrollTop())

      left = textAreaOffset.x + @textOffset.x
      top = textAreaOffset.y + @textOffset.y
      @$bottom.css 'left', left
      @$bottom.css 'top', top
      @$top.css 'left', left
      @$top.css 'top', top
      @$topStepBubbles.css 'left', left
      @$topStepBubbles.css 'top', top
      @$margin.css 'top', top

    updateSize: ->
      @$mirror.text @text
      @$textarea.width @$mirror.outerWidth()
      @$textarea.height @$mirror.outerHeight() + 100

    showElements: ->
      @$div.removeClass 'editor-typing'
      @clearShowElementsTimeout()

    hideElements: ->
      @$div.addClass 'editor-typing'
      @clearShowElementsTimeout()
      @showElementsTimeout = setTimeout (=> @showElements()), 1000

    clearShowElementsTimeout: ->
      if @showElementsTimeout?
        clearTimeout @showElementsTimeout
        @showElementsTimeout = null

    pageXToColumn: (x) ->
      Math.floor (x - @$textarea.offset().left - @textOffset.x) / @charWidth

    pageYToLine: (y) ->
      1 + Math.floor((y - @$textarea.offset().top - @textOffset.y) / @lineHeight)

    scrollToY: (y) ->
      y = Math.max(0, y - @$div.height() / 2)
      @$div.stop(true).animate {scrollTop: y}, 150, 'linear'

    sanitizeTextArea: ->
      @$textarea.val @$textarea.val().replace(/\t/g, '  ')

    keyDown: (event) ->
      
      # 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND, 27 == ESC, 113 = F2, 114 = F3
      # let these through for the keyboard shortcuts
      unless event.keyCode in [17, 18, 91, 93, 224, 27, 113, 114]
        event.stopPropagation()  

      @sanitizeTextArea()

      if @$textarea.val() != @text
        # note: this will never be called at the first keypress, only when holding it!
        @text = @$textarea.val()
        @updateSize()
        @userChangedText = true
      
      # 38 == up, 40 == down, 13 == enter, 16 == shift, 9 == TAB, 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND, 113 = F2, 114 = F3
      unless event.keyCode in [38, 40, 13, 16, 9, 17, 18, 91, 93, 224, 113, 114]
        @delegate.autoComplete event, @$textarea[0].selectionStart
      else if @autoCompleteBox?
        @autoCompleteNavigateDown event
      else
        if @delegate.tabIndent(event, @$textarea[0].selectionStart, @$textarea[0].selectionEnd)
          @userChangedText = true

      if @userChangedText
        @hideElements()

    keyUp: (event) ->
      
      # 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND, 27 == ESC, 113 = F2, 114 = F3
      # let these through for the keyboard shortcuts
      unless event.keyCode in [17, 18, 91, 93, 224, 27, 113, 114]
        event.stopPropagation()

      @sanitizeTextArea()
      
      if @$textarea.val() != @text
        @text = @$textarea.val()
        @delegate.autoIndent event, @$textarea[0].selectionStart
        @updateSize()
        @userChangedText = true
      
      # 38 == up, 40 == down, 13 == enter, 16 == shift, 9 == TAB, 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND, 113 = F2, 114 = F3
      unless event.keyCode in [38, 40, 13, 16, 9, 17, 18, 91, 93, 224, 113, 114]
        @delegate.autoComplete event, @$textarea[0].selectionStart
      else if @autoCompleteBox?
        @autoCompleteNavigateUp event

      if @userChangedText
        @userChangedText = false
        @showElements()

        unless @autoCompleteBox?
          @delegate.userChangedText()

    lostFocus: (event) ->
      if @userChangedText
        @userChangedText = false
        @showElements()

        unless @autoCompleteBox?
          @delegate.userChangedText()

    click: (event) ->
      if @autoCompleteBox?
        @delegate.autoComplete event, @$textarea[0].selectionStart
      else
        @delegate.disableAutoCompletion()

    mouseMove: (event) ->
      @delegate.mouseMove event, @pageYToLine(event.pageY), @pageXToColumn(event.pageX)

    mouseLeave: (event) ->
      @delegate.mouseLeave event
