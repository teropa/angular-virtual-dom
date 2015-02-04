angular.module('teropa.virtualDom.getAttribute', [])
  .factory('getVDomAttribute', function() {
    'use strict';
    return function getVDomAttribute(node, name) {
      if (node.properties && node.properties.attributes) {
        return node.properties.attributes[name];
      }
    };
  });
