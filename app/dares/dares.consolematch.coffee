applet = require('../jsmm-applet')

module.exports = (dares) ->
  class dares.AnimatedConsole

    constructor: ($div) ->
      @$div = $div
      @$div.addClass 'dare-consolematch-animatedconsole'
      @text = ''
      @calls = []
      @width = @height = @position = 0
      @timeout = null

    remove: ->
      @$div.removeClass 'dare-consolematch-animatedconsole'
      @clearTimeout()

    run: (code) ->
      simpleConsole = new applet.output.SimpleConsole
      runner = new applet.jsmm.SimpleRunner console: simpleConsole.getAugmentedObject()
      runner.run code
      @calls = @calls.concat(simpleConsole.getCalls())
      @text = simpleConsole.getText()

      for call in @calls
        @applyCall call
        @width = Math.max(@width, @$div.width())
        @height = Math.max(@height, @$div.height())

      @$div.width @width # fix width and height
      @$div.height @height

    play: (delay) ->
      if delay?
        @delay = delay
      else
        @delay = Math.max(2000 / @calls.length, 30)

      @clearTimeout()
      @position = 0
      @$div.html ''
      @animateNext()

    getText: ->
      @text
    
    ## INTERNAL FUNCTIONS ##
    clearTimeout: ->
      if @timeout?
        clearTimeout @timeout
        @timeout = null

    animateNext: ->
      @clearTimeout()

      while @position < @calls.length
        @applyCall @calls[@position++]
        if @delay > 0
          @timeout = setTimeout (=> @animateNext()), @delay
          return

    applyCall: (call) ->
      if call.clear
        @$div.html ''
      else
        $line = $('<div class="dare-consolematch-animatedconsole-line"></div>')
        $line.text call.text
        $line.css 'color', call.color
        @$div.append $line

  class dares.ConsoleMatchDare

    dares.addCommonDareMethods @prototype

    constructor: (delegate, ui, options) ->
      @initOptions delegate, ui, options

      @$div.addClass 'dare dare-consolematch'
      @console = @ui.getOutput('console')
      
      @appendDescription @$div
      
      @$originalConsoleContainer = $('<div class="dare-consolematch-original-container"></div>')
      @$originalConsoleContainer.on 'click', _(@animateConsole).bind(this)
      @$div.append @$originalConsoleContainer
      
      @$resultConsole = $('<canvas class="dare-consolematch-result"></canvas>')
      @$originalConsoleContainer.append @$resultConsole
      @resultContext = @$resultConsole[0].getContext('2d')
      
      @$originalConsoleContainer.append '<div class="dare-original-refresh"><i class="icon-repeat icon-white"></i></div>'
      @$originalConsole = $('<div class="dare-consolematch-original-console"></div>')
      @$originalConsoleContainer.append @$originalConsole
      
      @originalAnim = new dares.AnimatedConsole(@$originalConsole)
      @originalAnim.run @options.original
      
      if @dareOptions.hidePreview
        @$originalConsoleContainer.hide()

      @initOffsets()
      @$originalConsole.width @$originalConsole.width() + @charWidth
      @$resultConsole.attr 'width', @$originalConsole.width()
      @$resultConsole.attr 'height', @$originalConsole.height() + @lineHeight
      
      @fullText = @originalAnim.getText()
      @console.makeTargetConsole @fullText
      
      @initPoints()
      @matchPoints = new dares.MatchPoints(@$points, @dareOptions.ConsoleMatch.minPercentage, 'console')
      @initEditor()
      @animateConsole()

    remove: ->
      @animationFinish()
      @$submit.remove()
      @$originalConsoleContainer.remove()

    initOutputs: (outputs) ->
      outputs.console.enabled = true
      outputs

    animateConsole: ->
      @animationFinish()
      @drawConsole @dareOptions.ConsoleMatch.speed

    drawConsole: (speed) ->
      @resultContext.clearRect 0, 0, @$resultConsole.width(), @$resultConsole.height()
      @originalAnim.play speed

    submit: ->
      return if @error
      @animationFinish()

      userText = @console.getText()
      @animationRects = []
      matching = x = y = maxX = 0
      @percentage = 100

      for orig, i in @fullText
        match = orig == userText[i]
        matching++ if match
        @percentage = Math.floor(100 * matching / @fullText.length)
        
        if orig is '\n'
          @animationRects.push x1: x, x2: x + 1, y: y, match: match, points: @percentage
          x = 0
          y++
        else
          prevX = x
          if orig is '\t'
            # tab width: 8
            x += 8 - (x % 8)
          else
            x++
          @animationRects.push x1: prevX, x2: x, y: y, match: match, points: @percentage
          maxX = Math.max(x, maxX)

      surplus = userText.length - @fullText.length
      maxX += 2 # account for last character and endline marker
      
      if surplus > 0
        origMatching = matching
        parts = Math.min(surplus, 30)

        for i in [1..parts]
          matching = Math.max(0, Math.floor(origMatching - i / parts * surplus))
          @percentage = Math.floor(100 * matching / @fullText.length)
          @animationRects.push
            x1: maxX * (i-1) / parts
            x2: maxX * i / parts
            y: y
            match: false
            points: @percentage
        matching = origMatching - surplus

      @percentage = Math.max(0, Math.floor(100 * matching / @fullText.length))
      animationSteps = Math.min(@animationRects.length, 100)
      @stepSize = Math.floor(@animationRects.length / animationSteps)
      animationSteps = Math.ceil(@animationRects.length / @stepSize)
      
      @animation = new dares.SegmentedAnimation()
      @animation.addSegment 1, 500, _(@animationMatchingStartCallback).bind(this)
      @animation.addSegment animationSteps, Math.max(1500 / animationSteps, 30), _(@animationMatchingCallback).bind(this)
      @animation.addRemoveSegment 500, _(@animationMatchingFinishCallback).bind(this)
      
      @addToAnimation @percentage, @percentage >= @dareOptions.ConsoleMatch.minPercentage
      @animation.play()

    initOffsets: ->
      # setting up mirror
      $mirror = $('<span class="dare-consolematch-mirror"></span>')
      @$originalConsoleContainer.append $mirror
      
      $mirror.text 'a'
      textOffset =
        x: $mirror.outerWidth()
        y: $mirror.outerHeight()
      
      # this trick of measuring a long string especially helps Firefox get an accurate character width
      $mirror.text 'a' + new Array(100 + 1).join('a')
      @charWidth = ($mirror.outerWidth() - textOffset.x) / 100
      
      $mirror.text 'a\na'
      @lineHeight = $mirror.outerHeight() - textOffset.y
      
      # this works assuming there is no padding on the right or bottom
      textOffset.x -= @charWidth
      textOffset.y -= @lineHeight
      
      # this.$resultConsole.css('left', textOffset.x);
      # this.$resultConsole.css('top', textOffset.y);
      $mirror.remove()

    animationMatchingStartCallback: ->
      @matchPoints.setValue 0
      @drawConsole 0

    animationMatchingCallback: (i) ->
      rectangle = null

      j = 0
      while j < @stepSize && @stepSize * i + j < @animationRects.length
        rectangle = @animationRects[@stepSize * i + j]
        if rectangle.match
          @resultContext.fillStyle = '#060'
        else
          @resultContext.fillStyle = '#600'
        @resultContext.fillRect rectangle.x1 * @charWidth, rectangle.y * @lineHeight, (rectangle.x2 - rectangle.x1) * @charWidth, @lineHeight
        @matchPoints.setValue rectangle.points
        j++

    animationMatchingFinishCallback: ->
      @matchPoints.setValue @percentage
      @matchPoints.endAnimation()
