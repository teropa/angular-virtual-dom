describe('teropa.virtualDom.getAttribute', function() {

  var getVDomAttribute;
  beforeEach(module('teropa.virtualDom.getAttribute'));
  beforeEach(inject(function(_getVDomAttribute_) {
    getVDomAttribute = _getVDomAttribute_;
  }));

  it('returns attribute value of node', function() {
    var node = new virtualDom.VNode('div', {
      attributes: {
        class: 'test'
      }
    });
    expect(getVDomAttribute(node, 'class')).toBe('test');
  });

  it('returns undefined if no attribute present', function() {
    var node = new virtualDom.VNode('div', {
      attributes: {
        class: 'test'
      }
    });
    expect(getVDomAttribute(node, 'other')).toBeUndefined();
  });

  it('returns undefined when no attributes', function() {
    var node = new virtualDom.VNode('div', {});
    expect(getVDomAttribute(node, 'class')).toBeUndefined();
  });

  it('returns undefined when text node', function() {
    var node = new virtualDom.VText('Hi');
    expect(getVDomAttribute(node, 'class')).toBeUndefined();
  });

});
