robot = require('../robot')
output = require('../output')
jsmm = require('../jsmm')

module.exports = (info) ->
  info.tables = []
  
  info.consoleExample = (infoTable, $content, example, sampText) ->
    $dfn = $('<dfn></dfn>')
    $content.append $('<div class="info-table-content-wrapper"></div>').append($dfn)
    
    $samp = $('<samp></samp>')
    $dfn.append $samp
    
    $code = $('<code>' + example + '</code>')
    $dfn.append $code
    
    if sampText?
      $samp.html sampText
    else
      console = {
        log: (string) ->
          if typeof string == 'object'
            string = '[object]'
          $samp.text $samp.text() + string + '\n'
        clear: ->
          $samp.text ''
      }

      localDocument = {}
      ((document) -> eval(example))(localDocument)
      infoTable.addGlobalEvent $(document), 'keydown', localDocument.onkeydown if localDocument.onkeydown?
      infoTable.addGlobalEvent $(document), 'keyup', localDocument.onkeyup if localDocument.onkeyup?

  canvasEventWrapper = ($canvas, func) ->
    (e) ->
      offset = $canvas.offset()
      event =
        layerX: e.pageX - offset.left
        layerY: e.pageY - offset.top
      func(event)
      false

  info.canvasExample = (infoTable, $content, example) ->
    $wrapper = $('<div class="info-table-content-wrapper"></div>')
    $content.append $wrapper
    
    $container = $('<div class="canvas-container info-table-content-container"></div>')
    $wrapper.append $container
    
    $canvas = $('<canvas class="canvas-canvas" width="130" height="130"></canvas>')
    $container.append $canvas
    
    $wrapper.append """<code>var context = canvas.getContext("2d");\n#{example}</code>"""
    
    canvas = {}
    context = $canvas[0].getContext('2d')
    interval = null
    window = setInterval: (func, time) ->
      interval = {func, time}

    eval example

    infoTable.addGlobalEvent $canvas, 'mousemove', canvasEventWrapper($canvas, canvas.onmousemove) if canvas.onmousemove?
    infoTable.addGlobalEvent $canvas, 'mousedown', canvasEventWrapper($canvas, canvas.onmousedown) if canvas.onmousedown?
    infoTable.addGlobalEvent $canvas, 'mouseup', canvasEventWrapper($canvas, canvas.onmouseup) if canvas.onmouseup?
    
    if canvas.onmousedown? or canvas.onmouseup?
      $canvas.addClass 'info-table-content-clickable'
      infoTable.addGlobalEvent $canvas, 'click', (e) ->
        e.stopPropagation()

    infoTable.addGlobalEvent null, 'interval', interval if interval?

  info.robotExample = (infoTable, $content, example, state) ->
    $wrapper = $('<div class="info-table-content-wrapper"></div>')
    $content.append $wrapper
    
    $container = $('<div class="robot-container info-table-content-container"></div>')
    $wrapper.append $container
    
    state = state or '{"columns":4,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":0,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":0}'
    rob = new robot.Robot($container, true, 48, state)
    rob.insertDelay 100000
    
    simpleRobot = new output.SimpleRobot(state)
    simpleConsole = new output.SimpleConsole
    runner = new jsmm.SimpleRunner
      console: simpleConsole.getAugmentedObject()
      robot: simpleRobot.getAugmentedObject()
    runner.run example
    simpleRobot.play rob
    rob.playAll()

    if simpleConsole.getText().length > 0
      $wrapper.append """<dfn><samp>#{simpleConsole.getText()}</samp><code>#{example}</code></dfn>"""
    else
      $wrapper.append """<code>#{example}</code>"""


  class info.InfoScope

    constructor: ($div, info) ->
      @info = info
      @$scopeContainer = $('<div class="info-scope-container"></div>')
      $div.append @$scopeContainer
      
      @$scopeContainer.append """
        <p>
          <span class="info-output">
            <i class="icon icon-eye-open icon-white"></i>
            scope
          </span>
        </p>
        <p>
          This list shows the variables that are declared in your
          <a href="#arrow-right,575,57">program</a>, along with their values.
          At the beginning the only variables are those that we provide,
          such as <var>robot</var> or <var>canvas</var>. You can add your own
          variables and functions using <var>var</var> and <var>function</var>.
        </p>
      """
      @info.prepareTextElement @$scopeContainer
      
      @$scope = $('<div class="info-scope"></div>')
      @$scopeContainer.append @$scope
      
      @highlighting = false
      @scopeTracker = null
      
      @itemClick = _(@itemClick).bind(this)
      @mouseMove = _(@mouseMove).bind(this)
      @mouseLeave = _(@mouseLeave).bind(this)

    remove: ->
      @clear()
      @$scope.remove()

    update: (scopeTracker, stepNum) ->
      @scopeTracker = scopeTracker
      state = @scopeTracker.getState(stepNum)
      @clear()

      state = state.slice(0).reverse()
      enabled = true
      for item in state
        enabled = item in [_.first(state), _.last(state)]
        @makeItem item, enabled

    enableHighlighting: ->
      @highlighting = true
      @$scope.on 'mouseleave', @mouseLeave

    disableHighlighting: ->
      @highlighting = false
      @$scope.off 'mouseleave'
      @removeHighlights()

    highlightNodes: (nodeIds) ->
      @nodeIds = nodeIds
      @renderHighlights() if @visible

    renderHighlights: ->
      @removeHighlights()
      nodeIds = @nodeIds
      if @scopeTracker? and nodeIds
        for nodeId in nodeIds
          highlightIds = @scopeTracker.getHighlightIdsByNodeId nodeId
          for highlightId in highlightIds
            $variable = @$variables[highlightId]
            $variable?.addClass 'info-scope-variable-highlight'

    setFocus: ->
      @visible = true
      @renderHighlights()

    unsetFocus: ->
      @visible = false

    ## INTERNAL FUNCTIONS ##
    clear: ->
      @$scope.find('.info-scope-variable').remove() # to prevent $.data leaks
      @$scope.children('.info-scope-item').remove() # to prevent $.data leaks
      @$variables = {}

    makeItem: (level, enabled) ->
      $item = $('<div class="info-scope-item"></div>')
      $item.data 'id', level.id
      $item.on 'click', @itemClick
      @$scope.append $item
      
      $cell = $('<div class="info-scope-cell"></div>')
      $item.append $cell
      
      $arrow = $('<span class="info-scope-cell-arrow"></span>')
      $cell.append $arrow
      $name = $("""<span class="info-scope-cell-name">#{level.name}:</span>""")
      $cell.append $name
      $content = $('<div class="info-scope-content"></div>')
      $item.append $content

      for name in level.names
        variable = level.scope[name]
        $variable = $("""<div class="info-scope-variable">#{variable.name} = #{variable.value}</div>""")
        if variable.highlight
          $variable.addClass 'info-scope-variable-highlight-step'
        $variable.on 'mousemove', @mouseMove
        $variable.data 'id', variable.id
        $content.append $variable
        @$variables[variable.id] = $variable

      if enabled
        $item.addClass 'info-scope-item-active'
        $content.show()
      else
        $item.addClass 'info-scope-item-disabled'
        $content.hide()

    itemClick: (event) ->
      $target = $(event.delegateTarget)
      $content = $target.children('.info-scope-content')
      if $target.hasClass('info-scope-item-active')
        $target.removeClass 'info-scope-item-active'
        $content.slideUp 200
      else
        $target.addClass 'info-scope-item-active'
        $content.slideDown 200

    removeHighlights: ->
      @$scope.find('.info-scope-variable-highlight').removeClass 'info-scope-variable-highlight'

    mouseMove: (event) ->
      event.stopPropagation()
      if @highlighting and @commandTracker?
        @removeHighlights()
        $target = $(event.delegateTarget)
        if $target.data('id')?
          $target.addClass 'info-scope-variable-highlight'
          @info.editor.highlightNodeIds @scopeTracker.getHighlightNodeIdsById($target.data('id'))
        else
          @info.editor.highlightNodeId 0

    mouseLeave: (event) ->
      @removeHighlights()
      @info.editor.highlightNodeId 0

  class info.InfoTable

    icons:
      console: 'icon-list-alt'
      canvas: 'icon-picture'
      robot: 'icon-th'

    constructor: ($div, info) ->
      @info = info
      @$tables = $('<div class="info-tables">')
      $div.append @$tables
      @commands = {}
      @highlighting = false
      @commandTracker = null
      @globalEvents = []
      
      @itemClick = _(@itemClick).bind(this)
      @mouseMove = _(@mouseMove).bind(this)
      @mouseLeave = _(@mouseLeave).bind(this)

    addCommands: (tables) ->
      @addTable(table) for table in tables

    addTable: (table) ->
      $table = $('<div class="info-table"></div>')
      $table.html table.html
      @$tables.append $table
      
      for id of table.list
        command = table.list[id]
        
        $item = $('<div class="info-table-item"></div>')
        $cell = $('<div class="info-table-cell"></div>')
        @makeCell command, $cell
        $item.append $cell
        
        $content = $('<div class="info-table-content"></div>')
        $content.hide()
        $item.append $content
        
        $item.data 'id', id
        $item.data 'command', command
        $item.on 'click', @itemClick
        $item.on 'mousemove', @mouseMove
        
        $table.append $item
        @commands[id] =
          command: command
          $item: $item
      
      @info.prepareTextElement $table

    remove: ->
      @removeGlobalEvents()
      @$tables.find('.info-table-item').remove() # to prevent $.data leaks
      @$tables.remove()

    update: (commandTracker, highlightStepNodeId) ->
      @commandTracker = commandTracker
      @$tables.find('.info-table-item-highlight-step').removeClass 'info-table-item-highlight-step'
      ids = @commandTracker.getHighlightIdsByNodeId(highlightStepNodeId)
      
      for id in ids
        @commands[id]?.$item.addClass 'info-table-item-highlight-step'

    highlightNodes: (nodeIds) ->
      @nodeIds = nodeIds
      @renderHighlights() if @visible

    renderHighlights: ->
      @removeHighlights()
      nodeIds = @nodeIds
      if @commandTracker? and nodeIds
        for nodeId in nodeIds
          highlightIds = @commandTracker.getHighlightIdsByTopNodeId(nodeId)
          for highlightId in highlightIds
            @commands[highlightId]?.$item.addClass 'info-table-item-highlight'

    enableHighlighting: ->
      @highlighting = true
      @$tables.on 'mouseleave', @mouseLeave

    disableHighlighting: ->
      @highlighting = false
      @removeHighlights()
      @$tables.off 'mouseleave'

    addGlobalEvent: ($element, type, func) ->
      if type == 'interval'
        @globalEvents.push
          type: type
          interval: window.setInterval(func.func, func.time)
      else
        $element.on type, func
        @globalEvents.push
          $element: $element
          type: type
          func: func

    removeGlobalEvents: ->
      for event in @globalEvents
        if event.type == 'interval'
          window.clearInterval event.interval
        else
          event.$element.off event.type, event.func

    setFocus: ->
      @visible = true
      @renderHighlights()

    unsetFocus: ->
      @visible = false
    
    ## INTERNAL FUNCTIONS ##
    makeCell: (command, $cell) ->
      $arrow = $('<span class="info-table-cell-arrow"></span>')
      $cell.append $arrow
      $name = $("""<span class="info-table-cell-name">#{command.name} </span>""")
      $cell.append $name

    itemClick: (event) ->
      $target = $(event.delegateTarget)
      command = $target.data('command')
      $content = $target.children('.info-table-content')
      @removeGlobalEvents()
      if $target.hasClass('info-table-item-active')
        $target.removeClass 'info-table-item-active'
        $content.slideUp 200
      else
        @$tables.find('.info-table-item-active').
                removeClass('info-table-item-active').
                children('.info-table-content').
                slideUp 200
        $content.show()
        @makeContent command, $content
        $target.addClass 'info-table-item-active'
        $content.hide()
        $content.slideDown 200

    makeContent: (command, $content) ->
      $content.html command.text
      for example in command.examples
        switch example.type
          when 'robot'
            info.robotExample this, $content, example.code, example.state
          when 'console'
            info.consoleExample this, $content, example.code, example.result
          when 'canvas'
            info.canvasExample this, $content, example.code

    removeHighlights: ->
      @$tables.find('.info-table-item-highlight').removeClass 'info-table-item-highlight'

    mouseMove: (event) ->
      if @highlighting and @commandTracker?
        @removeHighlights()
        $target = $(event.delegateTarget)
        if $target.data('id')?
          $target.addClass 'info-table-item-highlight'
          @info.editor.highlightNodeIds @commandTracker.getHighlightNodeIdsById($target.data('id'))
        else
          @info.editor.highlightNodeId 0

    mouseLeave: (event) ->
      if @highlighting
        @removeHighlights()
        @info.editor.highlightNodeId 0

  class info.Info

    constructor: (editor, options, $div) ->
      @$div = $div
      @$div.addClass 'output info'
      @prepareTextElement = options.prepareTextElement
      
      if options.scope ? true
        @scope = new info.InfoScope(@$div, this)
      else
        @scope = null

      @table = new info.InfoTable(@$div, this)
      @table.addCommands @filterCommands(options.commands || '')
      @editor = editor

    remove: ->
      @$div.removeClass 'output info'
      @scope?.remove()
      @table.remove()

    getScopeObjects: ->
      {}

    outputClearAllEvents: ->
      @events = []
      @currentEvent = null
      @lastEvent = null

    outputStartEvent: (context) ->
      @lastEvent = context: context
      @events.push @lastEvent
      @stepNum = Infinity

    outputEndEvent: (context) ->

    outputPopFront: ->
      @events.shift()

    outputClearEventsFrom: (eventNum) ->
      @events = @events.slice(0, eventNum)
      # always followed by appropriate outputSetEventStep

    outputClearEventsToEnd: ->
      @scope?.update @lastEvent.context.getScopeTracker(), Infinity
      @table.update @lastEvent.context.getCommandTracker(), 0
      @events = []

    outputSetEventStep: (eventNum, stepNum) ->
      if eventNum >= 0 && (@currentEvent != @events[eventNum] || @stepNum != stepNum)
        @currentEvent = @events[eventNum]
        @stepNum = stepNum
        @scope?.update @currentEvent.context.getScopeTracker(), @stepNum
        @table.update @lastEvent.context.getCommandTracker(), @currentEvent.context.getNodeIdByStepNum(@stepNum)

    highlightNodes: (nodeIds) ->
      @scope?.highlightNodes nodeIds
      @table.highlightNodes nodeIds

    enableHighlighting: ->
      @$div.addClass 'info-highlighting'
      @scope?.enableHighlighting()
      @table.enableHighlighting()

    disableHighlighting: ->
      @$div.removeClass 'info-highlighting'
      @scope?.disableHighlighting()
      @table.disableHighlighting()

    setFocus: ->
      @scope?.setFocus()
      @table.setFocus()

    unsetFocus: ->
      @scope?.unsetFocus()
      @table.unsetFocus()

    ## INTERNAL FUNCTIONS ##
    filterCommands: (string) ->
      regex = /^(([^.\[]*[.]?)*)(\[([0-9]*)\])?/

      if string.length <= 0
        @buildTable()
      else
        commands = string.split(',')
        filter = []

        for command in commands
          command = commands[i]
          matches = regex.exec(command)
          id = matches[1]
          example = matches[4]
          filter[id] = filter[id] || []
          filter[id].push example if example?

        @buildTable filter

    buildTable: (filter) ->
      unless filter?
        info.tables
      else
        tables = []
        for infoTable in info.tables
          table = null
          for id of filter
            item = infoTable.list[id]
            if item?
              unless table?
                table =
                  html: infoTable.html
                  list: {}
                tables.push table
              unless table.list[id]?
                table.list[id] =
                  name: item.name
                  text: item.text
                  examples: item.examples
              if filter[id].length > 0
                table.list[id].examples = []
                for fil in filter[id]
                  table.list[id].examples.push item.examples[fil]
        tables
