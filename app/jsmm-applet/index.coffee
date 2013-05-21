# load colorPicker lib
require "./colorpicker/jquery.ui.colorPicker"

module.exports.clayer = require("./clayer")
module.exports.editor = require("./editor")
module.exports.info = require("./info")
module.exports.jsmm = require("./jsmm")
module.exports.output = require("./output")
module.exports.robot = require("./robot")

class module.exports.UI

  icons:
    dare: "icon-file"
    console: "icon-list-alt"
    canvas: "icon-picture"
    robot: "icon-th"
    info: "icon-info-sign"
    home: "icon-home"
    editor: "icon-pencil"
    config: "icon-wrench"

  paneOutputs: ["robot", "console", "canvas", "info", "config"]
  
  constructors:
    robot: module.exports.output.Robot
    console: module.exports.output.Console
    canvas: module.exports.output.Canvas
    info: module.exports.info.Info
    events: module.exports.output.Events
    math: module.exports.output.Math
    config: module.exports.output.ConfigOutput

  constructor: ($main, globalOptions) ->
    unless $main? # use modal mode
      @$modal = $("<div class=\"ui-modal\"></div>")
      $("body").append @$modal
      
      @$main = $("<div class=\"ui-modal-ui\"></div>")
      @$modal.append @$main
      
      @$close = $("<a href=\"#\" class=\"ui-close\">&times;</a>")
      @$main.append @$close
      @$close.on "click", _(@closeHandler).bind(this)
    else
      @$modal = null
      @$main = $main

    @globalOptions = globalOptions or {}
    
    @$main.addClass "ui-main"
    
    @$background = $("<div class=\"ui-background\"></div>")
    @$main.append @$background
    
    @$arrow = $("<div class=\"arrow\"><div class=\"arrow-head\"></div><div class=\"arrow-body\"></div></div>")
    @$main.append @$arrow
    
    @$output = $("<div class=\"ui-output tabbable\"></div>")
    @$main.append @$output
    
    @$tabs = $("<ul class=\"nav nav-tabs\"></ul>")
    @$output.append @$tabs
    @$tabs.toggle not @globalOptions.hideTabs
    
    @$content = $("<div class=\"tab-content\">")
    @$output.append @$content
    
    @$editor = $("<div class=\"ui-editor\"></div>")
    @$toolbar = $("<div class=\"ui-toolbar\"></div>")
    @$stepbar = $("<div class=\"ui-stepbar\"></div>")
    @$main.append @$editor
    @$main.append @$toolbar
    @$main.append @$stepbar
    
    @outputs = {}
    @additionalObjects = {}
    @editor = null
    @closeCallback = null
    @removeAll()

  remove: ->
    @removeAll()
    @$main.removeClass "ui-main"
    @$background.remove()
    @$output.remove()
    @$editor.remove()
    @$toolbar.remove()
    @$stepbar.remove()
    @$arrow.remove()
    if @$modal?
      @$close.remove()
      @$modal.remove()

  removeOutputs: ->
    for name of @outputs
      @outputs[name].remove()
      if @tabsByName[name]
        @tabsByName[name].$tab.remove()
        @tabsByName[name].$pane.remove()
        @tabsByName[name] = `undefined`
        @numTabs--
    @outputs = {}
    @scope = {}

  removeAll: ->
    @removeOutputs()
    for name of @additionalObjects
      @additionalObjects[name].remove()
    @editor.remove() if @editor?
    @$tabs.children("li").remove()
    @$content.children("div").remove()
    @additionalObjects = {}
    @tabsByName = {}
    @numTabs = 0

  loadConfigProgram: (definition, program, states) ->
    config = new module.exports.output.Config definition
    runner = new module.exports.jsmm.SimpleRunner config.getScopeObjects(), maxWidth: Infinity
    runner.run program

    if runner.hasError()
      console.error runner.getError()
    else
      @mixinStates config.getConfig(), states

  mixinStates: (config, states) ->
    for name of states
      config.outputs[name].state = states[name]
    config

  loadOutputs: (outputs) ->
    for name of outputs
      if outputs[name].enabled
        outputs[name].prepareTextElement = _(@prepareTextElement).bind(this)
        
        if @paneOutputs.indexOf(name) >= 0
          output = new @constructors[name] @editor, outputs[name], @addTab(name)
        else
          output = new @constructors[name] @editor, outputs[name]
        
        @outputs[name] = output
        @addToScope output.getScopeObjects()

        if name == "events"
          @scope.document = output.getAugmentedDocumentObject()
          @scope.window = output.getAugmentedWindowObject()
          
          mouseObjects = outputs[name].mouseObjects || []
          for outputName in mouseObjects
            output.addMouseEvents @outputs[outputName].getMouseElement(), outputName, @scope[outputName]

    @editor.updateSettings new module.exports.jsmm.Runner(@editor, @scope), @outputs

  addToScope: (objects) ->
    for name of objects
      @scope[name] = objects[name]

  registerAdditionalObject: (name, obj) ->
    @additionalObjects[name] = obj

  addTab: (name) ->
    $tab = $("<li></li>")
    setTimeout (-> $tab.addClass "tab-button-enabled"), 200 * @numTabs + 300
    @$tabs.append $tab

    $link = $("<a href=\"#\"><i class=\"icon icon-white " + @icons[name] + "\"></i> " + name + "</a>")
    $tab.append $link
    
    $link.click (event) =>
      event.preventDefault()
      @selectTab name

    $pane = $("<div class=\"tab-pane\"></div>")
    @$content.append $pane

    $output = $("<div class=\"tab-output\"></div>")
    $pane.append $output

    @numTabs++
    @tabsByName[name] = {$pane, $tab}
    $output

  addEditor: (options) ->
    @editor = new module.exports.editor.Editor(options, module.exports.jsmm, @$editor, @$toolbar, @$stepbar)
    @editor

  selectTab: (name) ->
    @$content.children(".active").removeClass "active"
    @$tabs.children("ul li.active").removeClass "active"
    @tabsByName[name].$pane.addClass "active"
    @tabsByName[name].$tab.addClass "active"
    @outputs[name]?.setFocus?()
    @outputs[@currentTab]?.unsetFocus?()
    @currentTab = name

  getOutput: (name) ->
    @outputs[name]

  loadDefault: ->
    @load
      editor: {}
      outputs:
        robot: {}
        console: {}
        canvas: {}
        info: {}
        input: {mouseObjects: ["canvas"]}
        Math: {}


  setCloseCallback: (callback) ->
    @closeCallback = callback

  openModal: ->
    @$modal.addClass "ui-modal-active"
    $main = @$main
    setTimeout (-> $main.addClass "ui-modal-ui-active"), 0
    $("body").addClass "modal-open" # for Bootstrap specific fixes

  closeModal: ->
    @removeAll()
    @$modal.removeClass "ui-modal-active"
    @$main.removeClass "ui-modal-ui-active"
    $("body").removeClass "modal-open"

  
  ## INTERNAL FUNCTIONS ##
  arrowPositions: # dir, left, top
    "arrow-step": ["arrow-down", 655, 585]
    "arrow-highlighting": ["arrow-up", 751, 40]
    "arrow-manipulation": ["arrow-up", 785, 40]
    "arrow-close": ["arrow-up", 1066, 3]

  prepareTextElement: ($el) ->
    $links = $el.find("a[href^=\"#arrow\"]")
    $links.on "mouseenter", =>
      this.showArrow $(this).attr("href").substring(1)

    $links.on "mouseleave", =>
      this.hideArrow()

    $links.on "click", (e) =>
      $(this).trigger "mouseenter"
      this.animateArrow()
      e.preventDefault()

    $links.addClass "arrow-link"

  showArrow: (str) ->
    pos = @arrowPositions[str]

    unless pos?
      if str.indexOf("arrow-tab-") == 0
        $tab = @tabsByName[str.substring("arrow-tab-".length)].$tab
        pos = ["arrow-left", $tab.position().left + $tab.width() + 5, 29]
      else
        pos = str.split(",")

    @$arrow.addClass "arrow-active"
    @$arrow.removeClass "arrow-left arrow-right arrow-up arrow-down arrow-animate"
    @$arrow.addClass pos[0]
    @$arrow.css "left", pos[1] + "px"
    @$arrow.css "top", pos[2] + "px"

  animateArrow: ->
    $arrow = @$arrow
    $arrow.removeClass "arrow-animate"
    window.setTimeout (-> $arrow.addClass "arrow-animate"), 0

  hideArrow: ->
    @$arrow.removeClass "arrow-active"

  closeHandler: (event) ->
    event.preventDefault()
    @closeModal()
    @closeCallback?()
