hhhh is a Virtual DOM based AngularJS view directive, for those situations where you need the extra performance - or clarity - that you get with immutable data structures.

hhhh lets you use regular AngularJS templating and expressions to bind data to the DOM, but uses virtual DOM diffing behind the scenes.

hhhh is designed to be used with immutable data structures such as immutable.js or Mori.

hhhh supports extensibility using directives - though only for directives that are Virtual DOM aware. hhhh is not a drop-in substitute for the AngularJS directive compiler and does not support directives that haven't been designed to be used with Virtual DOM.

## Usage

```` js
angular.module('myModule', ['teropa.hhhh']);
````

```` html
<table v-root="myData">
  <thead>
    <th v-repeat="col in myData.get('cols')"
        class="{{col.get('cssClass')}}">
      {{col.get('name')}}
    </th>
  </thead>
  <tbody>
    <tr v-repeat="row in myData.get('rows')"
        v-class="{even: $even}">
      <th v-repeat="col in myData.get('cols')">
        {{row.get(col.get('key')}}
      </th>
    </tr>
  </tbody>
</table>
````

## Installation

## API

### v-root

### Expressions

### Directives

#### v-if

#### v-show and v-hide

#### v-repeat

Given a repeater expression, clones the DOM node, including all subnodes, once for each item in the repeater. Each cloned instance will be bound to the repeated item with the name specified in the repeater expression.

<li v-repeat="item in items">
  {{item}}
</li>


#### v-class

#### v-style

#### v-bind and v-bind-html

## Writing Custom Directives

## Accessibility

## Events

## Usage with Mutable Data Structures
