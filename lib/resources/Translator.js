'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'utils/translator',

  translate: swiftyperMethod({
    method: 'POST',
    path: '/translate',
  }),
});
