#jshint node:true
"use strict"
module.exports = (jsmm) ->
  jsmm.SimpleRunner = ->
    @init.apply this, arguments

  jsmm.SimpleRunner:: =
    init: (scope, options) ->
      @options = options or {}
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
        @error = @context.getError()  if @context.hasError()

    hasError: ->
      @error isnt null

    getError: ->
      @error

    getTree: ->
      @tree

    getContext: ->
      @context

  jsmm.Event = ->
    @init.apply this, arguments

  jsmm.Event:: =
    init: (runner, type, funcName, args) ->
      @runner = runner
      @type = type
      @funcName = funcName or `undefined`
      @args = args or []
      @context = null

    run: (tree, scope, limits) ->
      @context = new jsmm.Context(tree, scope, limits)
      @runner.delegate.startEvent @context
      @context.run @funcName, @args
      @runner.delegate.endEvent @context

  jsmm.Runner = ->
    @init.apply this, arguments

  jsmm.Runner:: =
    init: (delegate, scope, limits) ->
      @delegate = delegate
      @scope = new jsmm.Scope(scope)
      @exampleScope = @scope
      @limits = limits or jsmm.defaultLimits
      @tree = null
      @baseEvent = new jsmm.Event(this, "base")
      @events = [@baseEvent]
      @eventNum = 0
      @stepNum = Infinity
      @runScope = null
      @errorEventNums = []
      @paused = false
      @interactive = false
      @enabled = false
      @baseCodeChanged = false
      @interactiveSignature = ""

    selectBaseEvent: ->
      if @events.length isnt 1 or @eventNum isnt 0 or @events[0] isnt @baseEvent
        @events = [@baseEvent]
        @stepNum = Infinity
      @eventNum = 0
      @interactive = false
      @paused = false
      @baseCodeChanged = false
      @interactiveSignature = ""
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
      @enabled and not @isStatic() and not @hasError()

    isStatic: ->
      not @interactive or @paused or @isStepping()

    addEvent: (type, funcName, args) ->
      unless @canReceiveEvents()
        false
      else
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
      if @baseEvent.context isnt null
        if @tree.compareAll(@baseEvent.context)
          if @interactive
            @errorEventNums = []
            if not @paused or @eventNum < 0
              
              # don't check if only functions have changed here, as when the base code is changed,
              # the base event should also be invalidated
              @delegate.clearEventsToEnd()
              @events = []
              @eventNum = -1
              @stepNum = Infinity
              @tree.programNode.getFunctionFunction() @runScope
              @baseCodeChanged = true  if @tree.compareBase(@baseEvent.context)
            else
              start = undefined
              if @events[0] is @baseEvent
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
                  @baseCodeChanged = (oldSignature isnt @interactiveSignature)
                  @interactiveSignature = oldSignature # restore it for future comparisons
                start = 1
              else if @tree.compareFunctions(@baseEvent.context)
                @delegate.clearEventsFrom 0
                @runScope = @events[0].context.getStartScope().getCopy()
                @tree.programNode.getFunctionFunction() @runScope
                start = 0
                @baseCodeChanged = true  if @tree.compareBase(@baseEvent.context)
              else
                start = Infinity
                @baseCodeChanged = true
              i = start

              while i < @events.length
                @events[i].run @tree, @runScope, @limits.event
                @runScope = @events[i].context.getBaseScope().getCopy()
                if @events[i].context.hasError()
                  @errorEventNums.push i
                else
                  @exampleScope = @runScope
                i++
              @updateStepping()
          else
            @selectBaseEvent()
            return
        @baseEvent.context.tree = @tree
        @delegate.runnerChanged()
      else
        @selectBaseEvent()

    
    #/ EVENTS ///
    play: ->
      @paused = false
      @stepNum = Infinity
      if @eventNum < @events.length - 1
        @runScope = @events[@eventNum + 1].context.getStartScope().getCopy()
        @events = @events.slice(0, @eventNum + 1)
        @delegate.clearEventsFrom @eventNum + 1
      @delegate.runnerChanged()

    pause: ->
      @paused = true
      @delegate.runnerChanged()

    reload: ->
      @stepNum = Infinity  if @stepNum isnt Infinity
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
      if eventNum >= 0 and eventNum < @events.length
        @eventNum = eventNum
        @step = Infinity
      @delegate.runnerChanged()

    getEventType: ->
      if @eventNum < 0
        ""
      else
        @events[@eventNum].type

    isBaseEventSelected: ->
      @eventNum is 0 and @events[0] is @baseEvent

    
    #/ STEPPING ///
    isStepping: ->
      @stepNum < Infinity

    canStep: ->
      @eventNum >= 0 and @getStepTotal() > 0 and @enabled

    restart: ->
      @stepNum = Infinity  if @stepNum isnt Infinity
      @delegate.runnerChanged()

    stepForward: ->
      if @canStep()
        if @stepNum < @events[@eventNum].context.steps.length - 1
          @stepNum++
        else if @stepNum is Infinity
          @stepNum = 0
        else
          @stepNum = Infinity
        @delegate.runnerChanged()

    stepBackward: ->
      if @canStep()
        if @stepNum < Infinity and @stepNum > 0
          @stepNum--
        else @stepNum = Infinity  if @stepNum < Infinity
        @delegate.runnerChanged()

    getStepTotal: ->
      @events[@eventNum].context.steps.length

    getStepNum: ->
      @stepNum

    setStepNum: (stepNum) ->
      @stepNum = stepNum  if stepNum >= 0 and stepNum < @events[@eventNum].context.steps.length
      @delegate.runnerChanged()

    updateStepping: ->
      total = @getStepTotal()
      if total <= 0
        @stepNum = Infinity
      else @stepNum = total - 1  if @stepNum < Infinity and @stepNum >= total

    
    #/ CONTROLS ///
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
      @paused = true  if @isStepping()

    hasbaseCodeChanged: ->
      @baseCodeChanged

    getAllSteps: ->
      if @eventNum >= 0
        @events[@eventNum].context.getAllSteps()
      else
        []

    
    #/ ERRORS & MSG ///
    hasError: ->
      @eventNum >= 0 and @events[@eventNum].context.hasError()

    getError: ->
      @events[@eventNum].context.getError()

    getErrorEventNums: ->
      @errorEventNums

    getMessage: ->
      if @eventNum < 0 or @events[@eventNum].context is null or @stepNum is Infinity
        null
      else
        @events[@eventNum].context.steps[@stepNum] or null

    
    #/ UTILS ///
    getCallIdsByNodeIds: (nodeIds) ->
      if @eventNum >= 0
        @events[@eventNum].context.getCallIdsByNodeIds nodeIds
      else
        []

    getAllCallIdsByNodeIds: (nodeIds) ->
      callIds = []
      i = 0

      while i < @events.length
        callIds[i] = @events[i].context.getCallIdsByNodeIds(nodeIds)
        i++
      callIds

    getExamples: (text) ->
      jsmm.editor.autocompletion.getExamples @exampleScope, text

    getFunctionNode: ->
      if @events[@eventNum] is @baseEvent or @eventNum < 0
        null
      else
        @tree.getFunctionNode @events[@eventNum].funcName
