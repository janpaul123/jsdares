connect = require("connect")
uuid = require("node-uuid")
crypto = require("crypto")
_ = require("underscore")
shared = require("../shared")

localAuth =
  iterations: 30000
  keyLen: 128

module.exports = (server) ->
  
  class server.API

    constructor: (options, objects) ->
      @options = options
      @db = objects.database
      @mailer = objects.mailer
      @common = objects.common

    getMiddleware: ->
      connect()
        .use("/get", connect.query())
        .use("/get/collection", @getCollection.bind(this))
        .use("/get/collectionAndDaresAndInstances", @getCollectionAndDaresAndInstances.bind(this))
        .use("/get/dare", @getDare.bind(this))
        .use("/get/dareAndInstance", @getDareAndInstance.bind(this))
        .use("/get/dareEdit", @getDareEdit.bind(this))
        .use("/get/checkUsername", @getCheckUsername.bind(this))
        .use("/get/checkEmail", @getCheckEmail.bind(this))
        .use("/get/loginData", @getLoginData.bind(this))
        .use("/get/daresAndInstancesAll", @getDaresAndInstancesAll.bind(this))
        .use("/get/daresAndInstancesNewest", @getDaresAndInstancesNewest.bind(this))
        .use("/get/daresAndInstancesByUserId", @getDaresAndInstancesByUserId.bind(this))
        .use("/get/daresAndInstancesPlayed", @getDaresAndInstancesPlayed.bind(this))
        .use("/get/userByUsername", @getUserByUsername.bind(this))
        .use("/get/usersAll", @getUsersAll.bind(this))
        .use("/post", connect.json())
        .use("/post/program", @postProgram.bind(this))
        .use("/post/instance", @postInstance.bind(this))
        .use("/post/dareCreate", @postDareCreate.bind(this))
        .use("/post/dareEdit", @postDareEdit.bind(this))
        .use("/post/register", @postRegister.bind(this))
        .use("/post/login", @postLogin.bind(this))
        .use "/post/logout", @postLogout.bind(this)

    getCollection: (req, res, next) ->
      @tryCatch req, res, ->
        @createObjectId req, res, req.query._id, (id) ->
          @db.collections.findById id, @existsCallback req, res, (collection) ->
            @end req, res, collection

    getCollectionAndDaresAndInstances: (req, res, next) ->
      @tryCatch req, res, ->
        @createObjectId req, res, req.query._id, (id) ->
          @db.collections.findById id, @errorCallback req, res, (collection) ->
            unless collection
              @common.error req, res, 404
            else
              @db.dares.findItems {_id: {$in: collection.dareIds}}, @errorCallback req, res, (dares) ->
                collection.dares = _.sortBy dares, (dare) ->
                  for id, i in collection.dareIds
                    return i if id.equals(dare._id)

                @addInstances req, res, collection.dares, false, ->
                  @end req, res, collection

    addInstances: (req, res, dares, filter, callback) ->
      @db.instances.findItems {dareId: {$in: _.pluck(dares, "_id")}, userId: req.session.userId}, @errorCallback req, res, (instances) ->
        for dare in dares
          dare.instance = null
          for instance in instances
            if instance.dareId.equals(dare._id)
              dare.instance = instance
              break

        if filter
          dares = _.filter dares, (dare) -> dare.instance?

        (callback.bind(this))(dares)

    addDares: (req, res, items, filter, callback) ->
      @db.dares.findItems {_id: {$in: _.pluck(items, "dareId")}, userId: req.session.userId}, @errorCallback req, res, (dares) ->
        for item in items
          item.dare = null
          for dare in dares
            if item.dareId.equals(dare._id)
              item.dare = dare
              break

        if filter
          items = _.filter items, (item) -> item.dare?

        (callback.bind(this))(items)

    getDare: (req, res, next) ->
      @tryCatch req, res, ->
        @createObjectId req, res, req.query._id, (id) ->
          @db.dares.findById id, @existsCallback req, res, (dare) ->
            @end req, res, dare

    getDareAndInstance: (req, res, next) ->
      @tryCatch req, res, ->
        @createObjectId req, res, req.query._id, (id) ->
          @db.dares.findById id, @errorCallback req, res, (dare) ->
            if dare
              @db.instances.findOne {userId: req.session.userId, dareId: dare._id}, @errorCallback req, res, (instance) ->
                if instance
                  dare.instance = instance
                  @end req, res, dare
                else
                  @db.instances.insert {userId: req.session.userId, dareId: dare._id, createdTime: new Date}, {safe: true}, @errorCallback req, res, (instances) ->
                    dare.instance = instances[0]
                    @end req, res, dare
            else
              @common.error req, res, 404

    getDareEdit: (req, res, next) ->
      @tryCatch req, res, ->
        @createObjectId req, res, req.query._id, (id) ->
          @db.dares.findById id, @userIdCallback req, res, (dare) ->
            @end req, res, dare

    getDaresAndInstancesAll: (req, res, next) ->
      @tryCatch req, res, ->
        # limit to 500 to be sure
        @db.dares.findItems {}, {sort: [["createdTime", "desc"]], limit: 500}, @existsCallback req, res, (array) ->
          @addInstances req, res, array, false, (array) ->
            @end req, res, array

    getDaresAndInstancesNewest: (req, res, next) ->
      @tryCatch req, res, ->
        @db.dares.findItems {}, {sort: [["createdTime", "desc"]], limit: 10}, @existsCallback req, res, (array) ->
          @addInstances req, res, array, false, (array) ->
            @end req, res, array

    getDaresAndInstancesByUserId: (req, res, next) ->
      @tryCatch req, res, ->
        
        # limit to 500 to be sure
        @db.dares.findItems {userId: req.query.userId}, {sort: [["createdTime", "desc"]], limit: 500}, @existsCallback req, res, (array) ->
          @addInstances req, res, array, false, (array) ->
            @end req, res, array

    getDaresAndInstancesPlayed: (req, res, next) ->
      @tryCatch req, res, ->
        @db.instances.findItems {userId: req.query.userId}, {sort: [["modifiedTime", "desc"]]}, @existsCallback req, res, (instances) ->
          @addDares req, res, instances, true, (instances) ->
            dares = []

            for instance in instances
              dare = instance.dare
              delete instance.dare
              dare.instance = instance
              dares.push dare

            @end req, res, dares

    postProgram: (req, res, next) ->
      @tryCatch req, res, ->
        @createObjectId req, res, req.body._id, (id) ->
          @db.instances.findItems {_id: id}, @userIdCallback req, res, (array) ->
            @db.instances.update {_id: id}, {$set: {text: req.body.text, modifiedTime: new Date()}}
            @end req, res

    postInstance: (req, res, next) ->
      @tryCatch req, res, ->
        @createObjectId req, res, req.body._id, (id) ->
          @db.instances.findItems {_id: id}, @userIdCallback req, res, (array) ->
            @db.instances.update {_id: id},
              {$set: {text: req.body.text, completed: req.body.completed, highscore: req.body.highscore, modifiedTime: new Date(), submittedTime: new Date()}},
              {safe: true},
              @postResponseCallback(req, res)

    postDareCreate: (req, res, next) ->
      @tryCatch req, res, ->
        dare = shared.dares.sanitizeInput {}, shared.dares.dareOptions
        dare.userId = req.session.userId
        dare.createdTime = new Date()
        dare.modifiedTime = new Date()
        @db.dares.insert dare, {safe: true}, @userIdCallback req, res, (dares) ->
          if dares.length != 1
            @common.error req, res, "When creating a new dare, not one dare inserted: " + dares.length
          else
            @end req, res, {_id: dares[0]._id}

    postDareEdit: (req, res, next) ->
      @tryCatch req, res, ->
        dare = shared.dares.sanitizeInput req.body, shared.dares.dareOptions
        dare.modifiedTime = new Date()
        @createObjectId req, res, dare._id, (id) ->
          delete dare._id
          delete dare.userId
          delete dare.instance

          @db.dares.findOne {_id: id}, @userIdCallback req, res, (array) ->
            @db.dares.update {_id: id}, {$set: dare}, {safe: true}, @postResponseCallback(req, res)

    postRegister: (req, res, next) ->
      @tryCatch req, res, ->
        @db.users.findById req.session.userId, @errorCallback req, res, (user) ->
          unless user
            @common.error req, res, 404
          else if !req.body.username || !shared.validation.username(req.body.username)
            @common.error req, res, 400, "Invalid username"
          else if !req.body.password || !shared.validation.password(req.body.password)
            @common.error req, res, 400, "Invalid password"
          else if !req.body.email || !shared.validation.email(req.body.email)
            @common.error req, res, 400, "Invalid email"
          else
            @db.users.findOne {"auth.local.username": req.body.username.toLowerCase()}, @errorCallback req, res, (user) ->
              if user
                @common.error req, res, 400, "Username already exists"
              else
                @db.users.findOne {"auth.local.email": req.body.email.toLowerCase()}, @errorCallback req, res, (user2) ->
                  if user2
                    @common.error req, res, 400, "Email already exists"
                  else
                    salt = uuid.v4()
                    password = uuid.v4().substr(-12)
                    @getHash req.body.password, salt, @errorCallback req, res, (hash) ->
                      @mailer.sendRegister req.body.email.toLowerCase(), req.body.username
                      @db.users.update {_id: req.session.userId},
                        $set:
                          screenname: req.body.username
                          link: req.body.username
                          "auth.local.email": req.body.email.toLowerCase()
                          "auth.local.username": req.body.username.toLowerCase()
                          "auth.local.hash": hash
                          "auth.local.salt": salt
                          "ips.registration": @common.getIP(req)
                          registeredTime: new Date()
                      , {safe: true}, @errorCallback req, res, (doc) ->
                        console.log "NEW USER: " + req.body.username
                        @common.setUserId req, res, =>
                          @end req, res

    postLogin: (req, res, next) ->
      @tryCatch req, res, ->
        @db.users.findOne {"auth.local.username": req.body.username.toLowerCase()}, @errorCallback req, res, (user) ->
          if user
            @getHash req.body.password, user.auth.local.salt, @errorCallback req, res, (hash) ->
              if hash is user.auth.local.hash
                @db.users.update {_id: user._id}, {$set: {"ips.login": @common.getIP(req), loginTime: new Date()}}

                req.session.userId = user._id # TODO: merge with current user id
                @common.setUserId req, res, =>
                  @end req, res
              else
                @db.users.update {_id: user._id}, {$set: {"ips.passwordError": @common.getIP(req)}}
                @common.error req, res, 404
          else
            @common.error req, res, 404

    postLogout: (req, res, next) ->
      @tryCatch req, res, ->
        delete req.session.userId
        @common.setUserId req, res, =>
          @end req, res

    getCheckUsername: (req, res, next) ->
      @tryCatch req, res, ->
        if req.query.username && shared.validation.username(req.query.username)
          @db.users.findOne {"auth.local.username": req.query.username.toLowerCase()}, @errorCallback req, res, (user) ->
            if user
              @common.error req, res, 400, "Username exists already"
            else
              @end req, res
        else
          @common.error req, res, 400, "Invalid username"

    getUserByUsername: (req, res, next) ->
      @tryCatch req, res, ->
        if req.query.username && shared.validation.username(req.query.username)
          @db.users.findOne {"auth.local.username": req.query.username.toLowerCase()}, @existsCallback req, res, (user) ->
            @end req, res, shared.dares.sanitizeInput(user, shared.dares.userOptions)
        else
          @common.error req, res, 400, "Invalid username"

    getUsersAll: (req, res, next) ->
      @tryCatch req, res, ->
        # limit to 10000 for now
        @db.users.findItems {link: {$exists: true}}, {sort: [["registeredTime", "desc"]], limit: 10000}, @existsCallback req, res, (array) ->
          users = []

          for item in array
            users.push shared.dares.sanitizeInput(item, shared.dares.userOptions)

          @end req, res, users

    getCheckEmail: (req, res, next) ->
      @tryCatch req, res, ->
        if req.query.email && shared.validation.email(req.query.email)
          @db.users.findOne {"auth.local.email": req.query.email.toLowerCase()}, @errorCallback req, res, (user) ->
            if user
              @common.error req, res, 400, "Email exists already"
            else
              @end req, res
        else
          @common.error req, res, 400, "Invalid email"

    getLoginData: (req, res, next) ->
      @tryCatch req, res, ->
        @end req, res

    userIdCallback: (req, res, callback) ->
      @existsCallback req, res, (doc) ->
        array = doc

        unless _.isArray(doc)
          array = [doc]

        for item in array
          unless item.userId
            @common.error req, res, 500, "No user id in object"
            return
          else if item.userId != req.session.userId && !req.session.loginData.admin
            @common.error req, res, 401
            return

        (callback.bind(this))(doc)

    getHash: (password, salt, callback) ->
      crypto.pbkdf2 password, salt, localAuth.iterations, localAuth.keyLen, (error, hash) ->
        if error
          callback error
        else
          callback null, new Buffer(hash, "binary").toString("hex")

    createObjectId: (req, res, id, callback) ->
      try
        objectId = new @db.ObjectID(id)
        (callback.bind(this))(objectId)
      catch error
        @common.error req, res, 404

    existsCallback: (req, res, callback) ->
      @errorCallback req, res, (doc) =>
        if doc
          (callback.bind(this))(doc)
        else
          @common.error req, res, 404

    postResponseCallback: (req, res) ->
      @errorCallback req, res, (doc) ->
        @end req, res

    end: (req, res, doc) ->
      res.end JSON.stringify(@addLoginData(req, doc || {}))

    addLoginData: (req, output) ->
      if req.session && req.session.loginData
        output.loginData = req.session.loginData 
      output

    errorCallback: (req, res, callback) ->
      (error, doc) =>
        if error
          @common.error req, res, 500, "errorCallback error: " + error
        else
          (callback.bind(this))(doc)

    tryCatch: (req, res, callback) ->
      try
        (callback.bind(this))()
      catch error
        @common.error req, res, 500, "tryCatch error: " + error
