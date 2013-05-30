module.exports = (jsmm) ->

  jsmm.editor = {}
  
  # expected text format: someObject.someProperty.startOfAFunction
  jsmm.editor.autocompletion =
    getExamples: (scope, text) ->
      split = text.split('.')
      obj = scope.find(split[0])
      split.shift() # Remove split[0]

      return null unless obj? && typeof obj.value == 'object' && obj.value.properties?
      
      obj = obj.value
      for part in split
        obj = obj.properties[part]
        return null unless typeof obj == 'object' && obj.properties?
      
      examples = []
      start = split[split.length - 1].toLowerCase()
      for name of obj.properties
        if typeof obj.properties[name] == 'object' && obj.properties[name].example?
          example = obj.properties[name].example
        else
          example = name

        if start.length == 0 || example.substring(0, start.length).toLowerCase() == start
          # split into name part and '= 123' or '(100, 150)' part
          splitExample = example.split(/( \=.*|\(.*)/)
          if splitExample[1]? and splitExample[1].length > 0
            splitExample[1] += ';'
          else
            splitExample[1] = ''

          examples.push splitExample

      examples: examples
      width: start.length
      prefix: text.substring(0, text.length - start.length)

  jsmm.editor.editables =
    generate: (tree, editorEditables, surface, editor) ->
      editables = []
      booleanNodes = tree.getNodesByType('BooleanLiteral')
      if booleanNodes?
        for node in booleanNodes
          editables.push new editorEditables.CycleEditable(node, surface, editor, @parseBoolean, @makeBoolean)
      
      numberNodes = tree.getNodesByType('NumberLiteral')
      if numberNodes?
        for node in numberNodes
          if node.parent.type is 'UnaryExpression'
            node = node.parent
          editables.push new editorEditables.NumberEditable(node, surface, editor, @parseNumber, @makeNumber)
      
      stringNodes = tree.getNodesByType('StringLiteral')
      if stringNodes?
        for node in stringNodes
          str = node.str
          if jsmm.editor.editables.splitColor('"' + str + '"')?
            editables.push new editorEditables.ColorEditable(node, surface, editor, @parseColor, @makeColor) 
      
      editables

    parseBoolean: (text) ->
      @value = (text == 'true')
      text == 'true' || text == 'false'

    makeBoolean: ->
      if @value then 'false' else 'true'

    splitNumber: (text) ->
      match = /^[+]?([\-]?)[ ]*([0-9]+)(?:[.]([0-9]+))?(?:([eE])[+]?([\-]?[0-9]+))?$/g.exec(text)
      return null unless match?

      sign: match[1] # either '-' or undefined ('+' is dropped)
      integer: match[2] # integer part, cannot be undefined (if the number is valid)
      decimals: match[3] # decimal part without '.', or undefined
      exponentLetter: match[4] # either 'e', 'E', or undefined
      exponent: match[5] # the exponent part without the letter, but with an optional '-' (again not '+'), or undefined

    parseNumber: (text) ->
      @numberData = {}
      
      # remove spaces since it is possible to have e.g. '-  5'
      @numberData.value = parseFloat(text.replace(/[ ]+/g, ''))
      split = jsmm.editor.editables.splitNumber(text)
      
      return false unless split? && isFinite(@numberData.value)
      
      # if an exponent is defined, use the capitalisation already used in the value
      @numberData.exponentLetter = split.exponentLetter || 'e'
      
      # calculate the delta for each offset pixel based on the number of decimals in the original number (and of course exponent)
      # the delta is inverted as this seems to reduce the number of rounding errors (e.g. 0.57 !== 57*0.01, but 0.57 === 57/100)
      @numberData.invDelta = Math.pow(10, -(parseInt(split.exponent || '0', 10) - (split.decimals || '').length))
      
      # determine the number of significant digits by trimming leading zeros
      significant = (split.integer + (split.decimals || '')).replace(/^0*/, '').length
      
      # when zero, the number of significant digits is the number of decimals plus one
      if @numberData.value == 0 and split.decimals?
        significant = split.decimals.length + 1 
      
      # clamp the number
      if significant > 8
        significant = 8
      else if significant < 1
        significant = 1 
      
      # the final number of decimals has to be based on the .toPrecision value with the calculated number of significant digits,
      # as this will be used when generating the number, and this function may alter the format of the number (e.g. different
      # number of digits and exponent, etc.)
      @numberData.decimals = (jsmm.editor.editables.splitNumber(@numberData.value.toPrecision(significant)).decimals || '').length
      true

    makeNumber: (offset) ->
      # calculate new number with 8 significant digits and split it
      # for calculating the new number the function x^3/(x^2+200), which provides nice snapping to the original number and
      # lower sensitiveness near the original number
      split = jsmm.editor.editables.splitNumber((@numberData.value + (offset * offset * offset) / ((offset * offset + 200) * @numberData.invDelta)).toPrecision(8))
      
      # start off with the integer part
      newText = split.integer
      
      # if we want any decimals, take all the decimals we get with 8 significant digits, and cap this off by the required amount
      if @numberData.decimals > 0
        newText += '.' + (split.decimals || '0').substring(0, @numberData.decimals)
      
      # add the exponent using the user-defined letter, if necessary
      if split.exponent?
        newText += @numberData.exponentLetter + split.exponent
      
      # finally add the negative sign if required, and if the rest of the number we have so far does not evaluate to zero
      if split.sign == '-' && parseFloat(newText) != 0
        newText = '-' + newText 

      newText

    splitColor: (text) ->
      match = /^[']([#][0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)|(?:(rgb|rgba|hsl|hsla)[(][ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*,[ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*,[ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*(?:,[ ]*(\d+(?:[.]\d+)?)[ ]*)?[)])[']$/g.exec(text)
      return null unless match?

      hex: match[1] # either '#xxx' or '#xxxxxx'
      format: match[2] # either 'rgb', 'rgba', 'hsl', 'hsla', or undefined
      part1: match[3] # number
      percent1: match[4] # either '' or '%'
      part2: match[5] # number
      percent2: match[6] # either '' or '%'
      part3: match[7] # number
      percent3: match[8] # either '' or '%'
      alpha: match[9] # alpha part or undefined

    parseColor: (text) ->
      @colorData = {}
      split = jsmm.editor.editables.splitColor(text)
      return false unless split?

      if split.hex?
        @colorData.value = split.hex
        @colorData.format = 'hex'
        true
      else
        if split.format == 'rgb' || split.format == 'rgba'
          r = parseFloat(split.part1)
          g = parseFloat(split.part2)
          b = parseFloat(split.part3)
          a = parseFloat(split.alpha || '1')

          r = r * 255 / 100 if split.percent1 == '%'
          g = g * 255 / 100 if split.percent2 == '%'
          b = b * 255 / 100 if split.percent3 == '%'

          return false if r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1

          @colorData.value = 'rgba(' + r.toFixed(0) + ', ' + g.toFixed(0) + ', ' + b.toFixed(0) + ', ' + a.toFixed(2) + ')'
          @colorData.format = 'rgba'
          true
        else if split.format == 'hsl' || split.format == 'hsla'
          h = parseInt(split.part1, 10)
          s = parseInt(split.part2, 10)
          l = parseInt(split.part3, 10)
          a = parseFloat(split.alpha || '1')

          return false if h < 0 || h > 360 || split.percent1 == '%' || s < 0 || s > 100 || split.percent2 != '%' || l < 0 || l > 100 || split.percent3 != '%' || a < 0 || a > 1
          
          @colorData.value = 'hsla(' + h.toFixed(0) + ', ' + s.toFixed(2) + '%, ' + l.toFixed(2) + '%, ' + a.toFixed(2) + ')'
          @colorData.format = 'hsla'
          true
        else
          false

    makeColor: (color) ->
      '"' + color + '"'

  jsmm.editor.timeHighlights =
    getTimeHighlights: (tree) ->
      nodes = tree.getNodesByType('FunctionDeclaration')
      result = {}
      for node in nodes
        result[node.name] = node.blockLoc
      result
