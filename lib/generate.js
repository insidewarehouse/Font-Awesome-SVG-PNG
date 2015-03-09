var Promise = require("bluebird"),
  extend = require('extend'),
  getGlyphs = require("./getGlyphs"),
  generateSprites = require("./generateSprites"),
  generateIcon = require("./generateIcon");

function flatten(arr) {
  return arr.reduce(function (a, b) {
    return a.concat(b);
  }, []);
}

function generate(argv) {

  var sizes = (argv.sizes || '').toString().split(',');

  if (argv.color) {
    var colors = argv.color.toString().split(',');
  }

  if (argv.icons) {
    var icons = argv.icons.toString().split(',');
  }

  var createSprites = !!argv.sprites;
  var addPadding = !argv.nopadding;
  var png = !!argv.png;
  var svg = !!argv.svg;
  var optipng = !!argv.optipng;

  return getGlyphs().then(function (glyphs) {

    if (icons) {
      glyphs = glyphs.filter(function (glyph) {
        return icons.indexOf(glyph.id) >= 0;
      });
    }

    var work = [];

    if (colors) {
      var iconConfigs = flatten(glyphs.map(function (glyph) {
        return colors.map(function (color) {
          return extend(true, {}, {
            id: glyph.id,
            advWidth: glyph.data['horiz-adv-x'] || 1536,
            path: glyph.data.d,
            color: color,
            addPadding: addPadding,
            generatePng: png,
            sizes: sizes,
            generateSvg: svg,
            optipng: optipng
          });
        })
      }));

      work.push(Promise.map(iconConfigs, generateIcon, {concurrency: 1}));
    }

    if (createSprites) {
      work.push(generateSprites(glyphs));
    }

    return Promise.all(work).then(function () {
      console.log('All done!');
    });

  });
}

module.exports = generate;