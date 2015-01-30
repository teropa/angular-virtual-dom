require('angular/angular');
require('./vdom_directive');


angular.module('vdomtest', ['teropa.vdom'])
  .directive('counter', ['$interval', function($interval) {
    return function link(scope) {
      scope.counter = 0;
      $interval(function() {
        scope.counter++;
      }, 1000);
    };
  }]);
