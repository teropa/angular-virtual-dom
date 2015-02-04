angular.module('teropa.vdom.link', ['teropa.vdom.cloneTree'])
  .factory('linkVDom', ['$injector', '$interpolate', 'cloneVDomTree', function($injector, $interpolate, cloneVDomTree) {
    'use strict';

    var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
    var MOZ_HACK_REGEXP = /^moz([A-Z])/;
    var PREFIX_REGEXP = /^((?:x|data)[\:\-_])/i;

    function camelCase(name) {
      return name.
        replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
          return offset ? letter.toUpperCase() : letter;
        }).
        replace(MOZ_HACK_REGEXP, 'Moz$1');
    }

    function directiveNormalize(name) {
      return camelCase(name.replace(PREFIX_REGEXP, ''));
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
      return dirs;
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
