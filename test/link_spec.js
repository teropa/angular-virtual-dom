describe('teropa.virtualDom.link', function() {

  var $rootScope, linkVDom;
  beforeEach(module('teropa.virtualDom.link'));
  beforeEach(module(function($compileProvider) {
    $compileProvider.directive('virtualDirective', function() {
      return {
        linkVirtual: function(node) {
          node.properties = node.properties || {};
          node.properties.attributes = node.properties.attributes || {};
          node.properties.attributes.visited = 'yes';
        }
      };
    });
    $compileProvider.directive('traditionalDirective', function() {
      return {
        link: function() { }
      };
    });
    $compileProvider.directive('returningDirective', function() {
      return {
        linkVirtual: function(node) {
          return new virtualDom.VNode('returned');
        }
      };
    });
    $compileProvider.directive('multiReturningDirective', function() {
      return {
        linkVirtual: function(node) {
          return [
            new virtualDom.VNode('returned'),
            new virtualDom.VNode('returned')
          ];
        }
      };
    });
    $compileProvider.directive('scopeAssigningDirective', function() {
      return {
        linkVirtual: function(node) {
          node.$scope = node.$scope.$new();
          node.$scope.assignedValue = node.properties.attributes['scope-assigning-directive'];
        }
      };
    });
    $compileProvider.directive('scopeAssigningDirective', function() {
      return {
        linkVirtual: function(node) {
          node.$scope = node.$scope.$new();
          node.$scope.assignedValue = node.properties.attributes['scope-assigning-directive'];
        }
      };
    });
    $compileProvider.directive('priority0Directive', function() {
      return {
        priority: 0,
        linkVirtual: function(node) {
          node.$scope.linked = node.$scope.linked || [];
          node.$scope.linked.push(this.name);
        }
      };
    });
    $compileProvider.directive('anotherPriority0Directive', function() {
      return {
        priority: 0,
        linkVirtual: function(node) {
          node.$scope.linked = node.$scope.linked || [];
          node.$scope.linked.push(this.name);
        }
      };
    });
    $compileProvider.directive('priority1Directive', function() {
      return {
        priority: 1,
        linkVirtual: function(node) {
          node.$scope.linked = node.$scope.linked || [];
          node.$scope.linked.push(this.name);
        }
      };
    });
  }));
  beforeEach(inject(function(_$rootScope_, _linkVDom_) {
    $rootScope = _$rootScope_;
    linkVDom = _linkVDom_;
  }));

  it('returns a clone of the given virtual dom', function() {
    var node = new virtualDom.VNode('div');
    var linked = linkVDom(node, $rootScope);

    expect(linked).toBeDefined();
    expect(linked).not.toBe(node);
    expect(virtualDom.isVNode(linked)).toBe(true);
    expect(linked.tagName).toBe('div');
  });

  it('attaches scope to node', function() {
    var node = new virtualDom.VNode('div');
    var linked = linkVDom(node, $rootScope);

    expect(linked.$scope).toBeDefined();
    expect(linked.$scope).toBe($rootScope);
  });

  it('interpolates text nodes', function() {
    var node = new virtualDom.VNode('div', {}, [
      new virtualDom.VText('Hello {{name}}!')
    ]);
    $rootScope.name = 'r2d2';
    var linked = linkVDom(node, $rootScope);

    expect(linked.children[0].text).toBe('Hello r2d2!');
  });

  it('interpolates attributes', function() {
    var node = new virtualDom.VNode('div', {
      attributes: {
        class: 'aClass {{otherClass}}'
      }
    });
    $rootScope.otherClass = 'bClass';
    var linked = linkVDom(node, $rootScope);

    expect(linked.properties.attributes.class).toBe('aClass bClass');
  });

  describe('with directives', function() {

    it('runs directives based on attribute matching', function() {
      var node = new virtualDom.VNode('div', {
        attributes: {
          'virtual-directive': ''
        }
      });
      var linked = linkVDom(node, $rootScope);

      expect(linked.properties.attributes.visited).toBe('yes');
    });

    it('skips directives that do not have a linkVirtual function', function() {
      var node = new virtualDom.VNode('div', {
        attributes: {
          'traditional-directive': ''
        }
      });
      var linked = linkVDom(node, $rootScope);
      expect(linked).toBeDefined();
    });

    it('supports directives that return nodes', function() {
      var node = new virtualDom.VNode('div', {
        attributes: {
          'returning-directive': ''
        }
      });
      var linked = linkVDom(node, $rootScope);

      expect(linked.tagName).toBe('returned');
    });

    it('supports directives that return arrays of nodes', function() {
      var node = new virtualDom.VNode('div', {}, [
        new virtualDom.VNode('div', {
          attributes: {
            'multi-returning-directive': ''
          }
        })
      ]);
      var linked = linkVDom(node, $rootScope);

      expect(linked.children.length).toBe(2);
    });

    it('supports directives that reassign scope to node', function() {
      var node = new virtualDom.VNode('div', {
        attributes: {
          'scope-assigning-directive': 'the assigned value'
        }
      }, [
        new virtualDom.VText('{{assignedValue}}')
      ]);
      var linked = linkVDom(node, $rootScope);

      expect(linked.children[0].text).toBe('the assigned value');
    });

    it('supports multiple directive per node', function() {
      var node = new virtualDom.VNode('div', {
        attributes: {
          'returning-directive': '',
          'virtual-directive': ''
        }
      });
      var linked = linkVDom(node, $rootScope);

      expect(linked.properties.attributes.visited).toBe('yes');

    });

    it('links in priority order', function() {
      var node = new virtualDom.VNode('div', {
        attributes: {
          'priority-0-directive': '',
          'priority-1-directive': ''
        }
      });
      var scope = $rootScope.$new();
      var linked = linkVDom(node, scope);
      expect(scope.linked).toEqual(['priority1Directive', 'priority0Directive']);

      node = new virtualDom.VNode('div', {
        attributes: {
          'priority-1-directive': '',
          'priority-0-directive': ''
        }
      });
      scope = $rootScope.$new();
      linked = linkVDom(node, $rootScope);
      expect(scope.linked).toEqual(['priority1Directive', 'priority0Directive']);
    });

    it('links in alphabetical order when same priority', function() {
      var node = new virtualDom.VNode('div', {
        attributes: {
          'priority-0-directive': '',
          'another-priority-0-directive': ''
        }
      });
      var scope = $rootScope.$new();
      var linked = linkVDom(node, scope);
      expect(scope.linked).toEqual(['anotherPriority0Directive', 'priority0Directive']);

      node = new virtualDom.VNode('div', {
        attributes: {
          'another-priority-0-directive': '',
          'priority-0-directive': ''
        }
      });
      scope = $rootScope.$new();
      linked = linkVDom(node, scope);
      expect(scope.linked).toEqual(['anotherPriority0Directive', 'priority0Directive']);
    });

  });


});
