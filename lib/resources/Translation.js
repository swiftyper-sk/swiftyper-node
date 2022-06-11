'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'intl/translations',

  query: swiftyperMethod({
    method: 'POST',
    path: '/query',
  }),

  translate: swiftyperMethod({
    method: 'POST',
    path: '/submit',
  }),

  upload: swiftyperMethod({
    method: 'POST',
    path: '/upload',
  }),

  vote: swiftyperMethod({
    method: 'POST',
    path: '/vote',
  }),

  raw: swiftyperMethod({
    method: 'GET',
    path: '/raw',
  }),

  variationGrid: swiftyperMethod({
    method: 'POST',
    path: '/variationGrid',
  }),
});
