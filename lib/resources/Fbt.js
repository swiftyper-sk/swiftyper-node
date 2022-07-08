'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'intl/fbt',

  init: swiftyperMethod({
    method: 'POST',
    path: '/initialize',
  }),
});
