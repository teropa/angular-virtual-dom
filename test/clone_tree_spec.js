describe('teropa.vdom.cloneTree', function() {

  var cloneVDomTree;
  beforeEach(module('teropa.vdom.cloneTree'));
  beforeEach(inject(function(_cloneVDomTree_) {
    cloneVDomTree = _cloneVDomTree_;
  }));

  it('clones a text node', function() {
    var vText = new virtualDom.VText('Hello');
    var clone = cloneVDomTree(vText);

    expect(clone).not.toBe(vText);
    expect(clone.text).toBe('Hello');
  });

  it('clones an element node', function() {
    var vNode = new virtualDom.VNode('div');
    var clone = cloneVDomTree(vNode);

    expect(clone).not.toBe(vNode);
    expect(clone.tagName).toBe('div');
  });

  it('clones the properties of an element node', function() {
    var vNode = new virtualDom.VNode('div', {
      attributes: {
        style: {
          display: 'none'
        }
      }
    });
    var clone = cloneVDomTree(vNode);

    expect(clone.properties).not.toBe(vNode.properties);
    expect(clone.properties.attributes.style.display).toBe('none');

  });

  it('clones nested structures', function() {
    var root = new virtualDom.VNode('div', {}, [
      new virtualDom.VNode('h1', {}, [
        new virtualDom.VText('Header')
      ]),
      new virtualDom.VText('Some text')
    ]);
    var clone = cloneVDomTree(root);

    expect(root.children.length).toBe(2);
    expect(root.children[0].tagName).toBe('h1');
    expect(root.children[0].children.length).toBe(1);
    expect(root.children[0].children[0].text).toBe('Header');
    expect(root.children[1].text).toBe('Some text')
  });

});
