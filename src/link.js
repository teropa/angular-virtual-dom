angular.module('teropa.virtualDom.link', ['teropa.virtualDom.cloneTree', 'teropa.virtualDom.directiveNormalize'])
  .factory('linkVDom', ['$injector', '$interpolate', 'directiveNormalize', 'cloneVDomTree', function($injector, $interpolate, directiveNormalize, cloneVDomTree) {
    'use strict';

    function byPriority(a, b) {
      var diff = b.priority - a.priority;
      if (diff !== 0) {
        return diff;
      }
      if (a.name !== b.name) {
        return (a.name < b.name) ? -1 : 1;
      }
      return a.index - b.index;
    }

    function getDirectives(node) {
      var dirs = [];
      if (node.properties && node.properties.attributes) {
        Object.keys(node.properties.attributes).forEach(function(attrName) {
          var dName = directiveNormalize(attrName) + 'Directive';
          if ($injector.has(dName)) {
            dirs.push.apply(dirs, $injector.get(dName));
          }
        });
      }
      return dirs.sort(byPriority);
    }

    function linkVisit(node, scope) {
      node.$scope = scope;
      var linkedNodes;
      if (virtualDom.isVNode(node)) {
        var directives = getDirectives(node);
        linkedNodes = directives.reduce(function(nodes, directive) {
          var nextNodes = [];
          nodes.forEach(function(node) {
            var linked = node;
            if (directive.linkVirtual) {
              linked = directive.linkVirtual(node);
            }
            if (Array.isArray(linked)) {
              nextNodes.push.apply(nextNodes, linked);
            } else if (!linked) {
              nextNodes.push(node);
            } else {
              nextNodes.push(linked);
            }
          });
          return nextNodes;
        }, [node]);

        linkedNodes.forEach(function(node) {
          if (node.properties && node.properties.attributes) {
            Object.keys(node.properties.attributes).forEach(function(attrName) {
              var interpolateFn = $interpolate(node.properties.attributes[attrName]);
              if (interpolateFn) {
                node.properties.attributes[attrName] = interpolateFn(node.$scope);
              }
            });
          }

          var linkedChildren = [];
          node.children.forEach(function(childNode) {
            linkedChildren.push.apply(linkedChildren, linkVisit(childNode, node.$scope));
          });
          node.children = linkedChildren;
        });
      } else {
        node.text = $interpolate(node.text)(node.$scope);
        linkedNodes = [node];
      }
      return linkedNodes;
    }

    return function linkVDom(tree, scope) {
      var clone = cloneVDomTree(tree);
      return linkVisit(clone, scope)[0];
    };

  }]);
