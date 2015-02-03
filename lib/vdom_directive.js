if (window.angular) {
  window.angular.module('teropa.vdom', [])
    .directive('vRoot', require('./vdom/v_root_directive'))
    .directive('vRepeat', require('./vdom/v_repeat_directive'))
    .directive('vIf', require('./vdom/v_if_directive'))
}
