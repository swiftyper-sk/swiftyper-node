'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'business',

  query: swiftyperMethod({
    method: 'POST',
    path: '/query',
  }),

  identifier: swiftyperMethod({
    method: 'POST',
    path: '/identifier',
  }),

  detail: swiftyperMethod({
    method: 'POST',
    path: '/{business_id}',
  }),
});
