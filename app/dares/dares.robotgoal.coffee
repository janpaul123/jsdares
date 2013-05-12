applet = require('../jsmm-applet')

module.exports = (dares) ->
  class dares.RobotGoalPoints

    constructor: ($div, min, total, reward) ->
      @min = min
      @total = total
      @reward = reward

      @$container = $("""
        <div class="dare-points-content dare-points-robotgoal">
          <div class="dare-points-info">
            <div class="dare-points-title">
              Goal squares: <span class="dare-points-robotgoal-goals">0</span>
            </div>
            <div class="dare-points-robotgoal-squares"></div>
          </div>
          
          <div class="dare-points-points">0</div>
        </div>
      """)
      $div.prepend @$container
      
      @$squareContainer = @$container.find('.dare-points-robotgoal-squares')
      @$goals = @$container.find('.dare-points-robotgoal-goals')
      @$points = @$container.find('.dare-points-points')
      
      @$squares = []
      for i in [0...min]
        @$squares[i] = $('<div class="dare-points-robotgoal-square"></div>')
        @$squareContainer.append @$squares[i]
      
      if min < total
        $optional = $('<div class="dare-points-robotgoal-optional"></div>')
        @$squareContainer.append $optional

        for i in [min...total]
          @$squares[i] = $('<div class="dare-points-robotgoal-square"></div>')
          $optional.append @$squares[i]
        
        $optional.append '<span class="dare-points-robotgoal-optional-text">optional</span>'

    setValue: (goals) ->
      @$goals.addClass 'dare-points-highlight'
      @$goals.text goals

      if goals > 0
        @$container.addClass 'dare-points-robotgoal-active'
        @$squares[goals - 1].addClass 'dare-points-robotgoal-square-active dare-points-robotgoal-square-blink'
        
        if goals - 2 >= 0
          @$squares[goals - 2].removeClass 'dare-points-robotgoal-square-blink'
      else
        @$container.removeClass 'dare-points-robotgoal-active'

        for $square in @$squares
          $square.removeClass 'dare-points-robotgoal-square-active dare-points-robotgoal-square-blink'
      
      @$points.text @reward * goals
      if goals >= @min
        @$points.addClass 'dare-points-good'
      else
        @$points.removeClass 'dare-points-good'

    endAnimation: ->
      @$goals.removeClass 'dare-points-highlight'
      @$squareContainer.find('.dare-points-robotgoal-square-blink').removeClass 'dare-points-robotgoal-square-blink'


  class dares.RobotGoalDare
    
    dares.addCommonDareMethods @prototype

    constructor: (delegate, ui, options) ->
      @initOptions delegate, ui, options
      @previewBlockSize = @dareOptions.RobotGoal.previewBlockSize || 48
      
      @$div.addClass 'dare dare-robotgoal'
      @robot = @ui.getOutput('robot')
      
      @$originalRobotContainer = $('<span class="dare-robotgoal-original-container"></span>')
      @$originalRobotContainer.on 'click', _(@animateRobot).bind(this)
      @$div.append @$originalRobotContainer
      
      if @dareOptions.hidePreview
        @$originalRobotContainer.hide()
      
      @$originalRobot = $('<div class="dare-robotgoal-original"></div>')
      @$originalRobotContainer.append @$originalRobot
      @$originalRobotContainer.append '<div class="dare-original-refresh"><i class="icon-repeat icon-white"></i></div>'
      
      @originalRobot = new applet.robot.Robot @$originalRobot, true, @previewBlockSize, @robot.getState()
      @originalRobot.insertDelay 30000
      
      simpleRobot = new applet.output.SimpleRobot @robot.getState()
      runner = new applet.jsmm.SimpleRunner robot: simpleRobot.getAugmentedObject()
      runner.run @options.original
      simpleRobot.play @originalRobot
      
      @appendDescription @$div
      
      @initPoints()
      total = @robot.getTotalGoals()
      @minGoals = total - @dareOptions.RobotGoal.optionalGoals
      @goalPoints = new dares.RobotGoalPoints @$points, @minGoals, total, @dareOptions.RobotGoal.goalReward
      @initEditor()
      @animateRobot()

    remove: ->
      @animationFinish()
      @originalRobot.remove()
      @$submit.remove()
      @$originalRobotContainer.remove()

    initOutputs: (outputs) ->
      outputs.robot.enabled = true
      outputs

    animateRobot: ->
      @animationFinish()
      @originalRobot.playAll()

    submit: ->
      return if @error
      @animationFinish()

      @visitedGoals = @robot.getVisitedGoals()
      points = @visitedGoals.length * @dareOptions.RobotGoal.goalReward
      
      @animation = new dares.SegmentedAnimation
      @animation.addSegment 1, 200, _(@animationGoalStartCallback).bind(this)
      @animation.addSegment @visitedGoals.length, 500, _(@animationGoalCallback).bind(this)
      @animation.addRemoveSegment 500, _(@animationGoalFinishCallback).bind(this)
      
      @addToAnimation points, @visitedGoals.length >= @minGoals
      @animation.play()

    animationGoalStartCallback: ->
      @goalPoints.setValue 0

    animationGoalCallback: (i) ->
      if i < @visitedGoals.length
        @goalPoints.setValue i + 1
        @originalRobot.highlightVisitedGoal @visitedGoals[i]

    animationGoalFinishCallback: ->
      @goalPoints.setValue @visitedGoals.length
      @goalPoints.endAnimation()
      @originalRobot.highlightVisitedGoal null
