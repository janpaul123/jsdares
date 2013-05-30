module.exports = (jsmm) ->

  class jsmm.SimpleRunner

    constructor: (scope, options) ->
      @options = options || {}
      @scope = new jsmm.Scope(scope)
      @error = null
      @context = null

    run: (text) ->
      tree = new jsmm.Tree(text, @options)
      if tree.hasError()
        @error = tree.getError()
      else
        @context = new jsmm.Context(tree, @scope, jsmm.defaultLimits.base)
        @context.run()
        if @context.hasError()
          @error = @context.getError()

    hasError: ->
      @error?

    getError: ->
      @error

    getTree: ->
      @tree

    getContext: ->
      @context

  
  class jsmm.Event

    constructor: (runner, type, funcName, args) ->
      @runner = runner
      @type = type
      @funcName = funcName || null
      @args = args || []
      @context = null

    run: (tree, scope, limits) ->
      @context = new jsmm.Context(tree, scope, limits)
      @runner.delegate.startEvent @context
      @context.run @funcName, @args
      @runner.delegate.endEvent @context


  class jsmm.Runner

    constructor: (delegate, scope, limits) ->
      @delegate = delegate
      @scope = new jsmm.Scope(scope)
      @exampleScope = @scope
      @limits = limits || jsmm.defaultLimits

      @tree = null
      @baseEvent = new jsmm.Event(this, 'base')
      @events = [@baseEvent]
      @eventNum = 0
      @stepNum = Infinity
      @runScope = null
      @errorEventNums = []

      @paused = false
      @interactive = false
      @enabled = false
      @baseCodeChanged = false
      @interactiveSignature = ''

    selectBaseEvent: ->
      if @events.length != 1 || @eventNum != 0 || @events[0] != @baseEvent
        @events = [@baseEvent]
        @stepNum = Infinity

      @eventNum = 0
      @interactive = false
      @paused = false
      @baseCodeChanged = false
      @interactiveSignature = ''
      @errorEventNums = []
      @delegate.clearReload()
      @delegate.clearAllEvents()
      @baseEvent.run @tree, @scope.getCopy(), @limits.base
      @runScope = @baseEvent.context.getBaseScope().getCopy()

      if @baseEvent.context.hasError()
        @errorEventNums.push 0
        @paused = true
      else
        @exampleScope = @runScope

      @updateStepping()
      @delegate.runnerChanged()

    canReceiveEvents: ->
      @enabled && !@isStatic() && !@hasError()

    isStatic: ->
      !@interactive || @paused || @isStepping()

    addEvent: (type, funcName, args) ->
      return false unless @canReceiveEvents()
      
      event = new jsmm.Event(this, type, funcName, args)
      event.run @tree, @runScope, @limits.event
      @runScope = event.context.getBaseScope().getCopy()
      
      @eventNum = @events.length
      @events.push event
      if @events.length > @limits.history
        @events.shift()
        @eventNum--
        @delegate.popFirstEvent()
      if event.context.hasError()
        @errorEventNums.push @events.length - 1
        @paused = true
        @delegate.runnerChanged()
      else
        @exampleScope = @runScope
        @delegate.runnerChangedEvent()
      true

    newTree: (tree) ->
      @tree = tree
      return @selectBaseEvent() unless @baseEvent.context?

      if @tree.compareAll(@baseEvent.context)
        return @selectBaseEvent() unless @interactive
        
        @errorEventNums = []
        if !@paused || @eventNum < 0
          # don't check if only functions have changed here, as when the base code == changed,
          # the base event should also be invalidated
          @delegate.clearEventsToEnd()
          @events = []
          @eventNum = -1
          @stepNum = Infinity
          @tree.programNode.getFunctionFunction() @runScope
          
          if @tree.compareBase(@baseEvent.context)
            @baseCodeChanged = true
        else
          if @events[0] == @baseEvent
            oldSignature = @interactiveSignature
            @delegate.clearAllEvents()
            @baseEvent.run @tree, @scope.getCopy(), @limits.base
            @runScope = @baseEvent.context.getBaseScope().getCopy()
            if @baseEvent.context.hasError()
              @errorEventNums.push 0
              # when there was an error, functions may not have been declared
              @tree.programNode.getFunctionFunction() @runScope
              @baseCodeChanged = false
            else
              @exampleScope = @runScope
              @baseCodeChanged = (oldSignature != @interactiveSignature)
              @interactiveSignature = oldSignature # restore it for future comparisons
            start = 1
          else if @tree.compareFunctions(@baseEvent.context)
            @delegate.clearEventsFrom 0
            @runScope = @events[0].context.getStartScope().getCopy()
            @tree.programNode.getFunctionFunction() @runScope
            start = 0

            if @tree.compareBase(@baseEvent.context)
              @baseCodeChanged = true
          else
            start = Infinity
            @baseCodeChanged = true

          for i in [start...@events.length]
            event = @events[i]
            event.run @tree, @runScope, @limits.event
            @runScope = event.context.getBaseScope().getCopy()
            if event.context.hasError()
              @errorEventNums.push i
            else
              @exampleScope = @runScope

          @updateStepping()

      @baseEvent.context.tree = @tree
      @delegate.runnerChanged()
    
    ## EVENTS ##
    play: ->
      @paused = false
      @stepNum = Infinity
      if @eventNum < @events.length - 1
        @runScope = @events[@eventNum + 1].context.getStartScope().getCopy()
        @events = @events[0..@eventNum]
        @delegate.clearEventsFrom @eventNum + 1
      @delegate.runnerChanged()

    pause: ->
      @paused = true
      @delegate.runnerChanged()

    reload: ->
      @stepNum = Infinity
      @selectBaseEvent()

    isPaused: ->
      @paused

    hasEvents: ->
      @events.length > 0

    getEventTotal: ->
      @events.length

    getEventNum: ->
      @eventNum

    setEventNum: (eventNum) ->
      if 0 <= eventNum < @events.length
        @eventNum = eventNum
        @step = Infinity
      @delegate.runnerChanged()

    getEventType: ->
      if @eventNum >= 0
        @events[@eventNum].type
      else
        ''

    isBaseEventSelected: ->
      @eventNum == 0 && @events[0] == @baseEvent

    ## STEPPING ##
    isStepping: ->
      @stepNum < Infinity

    canStep: ->
      @eventNum >= 0 && @getStepTotal() > 0 && @enabled

    restart: ->
      @stepNum = Infinity
      @delegate.runnerChanged()

    stepForward: ->
      if @canStep()
        if @stepNum < @events[@eventNum].context.steps.length - 1
          @stepNum++
        else if @stepNum == Infinity
          @stepNum = 0
        else
          @stepNum = Infinity
        @delegate.runnerChanged()

    stepBackward: ->
      if @canStep()
        if 0 < @stepNum < Infinity
          @stepNum--
        else
          @stepNum = Infinity
        @delegate.runnerChanged()

    getStepTotal: ->
      @events[@eventNum].context.steps.length

    getStepNum: ->
      @stepNum

    setStepNum: (stepNum) ->
      if 0 <= stepNum < @events[@eventNum].context.steps.length
        @stepNum = stepNum
      @delegate.runnerChanged()

    updateStepping: ->
      total = @getStepTotal()
      if total <= 0
        @stepNum = Infinity
      else if total <= @stepNum < Infinity
        @stepNum = total - 1
    
    ## CONTROLS ##
    enable: ->
      @enabled = true

    disable: ->
      @enabled = false

    isEnabled: ->
      @enabled

    isInteractive: ->
      @interactive

    makeInteractive: (signature) ->
      @interactive = true
      @interactiveSignature = signature
      @paused = true if @isStepping()

    hasbaseCodeChanged: ->
      @baseCodeChanged

    getAllSteps: ->
      if @eventNum >= 0
        @events[@eventNum].context.getAllSteps()
      else
        []
    
    ## ERRORS & MSG ##
    hasError: ->
      @eventNum >= 0 && @events[@eventNum].context.hasError()

    getError: ->
      @events[@eventNum].context.getError()

    getErrorEventNums: ->
      @errorEventNums

    getMessage: ->
      if @eventNum < 0 || @events[@eventNum].context == null || @stepNum == Infinity
        null
      else
        @events[@eventNum].context.steps[@stepNum] || null

    ## UTILS ##
    getCallIdsByNodeIds: (nodeIds) ->
      if @eventNum >= 0
        @events[@eventNum].context.getCallIdsByNodeIds nodeIds
      else
        []

    getAllCallIdsByNodeIds: (nodeIds) ->
      (e.context.getCallIdsByNodeIds(nodeIds) for e in @events)

    getExamples: (text) ->
      jsmm.editor.autocompletion.getExamples @exampleScope, text

    getFunctionNode: ->
      if @events[@eventNum] == @baseEvent || @eventNum < 0
        null
      else
        @tree.getFunctionNode @events[@eventNum].funcName
