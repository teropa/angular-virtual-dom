vdomFiles = {
  lib: [
    'lib/virtual-dom.js'
  ],
  src: [
    'src/get_attribute.js',
    'src/clone_tree.js',
    'src/virtualize.js',
    'src/link.js',
    'src/v_if_directive.js',
    'src/v_repeat_directive.js',
    'src/v_root_directive.js',
    'src/angular-vdom.js',
  ],
  testLib: [
    'lib/immutable.js',
    'lib/mori.js'
  ],
  test: [
    'test/*spec.js'
  ],
  angular: function(version) {
    return [
      'lib/angular-' + version + '/angular.js',
      'lib/angular-' + version + '/angular-mocks.js'
    ];
  }
};

if (exports) {
  exports.files = vdomFiles;
}
