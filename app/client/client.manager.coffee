applet = require("../jsmm-applet")
dares = require("../dares")

pageConstructors = [
  {regex: /^dare/, type: 'PageHome'},
  {regex: /^edit/, type: 'PageHome'},
  {regex: /^full/, type: 'PageHome'},
  {regex: /^about/, type: 'PageAbout'},
  {regex: /^learn/, type: 'PageLearn'},
  {regex: /^create/, type: 'PageCreate'},
  {regex: /^superheroes$/, type: 'PageUsersList'},
  {regex: /^superheroes/, type: 'PageUsersSingle'},
  {regex: /^blindfold/, type: 'PageBlog'}
]

module.exports = (client) ->
  class client.Manager
    constructor: ->
      @$div = $("#content")
      @menu = new client.MenuHeader(this)
      @login = new client.Login(this)
      @sync = new client.Sync(this)
      @history = window.History
      @history.Adapter.bind window, "statechange", _(@stateChange).bind(this)
      @loginData = window.jsdaresLoginData
      
      @modalUI = new applet.UI()
      @modalUI.setCloseCallback _(@closeDareCallback).bind(this)
      
      @page = null
      @urlChange window.location.pathname

    getSync: ->
      @sync

    getLoginData: ->
      @loginData

    getUserId: ->
      (if @loginData then @loginData.userId else `undefined`)

    getAdmin: ->
      (if @loginData then @loginData.admin else false)

    navigateTo: (url) ->
      @addHistory url

    removePage: ->
      if @page?
        @page.remove()
        @page = null

    connectionError: (error) ->
      @login.showConnectionError()
      if console
        console.error "Connection error: " + error

    connectionSuccess: (response) ->
      @login.hideConnectionError()

    updateLoginData: (loginData) ->
      if @loginData.loggedIn isnt loginData.loggedIn
        @loginData = loginData # already do this here for if the page requests it
        @refresh()
      @loginData = loginData
      @login.update @loginData
      @menu.showLocks not @loginData.loggedIn

    addHistory: (url) ->
      @history.pushState null, null, url

      _gaq.push ["_trackPageview", url] # Google Analytics

    stateChange: ->
      state = @history.getState()
      @urlChange state.hash

    refresh: ->
      document.title = "jsdares"
      @page.navigateTo @splitUrl
      @navigateDare @splitUrl

    urlChange: (url) ->
      @modalUI.closeModal()

      url = (url || "/").substring(1)

      type = null

      for constructor in pageConstructors
        if constructor.regex.test(url)
          type = constructor.type
          break

      unless type?
        type = "PageHome"
        url = ""

      @splitUrl = url.split("/")

      if @page == null || @page.type != type
        @removePage()
        @page = new client[type](this, @$div)

      @menu.navigateTo @splitUrl
      @refresh()

    navigateDare: (splitUrl) ->
      if @splitUrl[@splitUrl.length - 2] is "dare"
        @viewDare @splitUrl[@splitUrl.length - 1]
      else @editDare @splitUrl[@splitUrl.length - 1]  if @splitUrl[@splitUrl.length - 2] is "edit"

    viewDare: (id) ->
      @dareId = id
      @getSync().getDareAndInstance id, (dare) =>
        if dare._id is @dareId
          @instance = dare.instance
          @modalUI.openModal()
          dares.openDare this, @modalUI, dare

    editDare: (id) ->
      @dareId = id
      @getSync().getDareEdit id, (dare) =>
        if dare._id is @dareId
          @instance = dare.instance
          @modalUI.openModal()
          new dares.Editor(this, @modalUI, dare)

    closeDareCallback: ->
      @navigateTo "/" + @splitUrl.slice(0, -2).join("/")  if ["dare", "edit"].indexOf(@splitUrl[@splitUrl.length - 2] >= 0)
