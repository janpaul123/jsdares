shared = require('../shared')

module.exports = (dares) ->
  class dares.LinePoints

    constructor: ($div, max, reward) ->
      @max = max
      @reward = reward

      @$container = $("""
        <div class="dare-points-content dare-points-lines">
          <div class="dare-points-info">
            <div class="dare-points-title">
              Lines: <span class="dare-points-lines-lines">0</span>
              <span class="dare-points-constraints">no more than #{@max} lines</span>
            </div>

            <div class="dare-points-description">
              You get <strong>#{@reward}</strong> points for every line below the maximum.
              Only lines that actually contain content are counted.
            </div>
          </div>

          <div class="dare-points-points dare-points-good">0</div>
        </div>
      """)
      $div.append @$container
      
      @$lines = @$container.find('.dare-points-lines-lines')
      @$points = @$container.find('.dare-points-points')

    remove: ->
      @$container.remove()

    setValue: (lines) ->
      @$lines.addClass 'dare-points-highlight'
      @$lines.text lines

      if lines <= @max
        @$points.addClass 'dare-points-good'
        @$points.text (@max - lines) * @reward
      else
        @$points.removeClass 'dare-points-good'
        @$points.text 0

    endAnimation: ->
      @$lines.removeClass 'dare-points-highlight'


  class dares.MatchPoints

    constructor: ($div, min, type) ->
      @min = min

      units = if type is 'console' then 'characters' else 'pixels'
      @$container = $("""
        <div class="dare-points-content dare-points-match">
          <div class="dare-points-info">
            <div class="dare-points-title">
              Matching #{units}: <span class="dare-points-match-percentage">0</span>%
              <span class="dare-points-constraints">at least #{@min}%</span>
            </div>

            <div class="dare-points-description">
              You get one point for every percentage of the #{type} output that matches.
            </div>
          </div>

          <div class="dare-points-points">0</div>
        </div>
      """)
      $div.prepend @$container
      
      @$percentage = @$container.find('.dare-points-match-percentage')
      @$points = @$container.find('.dare-points-points')

    setValue: (percentage) ->
      @$percentage.addClass 'dare-points-highlight'
      @$percentage.text percentage

      @$points.text percentage
      if percentage >= @min
        @$points.addClass 'dare-points-good'
      else
        @$points.removeClass 'dare-points-good'

    endAnimation: ->
      @$percentage.removeClass 'dare-points-highlight'


  class dares.HighscorePoints

    constructor: ($div, name) ->
      @$div = $div
      @name = name

      @$container = $("""
        <div class="dare-points-highscore">
          <div class="dare-points-highscore-score">0</div>
          <div class="dare-points-highscore-share"></div>
        </div>
      """)
      @$div.append @$container
      
      @$score = @$container.find('.dare-points-highscore-score')
      @$share = @$container.find('.dare-points-highscore-share')

    show: ->
      @$container.addClass 'dare-points-highscore-active'
      @$div.addClass 'dare-points-has-highscore'

    blink: ->
      @$container.addClass 'dare-points-highscore-blink'

    setValue: (score) ->
      @$score.text score

      encodedText = encodeURIComponent """I completed the "#{@name}" dare with #{score} points on @jsdares!"""
      
      $twitter = $("""
        <a href="https://twitter.com/intent/tweet?text=#{encodedText}" target="_blank">
          <i class="icon icon-white icon-twitter"></i>
        </a>
      """)

      $twitter.click (event) ->
        event.preventDefault()
        window.open twitUrl, '', 'width=550,height=300'

      @$share.html $twitter

    endAnimation: ->
      @$container.removeClass 'dare-points-highscore-blink'


  class dares.SegmentedAnimation

    constructor: ->
      @segments = []
      @removeSegments = []
      @timeout = null

    remove: ->
      @clearTimeout()
      removeSegment() for removeSegment in @removeSegments

    prependSegment: (to, delay, callback) ->
      return unless to > 0
      @segments.unshift
        to: to
        delay: delay
        callback: callback
        popRemove: false

    addSegment: (to, delay, callback) ->
      return unless to > 0
      @segments.push
        to: to
        delay: delay
        callback: callback
        popRemove: false

    addRemoveSegment: (delay, callback) ->
      @segments.push
        to: 1
        delay: delay
        callback: callback
        popRemove: @removeSegments.length

      @removeSegments.push callback

    play: ->
      @position = 0
      @segment = 0
      @animateNext()
    
    ## INTERNAL FUNCTIONS ##
    clearTimeout: ->
      if @timeout?
        clearTimeout @timeout
        @timeout = null

    animateNext: ->
      @clearTimeout()

      while @segment < @segments.length
        segment = @segments[@segment]
        segment.callback @position

        if segment.popRemove != false
          @removeSegments.splice segment.popRemove, 1

        @position++
        if @position >= segment.to
          @segment++
          @position = 0

        if segment.delay > 0
          @timeout = setTimeout (=> @animateNext()), segment.delay
          return


  dares.openDare = (delegate, ui, options) ->
    options = shared.dares.sanitizeInput(options, shared.dares.dareOptions)
    config = ui.loadConfigProgram(shared.dares.configDefinition, options.configProgram, options.outputStates)
    
    options.dare = config.dare
    options.outputs = config.outputs
    
    if dares[options.dare.type + 'Dare']
      new dares[options.dare.type + 'Dare'](delegate, ui, options)
      true
    else
      false


  dares.addCommonDareMethods = (dare) ->
    dare.initOptions = (delegate, ui, options) ->
      @delegate = delegate
      @ui = ui

      @options = options
      @dareOptions = options.dare
      @animation = null
      @completed = @options.instance.completed
      @highscore = @options.instance.highscore

      @editor = @ui.addEditor(@options.editor)
      @$div = @ui.addTab('dare')
      @ui.registerAdditionalObject 'dare', this
      @ui.loadOutputs @initOutputs(options.outputs)
      @ui.selectTab 'dare'

    dare.getId = ->
      @options._id

    dare.appendDescription = ($div) ->
      @$description = $('<div class="dare-description"></div>')
      @$description.append '<h2>' + @options.name + '</h2><div class="dare-text">' + @options.description + '</div>'
      @ui.prepareTextElement @$description
      $div.append @$description
      
      @$submit = $('<div class="btn btn-success dare-submit">Submit solution</div>')
      @$submit.on 'click', _(@submit).bind(this)
      @$description.append @$submit

    dare.initPoints = ->
      @$points = $('<div class="dare-points"></div>')
      @$div.append @$points
      @$points.hide()
      
      @linePoints = null
      if @dareOptions.maxLines > 0
        @linePoints = new dares.LinePoints(@$points, @dareOptions.maxLines, @dareOptions.lineReward)
      
      @highscorePoints = new dares.HighscorePoints(@$points, @options.name)
      
      if @completed
        @highscorePoints.show()
        @highscorePoints.setValue @highscore

    dare.initEditor = ->
      if @options.instance.text
        @editor.setText @options.instance.text
      @editor.setTextChangeCallback _(@updateProgram).bind(this)

    dare.hasError = ->
      @error = true
      @$submit.addClass 'disabled'
      @animationFinish()

    dare.setCallNr = ->
      @error = false
      @$submit.removeClass 'disabled'
      @animationFinish()

    dare.updateHighScore = (points) ->
      if !@completed || points > @highscore
        @completed = true
        @highscore = points
        @animation.addSegment 1, 0, _(@animationHighscoreBlinkCallback).bind(this)
        @animation.addSegment points, 5, _(@animationHighscoreIncreaseCallback).bind(this)
      if @completed
        @options.instance.completed = @completed
        @options.instance.highscore = @highscore
        @options.instance.text = @editor.getText()
        @delegate.getSync().updateInstance @options.instance

    dare.updateProgram = (text) ->
      @options.instance.text = text
      @delegate.getSync().updateProgram @options.instance

    dare.hasValidNumberOfLines = ->
      @linePoints == null || @editor.getContentLines().length <= @dareOptions.maxLines

    dare.addLineAnimation = ->
      @contentLines = @editor.getContentLines()
      @animation.addSegment 1, 500, _(@animationLinesStartCallback).bind(this)
      @animation.addSegment @contentLines.length, Math.min(500, Math.max(1300 / @contentLines.length, 50)), _(@animationLinesCallback).bind(this)
      @animation.addRemoveSegment 0, _(@animationLinesFinishCallback).bind(this)
      (@dareOptions.maxLines - @contentLines.length) * @dareOptions.lineReward

    dare.addToAnimation = (points, enough) ->
      unless @$points.is(':visible')
        @animation.prependSegment 1, 400, _(@animationSlideDown).bind(this)
      
      if @linePoints?
        points += @addLineAnimation()

      if enough && @hasValidNumberOfLines()
        @updateHighScore points

      @animation.addSegment 1, 0, _(@animationFinish).bind(this)

    dare.animationSlideDown = ->
      @$points.slideDown 400

    dare.animationLinesStartCallback = ->
      @linePoints.setValue 0

    dare.animationLinesCallback = (line) ->
      @editor.highlightContentLine @contentLines[line]
      @linePoints.setValue line + 1

    dare.animationLinesFinishCallback = ->
      @linePoints.setValue @contentLines.length
      @linePoints.endAnimation()
      @editor.highlightContentLine null

    dare.animationHighscoreBlinkCallback = ->
      @highscorePoints.show()
      @highscorePoints.blink()

    dare.animationHighscoreIncreaseCallback = (score) ->
      @highscorePoints.setValue score

    dare.animationFinish = ->
      if @animation != null
        @animation.remove()
        @animation = null
        @highscorePoints.setValue @highscore
        @highscorePoints.endAnimation()

    dare
