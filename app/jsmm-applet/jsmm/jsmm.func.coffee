module.exports = (jsmm) ->

  getValue = (context, node, expression) ->
    value = expression
    if typeof value == "object" && value.type == "local"
      value = value.value

    if value == `undefined`
      throw new jsmm.msg.Error(node.id, "<var>#{node.getCode()}</var> is <var>undefined</var>")
    else if value == null
      throw new jsmm.msg.Error(node.id, "<var>#{node.getCode()}</var> is <var>null</var>")
    else if typeof value == "number" && !isFinite(value)
      throw new jsmm.msg.Error(node.id, "<var>#{node.getCode()}</var> is not a valid number")
    else if typeof value == "object" && value.type == "newArrayValue"
      throw new jsmm.msg.Error(node.id, "<var>#{node.getCode()}</var> is <var>undefined</var>")
    else if typeof value == "object" && value.type == "variable"
      context.addCommand node, value.info
      value.get value.name
    else
      value

  dereferenceArray = (context, value) ->
    if typeof value == "object" && value.type == "arrayPointer"
      context.scope.getArray value.id
    else
      value

  setVariable = (context, node, variableNode, variable, value) ->
    if typeof variable == "object" && variable.type == "newArrayValue"
      throw new jsmm.msg.Error(node.id, "<var>#{variableNode.getCode()}</var> is <var>undefined</var>")
    else if typeof variable != "object" || variable.type not in ["variable", "local"]
      throw new jsmm.msg.Error(node.id, "Cannot assign <var>#{jsmm.stringify(value)}</var> to <var>#{variableNode.getCode()}</var>")
    else if variable.type == "variable"
      context.addCommand node, variable.info
      try
        variable.set context, variable.name, value
      catch error
        # augmented variables should do their own error handling, so wrap the resulting strings in jsmm messages
        if typeof error == "string"
          throw new jsmm.msg.Error(node.id, error)
        else
          throw error
    else if typeof variable.value == "object" && variable.value.type == "functionPointer"
      throw new jsmm.msg.Error(node.id, "Cannot assign a new value to function <var>#{variable.value.name}</var>")
    else
      variable.value = value

  jsmm.nodes.PostfixStatement::runFunc = (context, variable, symbol) ->
    context.addCommand this, "jsmm.arithmetic.increment"
    value = getValue(context, @identifier, variable)
    if typeof value != "number"
      throw new jsmm.msg.Error(@id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value)}</var> is not a number")
    else
      if symbol == "++"
        value++
      else
        value--
      setVariable context, this, @identifier, variable, value
      context.addAssignment this, @identifier.getCode()
      context.pushStep new jsmm.msg.Inline(@id, "<var>#{@identifier.getCode()}</var> = <var>#{jsmm.stringify(value)}</var>")

  runBinaryExpression = (context, node, value1, symbol, value2) ->
    switch symbol
      when '+', '+='
        if typeof value1 == "string" || typeof value2 == "string"
          context.addCommand node, "jsmm.arithmetic.strings"
        else if symbol == '+'
          context.addCommand node, "jsmm.arithmetic.numbers"
        else if symbol == '+='
          context.addCommand node, "jsmm.arithmetic.assignment"
      when '-', '*', '/', '%'
        context.addCommand node, "jsmm.arithmetic.numbers"
      when '-=', '*=', '/=', '%='
        context.addCommand node, "jsmm.arithmetic.assignment"
      when '>', '>=', '<', '<='
        context.addCommand node, "jsmm.logic.comparison"
      when '==', '!='
        context.addCommand node, "jsmm.logic.equality"
      when '&&', '||'
        context.addCommand node, "jsmm.logic.booleans"
    
    switch symbol
      when "-", "*", "/", "%", "-=", "*=", "/=", "%=", ">", ">=", "<", "<="
        if typeof value1 != "number" || !isFinite(value1)
          throw new jsmm.msg.Error(node.id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value1)}</var> is not a number")
        if typeof value2 != "number" || !isFinite(value2)
          throw new jsmm.msg.Error(node.id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value2)}</var> is not a number")
        if symbol in ["/", "/=", "%", "%="] && value2 == 0
          throw new jsmm.msg.Error(node.id, "<var>#{symbol}</var> not possible since it is a division by zero")  
      when "+", "+="
        if typeof value1 == "string" || typeof value2 == "string"
          if typeof value1 not in ["number", "boolean", "string"]
            throw new jsmm.msg.Error(node.id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value1)}</var> is not a number, string, or boolean")
          if typeof value2 not in ["number", "boolean", "string"]
            throw new jsmm.msg.Error(node.id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value2)}</var> is not a number, string, or boolean")
        else
          if typeof value1 != "number"
            throw new jsmm.msg.Error(node.id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value1)}</var> is not a number or string")
          if typeof value2 != "number"
            throw new jsmm.msg.Error(node.id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value2)}</var> is not a number or string")
      when "&&", "||"
        if typeof value1 != "boolean"
          throw new jsmm.msg.Error(node.id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value1)}</var> is not a boolean")
        if typeof value2 != "boolean"
          throw new jsmm.msg.Error(node.id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value2)}</var> is not a boolean")
      when "==", "!="
        if typeof value1 not in ["boolean", "number", "string"]
          throw new jsmm.msg.Error(node.id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value1)}</var> is not a number, string, or boolean")
        if typeof value2 not in ["boolean", "number", "string"]
          throw new jsmm.msg.Error(node.id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value2)}</var> is not a number, string, or boolean")
    
    switch symbol
      when "+", "+="
        value1 + value2
      when "-", "-="
        value1 - value2
      when "*", "*="
        value1 * value2
      when "/", "/="
        value1 / value2
      when "%", "%="
        value1 % value2
      when ">"
        value1 > value2
      when ">="
        value1 >= value2
      when "<"
        value1 < value2
      when "<="
        value1 <= value2
      when "&&"
        value1 && value2
      when "||"
        value1 || value2
      when "=="
        value1 == value2
      when "!="
        value1 != value2

  jsmm.nodes.AssignmentStatement::runFunc = (context, variable, symbol, expression) ->
    if symbol == "="
      context.addCommand this, "jsmm.="
      value = getValue(context, @expression, expression)
    else
      value = runBinaryExpression(context, this, getValue(context, @identifier, variable), symbol, getValue(context, @expression, expression))
    
    if variable.type == "newArrayValue"
      variable.array.setArrayValue variable.index, value
    else
      setVariable context, this, @identifier, variable, value
    
    context.addAssignment this, @identifier.getBaseName()
    context.pushStep new jsmm.msg.Inline(@id, "<var>#{@identifier.getCode()}</var> = <var>#{jsmm.stringify(value)}</var>")

  jsmm.nodes.VarItem::runFunc = (context, name) ->
    context.addCommand this, "jsmm.var"
    context.scope.vars[name] =
      type: "local"
      value: `undefined`

    unless @assignment?
      context.addAssignment this, name
      context.pushStep new jsmm.msg.Inline(@id, "<var>#{@name}</var> = <var>undefined</var>")

  jsmm.nodes.BinaryExpression::runFunc = (context, expression1, symbol, expression2) ->
    value1 = getValue(context, @expression1, expression1)
    value2 = getValue(context, @expression2, expression2)
    result = runBinaryExpression(context, this, value1, symbol, value2)
    context.pushStep new jsmm.msg.Inline(@id, "<var>#{jsmm.stringify(value1)}</var> #{symbol} <var>#{jsmm.stringify(value2)}</var> = <var>#{jsmm.stringify(result)}</var>")
    result

  jsmm.nodes.UnaryExpression::runFunc = (context, symbol, expression) ->
    value = getValue(context, @expression, expression)
    
    if symbol == "!"
      context.addCommand this, "jsmm.logic.inversion"
      if typeof value != "boolean"
        throw new jsmm.msg.Error(@id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value)}</var> is not a boolean")
      else
        result = !value
    else
      context.addCommand this, "jsmm.arithmetic.numbers"
      if typeof value != "number"
        throw new jsmm.msg.Error(@id, "<var>#{symbol}</var> not possible since <var>#{jsmm.stringify(value)}</var> is not a number")
      else
        if symbol == "+"
          result = value
        else
          result = -value

    if symbol == "!" || @expression.type != "NumberLiteral"
      context.pushStep new jsmm.msg.Inline(@id, "<var>#{symbol + jsmm.stringify(value)}</var> = <var>#{jsmm.stringify(result)}</var>")
    
    result

  jsmm.nodes.NumberLiteral::runFunc = (context, val) ->
    context.addCommand this, "jsmm.number"
    val

  jsmm.nodes.StringLiteral::runFunc = (context, val) ->
    context.addCommand this, "jsmm.string"
    val

  jsmm.nodes.BooleanLiteral::runFunc = (context, val) ->
    context.addCommand this, "jsmm.boolean"
    val

  jsmm.nodes.NameIdentifier::runFunc = (context, name) ->
    val = context.scope.find(name)
    if val != `undefined`
      val
    else
      throw new jsmm.msg.Error(@id, "Variable <var>#{name}</var> could not be found")

  jsmm.nodes.ObjectIdentifier::runFunc = (context, identifier, property) ->
    identifierValue = getValue(context, @identifier, identifier)
    identifierValue = dereferenceArray(context, identifierValue)
    if typeof identifierValue != "object" || identifierValue.type not in ["object", "array"]
      throw new jsmm.msg.Error(@id, "Variable <var>#{@identifier.getCode()}</var> is not an object</var>")
    else if !identifierValue.properties[property]?
      throw new jsmm.msg.Error(@id, "Variable <var>#{@identifier.getCode()}</var> does not have property <var>#{property}</var>")
    else
      identifierValue.properties[property]

  jsmm.nodes.ArrayIdentifier::runFunc = (context, identifier, expression) ->
    identifierValue = getValue(context, @identifier, identifier)
    identifierValue = dereferenceArray(context, identifierValue)
    expressionValue = getValue(context, @expression, expression)
    if typeof identifierValue != "object" || identifierValue.type != "array"
      throw new jsmm.msg.Error(@id, "Variable <var>#{@identifier.getCode()}</var> is not an array")
    else if typeof expressionValue != "number" && (expressionValue % 1) != 0
      throw new jsmm.msg.Error(@id, "Index <var>#{@expression.getCode()}</var> is not an integer")
    else
      context.addCommand this, "jsmm.array.access"
      identifierValue.getArrayValue expressionValue

  jsmm.nodes.FunctionCall::runFunc = (context, funcObject, args) ->
    funcValue = getValue(context, @identifier, funcObject)
    funcArgs = []
    msgFuncArgs = []

    for arg, i in args
      value = getValue(context, @expressionArgs[i], arg)
      funcArgs.push value
      msgFuncArgs.push jsmm.stringify(value)
      
    context.enterCall this
    if typeof funcValue == "object" && funcValue.type == "function"
      context.addCommand this, funcValue.info
      retVal = context.externalCall(this, funcValue, funcArgs)
    else if typeof funcValue == "object" && funcValue.type == "functionPointer"
      context.pushStep new jsmm.msg.Inline(@id, "calling <var>#{@identifier.getCode()}(#{msgFuncArgs.join(", ")})</var>")
      func = context.scope.getFunction(funcValue.name)

      if !func?
        throw new jsmm.msg.Error(@id, "Function <var>#{funcValue.name}</var> could not be found")
      
      retVal = func.call(null, context, funcArgs)
    else
      throw new jsmm.msg.Error(@id, "Variable <var>#{@identifier.getCode()}</var> is not a function")

    context.leaveCall()

    retVal ?= `undefined`
    if retVal?
      context.pushStep new jsmm.msg.Inline(@id, "called <var>#{@identifier.getCode()}(#{msgFuncArgs.join(", ")})")
    else
      context.pushStep new jsmm.msg.Inline(@id, "<var>#{@identifier.getCode()}(#{msgFuncArgs.join(", ")})</var> = <var>#{jsmm.stringify(retVal)}</var>")
    
    retVal

  jsmm.nodes.ArrayDefinition::runFunc = (context, expressions) ->
    values = (getValue(context, exp, expressions[i]) for exp, i in @expressions)
    context.addCommand this, "jsmm.array.creation"
    array = new jsmm.Array(values)

    type: "arrayPointer" # properties only for examples!
    string: "[array]"
    id: context.scope.registerArray(array)
    properties: array.properties

  jsmm.nodes.IfBlock::runFunc =
  jsmm.nodes.WhileBlock::runFunc =
  jsmm.nodes.ForBlock::runFunc = (context, expression) ->
    switch @type
      when "IfBlock"    then type = "if"
      when "WhileBlock" then type = "while"
      when "ForBlock"   then type = "for"
    context.addCommand this, "jsmm.#{type}"
    value = getValue(context, @expression, expression)
    if typeof value != "boolean"
      throw new jsmm.msg.Error(@id, "<var>#{type}</var> is not possible since <var>#{jsmm.stringify(value)}</var> is not a boolean")
    else
      value

  jsmm.nodes.ElseIfBlock::runFunc =
  jsmm.nodes.ElseBlock::runFunc = (context) ->
    context.addCommand this, "jsmm.else"

  jsmm.nodes.FunctionDeclaration::runFuncDecl = (context, name, func) ->
    context.addCommand this, "jsmm.function"
    
    # only check local scope for conflicts
    if context.scope.vars[name] != `undefined`
      if typeof context.scope.vars[name] == "object" && context.scope.vars[name].type in ["function", "functionPointer"]
        throw new jsmm.msg.Error(@id, "Function <var>#{name}</var> cannot be declared since there already is a function with that name")
      else
        throw new jsmm.msg.Error(@id, "Function <var>#{name}</var> cannot be declared since there already is a variable with that name")
    else
      context.scope.declareFunction name, func
      context.addAssignment this, name
      context.pushStep new jsmm.msg.Inline(@id, "declaring <var>#{@name + @getArgList()}</var>", "blockLoc")

  jsmm.nodes.FunctionDeclaration::runFuncEnter = (context, args) ->
    if args.length < @nameArgs.length
      if args.length <= 0
        but = "none are given"
      else if args.length == 1
        but = "only <var>1</var> is given"
      else
        but = "only <var>#{args.length}</var> are given"
      throw new jsmm.msg.Error(context.leaveCall().id, "Function expects <var>#{@nameArgs.length}</var> arguments, but #{but}")

    scopeVars = {}
    msgFuncArgs = []
    for nameArg, i in @nameArgs
      if args[i] == `undefined`
        throw new jsmm.msg.Error(context.leaveCall().id, "Argument <var>#{nameArg}</var> is <var>undefined</var>")
      else if args[i] == null
        throw new jsmm.msg.Error(context.leaveCall().id, "Argument <var>#{nameArg}</var> is <var>null</var>")
      else
        scopeVars[nameArg] = args[i]
        msgFuncArgs.push jsmm.stringify(args[i])
    
    fullName = "#{@name}(#{msgFuncArgs.join(", ")})"
    context.pushStep new jsmm.msg.Inline(@id, "entering <var>#{fullName}</var>")
    context.enterFunction this, scopeVars, fullName

  jsmm.nodes.ReturnStatement::runFunc = (context, expression) ->
    context.addCommand this, "jsmm.return"
    
    unless context.inFunction()
      throw new jsmm.msg.Error(@id, "Cannot return if not inside a function")
    
    if @expression? && expression?
      retVal = getValue(context, @expression, expression)
      context.pushStep new jsmm.msg.Inline(@id, "returning <var>#{jsmm.stringify(retVal)}</var>")
    else
      context.pushStep new jsmm.msg.Inline(@id, "returning nothing")
    context.leaveFunction this
    retVal

  jsmm.nodes.FunctionDeclaration::runFuncLeave = (context, expression) ->
    context.leaveFunction this
