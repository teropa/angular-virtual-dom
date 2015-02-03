require('angular/angular');

var camelCase     = require('lodash.camelcase');
var reduce        = require('lodash.reduce');
var find          = require('lodash.find');

var VNode         = require('virtual-dom/vnode/vnode');
var VText         = require('virtual-dom/vnode/vtext');
var createElement = require('virtual-dom/create-element');
var diff          = require('virtual-dom/diff');
var patch         = require('virtual-dom/patch');

var forEach = Array.prototype.forEach;
var map     = Array.prototype.map;

class VAttrSpec {
  constructor(name, value, fn) {
    this.name = name;
    this.value = value;
    this.fn = fn;
  }
  toVAttr(attrs, scope) {
    attrs[this.name] = this.fn(scope);
  }
}


class VNodeSpec {
  constructor(tagName, attrSpecs, directives) {
    this.tagName = tagName;
    this.attrSpecs = attrSpecs;
    this.directives = directives;
    this.children = [];
  }
  addChild(childSpec) {
    this.children.push(childSpec);
  }
  getAttrSpec(name) {
    return find(this.attrSpecs, {name: name});
  }
  toVNode(scope) {
    var scopesAndNodes = reduce(this.directives, function(sAndN, directive) {
      if (directive.linkVirtual) {
        var results = [];
        sAndN.forEach(function(scopeAndNode) {
          var scope = scopeAndNode[0];
          var node = scopeAndNode[1];
          results.push.apply(results, directive.linkVirtual(scope, node));
        });
        return results;
      } else if (directive.name === 'vRoot') {
        return sAndN;
      } else {
        throw 'Incompatible directive';
      }
    }, [[scope, this]]);
    return scopesAndNodes.map(function(scopeAndNode) {
      var scope = scopeAndNode[0];
      var node = scopeAndNode[1];
      var attrs = {};
      node.attrSpecs.forEach(function(attrSpec) {
        attrSpec.toVAttr(attrs, scope);
      });
      var children = [];
      node.children.forEach(function(c) {
        var childNodes = c.toVNode(scope);
        if (Array.isArray(childNodes)) {
          children.push.apply(children, childNodes);
        } else {
          children.push(childNodes);
        }
      });
      return new VNode(
        node.tagName,
        {attributes: attrs},
        children
      )
    });
  }
}


class VTextSpec {
  constructor(fn) {
    this.fn = fn;
  }
  toVNode(scope) {
    return new VText(this.fn(scope));
  }
}


angular.module('teropa.vdom', [])
  .directive('vRoot', ['$injector', '$interpolate', function($injector, $interpolate) {

    function makeTextNodeSpec(node) {
      var fn = $interpolate(node.nodeValue);
      return new VTextSpec(fn);
    }

    function makeAttributeSpecs(node) {
      return map.call(node.attributes, function(attr) {
        var fn = $interpolate(attr.value);
        return new VAttrSpec(attr.name, attr.value, fn);
      });
    }

    function getDirectives(node) {
      var dirs = [];
      forEach.call(node.attributes, function(attr) {
        var dName = camelCase(attr.name) + 'Directive';
        if ($injector.has(dName)) {
          dirs.push.apply(dirs, $injector.get(dName));
        }
      });
      return dirs;
    }

    function makeElementNodeSpec(node) {
      var vNodeSpec = new VNodeSpec(node.tagName.toLowerCase(), makeAttributeSpecs(node), getDirectives(node));
      forEach.call(node.childNodes, function(child) {
        vNodeSpec.addChild(makeTreeSpec(child));
      });
      return vNodeSpec;
    }

    function makeTreeSpec(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return makeTextNodeSpec(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        return makeElementNodeSpec(node);
      }
    }

    return {
      compile: function(element) {
        var node = element[0];

        var rootSpec = makeTreeSpec(node);
        element.empty();

        return function link(scope, element, attrs) {
          var tree = rootSpec.toVNode(scope)[0];
          var aNode = createElement(tree);
          element.replaceWith(aNode);

          scope.$watch(attrs.vRoot, function() {
            var newTree = rootSpec.toVNode(scope)[0];
            var changes = diff(tree, newTree);
            aNode = patch(aNode, changes);
            tree = newTree;
          });

        };

      }
    };
  }])
  .directive('vRepeat', ['$parse', function($parse) {

    function mapRepeat(expr, scope, callback) {
      var match = expr.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)\s*$/);
      var alias = match[1];
      var coll  = match[2];
      return $parse(coll)(scope).map(function(item, index) {
        return callback(item, alias, index);
      }).toArray();
    }

    return {
      restrict: 'A',
      linkVirtual: function(scope, nodeSpec) {
        var expr = nodeSpec.getAttrSpec('v-repeat').value;
        return mapRepeat(expr, scope, function(item, alias, index) {
          var childScope = scope.$new();
          childScope[alias] = item;
          childScope.$index = index;
          childScope.$even = (index % 2 === 0);
          childScope.$odd = !childScope.$even;
          return [childScope, nodeSpec];
        });
      }
    };
  }])
  .directive('vClass', ['$parse', function($parse) {
    return {
      linkVirtual: function(scope, nodeSpec) {
        console.log('wat');
        var expr = $parse(nodeSpec.getAttrSpec('v-class').value);
        var classes = expr(scope);
        Object.keys(classes).forEach(function(className) {
          if (classes[className]) {
            var klass = nodeSpec.getAttrSpec('class');
            if (!klass) {
              klass = '';
            }
            klass += ' ' + className;
          }
        });
        return [[scope, nodeSpec]];
      }
    }
  }]);
