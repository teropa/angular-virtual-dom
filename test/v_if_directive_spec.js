describe('teropa.vdom.vIf', function() {

  var $rootScope, vIfDirective;
  beforeEach(module('teropa.vdom.vIf'));
  beforeEach(inject(function(_$rootScope_, _vIfDirective_) {
    $rootScope = _$rootScope_;
    vIfDirective = _vIfDirective_[0];
  }));

  it('omits the node if expression is falsy', function() {
    var node = new virtualDom.VNode('div', {
      attributes: {
        'v-if': 'isIncluded'
      }
    });
    node.$scope = $rootScope;

    var res = vIfDirective.linkVirtual(node);
    expect(res).toBeDefined();
    expect(res.length).toBe(0);
  });

  it('includes the node if expression is truthy', function() {
    var node = new virtualDom.VNode('div', {
      attributes: {
        'v-if': 'isIncluded'
      }
    });
    node.$scope = $rootScope;

    $rootScope.isIncluded = true;
    var res = vIfDirective.linkVirtual(node);
    expect(res).toBe(node);
  });

});
