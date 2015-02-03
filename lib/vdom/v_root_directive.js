var createElement = require('virtual-dom/create-element');
var diff          = require('virtual-dom/diff');
var patch         = require('virtual-dom/patch');

var compileTree   = require('./compile_tree');
var linkTree      = require('./link_tree');

module.exports = ['$injector', '$interpolate', function($injector, $interpolate) {

  return {
    compile: function(element) {
      var node = element[0];

      var tree = compileTree(node);
      element.empty();

      return function link(scope, element, attrs) {
        var linkedTree = linkTree($injector, tree, scope);
        var aNode = createElement(linkedTree);
        element.replaceWith(aNode);

        var doRender;
        function watchAction() {
          if (doRender) {
            var newTree = linkTree($injector, tree, scope);
            var changes = diff(linkedTree, newTree);
            aNode = patch(aNode, changes);
            linkedTree = newTree;
            doRender = false;
          }
        }

        scope.$watch(attrs.vRoot, function() {
          doRender = true;
          scope.$$postDigest(watchAction);
        });

      };

    }
  };
}];
