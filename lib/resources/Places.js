'use strict';

const SwiftyperResource = require('../SwiftyperResource');
const swiftyperMethod = SwiftyperResource.method;

module.exports = SwiftyperResource.extend({
  path: 'places',

  query: swiftyperMethod({
    method: 'POST',
    path: '/query',
  }),

  validate: swiftyperMethod({
    method: 'POST',
    path: '/validate',
  }),

  street: swiftyperMethod({
    method: 'POST',
    path: '/street',
  }),

  municipality: swiftyperMethod({
    method: 'POST',
    path: '/municipality',
  }),

  postal: swiftyperMethod({
    method: 'POST',
    path: '/postal',
  }),

  reverse: swiftyperMethod({
    method: 'POST',
    path: '/reverse',
  }),

  regions: swiftyperMethod({
    method: 'POST',
    path: '/regions',
  }),

  counties: swiftyperMethod({
    method: 'POST',
    path: '/counties',
  }),

  municipalities: swiftyperMethod({
    method: 'POST',
    path: '/municipalities',
  }),

  detail: swiftyperMethod({
    method: 'POST',
    path: '/{place_id}',
  }),
});
