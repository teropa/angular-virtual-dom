angular.module('teropa.virtualDom.cloneTree', [])
  .factory('cloneVDomTree', function() {
    'use strict';
    return function cloneTree(tree) {
      if (virtualDom.isVNode(tree)) {
        return new virtualDom.VNode(
          tree.tagName,
          angular.copy(tree.properties),
          tree.children.map(cloneTree)
        );
      } else if (virtualDom.isVText(tree)) {
        return new virtualDom.VText(tree.text);
      }
    };
  });
