const url = require('url');
const path = require('path');
const http = require('http');
const https = require('https');
const normalizePath = require('normalize-path');
const imageSize = require('image-size');
const ratio = require('./ratio.js');

module.exports = {
    default: function(options) {
        options = options || {};
        options.root = options.root || '.';
        options.processEmptySize = options.processEmptySize || false;

        const projectRoot = path.resolve(options.root);

        return function(tree) {
            const htmlRelativePath = path.relative(process.cwd(), path.dirname(tree.options.to || ''));

            const promises = [];

            tree.match({ tag: 'img' }, img => {
                img.attrs = img.attrs || {};

                if (!img.attrs.src) {
                    return img;
                }

                if (img.attrs.src.endsWith(".svg")) {
                    return img;
                }

                const hasDimensions =
                    !isNaN(parseInt(img.attrs.width)) &&
                    !isNaN(parseInt(img.attrs.height));
                if (hasDimensions) {
                    return img;
                }

                const imagePath = translatePath(
                    projectRoot, htmlRelativePath, img.attrs.src, options.questionMarkAsVersion
                );

                const hasAuto =
                    img.attrs.width === 'auto' || img.attrs.height === 'auto';
                if (options.processEmptySize) {
                    if (!img.attrs.width) {
                        img.attrs.width = 'auto';
                    }

                    if (!img.attrs.height) {
                        img.attrs.height = 'auto';
                    }
                } else {
                    if (!hasAuto) {
                        return img;
                    }
                }

                promises.push(
                    getImageDimensions(imagePath)
                        .then(dimensions => {
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
                        .catch(e => Promise.reject(e.message))
                );

                return img;
            });

            return Promise.all(promises).then(() => tree);
        };
    }
};

function translatePath(projectRoot, htmlRelativePath, imgPath, isQuestionMarkAsVersion) {
    const img = url.parse(imgPath);

    if (img.host) {
        return imgPath;
    }

    const imgProjectPath = path.join(htmlRelativePath, imgPath);
    let imgAbsolutePath = path.join(projectRoot, imgProjectPath);

    if (isQuestionMarkAsVersion) {
        // Translat dir/file.jpg?v=.. → dir/file.jpg
        imgAbsolutePath = imgAbsolutePath.replace(/\?[^/]*/, '');
    }

    return normalizePath(path.resolve(imgAbsolutePath));
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

    const httpModule = img.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
        httpModule.get(imgPath, response => {
            const chunks = [];

            response
                .on('data', chunk => chunks.push(chunk))
                .on('end', () => resolve(imageSize(Buffer.concat(chunks))));
        }).on('error', reject);
    });
}
