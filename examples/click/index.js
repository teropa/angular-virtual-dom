angular.module('myModule', ['teropa.virtualDom'])
  .controller('RootCtrl', function() {

    this.root = Immutable.Map({
      spades: 1,
      clubs: 1,
      hearts: 1,
      diamonds: 1
    });

    this.increase = function(suit) {
      this.root = this.root.updateIn([suit], function(n) {
        return n + 1;
      });
    };
    this.decrease = function(suit) {
      this.root = this.root.updateIn([suit], function(n) {
        return n - 1;
      });
    };

    this.range = function(suit) {
      return Immutable.Range(0, Math.max(this.root.get(suit), 0));
    }

  });
