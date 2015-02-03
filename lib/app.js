require('angular/angular');
require('./vdom_directive');

var Immutable = require('immutable');

angular.module('vdomtest', ['teropa.vdom'])
  .controller('MainCtrl', function($interval) {
    var self = this;

    self.myData = Immutable.fromJS({
      cols: [
        {name: 'One', key: 'one', cssClass: 'one'},
        {name: 'Two', key: 'two', cssClass: 'two'}
      ],
      rows: [
        {one: 1, two: 2},
        {one: 3, two: 4}
      ]
    });

    $interval(function() {
      self.myData = self.myData.updateIn(['rows'], function(rows) {
        return rows.push(Immutable.fromJS({one: Math.random(), two: Math.random()}));
      });
    }, 1000)
  });
