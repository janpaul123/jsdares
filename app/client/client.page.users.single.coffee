applet = require('../jsmm-applet')
dares = require('../dares')

module.exports = (client) ->
  class client.PageUsersSingle

    type: 'PageUsersSingle'
    
    constructor: (delegate, $div) ->
      @delegate = delegate

      @$container = $('<div class="users-single"></div>')
      $div.append @$container

      @page = null

    remove: ->
      @page.remove() if @page?
      @$container.remove()

    navigateTo: (splitUrl) ->
      if splitUrl[1]
        @username = splitUrl[1]
        @delegate.getSync().getUserByUsername @username, _(@userHandler).bind(this)

    userHandler: (user) ->
      @page.remove() if @page?
      if user._id == @delegate.getUserId()
        @page = new client.PageUsersOwn @delegate, @$container, user, @username
      else
        @page = new client.PageUsersOther @delegate, @$container, user, @username


  class client.PageUsersOwn

    constructor: (delegate, $div, user, username) ->
      @delegate = delegate
      @$div = $div
      @user = user
      @username = username

      $collectionPlayed = $('<div class="superheroes-collection-played"></div>')
      @collectionPlayed = new dares.Collection(this, $collectionPlayed)
      @$div.append $collectionPlayed
      
      $collectionMine = $('<div class="superheroes-collection-mine"></div>')
      @collectionMine = new dares.Collection(this, $collectionMine)
      @collectionMine.addButton '<i class="icon icon-plus-sign"></i> New', _(@newHandler).bind(this)
      @$div.append $collectionMine
      
      @updateCollections()

    remove: ->
      @collectionPlayed.remove()
      @collectionMine.remove()
      @$div.html ''

    updateCollections: ->
      @delegate.getSync().getDaresAndInstancesPlayed @delegate.getUserId(), (dares) =>
        @collectionPlayed.update
          title: 'Played dares'
          dares: dares
        , @delegate.getUserId(), @delegate.getAdmin()

      @delegate.getSync().getDaresAndInstancesByUserId @delegate.getUserId(), (dares) =>
        @collectionMine.update
          title: 'My created dares'
          dares: dares
        , @delegate.getUserId(), @delegate.getAdmin()

    newHandler: ->
      @delegate.getSync().createDare (content) =>
        @editDare content._id

    viewDare: (id) ->
      @delegate.navigateTo '/superheroes/' + @username.toLowerCase() + '/dare/' + id

    editDare: (id) ->
      @delegate.navigateTo '/superheroes/' + @username.toLowerCase() + '/edit/' + id


  class client.PageUsersOther

    constructor: (delegate, $div, user, username) ->
      @delegate = delegate
      @$div = $div
      @user = user
      @username = username

      $collectionTheirs = $('<div class="superheroes-collection-theirs"></div>')
      @collectionTheirs = new dares.Collection this, $collectionTheirs
      @$div.append $collectionTheirs

      @updateCollections()

    remove: ->
      @collectionTheirs.remove()
      @$div.html ''

    updateCollections: ->
      @delegate.getSync().getDaresAndInstancesByUserId @user._id, (dares) =>
        @collectionTheirs.update
          title: 'Dares by ' + @user.screenname
          dares: dares
        , @delegate.getUserId()

    viewDare: (id) ->
      @delegate.navigateTo '/superheroes/' + @username.toLowerCase() + '/dare/' + id

    editDare: (id) ->
      @delegate.navigateTo '/superheroes/' + @username.toLowerCase() + '/edit/' + id
