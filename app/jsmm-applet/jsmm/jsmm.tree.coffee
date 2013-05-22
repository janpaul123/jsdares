#jshint node:true
"use strict"
module.exports = (jsmm) ->
  jsmm.Tree = ->
    @init.apply this, arguments

  jsmm.Tree:: =
    init: (code, options) ->
      @options = options or {}
      @genIds =
        base: 1
        functions: 1

      @nodes = []
      @nodesByType =
        Program: []
        StatementList: []
        CommonSimpleStatement: []
        PostfixStatement: []
        AssignmentStatement: []
        VarStatement: []
        VarItem: []
        ReturnStatement: []
        BinaryExpression: []
        UnaryExpression: []
        ParenExpression: []
        NumberLiteral: []
        StringLiteral: []
        BooleanLiteral: []
        NameIdentifier: []
        ObjectIdentifier: []
        ArrayIdentifier: []
        FunctionCall: []
        ArrayDefinition: []
        IfBlock: []
        ElseIfBlock: []
        ElseBlock: []
        WhileBlock: []
        ForBlock: []
        FunctionDeclaration: []

      @nodesByLine = {}
      @functionNodes = {}
      @error = null
      jsmm.parser.yy.tree = this
      try
        lines = code.split(/\n/)
        i = 0

        while i < lines.length
          if lines[i].length > (@options.maxWidth or jsmm.maxWidth)
            throw new jsmm.msg.CriticalError(
              line: i + 1
              column: jsmm.maxWidth
            , "This line is too long, please split it into separate statements")
          i++
        @programNode = jsmm.parser.parse(code + "\n")
      catch error
        if error.type is "Error"
          @error = error
        else
          @error = new jsmm.msg.Error(0, "An unknown error has occurred", error)
          throw error  if jsmm.debug

    hasError: ->
      @error isnt null

    compareBase: (context) ->
      if @hasError() or context.tree.hasError() or context.hasError()
        true
      else
        context.tree.programNode.getCompareBaseCode(context.getCalledFunctions()) isnt @programNode.getCompareBaseCode(context.getCalledFunctions())

    compareFunctions: (context) ->
      if @hasError() or context.tree.hasError() or context.hasError()
        true
      else
        context.tree.programNode.getCompareFunctionCode() isnt @programNode.getCompareFunctionCode()

    compareAll: (context) ->
      if @hasError() or context.tree.hasError() or context.hasError()
        true
      else
        context.tree.programNode.getRunCode() isnt @programNode.getRunCode()

    getError: ->
      @error

    getNewId: (type) ->
      type + "-" + @genIds[type]++

    getNodeByLine: (line) ->
      if @nodesByLine[line] is `undefined`
        null
      else
        @nodesByLine[line]

    getNodeLines: ->
      lines = []
      for line of @nodesByLine
        lines.push line
      lines

    getNodesByType: (type) ->
      @nodesByType[type]

    getNodeById: (nodeId) ->
      if @nodes[nodeId] isnt `undefined`
        @nodes[nodeId]
      else
        null

    getFunctionNode: (funcName) ->
      if @functionNodes[funcName] isnt `undefined`
        @functionNodes[funcName]
      else
        null

    getNodeIdsByRange: (line1, line2) ->
      nodeIds = []
      line = line1

      while line <= line2
        nodeIds.push @nodesByLine[line].id  if @nodesByLine[line] isnt `undefined`
        line++
      nodeIds
