module.exports = (jsmm) ->
  class jsmm.CommandTracker

    constructor: ->
      @idsByTopNodeId = {}
      @idsByNodeId = {}
      @nodeIdsById = {}

    addCommand: (node, id) ->
      @idsByNodeId[node.id] ||= []
      @idsByNodeId[node.id].push id
      @idsByTopNodeId[node.getTopNode().id] ||= []
      @idsByTopNodeId[node.getTopNode().id].push id
      @nodeIdsById[id] ||= {}
      @nodeIdsById[id][node.id] = true

    getHighlightIdsByNodeId: (id) ->
      @idsByNodeId[id] || []

    getHighlightIdsByTopNodeId: (id) ->
      @idsByTopNodeId[id] || []

    getHighlightNodeIdsById: (id) ->
      Object.keys @nodeIdsById[id] || []

  class jsmm.ScopeTracker

    constructor: ->
      @scopes = []
      @nodeIds = {}
      @calls = []

    logScope: (stepNum, node, data) ->
      switch data.type
        when "assignment"
          obj = data.scope.find(data.name)
          if obj?
            if data.scope.parent? and data.scope.vars[data.name]?
              @addAssignment stepNum, node, @scopes.length - 1, data.name, jsmm.stringify(obj.value, data.scope), true
            else
              @addAssignment stepNum, node, 0, data.name, jsmm.stringify(obj.value, data.scope), true
        when "return"
          @calls.push
            type: "return"
            stepNum: stepNum
        when "enter"
          @scopes.push {}
          @calls.push
            type: "enter"
            stepNum: stepNum
            name: data.name
            position: @scopes.length - 1

          for name of data.scope.vars
            @addAssignment stepNum, node, @scopes.length - 1, name, jsmm.stringify(data.scope.vars[name].value, data.scope), data.name != "global"

    getState: (stepNum) ->
      stack = []
      for call in @calls
        break if call.stepNum > stepNum
        switch call.type
          when "assignment"
            level = stack[(if call.position is 0 then 0 else stack.length - 1)]
            scope = level.scope
            unless scope[call.name]?
              scope[call.name] =
                id: call.position + "-" + call.name
                name: call.name
                value: call.value

              level.names.push call.name
            scope[call.name].value = call.value
            if call.stepNum == stepNum
              scope[call.name].highlight = true
          when "return"
            stack.pop()
          when "enter"
            stack.push
              id: "" + call.position
              name: call.name
              names: []
              scope: {}
      stack

    getHighlightNodeIdsById: (id) ->
      split = id.split("-")
      return [] if split.length < 2
      scope = @scopes[split[0]]
      return [] unless scope?
      Object.keys scope[split[1]] || []

    getHighlightIdsByNodeId: (nodeId) ->
      @nodeIds[nodeId] || []
    
    ## INTERNAL FUNCTIONS ##
    addAssignment: (stepNum, node, position, name, value, highlight) ->
      if highlight
        @scopes[position][name] ?= {}
        @scopes[position][name][node.id] = true
        topNodeId = node.getTopNode().id
        @nodeIds[topNodeId] ?= []
        @nodeIds[topNodeId].push position + "-" + name
      @calls.push
        type: "assignment"
        stepNum: stepNum
        position: position
        name: name
        value: value

  class jsmm.Array

    type: "array"
    string: "[array]"

    constructor: (values) ->
      @values = []
      for value, i in values
        @values[i] =
          type: "local"
          value: value

      that = this
      @properties = length:
        name: "length"
        info: "array.length"
        type: "variable"
        example: "length"
        get: @getLength
        set: @setLength

    getLength: (name) =>
      @values.length

    setLength: (context, name, value) =>
      @values.length = value

    getArrayValue: (index) ->
      if index < @values.length
        @values[index] ?=
          type: "local"
          value: `undefined`
        @values[index]
      else
        type: "newArrayValue"
        array: this
        index: index

    setArrayValue: (index, value) ->
      @values[index] =
        type: "local"
        value: value

    getCopy: ->
      values = (value?.value for value in @values)
      new jsmm.Array(values)

    serialize: (scope) ->
      serializedValues = (jsmm.stringify(value?.value, scope) for value in @values)
      '[' + serializedValues.join(', ') + ']'

  class jsmm.Scope

    constructor: (vars, parent, copyScope) ->
      @vars = {}
      @arrays = []
      @functions = {}

      for name, var of vars
        @vars[name] =
          type: "local"
          value: var

        if typeof var == "object" && var.type == "arrayPointer"
          @addArrayItems copyScope, var.id 
        
        if typeof var == "object" && var.type == "functionPointer"
          @functions[var.name] = copyScope.functions[var.name] 

      @parent = parent || null

      @topParent = this
      while @topParent.parent?
        @topParent = @topParent.parent

    addArrayItems: (copyScope, id) ->
      @arrays[id] = copyScope.arrays[id].getCopy()
      for value in copyScope.arrays[id].values
        if value? && typeof value.value == "object" && value.value.type == "arrayPointer"
        @addArrayItems copyScope, value.value.id

    find: (name) ->
      scope = this
      loop
        return scope.vars[name] if scope.vars[name]?
        scope = scope.parent
        break unless scope?
      `undefined`

    getCopy: ->
      vars = {}
      arrays = []
      for name, var of @vars
        vars[name] = var.value
      new jsmm.Scope(vars, @parent, @topParent)

    registerArray: (array) ->
      @topParent.arrays.push array
      @topParent.arrays.length - 1

    getArray: (id) ->
      @topParent.arrays[id]

    clearFunctions: ->
      @topParent.functions = []

    declareFunction: (name, func) ->
      @topParent.functions[name] = func
      @vars[name] =
        type: "local"
        value:
          type: "functionPointer"
          name: name
          string: "[function " + name + "]"

    getFunction: (name) ->
      @topParent.functions[name]

  
  # scope is optional, only for verbose output, such as content of arrays
  jsmm.stringify = (value, scope) ->
    if value is `undefined`
      "undefined"
    else if scope isnt `undefined` and typeof value is "object" and value.type is "arrayPointer"
      scope.getArray(value.id).serialize scope
    else if typeof value is "object"
      value.string
    else
      JSON.stringify value

  jsmm.Context = ->
    @init.apply this, arguments

  jsmm.Context:: =
    init: (tree, scope, limits) ->
      @tree = tree
      @scope = scope
      @scopeStack = [@scope]
      @startScope = scope.getCopy()
      @limits = limits
      @executionCounter = 0
      @costCounter = 0
      @steps = []
      @callStackNodes = []
      @callIdsByNodeIds = {}
      @commandTracker = new jsmm.CommandTracker()
      @scopeTracker = new jsmm.ScopeTracker()
      @calledFunctions = []
      @callNodeId = null
      @callId = null
      @error = null

    
    #/ OUTPUT FUNCTIONS ///
    getCallNodeId: ->
      @callNodeId

    getCallId: ->
      @callId

    getCommandTracker: ->
      @commandTracker

    getScopeTracker: ->
      @scopeTracker

    throwTimeout: (nodeId) ->
      throw new jsmm.msg.Error(nodeId or @callNodeId, "Program takes too long to run")

    
    #/ TREE/RUNNER FUNCTIONS ///
    run: (funcName, args) ->
      @scopeTracker.logScope -1, @tree.programNode,
        type: "enter"
        scope: @scope
        name: "global"

      func = undefined
      if funcName isnt `undefined`
        func = @scope.getFunction(funcName)
        if func is `undefined`
          @error = new jsmm.msg.Error(0, "Function <var>" + funcName + "</var> could not be found")
          @pushStep @error
          return
        @isFunctionContext = true
      else
        func = @tree.programNode.getRunFunction()
        @isFunctionContext = false
      try
        func this, args
      catch error
        if error.type is "Error"
          @error = error
        else
          @error = new jsmm.msg.Error(0, "An unknown error has occurred", error)
          throw error  if jsmm.debug
        @pushStep @error

    hasError: ->
      @error isnt null

    getError: ->
      @error

    getBaseScope: ->
      @scopeStack[0]

    getStartScope: ->
      @startScope

    getCalledFunctions: ->
      @calledFunctions

    getCallIdsByNodeIds: (nodeIds) ->
      callIds = {}
      i = 0

      while i < nodeIds.length
        id = nodeIds[i]
        if @callIdsByNodeIds[id] isnt `undefined`
          j = 0

          while j < @callIdsByNodeIds[id].length
            callIds[@callIdsByNodeIds[id][j]] = true
            j++
        i++
      Object.keys callIds

    getNodeIdByStepNum: (stepNum) ->
      @steps[stepNum].nodeId  unless stepNum >= @steps.length

    
    #/ JS-- PROGRAM FUNCTIONS ///
    enterCall: (node) ->
      @callStackNodes.push node
      
      #throw new jsmm.msg.Error(node.id, 'Too many nested function calls have been made already, perhaps there is infinite recursion somewhere');
      @throwTimeout node.id  if @callStackNodes.length > @limits.callStackDepth

    leaveCall: ->
      @callStackNodes.pop()

    enterFunction: (node, vars, fullName) ->
      @scope = new jsmm.Scope(vars, @scopeStack[0])
      @scopeStack.push @scope
      @scopeTracker.logScope @getStepNum(), node,
        type: "enter"
        scope: @scope
        name: fullName

      @calledFunctions.push node.name

    leaveFunction: (node) ->
      @scopeStack.pop()
      @scope = @scopeStack[@scopeStack.length - 1]
      @scopeTracker.logScope @getStepNum(), node,
        type: "return"
        scope: @scope


    addAssignment: (node, name) ->
      @scopeTracker.logScope @getStepNum(), node,
        type: "assignment"
        scope: @scope
        name: name


    externalCall: (node, funcValue, args) ->
      @callNodeId = node.id
      @callId = node.id
      i = 0

      while i < @callStackNodes.length
        @callId += "-" + @callStackNodes[i].getTopNode().id
        i++
      i = 0
      while i < @callStackNodes.length
        nodeId = @callStackNodes[i].getTopNode().id
        @callIdsByNodeIds[nodeId] = []  if @callIdsByNodeIds[nodeId] is `undefined`
        @callIdsByNodeIds[nodeId].push @callId  if @callIdsByNodeIds[nodeId].indexOf(@callId) < 0
        i++
      @costCounter += funcValue.cost or 1
      @throwTimeout node.id  if @costCounter > @limits.costCounter
      try
        return funcValue.func.call(null, this, funcValue.name, args)
      catch error
        
        # augmented functions should do their own error handling, so wrap the resulting strings in jsmm messages
        if typeof error is "string"
          throw new jsmm.msg.Error(node.id, error)
        else
          throw error

    inFunction: ->
      @isFunctionContext or @callStackNodes.length > 0

    increaseExecutionCounter: (node, amount) ->
      @executionCounter += amount
      @throwTimeout node.id  if @executionCounter > @limits.executionCounter

    pushStep: (step) ->
      @steps.push step

    getStepNum: ->
      @steps.length

    addCommand: (node, command) ->
      @commandTracker.addCommand node, command

    getAllSteps: ->
      @steps
