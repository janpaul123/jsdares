#jshint node:true
"use strict"
module.exports = (jsmm) ->
  jsmm.editor = {}
  
  # expected text format: someObject.someProperty.startOfAFunction
  jsmm.editor.autocompletion = getExamples: (scope, text) ->
    split = text.split(".")
    obj = scope.find(split[0])
    return null  if obj is `undefined` or typeof obj.value isnt "object" or obj.value.properties is `undefined`
    obj = obj.value
    i = 1

    while i < split.length - 1
      obj = obj.properties[split[i]]
      return null  if typeof obj isnt "object" or obj.properties is `undefined`
      i++
    examples = []
    start = split[split.length - 1].toLowerCase()
    for name of obj.properties
      example = undefined
      if typeof obj.properties[name] is "object" and obj.properties[name].example isnt `undefined`
        example = obj.properties[name].example
      else
        example = name
      if start.length is 0 or example.substring(0, start.length).toLowerCase() is start
        
        # split into name part and "= 123" or "(100, 150)" part
        splitExample = example.split(/( \=.*|\(.*)/)
        if splitExample[1] isnt `undefined` and splitExample[1].length > 0
          splitExample[1] += ";"
        else
          splitExample[1] = ""
        examples.push splitExample
    examples: examples
    width: start.length
    prefix: text.substring(0, text.length - start.length)

  jsmm.editor.editables =
    generate: (tree, editorEditables, surface, editor) ->
      editables = []
      i = undefined
      booleanNodes = tree.getNodesByType("BooleanLiteral")
      if booleanNodes isnt `undefined`
        i = 0
        while i < booleanNodes.length
          editables.push new editorEditables.CycleEditable(booleanNodes[i], surface, editor, @parseBoolean, @makeBoolean)
          i++
      numberNodes = tree.getNodesByType("NumberLiteral")
      if numberNodes isnt `undefined`
        i = 0
        while i < numberNodes.length
          node = numberNodes[i]
          node = node.parent  if node.parent.type is "UnaryExpression"
          editables.push new editorEditables.NumberEditable(node, surface, editor, @parseNumber, @makeNumber)
          i++
      stringNodes = tree.getNodesByType("StringLiteral")
      if stringNodes isnt `undefined`
        i = 0
        while i < stringNodes.length
          str = stringNodes[i].str
          editables.push new editorEditables.ColorEditable(stringNodes[i], surface, editor, @parseColor, @makeColor)  if jsmm.editor.editables.splitColor("\"" + str + "\"") isnt null
          i++
      editables

    parseBoolean: (text) ->
      @value = text is "true"
      text is "true" or text is "false"

    makeBoolean: ->
      (if @value then "false" else "true")

    splitNumber: (text) ->
      match = /^[+]?([\-]?)[ ]*([0-9]+)(?:[.]([0-9]+))?(?:([eE])[+]?([\-]?[0-9]+))?$/g.exec(text)
      if match is null
        null
      else
        sign: match[1] # either "-" or undefined ("+" is dropped)
        integer: match[2] # integer part, cannot be undefined (if the number is valid)
        decimals: match[3] # decimal part without ".", or undefined
        exponentLetter: match[4] # either "e", "E", or undefined
        exponent: match[5] # the exponent part without the letter, but with an optional "-" (again not "+"), or undefined

    parseNumber: (text) ->
      @numberData = {}
      
      # remove spaces since it is possible to have e.g. "-  5"
      @numberData.value = parseFloat(text.replace(/[ ]+/g, ""))
      split = jsmm.editor.editables.splitNumber(text)
      if split is null or not isFinite(@numberData.value)
        false
      else
        
        # if an exponent is defined, use the capitalisation already used in the value
        @numberData.exponentLetter = split.exponentLetter or "e"
        
        # calculate the delta for each offset pixel based on the number of decimals in the original number (and of course exponent)
        # the delta is inverted as this seems to reduce the number of rounding errors (e.g. 0.57 !== 57*0.01, but 0.57 === 57/100)
        @numberData.invDelta = Math.pow(10, -(parseInt(split.exponent or "0", 10) - (split.decimals or "").length))
        
        # determine the number of significant digits by trimming leading zeros
        significant = (split.integer + (split.decimals or "")).replace(/^0*/, "").length
        
        # when zero, the number of significant digits is the number of decimals plus one
        significant = split.decimals.length + 1  if @numberData.value is 0 and split.decimals isnt `undefined`
        
        # clamp the number
        if significant > 8
          significant = 8
        else significant = 1  if significant < 1
        
        # the final number of decimals has to be based on the .toPrecision value with the calculated number of significant digits,
        # as this will be used when generating the number, and this function may alter the format of the number (e.g. different
        # number of digits and exponent, etc.)
        @numberData.decimals = (jsmm.editor.editables.splitNumber(@numberData.value.toPrecision(significant)).decimals or "").length
        true

    makeNumber: (offset) ->
      
      # calculate new number with 8 significant digits and split it
      # for calculating the new number the function x^3/(x^2+200), which provides nice snapping to the original number and
      # lower sensitiveness near the original number
      split = jsmm.editor.editables.splitNumber((@numberData.value + (offset * offset * offset) / ((offset * offset + 200) * @numberData.invDelta)).toPrecision(8))
      
      # start off with the integer part
      newText = split.integer
      
      # if we want any decimals, take all the decimals we get with 8 significant digits, and cap this off by the required amount
      newText += "." + (split.decimals or "0").substring(0, @numberData.decimals)  if @numberData.decimals > 0
      
      # add the exponent using the user-defined letter, if necessary
      newText += @numberData.exponentLetter + split.exponent  if split.exponent isnt `undefined`
      
      # finally add the negative sign if required, and if the rest of the number we have so far does not evaluate to zero
      newText = "-" + newText  if split.sign is "-" and parseFloat(newText) isnt 0
      newText

    splitColor: (text) ->
      match = /^["]([#][0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)|(?:(rgb|rgba|hsl|hsla)[(][ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*,[ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*,[ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*(?:,[ ]*(\d+(?:[.]\d+)?)[ ]*)?[)])["]$/g.exec(text)
      if match is null
        null
      else
        hex: match[1] # either "#xxx" or "#xxxxxx"
        format: match[2] # either "rgb", "rgba", "hsl", "hsla", or undefined
        part1: match[3] # number
        percent1: match[4] # either "" or "%"
        part2: match[5] # number
        percent2: match[6] # either "" or "%"
        part3: match[7] # number
        percent3: match[8] # either "" or "%"
        alpha: match[9] # alpha part or undefined

    parseColor: (text) ->
      @colorData = {}
      split = jsmm.editor.editables.splitColor(text)
      if split is null
        false
      else
        if split.hex isnt `undefined`
          @colorData.value = split.hex
          @colorData.format = "hex"
          true
        else
          a = undefined
          if split.format is "rgb" or split.format is "rgba"
            r = parseFloat(split.part1)
            g = parseFloat(split.part2)
            b = parseFloat(split.part3)
            a = parseFloat(split.alpha or "1")
            r = r * 255 / 100  if split.percent1 is "%"
            g = g * 255 / 100  if split.percent2 is "%"
            b = b * 255 / 100  if split.percent3 is "%"
            return false  if r < 0 or r > 255 or g < 0 or g > 255 or b < 0 or b > 255 or a < 0 or a > 1
            @colorData.value = "rgba(" + r.toFixed(0) + ", " + g.toFixed(0) + ", " + b.toFixed(0) + ", " + a.toFixed(2) + ")"
            @colorData.format = "rgba"
            true
          else if split.format is "hsl" or split.format is "hsla"
            h = parseInt(split.part1, 10)
            s = parseInt(split.part2, 10)
            l = parseInt(split.part3, 10)
            a = parseFloat(split.alpha or "1")
            return false  if h < 0 or h > 360 or split.percent1 is "%" or s < 0 or s > 100 or split.percent2 isnt "%" or l < 0 or l > 100 or split.percent3 isnt "%" or a < 0 or a > 1
            @colorData.value = "hsla(" + h.toFixed(0) + ", " + s.toFixed(2) + "%, " + l.toFixed(2) + "%, " + a.toFixed(2) + ")"
            @colorData.format = "hsla"
            true
          else
            false

    makeColor: (color) ->
      "\"" + color + "\""

  jsmm.editor.timeHighlights = getTimeHighlights: (tree) ->
    nodes = tree.getNodesByType("FunctionDeclaration")
    result = {}
    i = 0

    while i < nodes.length
      result[nodes[i].name] = nodes[i].blockLoc
      i++
    result
