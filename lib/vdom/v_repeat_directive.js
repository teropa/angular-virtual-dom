var getAttribute  = require('./get_attribute');
var cloneTree     = require('./clone_tree');

module.exports = ['$parse', function($parse) {
  return {
    restrict: 'A',
    linkVirtual: function(node) {
      var expr = getAttribute(node, 'v-repeat');
      var match = expr.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)\s*$/);
      var alias = match[1];
      var coll  = match[2];
      var repeater = $parse(coll)(node.$scope);
      return repeater.map(function(item, index) {
        var repeatNode = cloneTree(node);
        repeatNode.$scope = node.$scope.$new();
        repeatNode.$scope[alias] = item;
        repeatNode.$scope.$index = index;
        repeatNode.$scope.$even = (index % 2 === 0);
        repeatNode.$scope.$odd = !repeatNode.$scope.$even;
        return repeatNode;
      }).toArray();
    }
  };
}];
