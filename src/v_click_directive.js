angular.module('teropa.virtualDom.vClick', ['teropa.virtualDom.getAttribute'])
  .directive('vClick', ['$parse', 'getVDomAttribute', function($parse, getVDomAttribute) {

    function ClickHook(expr, scope) {
      this._onClick = function() {
        scope.$apply(expr);
      }
    }
    ClickHook.prototype.hook = function(node) {
      node.addEventListener('click', this._onClick);
    }
    ClickHook.prototype.unhook = function(node) {
      node.removeEventListener('click', this._onClick);
    }

    return {
      linkVirtual: function(node) {
        var expr = $parse(getVDomAttribute(node, 'v-click'));
        node.properties.onClick = new ClickHook(expr, node.$scope);
        return node;
      }
    };
  }]);
