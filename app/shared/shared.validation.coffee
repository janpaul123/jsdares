module.exports = (shared) ->

  shared.validation =
    username: (input) ->
      (/^[a-zA-Z0-9_\-\.]+$/).test(input) &&
        @usernameNotTooShort(input) &&
        @usernameNotTooLong(input)

    usernameNotTooShort: (input) ->
      input.length >= 3

    usernameNotTooLong: (input) ->
      input.length <= 20

    password: (input) ->
      input.length >= 6

    email: (input) ->
      input.indexOf("@") > 0 &&
      input.lastIndexOf(".") > input.indexOf("@")
