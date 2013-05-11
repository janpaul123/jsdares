#jshint node:true jquery:true
"use strict"
module.exports = (client) ->
  class client.Sync

    constructor: (delegate) ->
      @delegate = delegate
      @postTimeout = null
      @delayedPostData = {}

    remove: ->
      @clearPostTimeout()

    getCollection: (_id, success) ->
      @apiGet "collection", {_id}, success

    getCollectionAndDaresAndInstances: (_id, success) ->
      @apiGet "collectionAndDaresAndInstances", {_id}, success

    getDare: (_id, success) ->
      @apiGet "dare", {_id}, success

    getDareAndInstance: (_id, success) ->
      @apiGet "dareAndInstance", {_id}, success

    getDareEdit: (_id, success) ->
      @apiGet "dareEdit", {_id}, success

    getDaresAndInstancesByUserId: (userId, success) ->
      @apiGet "daresAndInstancesByUserId", {userId}, success

    getDaresAndInstancesPlayed: (userId, success) ->
      @apiGet "daresAndInstancesPlayed", {userId}, success

    getDaresAndInstancesAll: (success) ->
      @apiGet "daresAndInstancesAll", {}, success

    getUserByUsername: (username, success) ->
      @apiGet "userByUsername", {username}, success

    getUsersAll: (success) ->
      @apiGet "usersAll", {}, success

    updateProgram: (instance) ->
      @apiPostDelayed "program", instance

    updateInstance: (instance, success) ->
      @apiPost "instance", instance, success

    createDare: (success, error) ->
      @apiPost "dareCreate", {}, success, error

    updateDare: (dare, success, error) ->
      @apiPost "dareEdit", dare, success, error

    register: (username, password, email, success, error) ->
      @apiPost "register", {username, password, email}, success, error

    login: (username, password, error) ->
      @apiPost "login", {username, password}, `undefined`, error

    logout: ->
      @apiPost "logout"

    checkUsername: (username, success, error) ->
      @apiGet "checkUsername", {username}, success, error

    checkEmail: (email, success, error) ->
      @apiGet "checkEmail", {email}, success, error

    getLoginData: ->
      @apiGet "loginData"

    apiGet: (name, data, success, error) ->
      $.ajax
        url: "/api/get/" + name
        type: "get"
        data: data || {}
        dataType: "json"
        success: (response) =>
          @delegate.updateLoginData response.loginData  if response.loginData
          if success
            @delegate.connectionSuccess response  if success(response) != false
          else
            @delegate.connectionSuccess response
        error: (message) =>
          if error
            @delegate.connectionError message  if error(message) != false
          else
            @delegate.connectionError message

    apiPost: (name, data, success, error) ->
      $.ajax
        url: "/api/post/" + name
        type: "post"
        data: JSON.stringify(data || {})
        contentType: "application/json; charset=utf-8"
        dataType: "json"
        success: (response) =>
          @delegate.updateLoginData response.loginData  if response.loginData
          if success
            @delegate.connectionSuccess response  if success(response) isnt false
          else
            @delegate.connectionSuccess response
        error: (message) =>
          if error
            @delegate.connectionError message  if error(message) isnt false
          else
            @delegate.connectionError message

    apiPostDelayed: (name, data) ->
      @delayedPostData[name] = data
      if @postTimeout == null
        @flushPostDelayed()
        @postTimeout = setTimeout (=> @flushPostDelayed()), 5000

    flushPostDelayed: ->
      @clearPostTimeout()
      for name of @delayedPostData
        @apiPost name, @delayedPostData[name]
      @delayedPostData = {}

    clearPostTimeout: ->
      if @postTimeout != null
        window.clearTimeout @postTimeout
        @postTimeout = null
