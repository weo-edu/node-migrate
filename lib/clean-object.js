var _ = require('lodash');

module.exports = function clean(obj, returnUndefined) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var val = obj[key];
      if (_.isObject(val)) {
        val = clean(val, true);
      }
      if (_.isUndefined(val))
        delete obj[key];
    }
  }
  if (returnUndefined) {
    if (!_.keys(obj).length) {
      return;
    }
  }
  return obj;
}