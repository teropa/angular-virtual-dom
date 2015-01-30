require('angular/angular');

var VNode         = require('virtual-dom/vnode/vnode');
var VText         = require('virtual-dom/vnode/vtext');
var createElement = require('virtual-dom/create-element');
var diff          = require('virtual-dom/diff');
var patch         = require('virtual-dom/patch');

var forEach = Array.prototype.forEach;
var map     = Array.prototype.map;

class VAttrSpec {
  constructor(name, fn) {
    this.name = name;
    this.fn = fn;
  }
  toVAttr(attrs, scope) {
    attrs[this.name] = this.fn(scope);
  }
}


class VNodeSpec {
  constructor(tagName, attrSpecs) {
    this.tagName = tagName;
    this.attrSpecs = attrSpecs;
    this.children = [];
  }
  addChild(childSpec) {
    this.children.push(childSpec);
  }
  toVNode(scope) {
    var attrs = {};
    this.attrSpecs.forEach(function(attrSpec) {
      attrSpec.toVAttr(attrs, scope);
    });
    return new VNode(
      this.tagName,
      {attributes: attrs},
      this.children.map(function(c) { return c.toVNode(scope); })
    )
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
  .directive('vRoot', ['$interpolate', function($interpolate) {

    function visit(node, expressions) {
      var vNodeSpec;
      if (node.nodeType === Node.TEXT_NODE) {
        var text = node.nodeValue;
        var interp = $interpolate(text);
        vNodeSpec = new VTextSpec(interp);
        expressions.push.apply(expressions, interp.expressions);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        var attrs = map.call(node.attributes, function(attr) {
          var interp = $interpolate(attr.value);
          expressions.push.apply(expressions, interp.expressions);
          return new VAttrSpec(attr.name, interp);
        });
        vNodeSpec = new VNodeSpec(node.tagName.toLowerCase(), attrs);
        forEach.call(node.childNodes, function(child) {
          vNodeSpec.addChild(visit(child, expressions));
        });
      }
      return vNodeSpec;
    }

    return {
      compile: function(element) {
        var node = element[0];

        var expressions = [];
        var rootSpec = visit(node, expressions);
        element.empty();

        return function link(scope) {
          var tree = rootSpec.toVNode(scope);
          var aNode = createElement(tree);
          element.replaceWith(aNode);

          scope.$watchGroup(expressions, function() {
            var newTree = rootSpec.toVNode(scope);
            var changes = diff(tree, newTree);
            aNode = patch(aNode, changes);
            tree = newTree;
          });
        };

      }
    };
  }]);
