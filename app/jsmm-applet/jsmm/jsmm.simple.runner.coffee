#jshint node:true
"use strict"
module.exports = (jsmm) ->
  require("./jsmm.msg") jsmm
  jsmm.OldSimpleRunner = ->
    @init.apply this, arguments

  jsmm.OldSimpleRunner:: =
    init: (text, scope) ->
      @code = text or ""
      @scope = scope or {}
      @reset()

    reset: ->
      @tree = null
      @rawFunc = null
      @safeFunc = null
      @stack = null
      @stepPos = null
      @resetError()

    resetError: ->
      @error = null

    setText: (text) ->
      @reset()
      @code = text

    setScope: (scope) ->
      @reset()
      @scope = scope

    getCode: ->
      @code

    handleError: (error) ->
      
      #console.log(error);
      if error.type is "Error"
        @error = error
      else
        throw error@error = new jsmm.msg.Error(0, "An unknown error has occurred", error)

    
    #console.log(this.error);
    parse: ->
      @resetError()
      return true  if @tree isnt null
      try
        @tree = new jsmm.Tree(@code)
        if @tree.hasError()
          @handleError @tree.getError()
          return false
        return true
      catch error
        @handleError error
        return false

    getElementsByType: (type) ->
      @resetError()
      return `undefined`  unless @parse()
      @tree.nodesByType[type]

    getElementByLine: (line) ->
      @resetError()
      return `undefined`  unless @parse()
      @tree.nodesByLine[line]

    addHookBeforeNode: (node, func) ->
      @safeFunc = null
      @tree.addHookBeforeNode node, func

    addHookAfterNode: (node, func) ->
      @safeFunc = null
      @tree.addHookAfterNode node, func

    getDot: ->
      @resetError()
      return `undefined`  unless @parse()
      try
        return @tree.programNode.getDot()
      catch error
        @handleError error
        return `undefined`

    getRawCode: ->
      @resetError()
      return `undefined`  unless @parse()
      try
        return @tree.programNode.getCode()
      catch error
        @handleError error
        return `undefined`

    makeRawFunc: ->
      @resetError()
      return true  if @rawFunc isnt null
      return false  unless @parse()
      try
        @rawFunc = @tree.programNode.getFunction(@scope)
        return true
      catch error
        @handleError error
        return false

    runRaw: ->
      @resetError()
      return false  unless @makeRawFunc()
      try
        @rawFunc()
        return true
      catch error
        @handleError error
        return false

    getSafeCode: ->
      @resetError()
      return `undefined`  unless @parse()
      try
        return @tree.programNode.getRunCode()
      catch error
        @handleError error
        return `undefined`

    makeSafeFunc: ->
      @resetError()
      return true  if @safeFunc isnt null
      return false  unless @parse()
      try
        @safeFunc = @tree.programNode.getRunFunction()
        return true
      catch error
        @handleError error
        return false

    runSafe: ->
      @resetError()
      
      #if (!this.makeSafeFunc()) return false;
      return false  unless @parse()
      try
        
        #this.safeFunc(new jsmm.RunContext(this.tree, this.scope));
        context = new jsmm.Context(@tree, new jsmm.Scope(@scope),
          callStackDepth: 100
          executionCounter: 4000
          costCounter: 1000
        )
        context.run()
        if context.hasError()
          @handleError context.getError()
          return false
        return true
      catch error
        @handleError error
        return false

    stepInit: ->
      @resetError()
      return false  unless @parse()
      try
        @stack = new jsmm.step.Stack(@tree, @scope)
        @stepPos = 0
        return true
      catch error
        @handleError error
        return false

    stepNext: ->
      @resetError()
      ret = []
      try
        return `undefined`  if @stack is null or not @stack.hasNext()
        msgs = @stack.stepNext()
        return `undefined`  if msgs.length <= 0
        i = 0

        while i < msgs.length
          if msgs[i].type is "Error"
            @error = msgs[i]
            return `undefined`
          else
            ret.push msgs[i]
          i++
        @stepPos++
        return ret
      catch error
        @handleError error
        return `undefined`

    stepBack: ->
      @resetError()
      stepPos = @stepPos - 1
      result = undefined
      if stepPos >= 0
        @stepInit()
        while @stepPos < stepPos
          result = @stepNext()
          return `undefined`  if result is `undefined`
      result

    isStepping: ->
      @stack isnt null and @stack.hasNext()

    runStep: ->
      @resetError()
      if @stepInit()
        step = undefined
        loop
          step = @stepNext()
          break unless step isnt `undefined`
      not @hasError()

    hasError: ->
      @error isnt null

    getError: ->
      @error
