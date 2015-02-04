describe('teropa.virtualDom.vRepeat', function() {

  var $rootScope, vRepeatDirective;
  beforeEach(module('teropa.virtualDom.vRepeat', 'teropa.virtualDom.link'));
  beforeEach(inject(function(_$rootScope_, _linkVDom_, _vRepeatDirective_) {
    $rootScope = _$rootScope_;
    linkVDom = _linkVDom_;
    vRepeatDirective = _vRepeatDirective_[0];
  }));

  describe('with JS arrays', function() {

    it('repeats for each item', function() {
      testSequential(['a', 'b', 'c']);
    });

    it('does not render when empty', function() {
      testEmptySequential([]);
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(['a', 'b']);
    });

  });

  describe('with JS objects', function() {

    it('repeats for each item', function() {
      testAssociative({a: 1, b: 2});
    });

    it('does not render when empty', function() {
      testEmptyAssociative({});
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven({a: 1, b: 2});
    });

  });

  describe('with immutable lists', function() {

    it('repeats for each item', function() {
      testSequential(Immutable.List.of('a', 'b', 'c'));
    });

    it('does not render when empty', function() {
      testEmptySequential(Immutable.List.of());
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(Immutable.List.of('a', 'b'));
    });

  });

  describe('with immutable maps', function() {

    it('repeats for each item', function() {
      testAssociative(Immutable.Map({a: 1, b: 2}));
    });

    it('does not render when empty', function() {
      testEmptyAssociative(Immutable.Map({}));
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(Immutable.Map({a: 1, b: 2}));
    });

  });

  describe('with immutable stacks', function() {

    it('repeats for each item', function() {
      testSequential(Immutable.Stack.of('a', 'b', 'c'));
    });

    it('does not render when empty', function() {
      testEmptySequential(Immutable.Stack.of());
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(Immutable.Stack.of('a', 'b'));
    });

  });

  describe('with immutable ordered maps', function() {

    it('repeats for each item', function() {
      testAssociative(Immutable.OrderedMap({a: 1, b: 2}));
    });

    it('does not render when empty', function() {
      testEmptyAssociative(Immutable.OrderedMap({}));
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(Immutable.OrderedMap({a: 1, b: 2}));
    });

  });

  describe('with immutable sets', function() {

    it('repeats for each item', function() {
      testSequential(Immutable.Set.of('a', 'b', 'c'));
    });

    it('does not render when empty', function() {
      testEmptySequential(Immutable.Set.of());
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(Immutable.Set.of('a', 'b'));
    });

  });

  describe('with immutable ordered sets', function() {

    it('repeats for each item', function() {
      testSequential(Immutable.OrderedSet.of('a', 'b', 'c'));
    });

    it('does not render when empty', function() {
      testEmptySequential(Immutable.OrderedSet.of());
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(Immutable.OrderedSet.of('a', 'b'));
    });

  });

  describe('with mori lists', function() {

    it('repeats for each item', function() {
      testSequential(mori.list('a', 'b', 'c'));
    });

    it('does not render when empty', function() {
      testEmptySequential(mori.list());
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(mori.list('a', 'b'));
    });

  });

  describe('with mori seqs', function() {

    it('repeats for each item', function() {
      testSequential(mori.seq(mori.list('a', 'b', 'c')));
    });

    it('does not render when empty', function() {
      testEmptySequential(mori.seq(mori.list()));
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(mori.seq(mori.list('a', 'b')));
    });

  });

  describe('with mori vectors', function() {

    it('repeats for each item', function() {
      testSequential(mori.vector('a', 'b', 'c'));
    });

    it('does not render when empty', function() {
      testEmptySequential(mori.vector());
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(mori.vector('a', 'b'));
    });

  });

  describe('with mori maps', function() {

    it('repeats for each item', function() {
      testAssociative(mori.hashMap('a', 1, 'b', 2));
    });

    it('does not render when empty', function() {
      testEmptyAssociative(mori.hashMap());
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(mori.hashMap('a', 1, 'b', 2));
    });

  });

  describe('with mori sets', function() {

    it('repeats for each item', function() {
      testSequential(mori.set(['a', 'b', 'c']));
    });

    it('does not render when empty', function() {
      testEmptySequential(mori.set([]));
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(mori.set(['a', 'b']));
    });

  });

  describe('with mori sorted sets', function() {

    it('repeats for each item', function() {
      testSequential(mori.sortedSet('a', 'b', 'c'));
    });

    it('does not render when empty', function() {
      testEmptySequential(mori.sortedSet());
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(mori.sortedSet('a', 'b'));
    });

  });

  describe('with mori queues', function() {

    it('repeats for each item', function() {
      testSequential(mori.queue('a', 'b', 'c'));
    });

    it('does not render when empty', function() {
      testEmptySequential(mori.queue());
    });

    it('includes indexes, odds, and evens', function() {
      testIndexOddEven(mori.queue('a', 'b'));
    });

  });

  function testSequential(data) {
    var node = new virtualDom.VNode('ul', {}, [
      new virtualDom.VNode('li', {
        attributes: {
          'v-repeat': 'n in data'
        }
      }, [
        new virtualDom.VText('{{n}}')
      ])
    ]);
    node.$scope = $rootScope;
    $rootScope.data = data;

    var result = linkVDom(node, $rootScope);
    expect(result.children.length).toBe(3);
    expect(result.children[0].children[0].text).toBe('a')
    expect(result.children[1].children[0].text).toBe('b')
    expect(result.children[2].children[0].text).toBe('c')
  }

  function testEmptySequential(data) {
    var node = new virtualDom.VNode('ul', {}, [
      new virtualDom.VNode('li', {
        attributes: {
          'v-repeat': 'n in data'
        }
      })
    ]);
    node.$scope = $rootScope;
    $rootScope.data = data;

    var result = linkVDom(node, $rootScope);
    expect(result.children.length).toBe(0);
  }

  function testIndexOddEven(data) {
    var node = new virtualDom.VNode('ul', {}, [
      new virtualDom.VNode('li', {
        attributes: {
          'v-repeat': 'n in data'
        },
      }, [
        new virtualDom.VText('{{$index}}'),
        new virtualDom.VText('{{$even}}'),
        new virtualDom.VText('{{$odd}}')
      ])
    ]);
    node.$scope = $rootScope;
    $rootScope.data = data;

    var result = linkVDom(node, $rootScope);
    expect(result.children[0].children[0].text).toBe('0');
    expect(result.children[0].children[1].text).toBe('true');
    expect(result.children[0].children[2].text).toBe('false');
    expect(result.children[1].children[0].text).toBe('1');
    expect(result.children[1].children[1].text).toBe('false');
    expect(result.children[1].children[2].text).toBe('true');
  }

  function testAssociative(data) {
    var node = new virtualDom.VNode('ul', {}, [
      new virtualDom.VNode('li', {
        attributes: {
          'v-repeat': '(k, v) in data'
        }
      }, [
        new virtualDom.VText('{{k}}'),
        new virtualDom.VText('{{v}}')
      ])
    ]);
    node.$scope = $rootScope;
    $rootScope.data = data;

    var result = linkVDom(node, $rootScope);
    expect(result.children.length).toBe(2);
    expect(result.children[0].children[0].text).toBe('a')
    expect(result.children[0].children[1].text).toBe('1')
    expect(result.children[1].children[0].text).toBe('b')
    expect(result.children[1].children[1].text).toBe('2')
  }

  function testEmptyAssociative(data) {
    var node = new virtualDom.VNode('ul', {}, [
      new virtualDom.VNode('li', {
        attributes: {
          'v-repeat': '(k,v) in data'
        }
      })
    ]);
    node.$scope = $rootScope;
    $rootScope.data = data;

    var result = linkVDom(node, $rootScope);
    expect(result.children.length).toBe(0);
  }


});
