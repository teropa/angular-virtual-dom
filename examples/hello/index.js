angular.module('myModule', ['teropa.virtualDom'])
  .controller('MyCtrl', function($timeout) {
    this.myData = Immutable.fromJS({
      cols: [
        {name: 'One', cssClass: 'one', key: 'one'},
        {name: 'Two', cssClsas: 'two', key: 'two'}
      ],
      rows: [
        {one: 'A1', two: 'B1'},
        {one: 'A2', two: 'B2'}
      ]
    });

    // A new version of the immutable data structure triggers
    // DOM diffing later.
    $timeout(function() {
      this.myData = this.myData.updateIn(['rows'], function(rows) {
        return rows.push(Immutable.Map({one: 'A3', two: 'B3'}));
      });
    }.bind(this), 1000);
  });
