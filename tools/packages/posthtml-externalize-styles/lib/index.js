"use strict";

const fs = require("fs");
const path = require("path");
const pageCssFileName = "p.css";

const factory = (options) => {
  options = options || {};

  return (tree) => {
    tree.match({ tag: "style" }, (node) => {
      const htmlRelativePath = path.relative(process.cwd(), path.dirname(tree.options.to || ''));
      const outputPath = `${htmlRelativePath}/${pageCssFileName}`;
      const nodePath = outputPath.replace(/^public/, "");
      const outputData = node.content.join("");
      fs.writeFileSync(outputPath, outputData);

      const cssNode = {
        tag: "link",
        attrs: {
          rel: "stylesheet",
          href: nodePath,
        },
        content: [],
      };

      return cssNode;
    });

    return tree;
  }
};

module.exports = factory;
