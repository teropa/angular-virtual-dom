angular.module('teropa.virtualDom.virtualize', [])
  .factory('virtualizeDom', function() {
    'use strict';

    function virtualizeTextNode(node) {
      return new virtualDom.VText(node.nodeValue);
    }

    function virtualizeProperties(node) {
      var attrs = {};
      Array.prototype.forEach.call(node.attributes, function(attr) {
        attrs[attr.name] = attr.value;
      });
      return {attributes: attrs};
    }

    function virtualizeChildren(node) {
      var children = [];
      Array.prototype.forEach.call(node.childNodes, function(childNode) {
        var childTree = virtualizeTree(childNode);
        if (childTree) {
          children.push(childTree);
        }
      });
      return children;
    }

    function virtualizeElementNode(node) {
      return new virtualDom.VNode(
        node.tagName.toLowerCase(),
        virtualizeProperties(node),
        virtualizeChildren(node)
      );
    }

    function virtualizeTree(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return virtualizeTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        return virtualizeElementNode(node);
      }
    }

    return virtualizeTree;

  });
