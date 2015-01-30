require('angular/angular');
require('./vdom_directive');


angular.module('vdomtest', ['teropa.vdom'])
  .directive('counter', ['$interval', function($interval) {
    return function link(scope) {
      scope.counter = 0;
      $interval(function() {
        scope.counter++;
      }, 100);
    };
  }])
  .filter('hex', function() {
    return function(n) {
      var s =  n.toString(16);
      if (s.length === 1) {
        return '0' + s;
      } else {
        return s;
      }
    };
  });
