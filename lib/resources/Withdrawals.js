'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'withdrawals',

  create: swiftyperMethod({
    method: 'POST',
    path: '',
  }),
});
