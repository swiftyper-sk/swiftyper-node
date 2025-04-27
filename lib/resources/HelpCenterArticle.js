'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'help-center/articles',

  query: swiftyperMethod({
    method: 'POST',
    path: '/query',
  }),

  popular: swiftyperMethod({
    method: 'POST',
    path: '/popular',
  }),

  detail: swiftyperMethod({
    method: 'POST',
    path: '/{article_id}',
  }),
});
