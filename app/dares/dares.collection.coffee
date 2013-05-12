module.exports = (dares) ->

  class dares.Collection

    icons:
      console: 'icon-list-alt'
      canvas: 'icon-picture'
      robot: 'icon-th'

    constructor: (delegate, $collection) ->
      @delegate = delegate
      @$collection = $collection
      @$collection.addClass 'dares-collection'

      @$header = $('<div class="dares-header"></div>')
      @$collection.append @$header
      
      @$buttons = $('<div class="dares-header-buttons"></div>')
      @$header.append @$buttons
      
      @$difficulty = $('<div class="dares-header-difficulty"></div>')
      @$header.append @$difficulty
      
      @$title = $('<div class="dares-header-title"></div>')
      @$header.append @$title
      
      @$body = $('<div class="dares-body"></div>')
      @$collection.append @$body
      
      @content = null
      @userId = null
      @admin = false

    remove: ->
      @$header.remove()
      @$body.remove()
      @$buttons.remove()
      @$collection.removeClass 'dares-collection'

    addButton: (html, callback) ->
      $button = $('<button class="btn">' + html + '</button>')
      $button.on 'click', callback
      @$buttons.append $button

    update: (content, userId, admin) ->
      @content = content
      @userId = userId
      @admin = admin
      @render()

    render: ->
      @$difficulty.html ''

      stars = @content.difficulty || 0
      for [0...stars]
        @$difficulty.append '<i class="icon-star-yellow"></i>'
      
      @$title.text @content.title or ''
      @$body.children('.dares-body-item').remove() # prevent $.data leaks
      
      for dare in @content.dares
        if dare.published || @userId == dare.userId || @admin
          $item = $('<div class="dares-body-item"></div>')

          if dare.instance && dare.instance.completed
            $item.addClass 'dares-body-completed'

          unless dare.published
            $item.addClass 'dares-body-unpublished'

          $item.data '_id', dare._id
          $item.on 'click', _(@itemViewClick).bind(this)
          
          $name = $('<span class="dares-body-name">' + dare.name + ' </span>')
          $item.append $name
          
          if @userId == dare.userId || @admin
            $editButton = $('<button class="btn dares-body-edit">Edit</button>')
            $editButton.on 'click', _(@itemEditClick).bind(this)
            $item.append $editButton
          else if dare.instance
            $item.append '<span class="dares-body-highscore"><i class="icon-trophy"></i> ' + dare.instance.highscore + '</span>'
          
          @$body.append $item

    itemViewClick: (event) ->
      event.stopImmediatePropagation()
      $target = $(event.delegateTarget)
      @delegate.viewDare $target.data('_id')

    itemEditClick: (event) ->
      event.stopImmediatePropagation()
      $target = $(event.delegateTarget).parent()
      @delegate.editDare $target.data('_id')
