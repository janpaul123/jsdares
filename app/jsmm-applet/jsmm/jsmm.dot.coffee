module.exports = (jsmm) ->
  
  makeEdge = (from, to) ->
    "#{from}->#{to};"

  makeNode = (id, label, shape) ->
    label = label.replace(/\"/g, "&quot;")
    label = label.replace(/\\/g, "\\\\")
    shape = shape || ""
    """#{id}[label="#{label}"shape="#{shape}"];"""
  
  # statementList 
  jsmm.nodes.Program::getDot = ->
    node = makeNode(@id, "PROGRAM")
    list = @statementList.getDot(@id)
    """digraph{graph[ordering="in"];#{node}#{list}}"""

  
  # statements 
  jsmm.nodes.StatementList::getDot = (fromId) ->
    output = makeEdge(fromId, @id)
    output += "subgraph cluster" + @id + "{color=lightgrey;"
    output += makeNode(@id, "", "point")
    for statement in @statements
      output += statement.getDot(@id)
    output += "}"
    output
  
  # statement 
  jsmm.nodes.CommonSimpleStatement::getDot = (fromId) ->
    @statement.getDot fromId
  
  # items 
  jsmm.nodes.VarStatement::getDot = (fromId) ->
    output = makeEdge(fromId, @id)
    output += "subgraph cluster" + @id + "{color=transparent;"
    output += makeNode(@id, "var")
    for item in @items
      output += item.getDot(@id)
    output += "}"
    output
  
  # name, assignment 
  jsmm.nodes.VarItem::getDot = (fromId) ->
    output = ""
    if @assignment?
      output += @assignment.getDot(fromId)
    else
      output += makeEdge(fromId, @id)
      output += makeNode(@id, @name)
    output

  jsmm.nodes.PostfixStatement::getDot =
  jsmm.nodes.AssignmentStatement::getDot =
  jsmm.nodes.ReturnStatement::getDot =
  jsmm.nodes.BinaryExpression::getDot =
  jsmm.nodes.UnaryExpression::getDot =
  jsmm.nodes.NumberLiteral::getDot =
  jsmm.nodes.StringLiteral::getDot =
  jsmm.nodes.BooleanLiteral::getDot =
  jsmm.nodes.NameIdentifier::getDot =
  jsmm.nodes.ObjectIdentifier::getDot =
  jsmm.nodes.ArrayIdentifier::getDot =
  jsmm.nodes.FunctionCall::getDot = (fromId) ->
    makeEdge(fromId, @id) + makeNode(@id, @getCode())
  
  # expressions 
  jsmm.nodes.ArrayDefinition::getDot = (fromId) ->
    output = makeEdge(fromId, @id)
    output += makeNode(@id, "[]")
    for expression in @expressions
      output += expression.getDot(@id)
    output

  
  # expression, statementList, elseBlock 
  jsmm.nodes.IfBlock::getDot = (fromId) ->
    output = makeEdge(fromId, @id)
    output += makeNode(@id, "if (" + @expression.getCode() + ")", "box")
    output += @statementList.getDot(@id)
    output += @elseBlock.getDot(@id) if @elseBlock?
    output
  
  # ifBlock 
  jsmm.nodes.ElseIfBlock::getDot = (fromId) ->
    output = makeEdge(fromId, @id)
    output += makeNode(@id, "else", "box")
    output += @ifBlock.getDot(@id)
    output

  # statementList 
  jsmm.nodes.ElseBlock::getDot = (fromId) ->
    output = makeEdge(fromId, @id)
    output += makeNode(@id, "else", "box")
    output += @statementList.getDot(@id)
    output
  
  # expression, statementList 
  jsmm.nodes.WhileBlock::getDot = (fromId) ->
    output = makeEdge(fromId, @id)
    output += makeNode(@id, "while (" + @expression.getCode() + ")", "box")
    output += @statementList.getDot(@id)
    output
  
  # statement1, expression, statement2, statementList 
  jsmm.nodes.ForBlock::getDot = (fromId) ->
    output = makeEdge(fromId, @id)
    output += makeNode(@id, "for ( ; " + @expression.getCode() + " ; )", "box")
    output += @statement1.getDot(@id)
    output += @statementList.getDot(@id)
    output += @statement2.getDot(@id)
    output
  
  # name, nameArgs, statementList 
  jsmm.nodes.FunctionDeclaration::getDot = (fromId) ->
    output = makeEdge(fromId, @id)
    output += makeNode(@id, "function " + @name + @getArgList(), "octagon")
    output += @statementList.getDot(@id)
    output
