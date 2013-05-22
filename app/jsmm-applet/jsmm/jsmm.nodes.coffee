#jshint node:true
"use strict"
module.exports = (jsmm) ->
  addCommonNodeMethods = (type, children, topNode, node) ->
    node.children = children
    node.build = (_$, column2) ->
      @tree = jsmm.parser.yy.tree
      @tree.nodesByType[type].push this
      @type = type
      
      # this.id = this.tree.getNewId();
      # this.tree.nodes[this.id] = this;
      @lineLoc =
        line: _$.first_line
        column: _$.first_column
        column2: (column2 or _$.last_column)

      @blockLoc =
        line: _$.first_line
        line2: _$.last_line

      @textLoc =
        line: _$.first_line
        column: _$.first_column
        line2: _$.last_line
        column2: _$.last_column

      @parent = null
      @topNode = topNode
      @tree.nodesByLine[@lineLoc.line] = this  if @topNode
      i = 2
      for name of @children
        this[name] = arguments[i++]
        # it is a node
        this[name].parent = this  if @children[name] and this[name] isnt null
      @init.apply this, [].slice.call(arguments, 2)  if @init isnt `undefined`

    node.getTopNode = ->
      @tree.nodesByLine[@lineLoc.line]

    if node.getChildren is `undefined`
      node.getChildren = ->
        children = []
        for name of @children
          # it is a node
          children.push this[name]  if @children[name] and this[name] isnt null
        children
    node.makeNodeIdsBase = (type) ->
      @id = @tree.getNewId(type)
      @tree.nodes[@id] = this
      children = @getChildren()
      i = 0

      while i < children.length
        children[i].makeNodeIds type
        i++

    node.makeNodeIds = node.makeNodeIdsBase  if node.makeNodeIds is `undefined`
    node

  jsmm.nodes = {}
  jsmm.nodes.Program = ->
    @build.apply this, arguments

  jsmm.nodes.Program:: = addCommonNodeMethods("Program",
    statementList: true
  , false,
    init: ->
      @makeNodeIds "base"
      @lineLoc =
        line: 0
        column: 0
        column2: 0

    getCode: ->
      @statementList.getCode()

    getFunction: (scope) ->
      
      #jshint evil:true
      args = [jsmm]
      output = "new function() {"
      output += "return function(jsmm"
      for name of scope
        output += ", " + name
        args.push scope[name]
      output += ") { return function() { \n"
      output += @statementList.getCode() + "return; }; }; }"
      
      #console.log(output);
      eval(output).apply null, args
  )
  jsmm.nodes.StatementList = ->
    @build.apply this, arguments

  jsmm.nodes.StatementList:: = addCommonNodeMethods("StatementList", {}, false,
    init: ->
      @statements = []

    addStatement: (statement) ->
      @statements.push statement
      statement.parent = this

    getCode: ->
      output = ""
      i = 0

      while i < @statements.length
        output += @statements[i].getCode() + "\n"
        i++
      output

    getChildren: ->
      @statements
  )
  jsmm.nodes.CommonSimpleStatement = ->
    @build.apply this, arguments

  jsmm.nodes.CommonSimpleStatement:: = addCommonNodeMethods("CommonSimpleStatement",
    statement: true
  , true,
    getCode: ->
      @statement.getCode() + ";"
  )
  jsmm.nodes.PostfixStatement = ->
    @build.apply this, arguments

  jsmm.nodes.PostfixStatement:: = addCommonNodeMethods("PostfixStatement",
    identifier: true
    symbol: false
  , false,
    getCode: ->
      @identifier.getCode() + @symbol
  )
  jsmm.nodes.AssignmentStatement = ->
    @build.apply this, arguments

  jsmm.nodes.AssignmentStatement:: = addCommonNodeMethods("AssignmentStatement",
    identifier: true
    symbol: false
    expression: true
  , false,
    getCode: ->
      @identifier.getCode() + " " + @symbol + " " + @expression.getCode()
  )
  jsmm.nodes.VarStatement = ->
    @build.apply this, arguments

  jsmm.nodes.VarStatement:: = addCommonNodeMethods("VarStatement", {}, false,
    init: ->
      @items = []

    addVarItem: (item) ->
      @items.push item
      item.parent = this

    getCode: ->
      output = "var " + @items[0].getCode()
      i = 1

      while i < @items.length
        output += ", " + @items[i].getCode()
        i++
      output

    getChildren: ->
      @items
  )
  jsmm.nodes.VarItem = ->
    @build.apply this, arguments

  jsmm.nodes.VarItem:: = addCommonNodeMethods("VarItem",
    name: false
    assignment: true
  , false,
    getCode: ->
      if @assignment is null
        @name
      else
        @assignment.getCode()
  )
  jsmm.nodes.ReturnStatement = ->
    @build.apply this, arguments

  jsmm.nodes.ReturnStatement:: = addCommonNodeMethods("ReturnStatement",
    expression: true
  , true,
    getCode: ->
      if @expression is null
        "return;"
      else
        "return " + @expression.getCode() + ";"
  )
  jsmm.nodes.BinaryExpression = ->
    @build.apply this, arguments

  jsmm.nodes.BinaryExpression:: = addCommonNodeMethods("BinaryExpression",
    expression1: true
    symbol: false
    expression2: true
  , false,
    getCode: ->
      @expression1.getCode() + " " + @symbol + " " + @expression2.getCode()
  )
  jsmm.nodes.UnaryExpression = ->
    @build.apply this, arguments

  jsmm.nodes.UnaryExpression:: = addCommonNodeMethods("UnaryExpression",
    symbol: false
    expression: true
  , false,
    getCode: ->
      @symbol + @expression.getCode()
  )
  jsmm.nodes.ParenExpression = ->
    @build.apply this, arguments

  jsmm.nodes.ParenExpression:: = addCommonNodeMethods("ParenExpression",
    expression: true
  , false,
    getCode: ->
      "(" + @expression.getCode() + ")"
  )
  jsmm.nodes.NumberLiteral = ->
    @build.apply this, arguments

  jsmm.nodes.NumberLiteral:: = addCommonNodeMethods("NumberLiteral",
    number: false
  , false,
    init: ->
      @number = parseFloat(@number)

    getCode: ->
      @number
  )
  jsmm.nodes.StringLiteral = ->
    @build.apply this, arguments

  jsmm.nodes.StringLiteral:: = addCommonNodeMethods("StringLiteral",
    str: false
  , false,
    init: ->
      try
        @str = JSON.parse(@str)
      catch e
        throw new jsmm.msg.Error(@id, "String contains invalid characters")

    getCode: ->
      JSON.stringify @str
  )
  jsmm.nodes.BooleanLiteral = ->
    @build.apply this, arguments

  jsmm.nodes.BooleanLiteral:: = addCommonNodeMethods("BooleanLiteral",
    bool: false
  , false,
    getCode: ->
      (if @bool then "true" else "false")
  )
  jsmm.nodes.NameIdentifier = ->
    @build.apply this, arguments

  jsmm.nodes.NameIdentifier:: = addCommonNodeMethods("NameIdentifier",
    name: false
  , false,
    getCode: ->
      @name

    getBaseName: ->
      @name
  )
  jsmm.nodes.ObjectIdentifier = ->
    @build.apply this, arguments

  jsmm.nodes.ObjectIdentifier:: = addCommonNodeMethods("ObjectIdentifier",
    identifier: true
    prop: false
  , false,
    getCode: ->
      @identifier.getCode() + "." + @prop

    getBaseName: ->
      @identifier.getBaseName()
  )
  jsmm.nodes.ArrayIdentifier = ->
    @build.apply this, arguments

  jsmm.nodes.ArrayIdentifier:: = addCommonNodeMethods("ArrayIdentifier",
    identifier: true
    expression: true
  , false,
    getCode: ->
      @identifier.getCode() + "[" + @expression.getCode() + "]"

    getBaseName: ->
      @identifier.getBaseName()
  )
  jsmm.nodes.FunctionCall = ->
    @build.apply this, arguments

  jsmm.nodes.FunctionCall:: = addCommonNodeMethods("FunctionCall",
    identifier: true
    expressionArgs: false
  , false,
    init: ->
      i = 0

      while i < @expressionArgs.length
        @expressionArgs[i].parent = this
        i++

    getCode: ->
      output = @identifier.getCode() + "("
      output += @expressionArgs[0].getCode()  if @expressionArgs.length > 0
      i = 1

      while i < @expressionArgs.length
        output += ", " + @expressionArgs[i].getCode()
        i++
      output + ")"

    getChildren: ->
      @expressionArgs.concat [@identifier]
  )
  jsmm.nodes.ArrayDefinition = ->
    @build.apply this, arguments

  jsmm.nodes.ArrayDefinition:: = addCommonNodeMethods("ArrayDefinition",
    expressions: false
  , false,
    init: ->
      i = 0

      while i < @expressions.length
        @expressions[i].parent = this
        i++

    getCode: ->
      output = "["
      output += @expressions[0].getCode()  if @expressions.length > 0
      i = 1

      while i < @expressions.length
        output += ", " + @expressions[i].getCode()
        i++
      output + "]"

    getChildren: ->
      @expressions
  )
  jsmm.nodes.IfBlock = ->
    @build.apply this, arguments

  jsmm.nodes.IfBlock:: = addCommonNodeMethods("IfBlock",
    expression: true
    statementList: true
    elseBlock: true
  , true,
    init: ->
      @blockLoc.line2 = @elseBlock.blockLoc.line - 1  if @elseBlock isnt null

    getCode: ->
      output = "if (" + @expression.getCode() + ") {\n" + @statementList.getCode() + "}"
      output += @elseBlock.getCode()  if @elseBlock isnt null
      output
  )
  jsmm.nodes.ElseIfBlock = ->
    @build.apply this, arguments

  jsmm.nodes.ElseIfBlock:: = addCommonNodeMethods("ElseIfBlock",
    ifBlock: true
  , false,
    getCode: ->
      " else " + @ifBlock.getCode()
  )
  jsmm.nodes.ElseBlock = ->
    @build.apply this, arguments

  jsmm.nodes.ElseBlock:: = addCommonNodeMethods("ElseBlock",
    statementList: true
  , true,
    getCode: ->
      " else {\n" + @statementList.getCode() + "}"
  )
  jsmm.nodes.WhileBlock = ->
    @build.apply this, arguments

  jsmm.nodes.WhileBlock:: = addCommonNodeMethods("WhileBlock",
    expression: true
    statementList: true
  , true,
    getCode: ->
      "while (" + @expression.getCode() + ") {\n" + @statementList.getCode() + "}"
  )
  jsmm.nodes.ForBlock = ->
    @build.apply this, arguments

  jsmm.nodes.ForBlock:: = addCommonNodeMethods("ForBlock",
    statement1: true
    expression: true
    statement2: true
    statementList: true
  , true,
    getCode: ->
      output = "for (" + @statement1.getCode() + ";" + @expression.getCode() + ";"
      output += @statement2.getCode() + ") {\n" + @statementList.getCode() + "}"
      output
  )
  jsmm.nodes.FunctionDeclaration = ->
    @build.apply this, arguments

  jsmm.nodes.FunctionDeclaration:: = addCommonNodeMethods("FunctionDeclaration",
    name: false
    nameArgs: false
    statementList: true
  , true,
    init: ->
      @tree.functionNodes[@name] = this

    getArgList: ->
      "(" + @nameArgs.join(", ") + ")"

    getCode: ->
      output = "function " + @name + @getArgList() + "{\n" + @statementList.getCode() + "}"
      output

    makeNodeIds: (type) ->
      @makeNodeIdsBase "functions"
  )
