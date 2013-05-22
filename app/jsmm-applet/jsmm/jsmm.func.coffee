#jshint node:true
"use strict"
module.exports = (jsmm) ->
  getValue = (context, node, expression) ->
    value = expression
    value = value.value  if typeof value is "object" and value.type is "local"
    if value is `undefined`
      throw new jsmm.msg.Error(node.id, "<var>" + node.getCode() + "</var> is <var>undefined</var>")
    else if value is null
      throw new jsmm.msg.Error(node.id, "<var>" + node.getCode() + "</var> is <var>null</var>")
    else if typeof value is "number" and not isFinite(value)
      throw new jsmm.msg.Error(node.id, "<var>" + node.getCode() + "</var> is not a valid number")
    else if typeof value is "object" and value.type is "newArrayValue"
      throw new jsmm.msg.Error(node.id, "<var>" + node.getCode() + "</var> is <var>undefined</var>")
    else if typeof value is "object" and value.type is "variable"
      context.addCommand node, value.info
      value.get value.name
    else
      value

  dereferenceArray = (context, value) ->
    if typeof value is "object" and value.type is "arrayPointer"
      context.scope.getArray value.id
    else
      value

  setVariable = (context, node, variableNode, variable, value) ->
    if typeof variable is "object" and variable.type is "newArrayValue"
      throw new jsmm.msg.Error(node.id, "<var>" + variableNode.getCode() + "</var> is <var>undefined</var>")
    else if typeof variable isnt "object" or ["variable", "local"].indexOf(variable.type) < 0
      throw new jsmm.msg.Error(node.id, "Cannot assign <var>" + jsmm.stringify(value) + "</var> to <var>" + variableNode.getCode() + "</var>")
    else if variable.type is "variable"
      context.addCommand node, variable.info
      try
        variable.set context, variable.name, value
      catch error
        
        # augmented variables should do their own error handling, so wrap the resulting strings in jsmm messages
        if typeof error is "string"
          throw new jsmm.msg.Error(node.id, error)
        else
          throw error
    else if typeof variable.value is "object" and variable.value.type is "functionPointer"
      throw new jsmm.msg.Error(node.id, "Cannot assign a new value to function <var>" + variable.value.name + "</var>")
    else
      variable.value = value

  jsmm.nodes.PostfixStatement::runFunc = (context, variable, symbol) ->
    context.addCommand this, "jsmm.arithmetic.increment"
    value = getValue(context, @identifier, variable)
    if typeof value isnt "number"
      throw new jsmm.msg.Error(@id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value) + "</var> is not a number")
    else
      if symbol is "++"
        value++
      else
        value--
      setVariable context, this, @identifier, variable, value
      context.addAssignment this, @identifier.getCode()
      context.pushStep new jsmm.msg.Inline(@id, "<var>" + @identifier.getCode() + "</var> = <var>" + jsmm.stringify(value) + "</var>")

  runBinaryExpression = (context, node, value1, symbol, value2) ->
    if (symbol is "+" or symbol is "+=") and (typeof value1 is "string" or typeof value2 is "string")
      context.addCommand node, "jsmm.arithmetic.strings"
    else if ["+", "-", "*", "/", "%"].indexOf(symbol) >= 0
      context.addCommand node, "jsmm.arithmetic.numbers"
    else if ["+=", "-=", "*=", "/=", "%="].indexOf(symbol) >= 0
      context.addCommand node, "jsmm.arithmetic.assignment"
    else if [">", ">=", "<", "<="].indexOf(symbol) >= 0
      context.addCommand node, "jsmm.logic.comparison"
    else if ["==", "!="].indexOf(symbol) >= 0
      context.addCommand node, "jsmm.logic.equality"
    else context.addCommand node, "jsmm.logic.booleans"  if ["&&", "||"].indexOf(symbol) >= 0
    if ["-", "*", "/", "%", "-=", "*=", "/=", "%=", ">", ">=", "<", "<="].indexOf(symbol) >= 0
      if typeof value1 isnt "number" or not isFinite(value1)
        throw new jsmm.msg.Error(node.id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value1) + "</var> is not a number")
      else if typeof value2 isnt "number" or not isFinite(value2)
        throw new jsmm.msg.Error(node.id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value2) + "</var> is not a number")
      else throw new jsmm.msg.Error(node.id, "<var>" + symbol + "</var> not possible since it is a division by zero")  if ["/", "/=", "%", "%="].indexOf(symbol) >= 0 and value2 is 0
    else if ["+", "+="].indexOf(symbol) >= 0
      if [typeof value1, typeof value2].indexOf("string") >= 0
        if ["number", "boolean", "string"].indexOf(typeof value1) < 0
          throw new jsmm.msg.Error(node.id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value1) + "</var> is not a number, string, or boolean")
        else throw new jsmm.msg.Error(node.id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value2) + "</var> is not a number, string, or boolean")  if ["number", "boolean", "string"].indexOf(typeof value2) < 0
      else
        if typeof value1 isnt "number"
          throw new jsmm.msg.Error(node.id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value1) + "</var> is not a number or string")
        else throw new jsmm.msg.Error(node.id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value2) + "</var> is not a number or string")  if typeof value2 isnt "number"
    else if ["&&", "||"].indexOf(symbol) >= 0
      if typeof value1 isnt "boolean"
        throw new jsmm.msg.Error(node.id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value1) + "</var> is not a boolean")
      else throw new jsmm.msg.Error(node.id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value2) + "</var> is not a boolean")  if typeof value2 isnt "boolean"
    else if ["==", "!="].indexOf(symbol) >= 0
      if ["boolean", "number", "string"].indexOf(typeof value1) < 0
        throw new jsmm.msg.Error(node.id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value1) + "</var> is not a number, string, or boolean")
      else throw new jsmm.msg.Error(node.id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value2) + "</var> is not a number, string, or boolean")  if ["boolean", "number", "string"].indexOf(typeof value2) < 0
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
        value1 and value2
      when "||"
        value1 or value2
      when "=="
        value1 is value2
      when "!="
        value1 isnt value2

  jsmm.nodes.AssignmentStatement::runFunc = (context, variable, symbol, expression) ->
    value = undefined
    if symbol is "="
      context.addCommand this, "jsmm.="
      value = getValue(context, @expression, expression)
    else
      value = runBinaryExpression(context, this, getValue(context, @identifier, variable), symbol, getValue(context, @expression, expression))
    if variable.type is "newArrayValue"
      variable.array.setArrayValue variable.index, value
    else
      setVariable context, this, @identifier, variable, value
    context.addAssignment this, @identifier.getBaseName()
    context.pushStep new jsmm.msg.Inline(@id, "<var>" + @identifier.getCode() + "</var> = <var>" + jsmm.stringify(value) + "</var>")

  jsmm.nodes.VarItem::runFunc = (context, name) ->
    context.addCommand this, "jsmm.var"
    context.scope.vars[name] =
      type: "local"
      value: `undefined`

    if @assignment is null
      context.addAssignment this, name
      context.pushStep new jsmm.msg.Inline(@id, "<var>" + @name + "</var> = <var>undefined</var>")

  jsmm.nodes.BinaryExpression::runFunc = (context, expression1, symbol, expression2) ->
    value1 = getValue(context, @expression1, expression1)
    value2 = getValue(context, @expression2, expression2)
    result = runBinaryExpression(context, this, value1, symbol, value2)
    context.pushStep new jsmm.msg.Inline(@id, "<var>" + jsmm.stringify(value1) + "</var> " + symbol + " <var>" + jsmm.stringify(value2) + "</var> = <var>" + jsmm.stringify(result) + "</var>")
    result

  jsmm.nodes.UnaryExpression::runFunc = (context, symbol, expression) ->
    value = getValue(context, @expression, expression)
    result = undefined
    if symbol is "!"
      context.addCommand this, "jsmm.logic.inversion"
      if typeof value isnt "boolean"
        throw new jsmm.msg.Error(@id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value) + "</var> is not a boolean")
      else
        result = not value
    else
      context.addCommand this, "jsmm.arithmetic.numbers"
      if typeof value isnt "number"
        throw new jsmm.msg.Error(@id, "<var>" + symbol + "</var> not possible since <var>" + jsmm.stringify(value) + "</var> is not a number")
      else
        result = ((if symbol is "+" then value else -value))
    context.pushStep new jsmm.msg.Inline(@id, "<var>" + symbol + jsmm.stringify(value) + "</var> = <var>" + jsmm.stringify(result) + "</var>")  if symbol is "!" or @expression.type isnt "NumberLiteral"
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
    if val is `undefined`
      throw new jsmm.msg.Error(@id, "Variable <var>" + name + "</var> could not be found")
    else
      val

  jsmm.nodes.ObjectIdentifier::runFunc = (context, identifier, property) ->
    identifierValue = getValue(context, @identifier, identifier)
    identifierValue = dereferenceArray(context, identifierValue)
    if typeof identifierValue isnt "object" or ["object", "array"].indexOf(identifierValue.type) < 0
      throw new jsmm.msg.Error(@id, "Variable <var>" + @identifier.getCode() + "</var> is not an object</var>")
    else if identifierValue.properties[property] is `undefined`
      throw new jsmm.msg.Error(@id, "Variable <var>" + @identifier.getCode() + "</var> does not have property <var>" + property + "</var>")
    else
      identifierValue.properties[property]

  jsmm.nodes.ArrayIdentifier::runFunc = (context, identifier, expression) ->
    identifierValue = getValue(context, @identifier, identifier)
    identifierValue = dereferenceArray(context, identifierValue)
    expressionValue = getValue(context, @expression, expression)
    if typeof identifierValue isnt "object" or identifierValue.type isnt "array"
      throw new jsmm.msg.Error(@id, "Variable <var>" + @identifier.getCode() + "</var> is not an array")
    else if typeof expressionValue isnt "number" and expressionValue % 1 isnt 0
      throw new jsmm.msg.Error(@id, "Index <var>" + @expression.getCode() + "</var> is not an integer")
    else
      context.addCommand this, "jsmm.array.access"
      identifierValue.getArrayValue expressionValue

  jsmm.nodes.FunctionCall::runFunc = (context, funcObject, args) ->
    funcValue = getValue(context, @identifier, funcObject)
    funcArgs = []
    msgFuncArgs = []
    appFunc = undefined
    i = 0

    while i < args.length
      value = getValue(context, @expressionArgs[i], args[i])
      funcArgs.push value
      msgFuncArgs.push jsmm.stringify(value)
      i++
    retVal = undefined
    context.enterCall this
    if typeof funcValue is "object" and funcValue.type is "function"
      context.addCommand this, funcValue.info
      retVal = context.externalCall(this, funcValue, funcArgs)
    else if typeof funcValue is "object" and funcValue.type is "functionPointer"
      context.pushStep new jsmm.msg.Inline(@id, "calling <var>" + @identifier.getCode() + "(" + msgFuncArgs.join(", ") + ")" + "</var>")
      func = context.scope.getFunction(funcValue.name)
      throw new jsmm.msg.Error(@id, "Function <var>" + funcValue.name + "</var> could not be found")  if func is `undefined`
      retVal = func.call(null, context, funcArgs)
    else
      throw new jsmm.msg.Error(@id, "Variable <var>" + @identifier.getCode() + "</var> is not a function")
    context.leaveCall()
    retVal = `undefined`  if retVal is null
    if retVal isnt `undefined`
      context.pushStep new jsmm.msg.Inline(@id, "<var>" + @identifier.getCode() + "(" + msgFuncArgs.join(", ") + ")" + "</var> = <var>" + jsmm.stringify(retVal) + "</var>")
    else
      context.pushStep new jsmm.msg.Inline(@id, "called <var>" + @identifier.getCode() + "(" + msgFuncArgs.join(", ") + ")")
    retVal

  jsmm.nodes.ArrayDefinition::runFunc = (context, expressions) ->
    values = []
    i = 0

    while i < @expressions.length
      values[i] = getValue(context, @expressions[i], expressions[i])
      i++
    context.addCommand this, "jsmm.array.creation"
    array = new jsmm.Array(values)
    type: "arrayPointer" # properties only for examples!
    string: "[array]"
    id: context.scope.registerArray(array)
    properties: array.properties

  jsmm.nodes.IfBlock::runFunc = jsmm.nodes.WhileBlock::runFunc = jsmm.nodes.ForBlock::runFunc = (context, expression) ->
    type = ((if @type is "IfBlock" then "if" else ((if @type is "WhileBlock" then "while" else "for"))))
    context.addCommand this, "jsmm." + type
    value = getValue(context, @expression, expression)
    if typeof value isnt "boolean"
      throw new jsmm.msg.Error(@id, "<var>" + type + "</var> is not possible since <var>" + jsmm.stringify(value) + "</var> is not a boolean")
    else
      value

  jsmm.nodes.ElseIfBlock::runFunc = jsmm.nodes.ElseBlock::runFunc = (context) ->
    context.addCommand this, "jsmm.else"

  jsmm.nodes.FunctionDeclaration::runFuncDecl = (context, name, func) ->
    context.addCommand this, "jsmm.function"
    
    # only check local scope for conflicts
    if context.scope.vars[name] isnt `undefined`
      if typeof context.scope.vars[name] is "object" and ["function", "functionPointer"].indexOf(context.scope.vars[name].type) >= 0
        throw new jsmm.msg.Error(@id, "Function <var>" + name + "</var> cannot be declared since there already is a function with that name")
      else
        throw new jsmm.msg.Error(@id, "Function <var>" + name + "</var> cannot be declared since there already is a variable with that name")
    else
      context.scope.declareFunction name, func
      context.addAssignment this, name
      context.pushStep new jsmm.msg.Inline(@id, "declaring <var>" + @name + @getArgList() + "</var>", "blockLoc")

  jsmm.nodes.FunctionDeclaration::runFuncEnter = (context, args) ->
    if args.length < @nameArgs.length
      but = "only <var>" + args.length + "</var> are given"
      if args.length <= 0
        but = "none are given"
      else but = "only <var>1</var> is given"  if args.length is 1
      throw new jsmm.msg.Error(context.leaveCall().id, "Function expects <var>" + @nameArgs.length + "</var> arguments, but " + but)
    scopeVars = {}
    msgFuncArgs = []
    i = 0

    while i < @nameArgs.length
      if args[i] is `undefined`
        throw new jsmm.msg.Error(context.leaveCall().id, "Argument <var>" + @nameArgs[i] + "</var> is <var>undefined</var>")
      else if args[i] is null
        throw new jsmm.msg.Error(context.leaveCall().id, "Argument <var>" + @nameArgs[i] + "</var> is <var>null</var>")
      else
        scopeVars[@nameArgs[i]] = args[i]
        msgFuncArgs.push jsmm.stringify(args[i])
      i++
    fullName = @name + "(" + msgFuncArgs.join(", ") + ")"
    context.pushStep new jsmm.msg.Inline(@id, "entering <var>" + fullName + "</var>")
    context.enterFunction this, scopeVars, fullName

  jsmm.nodes.ReturnStatement::runFunc = (context, expression) ->
    context.addCommand this, "jsmm.return"
    throw new jsmm.msg.Error(@id, "Cannot return if not inside a function")  unless context.inFunction()
    retVal = undefined
    if @expression isnt `undefined` and expression isnt `undefined`
      retVal = getValue(context, @expression, expression)
      context.pushStep new jsmm.msg.Inline(@id, "returning <var>" + jsmm.stringify(retVal) + "</var>")
    else
      context.pushStep new jsmm.msg.Inline(@id, "returning nothing")
    context.leaveFunction this
    retVal

  jsmm.nodes.FunctionDeclaration::runFuncLeave = (context, expression) ->
    context.leaveFunction this
