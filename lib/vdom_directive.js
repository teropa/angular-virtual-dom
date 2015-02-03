require('angular/angular');

angular.module('teropa.vdom', [])
  .directive('vRoot', require('./vdom/v_root_directive'))
  .directive('vRepeat', require('./vdom/v_repeat_directive'));
