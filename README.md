# angular-virtual-dom

[![npm version](https://badge.fury.io/js/angular-virtual-dom.svg)](http://badge.fury.io/js/angular-virtual-dom)

angular-virtual-dom is an experimental [Virtual DOM](https://github.com/Matt-Esch/virtual-dom) based AngularJS view renderer designed to be used with immutable data structures such as [immutable-js](https://github.com/facebook/immutable-js) and [mori](http://swannodette.github.io/mori/).

angular-virtual-dom lets you use regular AngularJS templates and expressions to bind data to the DOM, but uses Virtual DOM diffing behind the scenes.

angular-virtual-dom supports extensibility using directives - though only with directives that are Virtual DOM aware. That means angular-virtual-dom is not a drop-in substitute for the AngularJS directive compiler, and is meant to be used in limited contexts.

angular-virtual-dom works with AngularJS versions 1.2 and newer.

## Usage

```` js
angular.module('myModule', ['teropa.virtualDom'])
  .controller('MyCtrl', function($timeout) {
    this.myData = Immutable.fromJS({
      cols: [
        {name: 'One', cssClass: 'one', key: 'one'},
        {name: 'Two', cssClass: 'two', key: 'two'}
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
````

```` html
<div ng-controller="MyCtrl as myCtrl">
  <table v-root="myCtrl.myData">
    <thead>
      <th v-repeat="col in myCtrl.myData.get('cols')"
          class="{{col.get('cssClass')}}">
        {{col.get('name')}}
      </th>
    </thead>
    <tbody>
      <tr v-repeat="row in myCtrl.myData.get('rows')"
          class="{{$even ? 'even' : 'odd'}}">
        <th v-repeat="col in myCtrl.myData.get('cols')">
          {{row.get(col.get('key'))}}
        </th>
      </tr>
    </tbody>
  </table>
</div>
````

* `v-root` establishes a Virtual DOM tree. The `table` tag and all of its descendants will be rendered using [virtual-dom](https://github.com/Matt-Esch/virtual-dom), bypassing Angular's own DOM compiler.
* Virtual DOM diffing and patching occurs when `myCtrl.myData` changes. *The whole Virtual DOM tree uses a single (reference) watch*, and only when it fires does the view re-render. The idea is to attach an immutable data structure on the scope, refer to it in `v-root`, and let Virtual DOM diffing take care of updates when new versions of the data structure are produced.
* The expressions within the table are normal AngularJS expressions. However, they are *not being watched*, and are only re-evaluated when diffing is triggered by the containing `v-root`.
* Directives bundled with angular-virtual-dom can be used within the Virtual DOM tree. Custom directives can also be created (see below).

## Installation

### With NPM / Browserify

``` sh
npm install angular-virtual-dom
```

Require the module and include it in your AngularJS modules:

``` js
require('angular-virtual-dom')

angular.module('myModule', ['teropa.virtualDom'])
```

Or just:

``` js
angular.module('myModule', [
  require('angular-virtual-dom')
])
```

### With Bower

The library is available as a Bower dependency:

``` sh
bower install angular-virtual-dom --save
```

After installation, add one of the following to your loaded scripts:

* `angular-virtual-dom/release/angular-virtual-dom.js`
* `angular-virtual-dom/release/angular-virtual-dom.min.js`

Finally, include the `teropa.virtualDom` module in your AngularJS modules:

``` js
angular.module('myModule', ['teropa.virtualDom'])
```

## API

### v-root

Use the `v-root` directive in your Angular templates to establish a Virtual DOM. This will short-circuit Angular's normal DOM compilation and build the Virtual DOM template from the contained elements.

The directive accepts an expression, and changes to that expression's value cause the Virtual DOM tree to be re-rendered:

``` html
<div v-root="baseData">
  <!--
    Nested DOM structures built into a Virtual DOM
    tree
  -->
</div>
```

### Expressions

Within a `v-root`, any AngularJS expressions are evaluated whenever DOM diffing occurs:

``` html
<div v-root="baseData">
  <h1 class="{{anExpression}}">
    {{anotherExpression}}
  </h1>
</div>
```

Typically, though not necessarily, the expressions will access data from the data structure referred to in `v-root`:

``` html
<div v-root="baseData">
  <h1 class="{{baseData.headerClass}}">
    {{baseData.headerText}}
  </h1>
</div>
```

### Directives

#### v-if

Includes the node in the Virtual DOM only when the expression evaluates to a truthy value. Analogous with `ng-if`.

``` html
<div v-root="baseData">
  <h1 v-if="{{baseData.headerText}}">
    {{baseData.headerText}}
  </h1>
</div>
```

#### v-repeat

Includes a collection of nodes in the Virtual DOM, for each item in a collection. Analogous with `ng-repeat`.

Supports at least the following types of collections:
* [immutable-js](https://github.com/facebook/immutable-js) lists, maps, stacks, ordered maps, sets, and ordered sets.
* [mori](http://swannodette.github.io/mori/) lists, seqs, vectors, maps, sets, sorted sets, and queues.
* JavaScript arrays an objects.

Should additionally support any ES6 iterable collections.

Usage with sequential data structures:

``` html
<ul v-root="data">
  <li v-repeat="item in data">
    {{item}}
  </li>
</ul>
```

Usage with associative data structures:

``` html
<ul v-root="data">
  <li v-repeat="(k, v) in data">
    {{k}}: {{v}}
  </li>
</ul>
```

Additionally makes the special variables `$index`, `$even`, and `$odd` available within the template scope.

## Writing Custom Directives

*Note:* The directive API should be considered highly unstable.

Virtual DOM directives are registered as normal AngularJS directives, but must define a `linkVirtual` function in the directive definition object. This should be a *pure function* that take a Virtual DOM node as an argument, and returns a modified Virtual DOM node or collection thereof.

The Virtual DOM nodes used by this library always hold a `$scope` attribute, referring to the current scope. A directive may create a new scope and attach it to the `$scope` attribute of the returned node.

## Usage with Mutable Data Structures

While angular-virtual-dom is designed to be used with immutable data structures, it is not a hard requirement. Regular, mutable JavaScript data structures and objects work just as well.

You will, however, need to manually trigger re-renders by reassigning `v-root` to a new value unless your code does so naturally.

## Contribution

Use Github issues for requests.

## Author

[Tero Parviainen](http://teropa.info) ([@teropa on Twitter](https://twitter.com/teropa))

Leans heavily on [virtual-dom by Matt-Esch](https://github.com/Matt-Esch/virtual-dom).
