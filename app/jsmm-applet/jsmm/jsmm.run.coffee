module.exports = (jsmm) ->
  
  getNode = (obj) ->
    'jsmmContext.tree.nodes["' + obj.id + '"]'

  # statementList 
  jsmm.nodes.Program::getRunCode = ->
    output = 'new function() {'
    output += 'return function(jsmmContext) {'
    output += @statementList.getRunCode() + '}; }'
    output

  jsmm.nodes.Program::getRunFunction = ->
    console.info @getRunCode()
    eval @getRunCode()

  jsmm.nodes.Program::getFunctionCode = ->
    output = 'new function() {'
    output += 'return function(jsmmScope) {'
    output += 'jsmmScope.clearFunctions();\n'
    output += @statementList.getFunctionCode() + '}; }'
    output

  jsmm.nodes.Program::getFunctionFunction = ->
    eval @getFunctionCode()

  jsmm.nodes.Program::getCompareBaseCode = (functionNames) ->
    @statementList.getCompareBaseCode functionNames

  jsmm.nodes.Program::getCompareFunctionCode = ->
    @statementList.getCompareFunctionCode()
  
  # statements 
  jsmm.nodes.StatementList::getRunCode = ->
    output = 'jsmmContext.increaseExecutionCounter(' + getNode(@parent) + ', ' + (@statements.length + 1) + ');\n'
    for s in @statements
      output += s.getRunCode() + '\n\n'
    output

  jsmm.nodes.StatementList::getFunctionCode = ->
    code = (s.getFunctionCode() for s in @statements when s.type == 'FunctionDeclaration')
    code.join('\n\n')

  jsmm.nodes.StatementList::getCompareBaseCode = (functionNames) ->
    output = ''
    for s in @statements
      if s.type != 'FunctionDeclaration' || s.name in functionNames
        output += s.getCode() + '\n\n'
      else
        output += '/* function ' + s.name + s.getArgList() + ' */\n\n'
    output

  jsmm.nodes.StatementList::getCompareFunctionCode = ->
    code = (s.getCode() for s in @statements when s.type == 'FunctionDeclaration')
    code.join('\n\n')

  # statement 
  jsmm.nodes.CommonSimpleStatement::getRunCode = ->
    @statement.getRunCode() + ';'
  
  # identifier, symbol 
  jsmm.nodes.PostfixStatement::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext, ' + @identifier.getRunCode() + ', "' + @symbol + '")'

  # identifier, symbol, expression 
  jsmm.nodes.AssignmentStatement::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext, ' + @identifier.getRunCode() + ', "' + @symbol + '", ' + @expression.getRunCode() + ')'
  
  # items 
  jsmm.nodes.VarStatement::getRunCode = ->
    code = (item.getRunCode() for item in @items)
    code.join(', ')
  
  # name, assignment 
  jsmm.nodes.VarItem::getRunCode = ->
    output = getNode(this) + '.runFunc(jsmmContext, "' + @name + '")'
    
    # ; is invalid in for loops
    # this should be possible in JS for normal statements as well
    if @assignment?
      output += ', ' + @assignment.getRunCode()
    output

  # expression 
  jsmm.nodes.ReturnStatement::getRunCode = ->
    expressonCode = @expression?.getRunCode() ? 'undefined'
    'return ' + getNode(this) + '.runFunc(jsmmContext, ' + expressonCode + ');'
  
  # expression1, symbol, expression2 
  jsmm.nodes.BinaryExpression::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext, ' + @expression1.getRunCode() + ', "' + @symbol + '", ' + @expression2.getRunCode() + ')'

  # symbol, expression 
  jsmm.nodes.UnaryExpression::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext, "' + @symbol + '", ' + @expression.getRunCode() + ')'

  # expression 
  jsmm.nodes.ParenExpression::getRunCode = ->
    '(' + @expression.getRunCode() + ')'
  
  # number 
  jsmm.nodes.NumberLiteral::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext, ' + @number + ')'

  # str 
  jsmm.nodes.StringLiteral::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext, ' + JSON.stringify(@str) + ')'
  
  # bool 
  jsmm.nodes.BooleanLiteral::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext, ' + ((if @bool then 'true' else 'false')) + ')'

  # name 
  jsmm.nodes.NameIdentifier::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext, "' + @name + '")'

  # identifier, prop 
  jsmm.nodes.ObjectIdentifier::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext, ' + @identifier.getRunCode() + ', "' + @prop + '")'
  
  # identifier, expression 
  jsmm.nodes.ArrayIdentifier::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext, ' + @identifier.getRunCode() + ', ' + @expression.getRunCode() + ')'
  
  # identifier, expressionArgs 
  jsmm.nodes.FunctionCall::getRunCode = ->
    code = (e.getRunCode() for e in @expressionArgs)
    getNode(this) + '.runFunc(jsmmContext, ' + @identifier.getRunCode() + ', [' + code.join(', ') + '])'
  
  # identifier, expressions 
  jsmm.nodes.ArrayDefinition::getRunCode = ->
    code = (e.getRunCode() for e in @expressions)
    getNode(this) + '.runFunc(jsmmContext, [' + code.join(', ') + '])'
  
  # expression, statementList, elseBlock 
  jsmm.nodes.IfBlock::getRunCode = ->
    output = 'if (' + getNode(this) + '.runFunc(jsmmContext, ' + @expression.getRunCode() + ')) {\n'
    output += @statementList.getRunCode() + '}'
    if @elseBlock?
      output += ' else {\n'
      output += @elseBlock.getRunCode() + '\n'
      output += '}'
    output
  
  # ifBlock 
  jsmm.nodes.ElseIfBlock::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext);\n' + @ifBlock.getRunCode()

  # statementList 
  jsmm.nodes.ElseBlock::getRunCode = ->
    getNode(this) + '.runFunc(jsmmContext);\n' + @statementList.getRunCode()

  # expression, statementList 
  jsmm.nodes.WhileBlock::getRunCode = ->
    output = 'while (' + getNode(this) + '.runFunc(jsmmContext, ' + @expression.getRunCode() + '))'
    output += '{\n' + @statementList.getRunCode() + '}'
    output
  
  # statement1, expression, statement2, statementList 
  jsmm.nodes.ForBlock::getRunCode = ->
    output = 'for (' + @statement1.getRunCode() + '; '
    output += getNode(this) + '.runFunc(jsmmContext, ' + @expression.getRunCode() + '); '
    output += @statement2.getRunCode() + ') {\n' + @statementList.getRunCode() + '}'
    output
  
  # name, nameArgs, statementList 
  jsmm.nodes.FunctionDeclaration::getRunCode = ->
    output = getNode(this) + '.runFuncDecl(jsmmContext, "' + @name + '", '
    output += 'function (jsmmContext, args) {\n'
    output += '/* args: ' + @getArgList() + ' */\n' # important for comparison
    output += getNode(this) + '.runFuncEnter(jsmmContext, args);\n'
    output += @statementList.getRunCode()
    output += 'return ' + getNode(this) + '.runFuncLeave(jsmmContext);\n'
    output += '});'
    output

  jsmm.nodes.FunctionDeclaration::getFunctionCode = ->
    output = 'jsmmScope.declareFunction("' + @name + '", '
    output += 'function (jsmmContext, args) {\n'
    output += '/* args: ' + @getArgList() + ' */\n' # important for comparison
    output += getNode(this) + '.runFuncEnter(jsmmContext, args);\n'
    output += @statementList.getRunCode()
    output += 'return ' + getNode(this) + '.runFuncLeave(jsmmContext);\n'
    output += '});'
    output
