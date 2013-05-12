shared = require('../shared')
applet = require('../jsmm-applet')

module.exports = (dares) ->
  class dares.Editor

    constructor: (delegate, ui, options) ->
      @delegate = delegate
      @ui = ui
      @options = shared.dares.sanitizeInput(options, shared.dares.dareOptions)

      @$div = @ui.addTab('editor')
      @$div.addClass 'dare-editor'
      
      $topToolbar = $('<div class="btn-toolbar dare-editor-top-toolbar"></div>')
      @$div.append $topToolbar
      
      $submitGroup = $('<div class="btn-group dare-editor-submit-group"></div>')
      @$saveButton = $("""
        <button class="btn btn-primary dare-editor-submit-group-save">
          <i class="icon icon-white icon-ok"></i> Save
        </button>
      """)
      @$saveButton.on 'click', _(@saveHandler).bind(this)
      $submitGroup.append @$saveButton
      $topToolbar.append $submitGroup
      
      @$saveSpinner = $('<i class="icon icon-white icon-loader dare-editor-top-toolbar-loader hide"></i>')
      $topToolbar.append @$saveSpinner
      @$saveError = $('<i class="icon icon-white icon-exclamation-sign-color dare-editor-top-toolbar-error hide"></i>')
      @$saveError.tooltip
        title: 'Connection error'
        placement: 'bottom'
      $topToolbar.append @$saveError

      $programGroup = $("""
        <div class="btn-group dare-editor-program-group">
          <div class="dare-editor-program-group-arrow"></div>
        </div>
      """)
      @$configProgramButton = $('<button class="btn btn-inverse">Config program</button>')
      @$configProgramButton.tooltip
        title: 'Dare configuration'
        placement: 'bottom'
      @$targetProgramButton = $('<button class="btn btn-inverse">Target program</button>')
      @$targetProgramButton.tooltip
        title: 'Program that is shown as an example'
        placement: 'bottom'
      @$initialProgramButton = $('<button class="btn btn-inverse">Initial program</button>')
      @$initialProgramButton.tooltip
        title: 'Initial value of the editor when opening the dare'
        placement: 'bottom'
      $programGroup.append @$configProgramButton, @$targetProgramButton, @$initialProgramButton
      @$div.append $programGroup

      @$configProgramButton.on 'click', =>
        @selectProgram 'config'
      @$targetProgramButton.on 'click', =>
        @selectProgram 'target'
      @$initialProgramButton.on 'click', =>
        @selectProgram 'initial'

      @$typeGroup = $('<div class="btn-group dare-editor-type-group"></div>')
      @$div.append @$typeGroup
      
      @$inputGroup = $('<div class="dare-editor-input-group"></div>')
      @$inputName = $('<input type="text" class="dare-editor-input-name"></input>')
      @$inputName.on 'keyup change', _(@nameChangeCallback).bind(this)
      @$inputDescription = $('<textarea class="dare-editor-input-description"></textarea>')
      @$inputDescription.on 'keyup change', _(@descriptionChangeCallback).bind(this)
      @$inputPublished = $('<input type="checkbox"></input>')
      @$inputPublished.on 'click change', _(@publishedChangeCallback).bind(this)
      $publishedLabel = $('<label></label>').append(@$inputPublished, ' Published')
      @$inputGroup.append @$inputName, @$inputDescription, $publishedLabel
      @$div.append @$inputGroup
      
      @ui.registerAdditionalObject 'editor', this
      
      @editor = @ui.addEditor(@options.editor)
      @editor.setTextChangeCallback _(@textChangeCallback).bind(this)
      
      @reload()
      @ui.selectTab 'editor'
      @selectProgram 'config'

    remove: ->
      @$div.removeClass 'dare-editor'

    reload: ->
      @ui.removeOutputs()

      if @programType is 'config'
        @ui.loadOutputs config:
          enabled: true
          definition: shared.dares.configDefinition
        @editor.setText @options.configProgram
      else
        config = @ui.loadConfigProgram(shared.dares.configDefinition, @options.configProgram, @options.outputStates)
        
        if config
          config.outputs.robot.readOnly = false
          @ui.loadOutputs config.outputs

          robot = @ui.getOutput('robot')
          if robot
            robot.setStateChangeCallback _(@robotStateChanged).bind(this)
        else
          @ui.loadOutputs {}

        if @programType is 'target'
          @editor.setText @options.original
        else
          @editor.setText @options.editor.text

      @$inputName.val @options.name
      @$inputDescription.val @options.description
      @$inputPublished.attr 'checked', @options.published

    selectProgram: (type) ->
      return if @programType == type
      @programType = type
      @$configProgramButton.toggleClass 'active', type is 'config'
      @$targetProgramButton.toggleClass 'active', type is 'target'
      @$initialProgramButton.toggleClass 'active', type is 'initial'
      @reload()

    textChangeCallback: (text) ->
      if @programType == 'config'
        @options.configProgram = text
      else if @programType == 'target'
        @options.original = text
      else
        @options.editor.text = text

    saveHandler: ->
      @$saveSpinner.removeClass 'hide'
      @$saveError.addClass 'hide'
      @delegate.getSync().updateDare @options, _(@saveSuccessHandler).bind(this), _(@saveErrorHandler).bind(this)

    saveSuccessHandler: ->
      @$saveSpinner.addClass 'hide'
      @$saveError.addClass 'hide'

    saveErrorHandler: ->
      @$saveSpinner.addClass 'hide'
      @$saveError.removeClass 'hide'

    typeButtonClickHandler: (event) ->
      @selectDareType $(event.delegateTarget).data('id')

    robotStateChanged: (state) ->
      @options.outputStates.robot = state

    nameChangeCallback: ->
      @options.name = @$inputName.val()

    descriptionChangeCallback: ->
      @options.description = @$inputDescription.val()

    publishedChangeCallback: ->
      @options.published = @$inputPublished.is(':checked')
