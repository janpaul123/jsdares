module.exports = (jsmm) ->
  require("./jsmm.msg")(jsmm)

  class jsmm.OldSimpleRunner

    constructor: (text, scope) ->
      @code = text || ""
      @scope = scope || {}
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
      if error.type == "Error"
        @error = error
      else
        # throw error
        @error = new jsmm.msg.Error(0, "An unknown error has occurred", error)

    parse: ->
      @resetError()
      return true if @tree?

      try
        @tree = new jsmm.Tree(@code)
        if @tree.hasError()
          @handleError @tree.getError()
          false
        else
          true
      catch error
        @handleError error
        false

    getDot: ->
      @resetError()
      return null unless @parse()

      try
        @tree.programNode.getDot()
      catch error
        @handleError error
        null

    getRawCode: ->
      @resetError()
      return null unless @parse()

      try
        @tree.programNode.getCode()
      catch error
        @handleError error
        null

    makeRawFunc: ->
      @resetError()
      return true if @rawFunc?
      return false unless @parse()
      try
        @rawFunc = @tree.programNode.getFunction(@scope)
        true
      catch error
        @handleError error
        false

    runRaw: ->
      @resetError()
      return false unless @makeRawFunc()
      try
        @rawFunc()
        true
      catch error
        @handleError error
        false

    getSafeCode: ->
      @resetError()
      return null unless @parse()
      try
        @tree.programNode.getRunCode()
      catch error
        @handleError error
        null

    makeSafeFunc: ->
      @resetError()
      return true  if @safeFunc?
      return false  unless @parse()
      try
        @safeFunc = @tree.programNode.getRunFunction()
        true
      catch error
        @handleError error
        false

    runSafe: ->
      @resetError()
      return false  unless @parse()

      try
        context = new jsmm.Context @tree, new jsmm.Scope(@scope),
          callStackDepth: 100
          executionCounter: 4000
          costCounter: 1000
        context.run()
        if context.hasError()
          @handleError context.getError()
          false
        else
          true
      catch error
        @handleError error
        false

    hasError: ->
      @error != null

    getError: ->
      @error
