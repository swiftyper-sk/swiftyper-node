'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'intl/phrases',

  query: swiftyperMethod({
    method: 'POST',
    path: '/query',
  }),

  upload: swiftyperMethod({
    method: 'POST',
    path: '/upload',
  }),

  raw: swiftyperMethod({
    method: 'GET',
    path: '/raw',
  }),
});
