'use strict';

const utils = require('./utils');
const makeRequest = require('./makeRequest');

function swiftyperMethod(spec) {
  return function (...args) {
    const callback = typeof args[args.length - 1] == 'function' && args.pop();

    spec.urlParams = utils.extractUrlParams(
      this.createResourcePathWithSymbols(spec.path || '')
    );

    const promise = makeRequest(this, args, spec, {});

    if (spec.streaming) {
      return utils.makeAsyncIterable(promise);
    }

    return utils.callbackifyPromiseWithTimeout(promise, callback);
  };
}

module.exports = swiftyperMethod;
