'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'sms',

  send: swiftyperMethod({
    method: 'POST',
    path: '/send',
  }),

  retrieve: swiftyperMethod({
    method: 'POST',
    path: '/{message_id}',
  }),

  retry: swiftyperMethod({
    method: 'POST',
    path: '/{message_id}/retry',
  }),

  cancel: swiftyperMethod({
    method: 'POST',
    path: '/{message_id}/cancel',
  }),
});
