module.exports = function(url) {
  /*!
   * migrate
   * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
   * MIT Licensed
   */

  /**
   * Module dependencies.
   */

  var Migration = require('./migration')
    , db = require('./db')(url)
    , Set = require('./set')(db);


  /**
   * Library version.
   */

  migrate.version = '0.1.3';

  function migrate(title, up, down) {
    // migration
    if ('string' == typeof title && up && down) {
      migrate.set.migrations.push(new Migration(title, up, down));
    // specify migration file
    } else if ('string' == typeof title) {
      migrate.set = new Set(title);
    // no migration path
    } else if (!migrate.set) {
      throw new Error('must invoke migrate(path) before running migrations');
    // run migrations
    } else {
      return migrate.set;
    }
  }

  migrate.db = db;
  return migrate;
};

