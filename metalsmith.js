var Metalsmith   = require('metalsmith');
var markdown     = require('metalsmith-markdownit');
var assets       = require('metalsmith-assets');
var layouts      = require('metalsmith-layouts');
var collections  = require('metalsmith-collections');

var metalsmith = function( dest ) {
  return Metalsmith(__dirname)
  .source('./documents')
  .clean(false)
  .use(collections({
    artists: 'artists/*.md'
  }))
  .use(markdown())
  .use(layouts({
    engine: 'jade',
    default: 'index.jade',
    pretty: true
  }))
  .use(assets({
      source: './static/img',
      destination: './img' //outputs to build/img
  }))
  .destination( dest );
}

module.exports = metalsmith;
