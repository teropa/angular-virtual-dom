describe('teropa.vdom.vRoot', function() {

  var $compile, $rootScope;
  beforeEach(module('teropa.vdom.vRoot'));
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('empties element at compilation', function() {
    var element = angular.element('<div v-root>Stuff</div>');
    $compile(element);
    expect(element.children().length).toBe(0);
  });

  it('renders element at link time', function() {
    var element = angular.element('<div><div v-root>Stuff</div></div>');
    $compile(element)($rootScope);
    expect(element[0].firstChild.childNodes.length).toBe(1);
    expect(element[0].firstChild.firstChild.nodeValue).toBe('Stuff');
  });

  it('uses given scope for linking', function() {
    var element = angular.element('<div><div v-root>{{msg}}</div></div>');
    $rootScope.msg = 'Hello';
    $compile(element)($rootScope);
    expect(element[0].firstChild.firstChild.nodeValue).toBe('Hello');
  });

  it('diffs the dom when root expression changes', function() {
    var element = angular.element('<div><div v-root="msg">{{msg}}</div></div>');
    $rootScope.msg = 'Hello';
    $compile(element)($rootScope);
    $rootScope.$digest();
    expect(element[0].firstChild.firstChild.nodeValue).toBe('Hello');

    $rootScope.msg = 'World';
    $rootScope.$digest();
    expect(element[0].firstChild.firstChild.nodeValue).toBe('World');
  });

  it('does not diff the dom when root expression mutates', function() {
    var element = angular.element('<div><div v-root="stuff">{{stuff[0]}}</div></div>');
    $rootScope.stuff = ['Hello'];
    $compile(element)($rootScope);
    $rootScope.$digest();
    expect(element[0].firstChild.firstChild.nodeValue).toBe('Hello');

    $rootScope.stuff[0] = 'World';
    $rootScope.$digest();
    expect(element[0].firstChild.firstChild.nodeValue).toBe('Hello');
  });

  it('does not diff the dom when inner expressions change', function() {
    var element = angular.element('<div><div v-root>{{msg}}</div></div>');
    $rootScope.msg = 'Hello';
    $compile(element)($rootScope);
    $rootScope.$digest();

    $rootScope.msg = 'World';
    $rootScope.$digest();
    expect(element[0].firstChild.firstChild.nodeValue).toBe('Hello');
  });

  it('cleans up after itself', function() {
    var scope = $rootScope.$new();
    var element = angular.element('<div><div v-root="msg">{{msg}}</div></div>');
    scope.msg = 'Hello';
    $compile(element)(scope);
    scope.$digest();
    expect(element[0].firstChild.firstChild.nodeValue).toBe('Hello');

    scope.msg = 'World';
    scope.$destroy();
    scope.$digest();
    expect(element[0].childNodes.length).toBe(0);
  });

});
