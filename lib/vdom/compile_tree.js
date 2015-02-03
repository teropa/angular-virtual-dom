var VNode         = require('virtual-dom/vnode/vnode');
var VText         = require('virtual-dom/vnode/vtext');

var forEach = Array.prototype.forEach;
var map     = Array.prototype.map;

function compileTextNode(node) {
  return new VText(node.nodeValue);
}

function compileProperties(node) {
  var attrs = {};
  forEach.call(node.attributes, function(attr) {
    attrs[attr.name] = attr.value;
  });
  return {attributes: attrs};
}

function compileElementNode(node) {
  var children = map.call(node.childNodes, compileTree);
  return new VNode(node.tagName.toLowerCase(), compileProperties(node), children);
}

function compileTree(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return compileTextNode(node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    return compileElementNode(node);
  }
};

module.exports = compileTree;
