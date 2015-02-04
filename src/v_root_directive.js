angular.module('teropa.virtualDom.vRoot', ['teropa.virtualDom.virtualize', 'teropa.virtualDom.link'])
  .directive('vRoot', ['$injector', '$interpolate', 'virtualizeDom', 'linkVDom', function($injector, $interpolate, virtualizeDom, linkVDom) {
    'use strict';

    return {
      compile: function(element) {
        var node = element[0];

        var tree = virtualizeDom(node);
        element.empty();

        return function link(scope, element, attrs) {
          var linkedTree = linkVDom(tree, scope);
          var aNode = virtualDom.create(linkedTree);
          element.replaceWith(aNode);

          var doRender;
          function watchAction() {
            if (doRender) {
              var newTree = linkVDom(tree, scope);
              var changes = virtualDom.diff(linkedTree, newTree);
              aNode = virtualDom.patch(aNode, changes);
              linkedTree = newTree;
              doRender = false;
            }
          }

          scope.$watch(attrs.vRoot, function() {
            doRender = true;
            scope.$$postDigest(watchAction);
          });

          scope.$on('$destroy', function() {
            angular.element(aNode).remove();
          });

        };

      }
    };
  }]);
