module.exports = (jsmm) ->

  class jsmm.Tree

    constructor: (code, options) ->
      @options = options || {}

      @genIds = {base: 1, functions: 1}
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
        lines = code.split('\n')
        for line, i in lines
          if line.length > (@options.maxWidth || jsmm.maxWidth)
            throw new jsmm.msg.CriticalError {line: i + 1, column: jsmm.maxWidth},
              "This line is too long, please split it into separate statements"
        @programNode = jsmm.parser.parse(code + "\n")
      catch error
        if error.type == "Error"
          @error = error
        else
          @error = new jsmm.msg.Error(0, "An unknown error has occurred", error)
          throw error if jsmm.debug

    hasError: ->
      @error != null

    compareBase: (context) ->
      if @hasError() || context.tree.hasError() || context.hasError()
        true
      else
        functionNames = context.getCalledFunctions()
        contextBaseCode = context.tree.programNode.getCompareBaseCode(functionNames)
        contextBaseCode != @programNode.getCompareBaseCode(functionNames)

    compareFunctions: (context) ->
      if @hasError() || context.tree.hasError() || context.hasError()
        true
      else
        context.tree.programNode.getCompareFunctionCode() != @programNode.getCompareFunctionCode()

    compareAll: (context) ->
      if @hasError() || context.tree.hasError() || context.hasError()
        true
      else
        context.tree.programNode.getRunCode() != @programNode.getRunCode()

    getError: ->
      @error

    getNewId: (type) ->
      type + "-" + @genIds[type]++

    getNodeByLine: (line) ->
      @nodesByLine[line] ? null

    getNodeLines: ->
      (line for line of @nodesByLine)

    getNodesByType: (type) ->
      @nodesByType[type]

    getNodeById: (nodeId) ->
      @nodes[nodeId] ? null

    getFunctionNode: (funcName) ->
      @functionNodes[funcName] ? null

    getNodeIdsByRange: (line1, line2) ->
      (@nodesByLine[line].id for line in [line1..line2] when @nodesByLine[line]?)
