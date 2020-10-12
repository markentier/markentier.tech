"use strict";

const fs = require("fs");
const path = require("path");
const url = require("url");

const posthtmlAvifWebp = (options) => {
  options = options || {};
  options.root = options.root || ".";

  return (tree) => {
    let baseHref;

    // we always have a <base> tag
    tree.match({ tag: "base" }, (node) => {
      baseHref = node.attrs.href;
      return node
    })

    tree.match({ tag: "img" }, (node) => {
      // prevents infinite recursion
      if (node.skip) return node;
      node.skip = true;

      // clean up for final output: no data attributes needed
      if (node.attrs.hasOwnProperty("data-skip-transform")) {
        delete node.attrs["data-skip-transform"];
        return node;
      }

      // const hasDataSrc = !!node.attrs["data-src"];
      // const nodeSrc = node.attrs["data-src"] || node.attrs.src;
      const nodeSrc = node.attrs.src;

      if (nodeSrc.endsWith(".svg")) return node;
      if (nodeSrc.endsWith(".gif")) return node;

      const imgUrl = parseUrlLike(nodeSrc, baseHref);
      const filePath = path.parse(imgUrl.pathname);
      const fileBase = path.join(filePath.dir, filePath.name);

      // if (hasDataSrc) {
      //   node.attrs["data-src"] = imgUrl.pathname;
      // }else{
      //   node.attrs.src = imgUrl.pathname;
      // }
      node.attrs.src = imgUrl.pathname;

      const pictureNode = {
        tag: "picture",
        attrs: {},
        content: [],
      };

      const avifSrc = fileBase + ".avif";
      const avifLocal = path.join(process.cwd(), options.root, avifSrc);
      if (fs.existsSync(avifLocal)) {
        const avifNode = {
          tag: "source",
          attrs: { srcset: avifSrc, type: "image/avif" },
        };
        pictureNode.content.push(avifNode);
      }

      const webpSrc = fileBase + ".webp";
      const webpLocal = path.join(process.cwd(), options.root, webpSrc);
      if (fs.existsSync(webpLocal)) {
        const webpNode = {
          tag: "source",
          attrs: { srcset: webpSrc, type: "image/webp" },
        };
        pictureNode.content.push(webpNode);
      };

      pictureNode.content.push(node);

      return pictureNode;
    });

    return tree;
  }
};

// const placeholderSrc = (width, height) =>
//   `data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"%3e%3c/svg%3e`;

// does not work for site external images!
const parseUrlLike = (input, baseHref) => {
  if (input.startsWith(baseHref)) {
    return url.parse(input);
  } else {
    return url.parse(path.join(baseHref), input);
  }
};

module.exports = posthtmlAvifWebp;
