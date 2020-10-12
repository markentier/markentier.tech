"use strict";

const factory = (options) => {
  options = options || {};

  return (tree) => {
    // use classes for the alignment;
    // don't forget to define them in your stylesheets
    tree.match([{ tag: "th" }, { tag: "td" }], (node) => {
      node.attrs = node.attrs || {};
      if (node.attrs.align) {
        node.attrs.class = `${node.attrs.class || ""} ${node.attrs.align}`;
        delete node.attrs.align;
      }
      return node;
    });

    return tree;
  }
};

module.exports = factory;
