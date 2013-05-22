#jshint node:true
"use strict"
module.exports = (jsmm) ->
  getNode = (obj) ->
    "jsmmContext.tree.nodes[\"" + obj.id + "\"]"

  
  # statementList 
  jsmm.nodes.Program::getRunCode = ->
    output = "new function() {"
    output += "return function(jsmmContext) {"
    output += @statementList.getRunCode() + "}; }"
    output

  jsmm.nodes.Program::getRunFunction = ->
    
    #jshint evil:true
    eval @getRunCode()

  jsmm.nodes.Program::getFunctionCode = ->
    output = "new function() {"
    output += "return function(jsmmScope) {"
    output += "jsmmScope.clearFunctions();\n"
    output += @statementList.getFunctionCode() + "}; }"
    output

  jsmm.nodes.Program::getFunctionFunction = ->
    
    #jshint evil:true
    eval @getFunctionCode()

  jsmm.nodes.Program::getCompareBaseCode = (functionNames) ->
    @statementList.getCompareBaseCode functionNames

  jsmm.nodes.Program::getCompareFunctionCode = ->
    @statementList.getCompareFunctionCode()

  
  # statements 
  jsmm.nodes.StatementList::getRunCode = ->
    output = "jsmmContext.increaseExecutionCounter(" + getNode(@parent) + ", " + (@statements.length + 1) + ");\n"
    i = 0

    while i < @statements.length
      output += @statements[i].getRunCode() + "\n\n"
      i++
    output

  jsmm.nodes.StatementList::getFunctionCode = ->
    output = ""
    i = 0

    while i < @statements.length
      output += @statements[i].getFunctionCode() + "\n\n"  if @statements[i].type is "FunctionDeclaration"
      i++
    output

  jsmm.nodes.StatementList::getCompareBaseCode = (functionNames) ->
    output = ""
    i = 0

    while i < @statements.length
      if @statements[i].type isnt "FunctionDeclaration" or functionNames.indexOf(@statements[i].name) >= 0
        output += @statements[i].getCode() + "\n\n"
      else
        output += "/* function " + @statements[i].name + @statements[i].getArgList() + " */\n\n"
      i++
    output

  jsmm.nodes.StatementList::getCompareFunctionCode = ->
    output = ""
    i = 0

    while i < @statements.length
      output += @statements[i].getCode() + "\n\n"  if @statements[i].type is "FunctionDeclaration"
      i++
    output

  
  # statement 
  jsmm.nodes.CommonSimpleStatement::getRunCode = ->
    @statement.getRunCode() + ";"

  
  # identifier, symbol 
  jsmm.nodes.PostfixStatement::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext, " + @identifier.getRunCode() + ", \"" + @symbol + "\")"

  
  # identifier, symbol, expression 
  jsmm.nodes.AssignmentStatement::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext, " + @identifier.getRunCode() + ", \"" + @symbol + "\", " + @expression.getRunCode() + ")"

  
  # items 
  jsmm.nodes.VarStatement::getRunCode = ->
    output = @items[0].getRunCode()
    i = 1

    while i < @items.length
      output += ", " + @items[i].getRunCode()
      i++
    output

  
  # name, assignment 
  jsmm.nodes.VarItem::getRunCode = ->
    output = getNode(this) + ".runFunc(jsmmContext, \"" + @name + "\")"
    
    # ; is invalid in for loops
    # this should be possible in JS for normal statements as well
    output += ", " + @assignment.getRunCode()  if @assignment isnt null
    output

  
  # expression 
  jsmm.nodes.ReturnStatement::getRunCode = ->
    output = ""
    expressonCode = (if @expression is null then "undefined" else @expression.getRunCode())
    output += "return " + getNode(this) + ".runFunc(jsmmContext, " + expressonCode + ");"
    output

  
  # expression1, symbol, expression2 
  jsmm.nodes.BinaryExpression::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext, " + @expression1.getRunCode() + ", \"" + @symbol + "\", " + @expression2.getRunCode() + ")"

  
  # symbol, expression 
  jsmm.nodes.UnaryExpression::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext, \"" + @symbol + "\", " + @expression.getRunCode() + ")"

  
  # expression 
  jsmm.nodes.ParenExpression::getRunCode = ->
    "(" + @expression.getRunCode() + ")"

  
  # number 
  jsmm.nodes.NumberLiteral::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext, " + @number + ")"

  
  # str 
  jsmm.nodes.StringLiteral::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext, " + JSON.stringify(@str) + ")"

  
  # bool 
  jsmm.nodes.BooleanLiteral::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext, " + ((if @bool then "true" else "false")) + ")"

  
  # name 
  jsmm.nodes.NameIdentifier::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext, \"" + @name + "\")"

  
  # identifier, prop 
  jsmm.nodes.ObjectIdentifier::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext, " + @identifier.getRunCode() + ", \"" + @prop + "\")"

  
  # identifier, expression 
  jsmm.nodes.ArrayIdentifier::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext, " + @identifier.getRunCode() + ", " + @expression.getRunCode() + ")"

  
  # identifier, expressionArgs 
  jsmm.nodes.FunctionCall::getRunCode = ->
    output = getNode(this) + ".runFunc(jsmmContext, " + @identifier.getRunCode() + ", ["
    output += @expressionArgs[0].getRunCode()  if @expressionArgs.length > 0
    i = 1

    while i < @expressionArgs.length
      output += ", " + @expressionArgs[i].getRunCode()
      i++
    output + "])"

  
  # identifier, expressions 
  jsmm.nodes.ArrayDefinition::getRunCode = ->
    output = getNode(this) + ".runFunc(jsmmContext, ["
    output += @expressions[0].getRunCode()  if @expressions.length > 0
    i = 1

    while i < @expressions.length
      output += ", " + @expressions[i].getRunCode()
      i++
    output + "])"

  
  # expression, statementList, elseBlock 
  jsmm.nodes.IfBlock::getRunCode = ->
    output = "if (" + getNode(this) + ".runFunc(jsmmContext, " + @expression.getRunCode() + ")) {\n"
    output += @statementList.getRunCode() + "}"
    if @elseBlock isnt null
      output += " else {\n"
      output += @elseBlock.getRunCode() + "\n"
      output += "}"
    output

  
  # ifBlock 
  jsmm.nodes.ElseIfBlock::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext);\n" + @ifBlock.getRunCode()

  
  # statementList 
  jsmm.nodes.ElseBlock::getRunCode = ->
    getNode(this) + ".runFunc(jsmmContext);\n" + @statementList.getRunCode()

  
  # expression, statementList 
  jsmm.nodes.WhileBlock::getRunCode = ->
    output = "while (" + getNode(this) + ".runFunc(jsmmContext, " + @expression.getRunCode() + "))"
    output += "{\n" + @statementList.getRunCode() + "}"
    output

  
  # statement1, expression, statement2, statementList 
  jsmm.nodes.ForBlock::getRunCode = ->
    output = "for (" + @statement1.getRunCode() + "; "
    output += getNode(this) + ".runFunc(jsmmContext, " + @expression.getRunCode() + "); "
    output += @statement2.getRunCode() + ") {\n" + @statementList.getRunCode() + "}"
    output

  
  # name, nameArgs, statementList 
  jsmm.nodes.FunctionDeclaration::getRunCode = ->
    output = getNode(this) + ".runFuncDecl(jsmmContext, \"" + @name + "\", "
    output += "function (jsmmContext, args) {\n"
    output += "/* args: " + @getArgList() + " */\n" # important for comparison
    output += getNode(this) + ".runFuncEnter(jsmmContext, args);\n"
    output += @statementList.getRunCode()
    output += "return " + getNode(this) + ".runFuncLeave(jsmmContext);\n"
    output += "});"
    output

  jsmm.nodes.FunctionDeclaration::getFunctionCode = ->
    output = "jsmmScope.declareFunction(\"" + @name + "\", "
    output += "function (jsmmContext, args) {\n"
    output += "/* args: " + @getArgList() + " */\n" # important for comparison
    output += getNode(this) + ".runFuncEnter(jsmmContext, args);\n"
    output += @statementList.getRunCode()
    output += "return " + getNode(this) + ".runFuncLeave(jsmmContext);\n"
    output += "});"
    output
