nodemailer = require('nodemailer')
mustache = require('mustache')
fs = require('fs')

templates = ['base', 'register']

module.exports = (server) ->

  class server.Mailer

    constructor: (options) ->
      @options = options
      @transport = nodemailer.createTransport(@options.transport.type, @options.transport.options)
      @templates = {}

      for template in templates
        @templates[template + '-text'] = fs.readFileSync "#{__dirname}/mails/#{template}-text.mustache", 'utf8'
        @templates[template + '-html'] = fs.readFileSync "#{__dirname}/mails/#{template}-html.mustache", 'utf8'

    sendRegister: (email, username) ->
      @send 'register',
        to:
          name: username
          email: email
        subject: "Nice! You've just joined jsdares."
        username: username

    send: (type, data) ->
      mailOptions =
        from: "#{@options.from.name} <#{@options.from.email}>"
        to: "#{data.to.name} <#{data.to.email}>"
        subject: data.subject
        text: mustache.render @templates['base-text'],
          subject: data.subject
          content: mustache.render(@templates[type + '-text'], data)
        html: mustache.render @templates['base-html'],
          subject: data.subject
          content: mustache.render(@templates[type + '-html'], data)

      @transport.sendMail mailOptions, (error, response) =>
        if error
          console.error "Error in mailer @ #{type} @ DATA : #{JSON.stringify(data)} @ ERROR: #{error}"
        else if @options.log
          console.log "SENT MAIL #{type} - #{data.to.name} <#{data.to.email}>"
