var getAttribute  = require('./get_attribute');

module.exports = ['$parse', function($parse) {
  return {
    restrict: 'A',
    linkVirtual: function(node) {
      var expr = $parse(getAttribute(node, 'v-if'));
      if (expr(node.$scope)) {
        return node;
      } else {
        return [];
      }
    }
  };
}];
