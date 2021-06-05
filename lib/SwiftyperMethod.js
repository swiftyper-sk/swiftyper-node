'use strict';

const utils = require('./utils');
const makeRequest = require('./makeRequest');

function swiftyperMethod(spec) {
  return function(...args) {
    const callback = typeof args[args.length - 1] == 'function' && args.pop();

    spec.urlParams = utils.extractUrlParams(
      this.createResourcePathWithSymbols(spec.path || '')
    );

    return utils.callbackifyPromiseWithTimeout(
      makeRequest(this, args, spec, {}),
      callback
    );
  };
}

module.exports = swiftyperMethod;
