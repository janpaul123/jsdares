applet = require('../jsmm-applet')

module.exports = (dares) ->

  class dares.AnimatedCanvas

    constructor: ->
      @calls = []
      @position = 0
      @timeout = null

    remove: ->
      @clearTimeout()

    run: (code) ->
      simpleCanvas = new applet.output.SimpleCanvas
      runner = new applet.jsmm.SimpleRunner canvas: simpleCanvas.getAugmentedObject()
      runner.run code
      @calls = @calls.concat simpleCanvas.getCalls()

    play: (context, delay) ->
      @clearTimeout()
      @context = context
      @delay = delay
      @position = 0
      @animateNext()

    ## INTERNAL FUNCTIONS ##
    clearTimeout: ->
      if @timeout?
        clearTimeout @timeout
        @timeout = null

    animateNext: ->
      @clearTimeout()
      while @position < @calls.length
        call = @calls[@position++]
        if call.value?
          @context[call.name] = call.value
        else
          @context[call.name].apply @context, call.args
        
        if @delay > 0 && call.draws
          @timeout = setTimeout (=> @animateNext()), @delay
          return


  class dares.ImageMatchDare
    dares.addCommonDareMethods @prototype

    constructor: (delegate, ui, options) ->
      @initOptions delegate, ui, options
      @previewAnim = null
      
      @$div.addClass 'dare dare-imagematch'
      @canvas = @ui.getOutput('canvas')
      @size = @canvas.getSize()
      
      @$originalCanvasContainer = $("""
        <div class="dare-imagematch-original-container">
          <div class="dare-original-refresh">
            <i class="icon icon-repeat icon-white"></i>
          </div>
        </div>
      """)
      @$originalCanvasContainer.on 'click', _(@animateImage).bind(this)
      @$div.append @$originalCanvasContainer
      @$originalCanvas = $("""<canvas class="dare-imagematch-original-canvas" width="#{@size}" height="#{@size}"></canvas>""")
      @$originalCanvasContainer.append @$originalCanvas
      @originalContext = @$originalCanvas[0].getContext('2d')
      
      @$resultCanvas = $("""<canvas class="dare-imagematch-result" width="#{@size}" height="#{@size}"></canvas>""")
      @$div.append @$resultCanvas
      @resultContext = @$resultCanvas[0].getContext('2d')
      
      if @dareOptions.hidePreview
        @$originalCanvasContainer.hide()
      
      @originalAnim = new dares.AnimatedCanvas
      @originalAnim.run @options.original
      @drawImage 0
      @imageData = @originalContext.getImageData(0, 0, @size, @size)
      
      targetContext = @canvas.makeTargetCanvas()
      @originalAnim.play targetContext, 0
      
      @appendDescription @$div
      
      @initPoints()
      @matchPoints = new dares.MatchPoints @$points, @dareOptions.ImageMatch.minPercentage, 'canvas'
      @initEditor()
      @animateImage()

    remove: ->
      @animationFinish()
      @$submit.remove()
      @$originalCanvasContainer.remove()

    initOutputs: (outputs) ->
      outputs.canvas.enabled = true
      outputs

    animateImage: ->
      @animationFinish()
      @drawImage @dareOptions.ImageMatch.speed

    drawImage: (speed) ->
      @originalContext.clearRect 0, 0, @size, @size
      @originalAnim.play @originalContext, speed

    submit: ->
      @animationFinish()
      
      userImageData = @canvas.getImageData()
      resultImageData = @resultContext.createImageData(@size, @size)
      @pointsPerLine = []
      
      i = matching = @percentage = 0
      total = @size * @size

      for y in [0...@size]
        for x in [0...@size]
          dr = userImageData.data[i] - @imageData.data[i++]
          dg = userImageData.data[i] - @imageData.data[i++]
          db = userImageData.data[i] - @imageData.data[i++]
          da = userImageData.data[i] - @imageData.data[i++]
          distance = dr * dr + dg * dg + db * db + da * da
          
          resultImageData.data[i - 1] = 140 # alpha
          if distance < 20
            matching++
            resultImageData.data[i - 3] = 255 # green
          else
            resultImageData.data[i - 4] = 255 # red

        @percentage = Math.floor(100 * matching / total)
        @pointsPerLine.push @percentage

      @resultContext.clearRect 0, 0, @size, @size
      @resultContext.putImageData resultImageData, 0, 0
      
      @animation = new dares.SegmentedAnimation()
      @animation.addSegment 1, 500, _(@animationMatchingStartCallback).bind(this)
      @animation.addSegment Math.ceil(@size / 10), 50, _(@animationMatchingCallback).bind(this)
      @animation.addRemoveSegment 500, _(@animationMatchingFinishCallback).bind(this)
      @addToAnimation @percentage, @percentage >= @dareOptions.ImageMatch.minPercentage
      @animation.play()

    animationMatchingStartCallback: ->
      @drawImage 0

    animationMatchingCallback: (y) ->
      height = 10
      height = @size - y * 10  if y * 10 + 10 > @size # to correct when this.size is no multiple of 10
      @matchPoints.setValue @pointsPerLine[Math.min(y * 10 + 9, @size - 1)]
      @originalContext.drawImage @$resultCanvas[0], 0, y * 10, @size, height, 0, y * 10, @size, height

    animationMatchingFinishCallback: ->
      @matchPoints.setValue @percentage
      @matchPoints.endAnimation()
