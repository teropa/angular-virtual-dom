var VNode         = require('virtual-dom/vnode/vnode');
var VText         = require('virtual-dom/vnode/vtext');
var isVNode       = require('virtual-dom/vnode/is-vnode');
var isVText       = require('virtual-dom/vnode/is-vtext');
var cloneDeep     = require('lodash.clonedeep');

module.exports = function cloneTree(tree) {
  if (isVNode(tree)) {
    return new VNode(
      tree.tagName,
      cloneDeep(tree.properties),
      tree.children.map(cloneTree)
    );
  } else if (isVText(tree)) {
    return new VText(tree.text);
  }
};
