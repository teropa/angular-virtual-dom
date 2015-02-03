var isVNode       = require('virtual-dom/vnode/is-vnode');
var isVText       = require('virtual-dom/vnode/is-vtext');
var reduce        = require('lodash.reduce');

var getDirectives = require('./get_directives');
var cloneTree     = require('./clone_tree');

function linkVisit($injector, node, scope) {
  node.$scope = scope;
  var linkedNodes;
  if (isVNode(node)) {
    var directives = getDirectives($injector, node);
    linkedNodes = reduce(directives, function(nodes, directive) {
      var nextNodes = [];
      nodes.forEach(function(node) {
        var linked = node;
        if (directive.linkVirtual) {
          linked = directive.linkVirtual(node);
        }
        if (Array.isArray(linked)) {
          nextNodes.push.apply(nextNodes, linked);
        } else {
          nextNodes.push(linked);
        }
      });
      return nextNodes;
    }, [node]);

    linkedNodes.forEach(function(node) {
      var linkedChildren = [];
      node.children.forEach(function(childNode) {
        linkedChildren.push.apply(linkedChildren, linkVisit($injector, childNode, node.$scope));
      });
      node.children = linkedChildren;
    });
  } else {
    node.text = $injector.get('$interpolate')(node.text)(node.$scope);
    linkedNodes = [node];
  }
  return linkedNodes;
}

module.exports = function linkTree($injector, tree, scope) {
  var clone = cloneTree(tree);
  return linkVisit($injector, clone, scope)[0];
}
