menu = [
  {title: 'INTRODUCTION', url: '', urls: ['', 'intro', 'full'], locked: false},
  {title: 'LEARN', url: 'learn', urls: ['learn'], locked: true},
  {title: 'CREATE', url: 'create', urls: ['create'], locked: true}
]

module.exports = (client) ->
  class client.MenuHeader
    constructor: (delegate) ->
      @delegate = delegate
      @$div = $("#header-menu")
      @$arrow = $("#header-arrow")
      @$tabs = []
      @$links = []
      @$locks = []
      @urls = {}
      @locksShown = false

      for menuItem, i in menu
        $tab = $("<li></li>")
        $link = $("<a href=\"#\">" + menuItem.title + " </a>")
        $lock = $("<i class=\"icon icon-lock-color hide\"></i>")
        $link.append $lock
        $tab.append $link
        @$div.append $tab

        $link.data "index", i
        $link.on "click", _(@clickHandler).bind(this)
        @$tabs.push $tab
        @$links.push $link
        @$locks.push $lock

        for url in menuItem.urls
          @urls[url] = i

    clickHandler: (event) ->
      event.preventDefault()
      index = $(event.delegateTarget).data("index")
      if @locksShown && menu[index].locked
        $arrow = @$arrow
        $arrow.removeClass "arrow-animate"
        window.setTimeout (->
          $arrow.addClass "arrow-animate"
        ), 0
      else
        @delegate.navigateTo "/" + menu[index].url

    mouseMoveHandler: (event) ->
      @$arrow.addClass "arrow-active"

    mouseLeaveHandler: (event) ->
      @$arrow.removeClass "arrow-active arrow-animate"

    navigateTo: (splitUrl) ->
      @$div.children("li").removeClass "active"
      index = @urls[splitUrl[0] || ""]

      @$tabs[index].addClass "active" if index?

    showLocks: (show) ->
      @$arrow.removeClass "arrow-animate"
      @locksShown = show

      for menuItem, i in menu
        hideLock = !show || !menuItem.locked
        @$locks[i].toggleClass "hide", hideLock
        @$links[i].off "mousemove mouseleave"
        unless hideLock
          @$links[i].on "mousemove", _(@mouseMoveHandler).bind(this)
          @$links[i].on "mouseleave", _(@mouseLeaveHandler).bind(this)
