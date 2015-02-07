angular.module('teropa.virtualDom.directiveNormalize', [])
  .factory('directiveNormalize', function() {
    var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
    var MOZ_HACK_REGEXP = /^moz([A-Z])/;
    var PREFIX_REGEXP = /^((?:x|data)[\:\-_])/i;

    function camelCase(name) {
      return name.
        replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
          return offset ? letter.toUpperCase() : letter;
        }).
        replace(MOZ_HACK_REGEXP, 'Moz$1');
    }

    return function directiveNormalize(name) {
      return camelCase(name.replace(PREFIX_REGEXP, ''));
    }
  });
