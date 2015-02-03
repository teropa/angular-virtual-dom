module.exports = function getAttribute(node, name) {
  if (node.properties && node.properties.attributes) {
    return node.properties.attributes[name];
  }
};
