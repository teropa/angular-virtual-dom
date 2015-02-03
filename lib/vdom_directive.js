require('angular/angular');

var camelCase     = require('lodash.camelcase');
var reduce        = require('lodash.reduce');
var find          = require('lodash.find');
var cloneDeep     = require('lodash.clonedeep');

var VNode         = require('virtual-dom/vnode/vnode');
var VText         = require('virtual-dom/vnode/vtext');
var isVNode       = require('virtual-dom/vnode/is-vnode');
var isVText       = require('virtual-dom/vnode/is-vtext');
var createElement = require('virtual-dom/create-element');
var diff          = require('virtual-dom/diff');
var patch         = require('virtual-dom/patch');

var forEach = Array.prototype.forEach;
var map     = Array.prototype.map;

function getAttribute(node, name) {
  if (node.properties && node.properties.attributes) {
    return node.properties.attributes[name];
  }
}

function cloneTree(tree) {
  if (isVNode(tree)) {
    return new VNode(
      tree.tagName,
      cloneDeep(tree.properties),
      tree.children.map(cloneTree)
    );
  } else if (isVText(tree)) {
    return new VText(tree.text);
  }
}

angular.module('teropa.vdom', [])
  .directive('vRoot', ['$injector', '$interpolate', function($injector, $interpolate) {

    function getDirectives(node) {
      var dirs = [];
      Object.keys(node.properties.attributes).forEach(function(attrName) {
        var dName = camelCase(attrName) + 'Directive';
        if ($injector.has(dName)) {
          dirs.push.apply(dirs, $injector.get(dName));
        }
      });
      return dirs;
    }

    function makeTextNode(node) {
      return new VText(node.nodeValue);
    }

    function makeProperties(node) {
      var attrs = {};
      forEach.call(node.attributes, function(attr) {
        attrs[attr.name] = attr.value;
      });
      return {attributes: attrs};
    }

    function makeElementNode(node) {
      var children = map.call(node.childNodes, makeTree);
      return new VNode(node.tagName.toLowerCase(), makeProperties(node), children);
    }

    function makeTree(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return makeTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        return makeElementNode(node);
      }
    }

    function linkVisit(node, scope) {
      node.$scope = scope;
      var linkedNodes;
      if (isVNode(node)) {
        var directives = getDirectives(node);
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

    function linkTree(tree, scope) {
      var clone = cloneTree(tree);
      return linkVisit(clone, scope)[0];
    }

    return {
      compile: function(element) {
        var node = element[0];

        var tree = makeTree(node);
        element.empty();

        return function link(scope, element, attrs) {
          var linkedTree = linkTree(tree, scope);
          var aNode = createElement(linkedTree);
          element.replaceWith(aNode);

          scope.$watch(attrs.vRoot, function() {
            var newTree = linkTree(tree, scope);
            var changes = diff(linkedTree, newTree);
            aNode = patch(aNode, changes);
            linkedTree = newTree;
          });

        };

      }
    };
  }])
  .directive('vRepeat', ['$parse', function($parse) {
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
  }]);
