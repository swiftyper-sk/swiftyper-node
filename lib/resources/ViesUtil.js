'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'utils/vies',

  checkVatNumber: swiftyperMethod({
    method: 'POST',
    path: '/check-vat-number',
  }),
});
