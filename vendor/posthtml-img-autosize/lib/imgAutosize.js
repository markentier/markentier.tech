const url = require('url');
const path = require('path');
const http = require('http');
const imageSize = require('image-size');
const ratio = require('./ratio.js');

module.exports = {
    default: function (options) {
        options = options || {};
        options.root = options.root || '.';
        options.processEmptySize = options.processEmptySize || false;

        const projectRoot = path.resolve(options.root);
        const imgBaseUrl = process.env.IMG_BASE_URL;

        return function (tree) {
            const htmlRelativePath = path.relative(process.cwd(), path.dirname(tree.options.to || ''));

            const promises = [];

            tree.match({ tag: 'img' }, img => {
                img.attrs = img.attrs || {};

                if (!img.attrs.src) {
                    return img;
                }

                const imagePath = translatePath(projectRoot, htmlRelativePath, imgBaseUrl, img.attrs.src);

                if (!img.attrs.width && options.processEmptySize) {
                    img.attrs.width = 'auto';
                }

                if (!img.attrs.height && options.processEmptySize) {
                    img.attrs.height = 'auto';
                }

                promises.push(
                    // extend with https://github.com/technopagan/sqip
                    getImageDimensions(imagePath).then(dimensions => {
                        dimensions = ratio(
                            { width: img.attrs.width, height: img.attrs.height },
                            dimensions
                        );

                        if (dimensions.width) {
                            img.attrs.width = dimensions.width;
                        }

                        if (dimensions.height) {
                            img.attrs.height = dimensions.height;
                        }
                    })
                );

                return img;
            });

            return Promise.all(promises).then(
                () => tree,
                () => { }
            );
        };
    }
};

function translatePath(projectRoot, htmlRelativePath, imgBaseUrl, imgPath) {
    const img = url.parse(imgPath);
    const imgBase = imgBaseUrl && url.parse(imgBaseUrl);

    if (img.host) {
        if (imgBase && img.host === imgBase.host) {
            imgPath = img.pathname
        } else {
            return imgPath;
        }
    }

    const imgProjectPath = path.resolve('/' + htmlRelativePath, imgPath);
    const imgAbsolutePath = path.join(projectRoot, imgProjectPath);

    return imgAbsolutePath;
}

function getImageDimensions(imgPath) {
    const img = url.parse(imgPath);

    if (!img.host) {
        return new Promise((resolve, reject) => {
            imageSize(imgPath, (err, dimensions) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(dimensions);
                }
            });
        });
    }

    return new Promise((resolve, reject) => {
        http.get(imgPath, response => {
            const chunks = [];

            response
                .on('data', chunk => chunks.push(chunk))
                .on('end', () => resolve(imageSize(Buffer.concat(chunks))));
        }).on('error', reject);
    });
}
