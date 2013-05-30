shared = require('../shared')
refreshSeconds = 60

module.exports = (client) ->
  class client.Login
    constructor: (delegate) ->
      @delegate = delegate
      @$div = $('#header-login')

      @timeout = null
      @setTimeout 500 # half a second

    remove: ->
      @register.hide()  if @register
      @register = `undefined`

    clear: ->
      @$username.remove()  if @$username
      @$password.remove()  if @$password
      @$login.remove()  if @$login
      @$register.remove()  if @$register
      @$group.remove()  if @$group
      @$invalid.remove()  if @$invalid
      @$form.remove()  if @$form
      @$loader.remove()  if @$loader

      @$logout.remove()  if @$logout
      @$name.remove()  if @$name
      @$points.remove()  if @$points
      @$details.remove()  if @$details

      @$connectionError.remove()  if @$connectionError

      @$username = @$password = @$login = @register = @$group = @$invalid = @$form = @$loader = @$logout = @$name = @$points = @$details = @$connectionError = `undefined`

    showLogin: ->
      @clear()
      @$form = $('<form class="form-inline"></form>')
      @$username = $('<input type="text" tabindex="1" placeholder="Username" class="login-field-username input-small"></input>')
      @$password = $('<input type="password" tabindex="2" placeholder="Password" class="login-field-password input-small"></input>')
      @$login = $('<input type="submit" tabindex="3" class="btn" value="Login"></input>')
      @$register = $('<input type="button" tabindex="4" class="btn" value="Register"></input>')
      @$group = $('<div class="btn-group"></div>')
      @$group.append @$login, @$register
      @$invalid = $('<i class="icon icon-exclamation-sign-color login-error hide"></i>')
      @$invalid.tooltip
        title: 'Invalid username or password'
        placement: 'bottom'

      @$connectionError = $('<i class="icon icon-exclamation-sign-color login-error hide"></i>')
      @$connectionError.tooltip
        title: 'Connection error'
        placement: 'bottom'

      @$form.append @$group, @$password, @$username, @$invalid, @$connectionError
      @$loader = $('<i class="icon icon-loader login-loader hide"></i>')
      @$div.append @$form, @$loader

      @$form.on 'submit', _(@loginHandler).bind(this)
      @$register.on 'click', _(@registerHandler).bind(this)

    showLogout: ->
      @clear()
      @$logout = $('<button type="submit" class="btn login-logout">Logout</button>')
      @$name = $('<span class="login-details-name"></span>')
      @$points = $('<span class="login-details-points"></span>')
      @$details = $('<button class="login-details btn"></button>')
      @$nameIcon = $('<i class="icon icon-user"></i>')
      @$details.append @$nameIcon, ' ', @$name, $('<i class="icon icon-trophy"></i> '), @$points
      @$connectionError = $('<i class="icon icon-exclamation-sign-color login-error hide"></i>')
      @$connectionError.tooltip
        title: 'Connection error'
        placement: 'bottom'

      @$div.append @$logout, @$details, @$connectionError

      @$details.on 'click', _(@detailsHandler).bind(this)
      @$logout.on 'click', _(@logoutHandler).bind(this)

    update: (data) ->
      if !data.loggedIn && !@$form
        @showLogin()
      else if data.loggedIn
        @showLogout() unless @$details
        @$name.text data.screenname
        @$points.text data.points
        @$nameIcon.toggleClass 'icon-user', !data.admin
        @$nameIcon.toggleClass 'icon-globe', data.admin
        @userLink = data.link
      @setTimeout refreshSeconds * 1000

    loginHandler: (event) ->
      event.preventDefault()
      username = @$username.val()
      password = @$password.val()
      @hideConnectionError()
      if !shared.validation.username(username) || !shared.validation.password(password)
        @$invalid.removeClass 'hide'
      else
        @$invalid.addClass 'hide'
        @$loader.removeClass 'hide'
        @delegate.getSync().login username, password, (error) =>
          @$loader.addClass 'hide'
          if error.status == 404
            @$invalid.removeClass 'hide'
            @hideConnectionError()
            false

    logoutHandler: ->
      @delegate.getSync().logout()

    detailsHandler: ->
      @delegate.navigateTo '/superheroes/' + @userLink

    registerHandler: ->
      @register = new client.Register(this, @delegate.getSync(), @$username.val(), @$password.val())  unless @register

    registerClosed: ->
      @register = null

    setTimeout: (time) ->
      window.clearTimeout @timeout if @timeout?
      @timeout = window.setTimeout (=>
        @timeout = null
        @delegate.getSync().getLoginData()
      ), time

    showConnectionError: ->
      @$connectionError.removeClass 'hide' if @$connectionError
      @$invalid.addClass 'hide' if @$invalid

    hideConnectionError: ->
      @$connectionError.addClass 'hide' if @$connectionError

  class client.Register
    constructor: (delegate, sync, username, password) ->
      @delegate = delegate
      @sync = sync

      @$div = $('<div class="header-register modal"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3>Register</h3></div></div>')
      @$body = $('<div class="modal-body header-register-form"><p>Sweet, you are only a few clicks away from registering! Your progress so far will be saved into your new account.</p><p>You do not have to repeat any of the fields, but if you mistype anything just contact me at <a href="mailto:jp@jsdares.com">jp@jsdares.com</a>.</p></div>')
      @$form = $('<form></form>')
      @$body.append @$form
      @$div.append @$body

      @$username = $('<input type="text" placeholder="Username" class="register-username input-large"></input>')
      @$usernameIcon = $('<i class="icon header-register-icon-right"></i>')
      @$usernameTooltip = $('<div class="tooltip right hide header-register-tooltip-username"><div class="tooltip-arrow"></div></div>')
      @$usernameTooltipText = $('<div class="tooltip-inner"></div>')
      @$usernameTooltip.append @$usernameTooltipText
      @$usernameIcon.append @$usernameTooltip
      @$form.append $('<div class="input-prepend"><span class="add-on"><i class="icon icon-user"></i></span></div>').append(@$username, @$usernameIcon)
      @$username.val username

      @$password = $('<input type="password" placeholder="Password" class="register-password input-large"></input>')
      @$passwordIcon = $('<i class="icon header-register-icon-right"></i>')
      @$passwordTooltip = $('<div class="tooltip right hide header-register-tooltip-password"><div class="tooltip-arrow"></div></div>')
      @$passwordTooltipText = $('<div class="tooltip-inner"></div>')
      @$passwordTooltip.append @$passwordTooltipText
      @$passwordIcon.append @$passwordTooltip
      @$form.append $('<div class="input-prepend"><span class="add-on"><i class="icon icon-lock"></i></span></div>').append(@$password, @$passwordIcon)
      @$password.val password

      @$email = $('<input type="email" placeholder="Email address" class="register-email input-large"></input>')
      @$emailIcon = $('<i class="icon header-register-icon-right"></i>')
      @$emailTooltip = $('<div class="tooltip right hide header-register-tooltip-email"><div class="tooltip-arrow"></div></div>')
      @$emailTooltipText = $('<div class="tooltip-inner"></div>')
      @$emailTooltip.append @$emailTooltipText
      @$emailIcon.append @$emailTooltip

      @$form.append $('<div class="input-prepend"><span class="add-on"><i class="icon icon-envelope"></i></span></div>').append(@$email, @$emailIcon)
      @$div.append '<div class="modal-body header-register-confirmation"><p>Well done! We have sent a welcome email to <strong class="header-register-confirmation-email"></strong>, be sure to check it. If you cannot find it, please contact me at <a href="mailto:jp@jsdares.com">jp@jsdares.com</a>.</p><p>You can now continue learning and start creating immediately!</p></div>'
      @$footer = $('<div class="modal-footer"></div>')
      @$register = $('<button class="btn btn-primary header-register-submit">Register</button>')
      @$submitIcon = $('<i class="icon icon-loader hide"></i>')
      @$footer.append @$register, '<button class="btn" data-dismiss="modal">Close</button>', @$submitIcon
      @$div.append @$footer

      @$form.on 'submit', _(@submitHandler).bind(this)
      @$register.on 'click', _(@submitHandler).bind(this)
      @$username.on 'blur keyup', _(@checkUsername).bind(this)
      @$password.on 'blur keyup', _(@checkPassword).bind(this)
      @$email.on 'blur keyup', _(@checkEmail).bind(this)

      @modal = @$div.modal()
      @$div.on 'hidden', _(@remove).bind(this)

      @checkUsername()
      @checkPassword()

    remove: ->
      @$username.remove()
      @$password.remove()
      @$email.remove()
      @$register.remove()
      @$form.remove()
      @$div.remove()
      @delegate.registerClosed()

    hide: ->
      @$div.modal 'hide'

    checkUsername: ->
      @$usernameIcon.removeClass 'icon-ok-sign-color icon-exclamation-sign-color icon-loader'
      @$usernameTooltip.addClass 'hide'
      username = @$username.val()
      if username.length > 0
        unless shared.validation.usernameNotTooShort(username)
          @$usernameIcon.addClass 'icon-exclamation-sign-color'
          @$usernameTooltip.removeClass 'hide'
          @$usernameTooltipText.text 'Username is too short'
        else unless shared.validation.usernameNotTooLong(username)
          @$usernameIcon.addClass 'icon-exclamation-sign-color'
          @$usernameTooltip.removeClass 'hide'
          @$usernameTooltipText.text 'Username is too long'
        else unless shared.validation.username(username)
          @$usernameIcon.addClass 'icon-exclamation-sign-color'
          @$usernameTooltip.removeClass 'hide'
          @$usernameTooltipText.text 'Invalid username'
        else
          @$usernameIcon.addClass 'icon-loader'
          @sync.checkUsername username, (=>
            @$usernameIcon.removeClass 'icon-ok-sign-color icon-exclamation-sign-color icon-loader'
            @$usernameIcon.addClass 'icon-ok-sign-color'
          ), =>
            @$usernameIcon.removeClass 'icon-ok-sign-color icon-exclamation-sign-color icon-loader'
            @$usernameIcon.addClass 'icon-exclamation-sign-color'
            @$usernameTooltip.removeClass 'hide'
            @$usernameTooltipText.text 'Username is already taken'

    checkPassword: ->
      @$passwordIcon.removeClass 'icon-ok-sign-color icon-exclamation-sign-color icon-loader'
      @$passwordTooltip.addClass 'hide'

      password = @$password.val()
      if password.length > 0
        if shared.validation.password(password)
          @$passwordIcon.addClass 'icon-ok-sign-color'
        else
          @$passwordIcon.addClass 'icon-exclamation-sign-color'
          @$passwordTooltip.removeClass 'hide'
          @$passwordTooltipText.text 'Password is too short'

    checkEmail: ->
      @$emailIcon.removeClass 'icon-ok-sign-color icon-exclamation-sign-color icon-loader'
      @$emailTooltip.addClass 'hide'

      email = @$email.val()
      if email.length > 0
        if shared.validation.email(email)
          @$emailIcon.addClass 'icon-loader'
          @sync.checkEmail email, (=>
            @$emailIcon.removeClass 'icon-ok-sign-color icon-exclamation-sign-color icon-loader'
            @$emailIcon.addClass 'icon-ok-sign-color'
          ), =>
            @$emailIcon.removeClass 'icon-ok-sign-color icon-exclamation-sign-color icon-loader'
            @$emailIcon.addClass 'icon-exclamation-sign-color'
            @$emailTooltip.removeClass 'hide'
            @$emailTooltipText.text 'Email address is already used'
        else
          @$emailIcon.addClass 'icon-exclamation-sign-color'
          @$emailTooltip.removeClass 'hide'
          @$emailTooltipText.text 'Invalid email address'

    submitHandler: ->
      @$submitIcon.addClass 'hide'
      username = @$username.val()
      password = @$password.val()
      email = @$email.val()

      if username.length <= 0
        @$usernameIcon.removeClass 'icon-ok-sign-color icon-loader'
        @$usernameIcon.addClass 'icon-exclamation-sign-color'
        @$usernameTooltip.removeClass 'hide'
        @$usernameTooltipText.text 'Username is empty'
      else
        @checkUsername()

      if password.length <= 0
        @$passwordIcon.removeClass 'icon-ok-sign-color icon-loader'
        @$passwordIcon.addClass 'icon-exclamation-sign-color'
        @$passwordTooltip.removeClass 'hide'
        @$passwordTooltipText.text 'Password is empty'
      else
        @checkPassword()

      if email.length <= 0
        @$emailIcon.removeClass 'icon-ok-sign-color icon-loader'
        @$emailIcon.addClass 'icon-exclamation-sign-color'
        @$emailTooltip.removeClass 'hide'
        @$emailTooltipText.text 'Email is empty'
      else
        @checkEmail()

      if shared.validation.username(username) && shared.validation.password(password) && shared.validation.email(email)
        @$submitIcon.removeClass 'hide'
        @sync.register username, password, email, (=>
          @$submitIcon.addClass 'hide'
          @$div.addClass 'header-register-done'
          @$div.find('.header-register-confirmation-email').text email
        ), =>
          @$submitIcon.addClass 'hide'
