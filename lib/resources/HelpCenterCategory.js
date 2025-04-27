'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'help-center/categories',

  query: swiftyperMethod({
    method: 'POST',
    path: '/query',
  }),

  detail: swiftyperMethod({
    method: 'POST',
    path: '/{category_id}',
  }),
});
