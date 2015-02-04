angular.module('teropa.vdom.vIf', ['teropa.vdom.getAttribute'])
  .directive('vIf', ['$parse', 'getVDomAttribute', function($parse, getVDomAttribute) {
    'use strict';
    return {
      restrict: 'A',
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
