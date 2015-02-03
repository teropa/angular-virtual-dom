var camelCase     = require('lodash.camelcase');

module.exports = function getDirectives($injector, node) {
  var dirs = [];
  Object.keys(node.properties.attributes).forEach(function(attrName) {
    var dName = camelCase(attrName) + 'Directive';
    if ($injector.has(dName)) {
      dirs.push.apply(dirs, $injector.get(dName));
    }
  });
  return dirs;
};
