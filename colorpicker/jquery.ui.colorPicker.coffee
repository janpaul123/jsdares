# jQuery UI Color Picker Widget
#
# Copyright 2012, Olav Andreas Lindekleiv (http://lindekleiv.com/)
# Available under the BSD License
# See the LICENSE file or http://opensource.org/licenses/BSD-3-Clause
#
# Available on BitBucket at
# https://bitbucket.org/lindekleiv/jquery-ui-colorpicker

$.widget 'oal.colorPicker',
  options:
    size: 250,
    format: 'hsla'

  _create: ->
    @lightness = 0.0    # Goes from -0.5 to 0.5
    @alpha = 1.0        # Goes from 0.0 to 1.0
    @fromCenter = 0.0   # Goes from 0 to @options.size/2
    @pickerPos = [0, 0] # X and Y coordinates for the picker.

    #
    @parent = $('<div class="colorpicker"></div>')
    @parent.css
      width: @options.size+36

    @element.addClass 'colorInput'
    @element.css
      width: @options.size+36
    @element.wrap @parent

    # Canvas color wheel:
    @canvasId = "colorpicker#{parseInt(Math.random()*9999)}"
    @wheel = $("<canvas id='#{@canvasId}' width='#{@options.size}' height='#{@options.size}'></canvas>")
    @element.before @wheel
    @_draw()

    # Add lightness mask
    lightness = $('<div class="circle lightness"></div>').css
      width: @options.size
      height: @options.size
    @element.before lightness

    # Add alpha mask
    alpha = $('<div class="circle alpha"></div>').css
      width: @options.size
      height: @options.size
    @element.before alpha

    @lightnessSlider = $('<div class="lightness slider"><span class="handle"></span></div>').css
      height: @options.size
    @element.before @lightnessSlider

    @lightnessSlider.find('span.handle').draggable
      containment: 'parent'
      drag: (e, ui) =>
        @_setLightness(ui.position.top, yes)

    @alphaSlider = $('<div class="alpha slider"><span class="handle"></span></div>').css
      height: @options.size
    @element.before @alphaSlider

    @alphaSlider.find('span.handle').draggable
      containment: 'parent'
      drag: (e, ui) =>
        @_setAlpha(ui.position.top, yes)

    # Picker handle
    @picker = $('<span class="picker"></span>').css
      top: (@options.size/2)
      left: (@options.size/2)
    @element.before @picker

    @picker.draggable
      drag: (e, ui) =>
        x = ui.position.left-@options.size/2
        y = ui.position.top-@options.size/2

        @_setHue x, y, yes


    @element.on 'change', =>
      color = @element.val()

      # Format: hsla(180, 50%, 50%, 1.0)
      if color.indexOf('hsla(') == 0
        pattern = /^hsla\((\d+),\s+(\d+(?:.\d+)?)%,\s+(\d+(?:.\d+)?)%,\s+(\d+(?:.\d+)?)\)$/
        [hsla, h, s, l, a] = pattern.exec(color)
        @setColor(h, s, l, a)

      # Format: hsl(180, 50%, 50%)
      else if color.indexOf('hsl(') == 0
        pattern = /^hsl\((\d+),\s+(\d+(?:.\d+)?)%,\s+(\d+(?:.\d+)?)%\)$/
        [hsla, h, s, l] = pattern.exec(color)
        @setColor(h, s, l)

      # Format: rgba(100, 100, 100, 1.0)
      else if color.indexOf('rgba(') == 0
        pattern = /^rgba\((\d{1,3}),[ ]?(\d{1,3}),[ ]?(\d{1,3}),[ ]?(\d?.\d{1,2})\)$/
        [rgba, r, g, b, a] = pattern.exec(color)
        [h, s, l, a] = @_toHsla(r, g, b, a)
        @setColor(h, s, l, a)

      # Format: rgb(100, 100, 100)
      else if color.indexOf('rgb(') == 0
        pattern = /^rgb\((\d{1,3}),[ ]?(\d{1,3}),[ ]?(\d{1,3})\)$/
        [rgb, r, g, b] = pattern.exec(color)
        [h, s, l, a] = @_toHsla(r, g, b)
        @setColor(h, s, l, a)

      # Format: #aaa
      else if color.indexOf('#') == 0 and color.length == 4
        r = parseInt(color[1]+color[1], 16)
        g = parseInt(color[2]+color[2], 16)
        b = parseInt(color[3]+color[3], 16)
        [h, s, l, a] = @_toHsla(r, g, b)
        @setColor(h, s, l, a)

      # Format: #aaaaaa
      else if color.indexOf('#') == 0 and color.length == 7
        r = parseInt(color[1]+color[2], 16)
        g = parseInt(color[3]+color[4], 16)
        b = parseInt(color[5]+color[6], 16)
        [h, s, l, a] = @_toHsla(r, g, b)
        @setColor(h, s, l, a)

    # Enable clicking in the color wheel to pick a color.
    # We do this on "alpha" because it's the top most layer of the picker wheel.
    alpha.on 'click', (e) =>
      offset = $(e.target).offset()
      x = e.clientX-offset.left-(@options.size/2)
      y = e.clientY-offset.top-(@options.size/2)
      @_setHue x, y
      @_update()

    @lightnessSlider.on 'click', (e) =>
      offset = $(e.target).offset()
      lightness = Math.abs(1-(e.clientY-offset.top)/@options.size)*100
      @_setLightness lightness, no
      @_update()

    @alphaSlider.on 'click', (e) =>
      offset = $(e.target).offset()
      alpha = Math.abs(1-(e.clientY-offset.top)/@options.size)
      @_setAlpha alpha, no
      @_update()

  _draw: ->
    canvas = document.getElementById @canvasId
    c = canvas.getContext '2d'

    # These will give a good result in most cases:
    size = @options.size
    half = size/2
    max = size*1.25

    # Draw lines from the center, around the circle
    for i in [0..max]
      c.save()
      color = i/max
      c.strokeStyle = "hsl(#{color*360},100%,50%)"
      c.translate(half, half)
      c.rotate(Math.PI*2*i/max)

      c.beginPath()
      c.lineWidth = 3
      c.moveTo(0, 0)
      c.lineTo(0, half)
      c.stroke()
      c.restore()

    # Gray gradient from the center of the circle:
    radialGradient = c.createRadialGradient(half,half,0,half, half, half);
    radialGradient.addColorStop(0, 'hsl(0, 0%, 50%)')
    radialGradient.addColorStop(1, 'hsla(0, 0%, 50%, 0)')
    c.fillStyle = radialGradient
    c.fillRect(0,0, @options.size, @options.size)


  # These will set values and update positions:
  _setHue: (x, y, pos=no) ->
    # Hue is saved from 0 to 360 (degrees).
    @fromCenter = Math.sqrt(x*x+y*y)
    @pickerPos = [x, y]

    if pos
      # Stop the picker from going outside the color wheel:
      @_update()
      return false if @fromCenter >= @options.size/2
    else
      @picker.css
        top: y+@options.size/2
        left: x+@options.size/2

  _setLightness: (l, pos=no) ->
    # Lightness is saved from -0.5 (white) to 0.5 (black).
    if pos
      @lightness = (l/@options.size)-0.5
      @_update()
    else
      # Expect lightness from 0 to 100:
      @lightness = 0.5-(l/100)

      # Set the slider position:
      @lightnessSlider.find('span.handle').css
        top: (@lightness+0.5)*@options.size

    if @lightness < 0
      color = "rgba(255,255,255,#{Math.abs(@lightness*2)})"
    else
      color = "rgba(0,0,0,#{@lightness*2})"
    @wheel.next().css
      backgroundColor: color

  _setAlpha: (a, pos=no) ->
    # Alpha is saved from 0.0 (fully transparent) to 1.0
    if pos
      @alpha = Math.abs 1-a/@options.size
      @_update()
    else
      # Expect alpha from 0.0 to 1.0:
      @alpha = a

      # Update slider position:
      @alphaSlider.find('span.handle').css
        top: Math.abs(1-@alpha)*@options.size

    @wheel.next().next().css
      opacity: Math.abs 1-@alpha

  _generateColor: ->
    h = parseInt 180-(Math.atan2(@pickerPos[0], @pickerPos[1])+Math.PI)/(Math.PI*2)*360
    h += 360 if h < 0
    s = @fromCenter/@options.size*100*2
    l = Math.abs(@lightness-0.5)*100
    a = @alpha

    # Limit to max values:
    h = 360 if h > 360
    s = 100 if s > 100
    l = 100 if l > 100
    a = 1.0 if a > 1.0

    # Round to two decimals
    s = Math.round(s*100)/100
    l = Math.round(l*100)/100
    a = Math.round(a*100)/100

    [h, s, l, a]

  _update: ->
    [h, s, l, a] = @_generateColor()

    switch @options.format
      when 'hsla'
        colorString = "hsla(#{h}, #{s}%, #{l}%, #{a})"
      when 'hsl'
        colorString = "hsl(#{h}, #{s}%, #{l}%)"
      when 'rgba'
        [r, g, b, a] = @_toRgba(h, s, l, a)
        colorString = "rgba(#{r}, #{g}, #{b}, #{a})"
      when 'rgb'
        [r, g, b, a] = @_toRgba(h, s, l)
        colorString = "rgb(#{r}, #{g}, #{b})"
      when 'hex'
        [r, g, b, a] = @_toRgba(h, s, l)
        rs = r.toString(16)
        gs = g.toString(16)
        bs = b.toString(16)
        rs = '0'+rs if rs.length == 1
        gs = '0'+gs if gs.length == 1
        bs = '0'+bs if bs.length == 1
        colorString = "##{rs}#{gs}#{bs}"
      else
        console.error 'Color format not supported!'

    @element.val colorString

    @picker.css
      background: colorString

    if @options.format in ['hsl', 'hsla']
      response =
        hue: h
        saturation: s
        lightness: l
    else
      response =
        red: r
        green: g
        blue: b

    if 'a' in @options.format
      response.alpha = a

    response.color = colorString

    @_trigger 'colorChange', null, response

  _toRgba: (h, s, l, a=1.0) ->
    # Based on js code by Michael Jackson (http://mjijackson.com/)
    h = h/360
    s = s/100
    l = l/100

    if s == 0.0
      r = l
      g = l
      b = l
    else
      hue2rgb = (p, q, t) ->
        if t < 0
          t += 1
        if t > 1
          t -= 1
        if t < 1/6
          return p+(q-p)*6*t
        if t < 1/2
          return q
        if t < 2/3
          return p+(q-p)*(2/3-t)*6
        return p


      if l < 0.5
        q = l*(1+s)
      else
        q = l+s-l*s

      p = 2*l-q
      r = hue2rgb(p, q, h+1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h-1/3)

    [
      parseInt(r*255),
      parseInt(g*255),
      parseInt(b*255),
      a,
    ]

  _toHsla: (r, g, b, a=1.0) ->
    r /= 255
    g /= 255
    b /= 255
    max = Math.max(r, g, b)
    min = Math.min(r, g, b)
    h = (max+min)/2;
    s = h
    l = h

    if max == min
      h = 0
      s = 0
    else
      d = max-min
      if l > 0.5
        s = d/(2-max-min)
      else
        s = d/(max + min)

      switch max
        when r
          if g < b
            add = 6
          else
            add = 0
          h = (g-b)/d+add
        when g
          h = (b-r)/d+2
        when b
          h = (r-g)/d+4

      h /= 6

    [parseInt(h*360), Math.round(s*1000)/10, Math.round(l*1000)/10, a]


  setColor: (h, s, l, a=1.0) ->
    if typeof(h) == 'string' and (h.indexOf('hsl') == 0 or h.indexOf('rgb') == 0 or h.indexOf('#') == 0)
      @element.val h
      @element.trigger 'change'
      return true

    h = parseInt h
    h += 90 # This is needed to get the 0 degrees point pointing down.
    h %= 360 if h > 360 # If we get a value more than 360 degrees, modulo it.
    if h > 0
      # Find picker distance from center of the color wheel:
      dist = s/100*(@options.size/2)
      x = Math.cos(h/360*(Math.PI*2))*dist
      y = Math.sin(h/360*(Math.PI*2))*dist

      @_setHue(x, y)

    # Make sure we have a valid saturation value:
    if s >= 0 and s <= 100
      @saturation = s
    else if s > 100
      @saturation = 100
    else
      @saturation = 0

    # Make sure we have a valid lightness value:
    if l > 100
      l = 100
    else if l < 0
      l = 0
    @_setLightness l

    # Make sure we have a valid alpha value:
    if a > 1.0
      a = 1.0
    else if a < 0.0
      a = 0.0
    @_setAlpha(a)

    @_update()

  _setOption: (key, value) ->
    if key == 'format' and value in ['hsla', 'hsl', 'rgba', 'rgb', 'hex']
      @options.format = value
      @_update()

    $.Widget::_setOption.apply(@, arguments)