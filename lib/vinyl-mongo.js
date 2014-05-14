/**
 * Module dependencies.
 */

var stream = require('stream')
  , db = require('./db')
  , parse = require('./parse')
  , clean = require('./clean-object')
  , _ = require('lodash')
  , es = require('event-stream');

var VinylMongo = module.exports;

VinylMongo.src = function(collection, query) {
  collection = db.get(collection);
  var rs = new stream.Readable({objectMode: true});
  query = collection.find(query, {stream: true})
    .each(function(doc) {
      rs.push(doc);
    })
    .success(function() {
      rs.push(null);
    })
  rs._read = function() {
    if (query) return;
    
  }
  return rs;
};

VinylMongo.dest = function(collection, concurrent) {
  collection = db.get(collection);

  var ws = stream.Writable({objectMode: true});
  var active = 0;
  var end = false;
  return es.through(function(doc) {
    var id = doc._id;
    delete doc._id;
    active++;
    var self = this;
    collection.update(id, {$set: doc}, {upsert: true}, function(err) {
      if (err) return self.emit('error', err);
      active--;
      if (active <= concurrent) self.resume();
      if (end && !active) {
        self.emit('end');
      }
    });
    if (active > concurrent) {
      this.pause();
    }
    
  }, function() {
    end = true;
  });

};

VinylMongo.transform = function(map) {
  var parsers = [];
  _.each(map, function(val, key) {
    parsers.push({
      from: parse(key),
      to: parse(val)
    });
  });
  return es.through(function(doc) {
    _.each(parsers, function(parser) {
      var val = parser.from(doc);
      parser.from.assign(doc, undefined);
      parser.to.assign(doc, val);
    });
    clean(doc);
    this.emit('data', doc);
  }, function() {
    this.emit('end');
  });
};

VinylMongo.db = db;