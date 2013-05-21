clayer = require('../clayer')

module.exports = (editor) ->

  editor.editables = {}

  class BaseEditable

    constructor: (node, surface, delegate, parseValue, makeValue) ->
      @surface = surface
      @delegate = delegate
      @parseValue = parseValue
      @makeValue = makeValue

      @loc =
        line: node.lineLoc.line
        line2: node.lineLoc.line + 1
        column: node.lineLoc.column
        column2: node.lineLoc.column2

      @text = delegate.getEditablesText(node)
      @finalText = @text
      @valid = @parseValue(@text)

      @$marking = $('<div class="editor-marking editor-editable editor-' + @type + '-editable"></div>')
      @surface.addElement @$marking
      @init()
      
      @updateMarking()

    offsetColumn: (column, amount) ->
      if @loc.column2 > column
        @loc.column2 += amount
        if @loc.column > column
          @loc.column += amount
        @updateMarking()

    show: ->
      @$marking.addClass 'editor-editable-show'

    hide: ->
      @$marking.removeClass 'editor-editable-show'

    ## INTERNAL FUNCTIONS ##
    updateMarking: ->
      @remove() unless @valid
      @$marking.css @surface.makeElementLocationRange(@loc)

    updateValue: ->
      @delegate.editableReplaceCode @loc.line, @loc.column, @loc.column2, @text


  class editor.editables.CycleEditable extends BaseEditable

    type: 'cycle'

    init: ->
      @$marking.on 'click', _(@cycle).bind(this)

    remove: ->
      @$marking.remove()

    cycle: ->
      @text = @makeValue()
      @updateValue()
      @valid = @parseValue(@text)


  class editor.editables.NumberEditable extends BaseEditable

    type: 'number'

    init: ->
      @$body = $('body')
      @hasTooltip = false
      @touchable = new clayer.Touchable(@$marking, this)

    remove: ->
      @hideTooltip()
      @$marking.remove()
      @touchable.setTouchable false
    
    ## INTERNAL FUNCTIONS ##
    showTooltip: ->
      unless @hasTooltip
        @hasTooltip = true
        @$marking.tooltip
          title: '&larr; drag &rarr;'
          placement: 'bottom'

      @$marking.tooltip 'show'

    hideTooltip: ->
      @$marking.tooltip 'hide' if @hasTooltip

    touchDown: (touch) ->
      @$marking.addClass 'active'
      @$body.addClass 'editor-number-editable-dragging'
      @surface.getTextArea().addClass 'editor-number-editable-dragging'
      @hideTooltip()

    touchMove: (touch) ->
      @text = @makeValue(touch.translation.x)
      @updateValue()

    touchUp: (touch) ->
      @$marking.removeClass 'active'
      @$body.removeClass 'editor-number-editable-dragging'
      @surface.getTextArea().removeClass 'editor-number-editable-dragging'
      @valid = @parseValue(@text)
      @showTooltip() if touch.wasTap


  class editor.editables.ColorEditable extends BaseEditable
    
    type: 'color'

    init: ->
      @$colorPicker = $('<div class="editor-editable-colorpicker"></div>')
      @box = new editor.Box()
      @surface.addElementToTop @box.getElement()
      @box.html @$colorPicker, @surface.makeElementLocationRange(@loc)
      @$colorPicker.colorPicker
        format: @colorData.format
        size: 200
        colorChange: _(@colorChange).bind(this)

      @$colorPicker.colorPicker 'setColor', @colorData.value
      @$marking.on 'click', _(@click).bind(this)
    
    ## INTERNAL FUNCTIONS ##
    remove: ->
      @$marking.remove()
      @box.remove()

    colorChange: (event, ui) ->
      @text = @makeValue(ui.color)
      @updateValue()

    click: (event) ->
      @valid = @parseValue(@text)
      if @box.$element.is(':visible')
        @$marking.removeClass 'active'
        @box.$element.fadeOut 150
      else
        @$marking.addClass 'active'
        @box.$element.fadeIn 150
        @box.updatePosition @surface.makeElementLocationRange(@loc)
