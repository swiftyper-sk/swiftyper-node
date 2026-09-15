'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'help-center/chat',

  stream: swiftyperMethod({
    method: 'POST',
    headers: {Accept: 'text/event-stream'},
    path: '/stream',
    streaming: true,
  }),

  handoff: swiftyperMethod({
    method: 'POST',
    path: '/handoff',
  }),

  contact: swiftyperMethod({
    method: 'POST',
    path: '/handoffs/{request_id}/contact',
  }),

  skip: swiftyperMethod({
    method: 'POST',
    path: '/handoffs/{request_id}/skip',
  }),

  feedback: swiftyperMethod({
    method: 'POST',
    path: '/{session_id}/feedback',
  }),

  end: swiftyperMethod({
    method: 'POST',
    path: '/{session_id}/end',
  }),
});
