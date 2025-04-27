'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'help-center',

  configuration: swiftyperMethod({
    method: 'POST',
    path: '/configuration',
  }),
});
