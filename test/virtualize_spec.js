describe('teropa.virtualDom.virtualize', function() {

  var virtualizeDom;
  beforeEach(module('teropa.virtualDom.virtualize'));
  beforeEach(inject(function(_virtualizeDom_) {
    virtualizeDom = _virtualizeDom_;
  }));

  it('virtualizes a single node', function() {
    var dom = angular.element('<div></div>');
    var result = virtualizeDom(dom[0]);
    expect(result).toBeDefined();
    expect(virtualDom.isVNode(result)).toBe(true);
    expect(result.tagName).toBe('div');
  });

  it('virtualizes attributes', function() {
    var dom = angular.element('<div class="test"></div>');
    var result = virtualizeDom(dom[0]);
    expect(result.properties.attributes.class).toBe('test');
  });

  it('virtualizes valueless attributes', function() {
    var dom = angular.element('<div readonly></div>');
    var result = virtualizeDom(dom[0]);
    expect(result.properties.attributes.readonly).toBe('');
  });

  it('virtualizes a node with nested text nodes', function() {
    var dom = angular.element('<h1>Hello</h1>');
    var result = virtualizeDom(dom[0]);
    expect(result.children.length).toBe(1);
    expect(virtualDom.isVText(result.children[0])).toBe(true);
    expect(result.children[0].text).toBe('Hello');
  });

  it('virtualizes a node with nested nodes', function() {
    var dom = angular.element('<h1><a href="#">Hello</a><span>Something</span></h1>');
    var result = virtualizeDom(dom[0]);
    expect(result.children.length).toBe(2);
    expect(virtualDom.isVNode(result.children[0])).toBe(true);
    expect(virtualDom.isVNode(result.children[1])).toBe(true);
  });

  it('strips comments', function() {
    var dom = angular.element('<h1>Hello <!-- Comment --> again</h1>');
    var result = virtualizeDom(dom[0]);
    expect(result.children.length).toBe(2);
    expect(virtualDom.isVText(result.children[0])).toBe(true);
    expect(result.children[0].text).toBe('Hello ');
    expect(virtualDom.isVText(result.children[1])).toBe(true);
    expect(result.children[1].text).toBe(' again');
  });

});
