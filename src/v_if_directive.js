angular.module('teropa.virtualDom.vIf', ['teropa.virtualDom.getAttribute'])
  .directive('vIf', ['$parse', 'getVDomAttribute', function($parse, getVDomAttribute) {
    'use strict';
    return {
      restrict: 'A',
      priority: 600,
      linkVirtual: function(node) {
        var expr = $parse(getVDomAttribute(node, 'v-if'));
        if (expr(node.$scope)) {
          return node;
        } else {
          return [];
        }
      }
    };
  }]);
