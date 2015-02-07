angular.module('teropa.virtualDom.vRepeat', ['teropa.virtualDom.getAttribute', 'teropa.virtualDom.cloneTree'])
  .directive('vRepeat', ['$parse', 'getVDomAttribute', 'cloneVDomTree', function($parse, getVDomAttribute, cloneVDomTree) {
    'use strict';

    var iteratorSymbol = (typeof Symbol !== 'undefined') ? Symbol.iterator : "@@iterator";

    function nth(v, n) {
      if (Array.isArray(v)) {
        return v[n];
      } else if (v[iteratorSymbol]) {
        var iterator = v[iteratorSymbol]();
        var i;
        for (i=0 ; i<n ; i++) {
          iterator.next();
        }
        return iterator.next().value;
      }
    }

    function setIndexEvenOdd(scope, index) {
      scope.$index = index;
      scope.$even = (index % 2 === 0);
      scope.$odd = !scope.$even;
    }

    return {
      restrict: 'A',
      linkVirtual: function(node) {
        var expr = getVDomAttribute(node, 'v-repeat');
        var match = expr.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)\s*$/);
        var lhs = match[1];
        var coll  = match[2];
        match = lhs.match(/^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/);
        var valueIdentifier = match[3] || match[1];
        var keyIdentifier = match[2];

        var repeater = $parse(coll)(node.$scope);
        if (Array.isArray(repeater)) {
          return repeater.map(function(item, index) {
            var repeatNode = cloneVDomTree(node);
            repeatNode.$scope = node.$scope.$new();
            repeatNode.$scope[valueIdentifier] = item;
            setIndexEvenOdd(repeatNode.$scope, index);
            return repeatNode;
          });
        } else if (repeater && repeater[iteratorSymbol]) {
          var iterator = repeater[iteratorSymbol]();
          var result = [];
          var index = 0;
          var value = iterator.next();
          while (!value.done) {
            var item = value.value;
            var repeatNode = cloneVDomTree(node);
            repeatNode.$scope = node.$scope.$new();
            if (keyIdentifier) {
              repeatNode.$scope[keyIdentifier] = nth(item, 0);
              repeatNode.$scope[valueIdentifier] = nth(item, 1);
            } else {
              repeatNode.$scope[valueIdentifier] = item;
            }
            setIndexEvenOdd(repeatNode.$scope, index);
            result.push(repeatNode);
            index++;
            value = iterator.next();
          }
          return result;
        } else if (typeof repeater === 'object' && repeater !== null) {
          return Object.keys(repeater).map(function(key, index) {
            var repeatNode = cloneVDomTree(node);
            repeatNode.$scope = node.$scope.$new();
            repeatNode.$scope[keyIdentifier] = key;
            repeatNode.$scope[valueIdentifier] = repeater[key];
            setIndexEvenOdd(repeatNode.$scope, index);
            return repeatNode;
          });
        } else {
          return [];
        }
      }

    };
  }]);
