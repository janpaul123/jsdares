module.exports = (client) ->
  client.init = ->
    manager = new client.Manager()
    $(".header-logo").on "click", (event) ->
      event.preventDefault()
      manager.navigateTo "/"

    $(".footer-about").on "click", (event) ->
      event.preventDefault()
      manager.navigateTo "/about"

    $(".footer-blindfold").on "click", (event) ->
      event.preventDefault()
      manager.navigateTo "/blindfold"
