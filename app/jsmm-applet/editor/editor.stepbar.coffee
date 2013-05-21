clayer = require('../clayer')

module.exports = (editor) ->
  class editor.Stepbar

    constructor: ($div, ed) ->
      ed.bindEventHandler this

      @$div = $div
      @editor = ed

      @$div.addClass 'editor-stepbar'
      @$div.on 'mousemove', _(@onMouseMove).bind(this)
      @$div.on 'mouseleave', _(@onMouseLeave).bind(this)
      @$div.on 'click', _(@onClick).bind(this)
      
      @$numbers = $('<div class="editor-stepbar-numbers"></div>')
      @$div.append @$numbers
      
      @editorMarginSize = 26 # corresponds to @editor-margin-size in global.less
      
      @stepNumbersLength = 0
      @numberWidth = 16
      @numberMargin = 3
      @currentStep = null
      @mouseX = null
      @locked = false
      @lockedStep = null
      @leftOffset = 0

    remove: ->
      @$div.html ''
      @$div.removeClass 'editor-stepbar'

    update: (runner) ->
      if runner.isStatic() && runner.canStep()
        @setLeftOffset 0 unless @enabled
        @enabled = true
        @runner = runner
        @$numbers.show()
        @setStepTotal runner.getStepTotal()
        @setStepNum runner.getStepNum()
      else
        @disable()

    disable: ->
      @enabled = false
      @runner = null
      @$numbers.hide()
      @mouseX = null
      @unsetlocked()

    ## INTERNAL FUNCTIONS ##
    onMouseMove: (e) ->
      @mouseX = e.pageX - @$div.offset().left
      @updateMouse()

    onMouseLeave: ->
      @mouseX = null
      @updateMouse()

    onClick: ->
      if @currentStep?
        if @locked && @currentStep == @lockedStep
          @unsetlocked()
          @updateMouse()
        else
          @unsetlocked()
          @setlocked()

    setlocked: ->
      @$div.addClass 'editor-stepbar-locked'
      @locked = true
      @lockedStep = @currentStep

      if @lockedStep?
        @$stepNumber(@lockedStep).addClass 'editor-stepbar-step-number-locked'

    unsetlocked: ->
      @$div.removeClass 'editor-stepbar-locked'
      @locked = false
      @lockedStep = null
      @$numbers.children('.editor-stepbar-step-number-locked').removeClass 'editor-stepbar-step-number-locked'

    updateLeftOffset: ->
      return if !@enabled || @locked

      fraction = 0
      fraction = @fractionFromX(@mouseX) if @mouseX?

      @setLeftOffset @leftOffsetFromFraction(fraction)

    updateMouse: ->
      return unless @enabled

      @updateLeftOffset()
      if @mouseX?
        step = @stepFromXAndLeftOffset(@mouseX, @leftOffset)
        @runner.setStepNum step
      else if @currentStep != @lockedStep
        if @lockedStep?
          @runner.setStepNum @lockedStep
        else
          @runner.restart()

    setLeftOffset: (leftOffset) ->
      @$numbers.css 'left', leftOffset
      @leftOffset = leftOffset

    fractionFromX: (x) ->
      sideMargin = @numberWidth / 2
      totalWidth = @$div.outerWidth()
      clippedX = Math.max(sideMargin, Math.min(totalWidth - sideMargin, x))
      (clippedX - sideMargin) / (@$div.outerWidth() - sideMargin * 2)

    leftOffsetFromFraction: (fraction) ->
      numbersWidth = @$numbers.outerWidth()
      divWidth = @$div.outerWidth()
      if numbersWidth >= divWidth
        scrollWidth = numbersWidth - divWidth
        -Math.round(fraction * scrollWidth)
      else
        halfDivWidth = Math.floor(divWidth / 2)
        leftOffsetAlignedRight = divWidth - numbersWidth
        Math.min leftOffsetAlignedRight, halfDivWidth + @editorMarginSize

    stepFromXAndLeftOffset: (x, leftOffset) ->
      width = @numberWidth + @numberMargin
      realX = x - leftOffset + @numberMargin / 2

      totalWidth = @$numbers.outerWidth()
      step = Math.floor(realX * @stepTotal / totalWidth)

      Math.min @stepTotal - 1, Math.max(0, step)

    setStepNum: (stepNum) ->
      stepNum = null if stepNum >= 998

      if @currentStep != stepNum
        if @currentStep?
          @$stepNumber(@currentStep).removeClass 'editor-stepbar-step-number-hover'
        if stepNum?
          @$stepNumber(stepNum).addClass 'editor-stepbar-step-number-hover'
        @currentStep = stepNum

    setStepTotal: (stepTotal) ->
      stepTotal = 998 if stepTotal >= 998

      if stepTotal != @stepTotal
        stepsHTML = ''

        for step in [@stepNumbersLength..stepTotal]
          stepsHTML += @getStepNumberHTML(step)

        @$numbers.append stepsHTML
        @stepNumbersLength = step

        @removeNumbers stepTotal
        @updateNumbersWidth stepTotal
        @stepTotal = stepTotal
        @updateLeftOffset()

    removeNumbers: (fromStep) ->
      $lastStepNumber = @$stepNumber(fromStep - 1)
      $lastStepNumber.nextAll().remove()

      @stepNumbersLength = fromStep
      @currentStep = null if @currentStep >= fromStep
      @unsetlocked() if @lockedStep >= fromStep

    getStepNumberHTML: (step) ->
      """
        <div class="editor-stepbar-step-number editor-stepbar-step-number-#{step}">
          #{step+1}
        </div>
      """

    $stepNumber: (step) ->
      @$numbers.children ".editor-stepbar-step-number-#{step}"

    updateNumbersWidth: (stepTotal) ->
      width = @numberWidth + @numberMargin
      @$numbers.width width * stepTotal
