dares = require("../dares")

module.exports = (client) ->
  class client.PageLearn

    type: "PageLearn"

    constructor: (delegate, $div) ->
      @delegate = delegate
      @$div = $("<div class=\"learn\"></div>")
      $div.append @$div

      $collectionPlayed = $("<div class=\"learn-collection-played\"></div>")
      @collectionPlayed = new dares.Collection(this, $collectionPlayed)
      @$div.append $collectionPlayed
      
      $collectionAll = $("<div class=\"learn-collection-all\"></div>")
      @collectionAll = new dares.Collection(this, $collectionAll)
      @$div.append $collectionAll

    remove: ->
      @collectionPlayed.remove()
      @collectionAll.remove()
      @$div.remove()

    navigateTo: (splitUrl) ->
      if @delegate.getUserId()
        @updateCollections()
      else
        @delegate.navigateTo "/"

    updateCollections: ->
      @delegate.getSync().getDaresAndInstancesPlayed @delegate.getUserId(), (dares) =>
        @collectionPlayed.update
          title: "Played dares"
          dares: dares
        , @delegate.getUserId(), @delegate.getAdmin()
      @delegate.getSync().getDaresAndInstancesAll (dares) =>
        @collectionAll.update
          title: "All dares"
          dares: dares
        , @delegate.getUserId(), @delegate.getAdmin()

    viewDare: (id) ->
      @delegate.navigateTo "/learn/dare/" + id

    editDare: (id) ->
      @delegate.navigateTo "/learn/edit/" + id
