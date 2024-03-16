'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'utils/email',

  validate: swiftyperMethod({
    method: 'POST',
    path: '/validate',
  }),
});
