"use strict";

const fs = require("fs");
const path = require("path");

const posthtmlAvifWebp = (options) => {
  options = options || {};
  options.root = options.root || ".";

  const imgBaseUrl = process.env.IMG_BASE_URL;

  return (tree) => {
    tree.match({ tag: "img" }, (node) => {
      // prevents infinite recursion
      if (node.skip) return node;
      node.skip = true;

      // clean up for final output: no data attributes needed
      if (node.attrs.hasOwnProperty("data-skip-transform")) {
        delete node.attrs["data-skip-transform"];
        return node;
      }

      const nodeSrc = node.attrs.src;

      // skip SVGs; my current styling breaks the flow (height issue)
      if (nodeSrc.endsWith(".svg")) {
        return node;
      }

      // Add lazy loading to all images without a loading attr:
      if (!node.attrs.loading) {
        node.attrs.loading = "lazy";
      }

      const pictureNode = {
        tag: "picture",
        attrs: {},
        content: [],
      };

      // If/when flow/height issue is fixed:
      // if (nodeSrc.endsWith(".svg")) {
      //   pictureNode.content.push(node);
      //   return pictureNode;
      // }

      const imgRatio = (node.attrs.height / node.attrs.width) * 100;
      pictureNode.attrs.style = `padding-bottom: ${imgRatio}%;`;

      if (nodeSrc.endsWith(".gif")) {
        pictureNode.content.push(node);
        return pictureNode;
      }

      const imgUrl = parseUrlLike(nodeSrc, imgBaseUrl);
      const filePath = path.parse(imgUrl.pathname);
      const fileBase = path.join(filePath.dir, filePath.name);

      node.attrs.src = imgUrl.pathname;

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
      }

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
    return new URL(input);
  } else {
    return new URL(path.join(baseHref, input));
  }
};

module.exports = posthtmlAvifWebp;
