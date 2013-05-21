clayer = require('../clayer')

module.exports = (editor) ->
  class editor.PlayPauseAnimation

    constructor: ($playPause) ->
      @$playPause = $playPause
      @$playPauseAnimationBlock = $('<div class="editor-toolbar-run-playpause-animation-block"></div>')
      @$playPauseAnimationContainer = $('<div class="editor-toolbar-run-playpause-animation-container"></div>')
      @$playPauseAnimationContainer.append @$playPauseAnimationBlock
      @$playPause.append @$playPauseAnimationContainer
      
      @$playPauseIcon = $('<i class="icon icon-play icon-white"></i>')
      @$playPause.append @$playPauseIcon
      
      #this.max = this.$playPauseAnimationContainer.width();
      @max = 30
      @playing = false
      @animating = false
      @position = 0
      @speed = 0.01
      @restartTimeout = null

    animate: (animate) ->
      if animate != @animating
        @animating = animate
        if @animating
          @startAnimation()
        else
          @stopTimeout()
          @setFraction ((new Date).getTime() - @lastAnimationTime) * @speed / @max

    play: ->
      unless @playing
        @playing = true
        @$playPauseIcon.addClass 'icon-pause'
        @$playPauseIcon.removeClass 'icon-play'

    pause: ->
      if @playing
        @playing = false
        @setFraction 1
        @$playPauseIcon.addClass 'icon-play'
        @$playPauseIcon.removeClass 'icon-pause'

    setFraction: (fraction) ->
      @stopTimeout()
      @position = fraction * @max
      clayer.setCss3 @$playPauseAnimationBlock, 'transition', 'none'
      @$playPauseAnimationBlock.css 'width', @position
      if @animating
        @restartTimeout = setTimeout(@startAnimation, 0)

    
    ## INTERNAL FUNCTIONS ##
    startAnimation: =>
      @stopTimeout()
      time = (@max - @position) / @speed
      clayer.setCss3 @$playPauseAnimationBlock, 'transition', 'width ' + time + 'ms linear'
      @$playPauseAnimationBlock.css 'width', @max
      @restartTimeout = setTimeout(@restartAnimation, time)
      @lastAnimationTime = (new Date).getTime()

    restartAnimation: =>
      @stopTimeout()
      clayer.setCss3 @$playPauseAnimationBlock, 'transition', ''
      @$playPauseAnimationBlock.css 'width', 0
      @position = 0
      @lastAnimationTime = (new Date).getTime()
      @restartTimeout = setTimeout(@startAnimation, @start + @max)

    stopTimeout: ->
      if @restartTimeout?
        clearTimeout @restartTimeout
        @restartTimeout = null

  class editor.RunBar

    eventWidth: 6

    constructor: ($div, ed) ->
      @runner = null
      @$div = $div
      @editor = ed
      
      @$div.on 'mouseenter', _(@mouseEnter).bind(this)
      @$div.on 'mouseleave', _(@mouseLeave).bind(this)
      
      @$reload = $('<button class="btn btn-primary editor-toolbar-reload"><i class="icon icon-repeat icon-white"></i></button>')
      @$reload.on 'click', _(@reload).bind(this)
      @$div.append @$reload
      
      @$playPause = $('<button class="btn btn-primary dropdown-toggle editor-toolbar-run-playpause"></button>')
      @$playPause.tooltip
        title: 'play/pause (<strong>esc</strong>)'
        placement: 'bottom'
      @$playPause.on 'click', _(@playPause).bind(this)
      @$div.append @$playPause
      
      @playPauseAnimation = new editor.PlayPauseAnimation(@$playPause)

      @$sliderContainer = $('<div class="editor-toolbar-run-slider-container"></div>')
      @$sliderButton = $('<div class="btn btn-primary editor-toolbar-run-slider-button"></div>')
      @$slider = $('<div class="editor-toolbar-run-slider"></div>')
      @slider = new clayer.Slider(@$slider, this, @eventWidth)
      @$sliderButton.append @$slider
      @$sliderContainer.append @$sliderButton
      @$div.append @$sliderContainer

      @$stepBarContainer = $('<div class="btn-group editor-toolbar-run-step-bar-container"></div>')
      @$stepBarContainer.append '<div class="editor-toolbar-run-step-bar-arrow"></div>'
      @$div.append @$stepBarContainer

      @$stepBarErrorIcon = $('<i class="icon-exclamation-sign-color editor-toolbar-run-step-bar-error-icon"/></i>')
      @$stepBarErrorIcon.on 'click', _(@errorIconClick).bind(this)
      @$stepBarContainer.append @$stepBarErrorIcon

      @$stepBarIcon = $('<i></i>')
      @$stepBarContainer.append @$stepBarIcon

      @sliderEnabled = true
      @stepBarEnabled = true
      @$stepBarContainer.hide() # hacky fix
      @disable()

    remove: ->
      @playPauseAnimation.animate false
      @slider.remove()
      @$stepBarErrorIcon.remove()
      @$stepBarContainer.remove()
      @$playPause.remove()
      @$slider.remove()
      @$sliderContainer.remove()

    disable: ->
      @canRun = false
      @$reload.removeClass 'editor-toolbar-reload-blink'
      @$reload.addClass 'disabled'
      @playPauseAnimation.animate false
      @$playPause.addClass 'disabled'
      @hideSlider()

    iconForEventType: (eventType) ->
      switch eventType
        when 'base' then 'icon-stop'
        when 'interval' then 'icon-time'
        else "icon-#{eventType}"

    update: (runner) ->
      @canRun = true
      @runner = runner

      @$reload.removeClass 'disabled'
      @playPauseAnimation.animate runner.canReceiveEvents()
      @$playPause.removeClass 'disabled'

      if @runner.isPaused()
        @playPauseAnimation.pause()
        if @runner.hasEvents()
          unless @sliderEnabled
            @sliderEnabled = true
            @$stepBarContainer.fadeIn 150
            @$div.removeClass 'editor-toolbar-run-slider-disabled'
            @$div.addClass 'editor-toolbar-run-slider-enabled'
            @$slider.width @runner.getEventTotal() * @eventWidth
            @slider.setValue @runner.getEventNum()
            @$sliderButton.css 'margin-left', ''
          @showStepBar()
          @setSliderErrors runner
          @playPauseAnimation.setFraction @runner.getEventNum() / (@runner.getEventTotal() - 1)
          @$stepBarContainer.css 'left', @$sliderContainer.position().left + @runner.getEventNum() * @eventWidth
          @$stepBarIcon.removeClass()

          icon = @iconForEventType(@runner.getEventType())
          @$stepBarIcon.addClass 'icon editor-toolbar-run-step-bar-icon icon-white ' + icon

          if @runner.hasError()
            @$stepBarContainer.addClass 'editor-toolbar-run-step-bar-error'
          else
            @$stepBarContainer.removeClass 'editor-toolbar-run-step-bar-error'
        else
          @hideSlider()
      else
        @playPauseAnimation.play()
        @hideSlider()
        if @runner.isBaseEventSelected()
          @playPauseAnimation.setFraction 0

      @$reload.toggleClass 'editor-toolbar-reload-blink', @runner.hasbaseCodeChanged()

    setSliderErrors: (runner) ->
      segments = []
      for errorEventNum in runner.getErrorEventNums()
        if lastSegment?.end == errorEventNum-1
          lastSegment.end = errorEventNum
        else
          lastSegment = 
            start: errorEventNum
            end: errorEventNum
            color: 'rgba(255, 0, 0, 0.7)'
          segments.push lastSegment

      @slider.setSegments segments

    hideSlider: ->
      if @sliderEnabled
        @sliderEnabled = false
        @$div.addClass 'editor-toolbar-run-slider-disabled'
        @$div.removeClass 'editor-toolbar-run-slider-enabled'
        @$sliderButton.css 'margin-left', -@$slider.width() - 20
        @editor.highlightFunctionNode null
        @hideStepBar()

    playPause: ->
      if @runner? and @runner.isInteractive()
        if @runner.isPaused()
          @runner.play()
        else
          @runner.pause()

    reload: ->
      @runner.reload() if @canRun

    sliderChanged: (value) ->
      if @runner.isPaused()
        @runner.setEventNum value
        @editor.highlightFunctionNode @runner.getFunctionNode(), !@runner.isStepping()

    showStepBar: ->
      unless @stepBarEnabled
        @$stepBarContainer.fadeIn 150
        @stepBarEnabled = true

    hideStepBar: ->
      if @stepBarEnabled
        @$stepBarContainer.fadeOut 150
        @stepBarEnabled = false

    mouseEnter: (event) ->
      if @sliderEnabled
        @editor.highlightFunctionNode @runner.getFunctionNode()
        @showStepBar()

    mouseLeave: (event) ->
      @editor.highlightFunctionNode null
      if @sliderEnabled && @stepBarEnabled && !@runner.isStepping()
        @hideStepBar()

    errorIconClick: ->
      @editor.scrollToError()

  class editor.Toolbar

    constructor: ($div, ed) ->
      ed.bindEventHandler this
      
      @$div = $div
      @editor = ed
      
      @$div.addClass 'editor-toolbar'
      
      $runBar = $('<div class="btn-group editor-toolbar-run-bar"></div>')
      @runBar = new editor.RunBar($runBar, @editor)
      @$div.append $runBar
      @keyDown = _(@keyDown).bind(this)
      @keyUp = _(@keyUp).bind(this)
      @lostFocus = _(@lostFocus).bind(this)
      $(document).on 'keydown', @keyDown
      $(document).on 'keyup', @keyUp
      $(window).on 'blur', @lostFocus

      @keys = {}
      @timers = {}
      @clearAllKeys()
      @enabled = true

    remove: ->
      @runBar.remove()
      @clearAllKeys()
      $(document).off 'keydown', @keyDown
      $(document).off 'keyup', @keyUp
      $(window).off 'blur', @lostFocus
      @$div.html ''
      @$div.removeClass 'editor-toolbar editor-toolbar-interactive'

    update: (runner) ->
      @enabled = true
      if runner.isInteractive()
        @runBar.update runner
        @$div.addClass 'editor-toolbar-interactive'
      else
        @runBar.disable()
        @$div.removeClass 'editor-toolbar-interactive'

    disable: ->
      @enabled = false
      @runBar.disable()
      @clearAllKeys()
    
    ## INTERNAL FUNCTIONS ##
    keyDown: (event) ->
      return  unless @enabled
      
      # 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND, 27 == ESC, 113 = F2, 114 = F3
      if event.keyCode == 27
        unless @keys.escape
          @runBar.playPause()
        @setKey 'escape'
        event.preventDefault()

    keyUp: (event) ->
      return unless @enabled
      
      # 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND, 27 == ESC, 113 = F2, 114 = F3
      if event.keyCode == 27
        @clearKey 'escape'
        event.preventDefault()

    lostFocus: (event) ->
      return  unless @enabled
      @clearAllKeys()

    setKey: (type) ->
      @clearTimer type
      @keys[type] = true
      @timers[type] = setTimeout (=>
        @keys[type] = false
      ), 1000

    clearKey: (type) ->
      @clearTimer type
      @keys[type] = false

    clearTimer: (type) ->
      if @timers[type]?
        clearTimeout @timers[type]
        delete @timers[type]

    clearAllKeys: ->
      @clearKey 'escape'
