'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'utils/ip',

  info: swiftyperMethod({
    method: 'GET',
    path: '/{ip_address}',
  }),
});
