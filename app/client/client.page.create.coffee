dares = require('../dares')

module.exports = (client) ->
  class client.PageCreate

    type: 'PageCreate'

    constructor: (delegate, $div) ->
      @delegate = delegate
      @$div = $('<div class="create"></div>')

      $div.append @$div

      $collectionMine = $('<div class="create-collection-mine"></div>')
      @collectionMine = new dares.Collection(this, $collectionMine)
      @collectionMine.addButton '<i class="icon icon-plus-sign"></i> New', _(@newHandler).bind(this)
      @$div.append $collectionMine

    remove: ->
      @collectionMine.remove()
      @$div.remove()

    navigateTo: (splitUrl) ->
      unless @delegate.getUserId()
        @delegate.navigateTo '/'
      else
        @updateCollections()

    updateCollections: ->
      @delegate.getSync().getDaresAndInstancesByUserId @delegate.getUserId(), (dares) =>
        @collectionMine.update
          title: 'My created dares'
          dares: dares
        , @delegate.getUserId(), @delegate.getAdmin()

    newHandler: ->
      @delegate.getSync().createDare _(@createDareSuccessfulHandler).bind(this)

    createDareSuccessfulHandler: (content) ->
      @editDare content._id

    viewDare: (id) ->
      @delegate.navigateTo '/create/dare/' + id

    editDare: (id) ->
      @delegate.navigateTo '/create/edit/' + id
