var Metalsmith = require('metalsmith'),
  markdown = require('metalsmith-markdownit'),
  assets = require('metalsmith-assets'),
  layouts = require('metalsmith-layouts'),
  collections = require('metalsmith-collections'),
  debug = require('metalsmith-debug');

var metalsmith = function(dest) {
  return Metalsmith(__dirname)
  .source('./documents')
  .clean(false)
  .use(debug())
  .use(collections({
    artists: 'artists/*.md'
  }))
  .use(markdown())
  .use(layouts({
    engine: 'pug',
    default: 'index.jade',
    pretty: true
  }))
  .use(assets({
      source: './static/img',
      destination: './img' //outputs to build/img
  }))
  .destination(dest);
}

module.exports = metalsmith;
