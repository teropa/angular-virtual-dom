require('angular/angular');

var VNode         = require('virtual-dom/vnode/vnode');
var VText         = require('virtual-dom/vnode/vtext');
var createElement = require('virtual-dom/create-element');
var diff          = require('virtual-dom/diff');
var patch         = require('virtual-dom/patch');

var forEach = Array.prototype.forEach;
var map     = Array.prototype.map;

angular.module('teropa.vdom', [])
  .directive('vRoot', ['$interpolate', function($interpolate) {

    function VAttrSpec(name, value, interp) {
      this.name = name;
      this.value = value;
      this.interp = interp;
    }
    VAttrSpec.prototype.toVAttr = function(attrs, scope) {
      attrs[this.name] = this.interp ? this.interp(scope) : this.value;
    };

    function VNodeSpec(tagName, attrSpecs) {
      this.tagName = tagName;
      this.attrSpecs = attrSpecs;
      this.children = [];
    }
    VNodeSpec.prototype.addChild = function(childSpec) {
      this.children.push(childSpec);
    };
    VNodeSpec.prototype.toVNode = function(scope) {
      var attrs = {};
      this.attrSpecs.forEach(function(attrSpec) {
        attrSpec.toVAttr(attrs, scope);
      });
      return new VNode(
        this.tagName,
        {attributes: attrs},
        this.children.map(function(c) { return c.toVNode(scope); })
      )
    };

    function VTextSpec(text, interp) {
      this.text = text;
      this.interp = interp;
    }
    VTextSpec.prototype.toVNode = function(scope) {
      if (this.interp) {
        return new VText(this.interp(scope));
      } else {
        return new VText(this.text);
      }
    };

    function visit(node, expressions) {
      var vNodeSpec;
      if (node.nodeType === Node.TEXT_NODE) {
        var text = node.nodeValue;
        var interp = $interpolate(text);
        vNodeSpec = new VTextSpec(text, interp);
        expressions.push.apply(expressions, interp.expressions);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        var attrs = map.call(node.attributes, function(attr) {
          return new VAttrSpec(attr.name, attr.value, $interpolate(attr.value));
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
