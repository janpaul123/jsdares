module.exports = (jsmm) ->

  class Node

    constructor: (_$, column2, args...) ->
      @tree = jsmm.parser.yy.tree
      @tree.nodesByType[@type].push this
      
      @lineLoc =
        line: _$.first_line
        column: _$.first_column
        column2: (column2 || _$.last_column)

      @blockLoc =
        line: _$.first_line
        line2: _$.last_line

      @textLoc =
        line: _$.first_line
        column: _$.first_column
        line2: _$.last_line
        column2: _$.last_column

      @parent = null
      if @topNode?
        @tree.nodesByLine[@lineLoc.line] = this

      i = 0
      for name, isNode of @children
        this[name] = args[i++]
        if isNode && this[name]?
          this[name].parent = this

      @initialize?(args...)

    getTopNode: ->
      @tree.nodesByLine[@lineLoc.line]

    getChildren: ->
      (this[name] for name, isNode of @children when isNode && this[name]?)

    makeNodeIdsBase: (type) ->
      @id = @tree.getNewId(type)
      @tree.nodes[@id] = this
      for child in @getChildren()
        child.makeNodeIds type

    makeNodeIds: (type) ->
      @makeNodeIdsBase type


  jsmm.nodes = {}

  class jsmm.nodes.Program extends Node
    type: "Program"
    topNode: false
    children:
      statementList: true
    
    initialize: ->
      @makeNodeIds "base"
      @lineLoc =
        line: 0
        column: 0
        column2: 0

    getCode: ->
      @statementList.getCode()

    getFunction: (scope) ->
      args = [jsmm]
      output = "new function() {"
      output += "return function(jsmm"
      for name of scope
        output += ", " + name
        args.push scope[name]
      output += ") { return function() { \n"
      output += @statementList.getCode() + "return; }; }; }"
      eval(output).apply null, args


  class jsmm.nodes.StatementList extends Node
    type: "StatementList"
    topNode: false
    children: {}

    initialize: ->
      @statements = []

    addStatement: (statement) ->
      @statements.push statement
      statement.parent = this

    getCode: ->
      code = (s.getCode() for s in @statements)
      code.join("\n") + "\n"

    getChildren: ->
      @statements


  class jsmm.nodes.CommonSimpleStatement extends Node
    type: "CommonSimpleStatement"
    topNode: true
    children:
      statement: true

    getCode: ->
      @statement.getCode() + ";"


  class jsmm.nodes.PostfixStatement extends Node
    type: "PostfixStatement"
    topNode: false
    children:
      identifier: true
      symbol: false
    
    getCode: ->
      @identifier.getCode() + @symbol


  class jsmm.nodes.AssignmentStatement extends Node
    type: "AssignmentStatement"
    topNode: false
    children:
      identifier: true
      symbol: false
      expression: true
    
    getCode: ->
      @identifier.getCode() + " " + @symbol + " " + @expression.getCode()


  class jsmm.nodes.VarStatement extends Node
    type: "VarStatement"
    topNode: false
    children: {}

    initialize: ->
      @items = []

    addVarItem: (item) ->
      @items.push item
      item.parent = this

    getCode: ->
      code = (item.getCode() for item in @items)
      "var " + code.join(', ')

    getChildren: ->
      @items


  class jsmm.nodes.VarItem extends Node
    type: "VarItem"
    topNode: false
    children:
      name: false
      assignment: true
    
    getCode: ->
      if @assignment?
        @assignment.getCode()
      else
        @name


  class jsmm.nodes.ReturnStatement extends Node
    type: "ReturnStatement"
    topNode: true
    children:
      expression: true

    getCode: ->
      if @expression?
        "return " + @expression.getCode() + ";"
      else
        "return;"


  class jsmm.nodes.BinaryExpression extends Node
    type: "BinaryExpression"
    topNode: false
    children:
      expression1: true
      symbol: false
      expression2: true
    
    getCode: ->
      @expression1.getCode() + " " + @symbol + " " + @expression2.getCode()


  class jsmm.nodes.UnaryExpression extends Node
    type: "UnaryExpression"
    topNode: false
    children:
      symbol: false
      expression: true
    
    getCode: ->
      @symbol + @expression.getCode()


  class jsmm.nodes.ParenExpression extends Node
    type: "ParenExpression"
    topNode: false
    children:
      expression: true
    
    getCode: ->
      "(" + @expression.getCode() + ")"


  class jsmm.nodes.NumberLiteral extends Node
    type: "NumberLiteral"
    topNode: false
    children:
      number: false
    
    initialize: ->
      @number = parseFloat(@number)

    getCode: ->
      @number


  class jsmm.nodes.StringLiteral extends Node
    type: "StringLiteral"
    topNode: false
    children:
      str: false
    
    initialize: ->
      try
        @str = JSON.parse(@str)
      catch e
        throw new jsmm.msg.Error(@id, "String contains invalid characters")

    getCode: ->
      JSON.stringify @str


  class jsmm.nodes.BooleanLiteral extends Node
    type: "BooleanLiteral"
    topNode: false
    children:
      bool: false
    
    getCode: ->
      if @bool then "true" else "false"


  class jsmm.nodes.NameIdentifier extends Node
    type: "NameIdentifier"
    topNode: false
    children:
      name: false
    
    getCode: ->
      @name

    getBaseName: ->
      @name


  class jsmm.nodes.ObjectIdentifier extends Node
    type: "ObjectIdentifier"
    topNode: false
    children:
      identifier: true
      prop: false
    
    getCode: ->
      @identifier.getCode() + "." + @prop

    getBaseName: ->
      @identifier.getBaseName()


  class jsmm.nodes.ArrayIdentifier extends Node
    type: "ArrayIdentifier"
    topNode: false
    children:
      identifier: true
      expression: true
    
    getCode: ->
      @identifier.getCode() + "[" + @expression.getCode() + "]"

    getBaseName: ->
      @identifier.getBaseName()


  class jsmm.nodes.FunctionCall extends Node
    type: "FunctionCall"
    topNode: false
    children:
      identifier: true
      expressionArgs: false
    
    initialize: ->
      for expression in @expressionArgs
        expression.parent = this

    getCode: ->
      code = (e.getCode() for e in @expressionArgs)
      @identifier.getCode() + "(" + code.join(', ') + ")"

    getChildren: ->
      @expressionArgs.concat [@identifier]


  class jsmm.nodes.ArrayDefinition extends Node
    type: "ArrayDefinition"
    topNode: false
    children:
      expressions: false
    
    initialize: ->
      for expression in @expressions
        expression.parent = this

    getCode: ->
      code = (e.getCode() for e in @expressions)
      "[" + code.join(', ') + "]"

    getChildren: ->
      @expressions

  class jsmm.nodes.IfBlock extends Node
    type: "IfBlock"
    topNode: true
    children:
      expression: true
      statementList: true
      elseBlock: true

    initialize: ->
      if @elseBlock?
        @blockLoc.line2 = @elseBlock.blockLoc.line - 1

    getCode: ->
      output = "if (" + @expression.getCode() + ") {\n" + @statementList.getCode() + "}"
      output += @elseBlock.getCode() if @elseBlock?
      output


  class jsmm.nodes.ElseIfBlock extends Node
    type: "ElseIfBlock"
    topNode: false
    children:
      ifBlock: true
    
    getCode: ->
      " else " + @ifBlock.getCode()


  class jsmm.nodes.ElseBlock extends Node
    type: "ElseBlock"
    topNode: true
    children:
      statementList: true

    getCode: ->
      " else {\n" + @statementList.getCode() + "}"


  class jsmm.nodes.WhileBlock extends Node
    type: "WhileBlock"
    topNode: true
    children:
      expression: true
      statementList: true

    getCode: ->
      "while (" + @expression.getCode() + ") {\n" + @statementList.getCode() + "}"


  class jsmm.nodes.ForBlock extends Node
    type: "ForBlock"
    topNode: true
    children:
      statement1: true
      expression: true
      statement2: true
      statementList: true

    getCode: ->
      output = "for (" + @statement1.getCode() + ";" + @expression.getCode() + ";"
      output += @statement2.getCode() + ") {\n" + @statementList.getCode() + "}"
      output


  class jsmm.nodes.FunctionDeclaration extends Node
    type: "FunctionDeclaration"
    topNode: true
    children:
      name: false
      nameArgs: false
      statementList: true
    
    initialize: ->
      @tree.functionNodes[@name] = this

    getArgList: ->
      "(" + @nameArgs.join(", ") + ")"

    getCode: ->
      "function " + @name + @getArgList() + "{\n" + @statementList.getCode() + "}"

    makeNodeIds: (type) ->
      @makeNodeIdsBase "functions"
