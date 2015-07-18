
var typeforce = require('typeforce')
var extend = require('extend')
var rest = require('./rest')

module.exports = Entry

function Entry (id) {
  if (!(this instanceof Entry)) return new Entry(id)

  this._props = {}
  this._metadata = {
    timestamp: Date.now(),
    prev: []
    // id: null,
    // prev: null
  }

  if (typeof id !== 'undefined') this._metadata.id = id
}

Entry.prototype.meta =
Entry.prototype.metadata = function (name, value) {
  if (arguments.length === 0) {
    return extend(true, {}, this._metadata)
  }

  if (arguments.length === 1) {
    if (typeof name === 'string') {
      return this._metadata[name]
    } else {
      extend(true, this._metadata, name)
    }
  } else {
    this._metadata[name] = value
  }

  return this
}

Entry.prototype.id = function (id) {
  if (typeof id === 'undefined') {
    return this._metadata.id
  }

  if (id == null) delete this._metadata.id
  else this._metadata.id = id

  return this
}

Entry.prototype.prev = function (id) {
  if (arguments.length === 0) return this._metadata.prev

  var prevId
  if (typeof id === 'number') {
    prevId = id
  } else if (id instanceof Entry) {
    prevId = id.prev().slice()
    prevId.push(id.id())
  } else if (id._l) {
    prevId = id._l.id
  }

  if (typeof prevId !== 'number' && !Array.isArray(prevId)) {
    throw new Error('invalid "prev"')
  }

  typeforce('Number', prevId)
  this._metadata.prev = this._metadata.prev.concat(prevId)
  return this
}

Entry.prototype.timestamp = function () {
  return this._metadata.timestamp
}

Entry.prototype.get = function (name) {
  return this._props[name]
}

Entry.prototype.data =
Entry.prototype.set = function (name, value) {
  if (typeof name === 'object') {
    extend(true, this._props, name)
  } else {
    this._props[name] = value
  }

  return this
}

Entry.prototype.copy = function (props) {
  if (arguments.length === 1) this.set(props)
  else {
    rest(arguments).forEach(function (prop) {
      this._props[prop] = getProp(props, prop)
    }, this)
  }

  return this
}

Entry.prototype.toJSON = function (skipMetadata) {
  this.validate()

  return {
    meta: extend(true, {}, this._metadata),
    data: extend(true, {}, this._props)
  }
}

Entry.prototype.validate = function () {
  return true // not sure if we need validation
}

Entry.prototype.clone = function () {
  return Entry.fromJSON(this.toJSON(true))
}

Entry.fromJSON = function (json) {
  typeforce({
    meta: '?Object',
    data: 'Object'
  }, json)

  var entry = new Entry()
    .data(json.data)

  if (json.meta) {
    entry.meta(json.meta)
  }

  return entry
}

function getProp (obj, name) {
  return obj instanceof Entry ? obj.get(name) : obj[name]
}
