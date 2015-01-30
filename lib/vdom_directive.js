require('angular/angular');

var VNode         = require('virtual-dom/vnode/vnode');
var VText         = require('virtual-dom/vnode/vtext');
var createElement = require('virtual-dom/create-element');
var diff          = require('virtual-dom/diff');
var patch         = require('virtual-dom/patch');

var forEach = Array.prototype.forEach;

angular.module('teropa.vdom', [])
  .directive('vRoot', ['$interpolate', function($interpolate) {

    function VNodeSpec(tagName) {
      this.tagName = tagName;
      this.children = [];
    }
    VNodeSpec.prototype.addChild = function(childSpec) {
      this.children.push(childSpec);
    };
    VNodeSpec.prototype.toVNode = function(scope) {
      return new VNode(
        this.tagName,
        {},
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

    function visit(node, vNodeSpec, expressions) {
      forEach.call(node.childNodes, function(child) {
        if (child.nodeType === Node.TEXT_NODE) {
          var text = child.nodeValue;
          var interp = $interpolate(text);
          vNodeSpec.addChild(new VTextSpec(text, interp));
          expressions.push.apply(expressions, interp.expressions);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          var childVNode = new VNodeSpec(child.tagName.toLowerCase());
          vNodeSpec.addChild(childVNode);
          visit(child, childVNode, expressions);
        }
      });
    }

    return {
      compile: function(element) {
        var node = element[0];

        var expressions = [];
        var rootSpec = new VNodeSpec(node.tagName.toLowerCase());
        visit(node, rootSpec, expressions);

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
