'use strict';

const http = require('http');
const https = require('https');
const path = require('path');

const utils = require('./utils');
const {
  SwiftyperConnectionError,
  SwiftyperError,
  SwiftyperAPIError,
} = require('./Error');

const defaultHttpAgent = new http.Agent({keepAlive: true});
const defaultHttpsAgent = new https.Agent({keepAlive: true});
let requests = 0;

SwiftyperResource.extend = utils.protoExtend;

SwiftyperResource.method = require('./SwiftyperMethod');

const MAX_RETRY_AFTER_WAIT = 60;

function SwiftyperResource(swiftyper) {
  this._swiftyper = swiftyper;

  this.basePath = utils.makeURLInterpolator(
    this.basePath || swiftyper.getApiField('basePath')
  );
  this.resourcePath = this.path;
  this.path = utils.makeURLInterpolator(this.path);

  this.initialize(...arguments);
}

SwiftyperResource.prototype = {
  path: '',

  basePath: null,

  initialize() {},

  requestDataProcessor: null,

  createFullPath(commandPath, urlData) {
    return path
      .join(
        this.basePath(urlData),
        this.path(urlData),
        typeof commandPath == 'function' ? commandPath(urlData) : commandPath
      )
      .replace(/\\/g, '/');
  },

  createResourcePathWithSymbols(pathWithSymbols) {
    return `/${path
      .join(this.resourcePath, pathWithSymbols || '')
      .replace(/\\/g, '/')}`;
  },

  _timeoutHandler(timeout, req) {
    return () => {
      const timeoutErr = new TypeError('ETIMEDOUT');
      timeoutErr.code = 'ETIMEDOUT';

      req.destroy(timeoutErr);
    };
  },

  _responseHandler(req, callback) {
    return (res) => {
      let response = '';

      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        response += chunk;
      });
      res.once('end', () => {
        const headers = res.headers || {};

        const requestEndTime = Date.now();
        const requestDurationMs = requestEndTime - req._requestStart;

        const responseEvent = utils.removeNullish({
          method: req._requestEvent.method,
          path: req._requestEvent.path,
          status: res.statusCode,
          elapsed: requestDurationMs,
          request_start_time: req._requestStart,
          request_end_time: requestEndTime,
        });

        this._swiftyper._emitter.emit('response', responseEvent);

        try {
          response = JSON.parse(response);

          if (response.error) {
            let err;

            response.error.headers = headers;
            response.error.statusCode = res.statusCode;

            if (res.statusCode === 500) {
              err = new SwiftyperAPIError(response.error);
            } else {
              err = SwiftyperError.generate(response.error);
            }
            return callback.call(this, err, null);
          }
        } catch (e) {
          return callback.call(
            this,
            new SwiftyperAPIError({
              message: 'Invalid JSON received from the Swiftyper API',
              response,
              exception: e,
            }),
            null
          );
        }

        Object.defineProperty(response, 'lastResponse', {
          enumerable: false,
          writable: false,
          value: res,
        });
        callback.call(this, null, response);
      });
    };
  },

  _generateConnectionErrorMessage(requestRetries) {
    return `An error occurred with our connection to Swiftyper.${
      requestRetries > 0 ? ` Request was retried ${requestRetries} times.` : ''
    }`;
  },

  _shouldRetry(res, numRetries, maxRetries) {
    if (numRetries >= maxRetries) {
      return false;
    }

    if (!res) {
      return true;
    }

    if (res.headers && res.headers['swiftyper-should-retry'] === 'false') {
      return false;
    }

    if (res.headers && res.headers['swiftyper-should-retry'] === 'true') {
      return true;
    }

    if (res.statusCode === 409) {
      return true;
    }

    if (res.statusCode >= 500) {
      return true;
    }

    return false;
  },

  _getSleepTimeInMS(numRetries, retryAfter = null) {
    const initialNetworkRetryDelay =
      this._swiftyper.getInitialNetworkRetryDelay();
    const maxNetworkRetryDelay = this._swiftyper.getMaxNetworkRetryDelay();

    let sleepSeconds = Math.min(
      initialNetworkRetryDelay * Math.pow(numRetries - 1, 2),
      maxNetworkRetryDelay
    );

    sleepSeconds *= 0.5 * (1 + Math.random());

    sleepSeconds = Math.max(initialNetworkRetryDelay, sleepSeconds);

    if (Number.isInteger(retryAfter) && retryAfter <= MAX_RETRY_AFTER_WAIT) {
      sleepSeconds = Math.max(sleepSeconds, retryAfter);
    }

    return sleepSeconds * 1000;
  },

  _getMaxNetworkRetries(settings = {}) {
    return settings.maxNetworkRetries &&
      Number.isInteger(settings.maxNetworkRetries)
      ? settings.maxNetworkRetries
      : this._swiftyper.getMaxNetworkRetries();
  },

  _makeHeaders(auth, contentLength, method, userSuppliedHeaders) {
    const defaultHeaders = {
      'X-Swiftyper-API-Key': auth || this._swiftyper.getApiField('auth'),
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': contentLength,
    };

    return Object.assign(
      utils.removeNullish(defaultHeaders),
      utils.normalizeHeaders(userSuppliedHeaders)
    );
  },

  _request(method, host, path, data, auth, options = {}, callback) {
    let requestData;

    data.__req = requests++;

    const retryRequest = (requestFn, headers, requestRetries, retryAfter) => {
      return setTimeout(
        requestFn,
        this._getSleepTimeInMS(requestRetries, retryAfter),
        headers,
        requestRetries + 1
      );
    };

    const makeRequest = (headers, numRetries) => {
      const protocol = this._swiftyper.getApiField('protocol');
      const timeout =
        options.settings &&
        Number.isInteger(options.settings.timeout) &&
        options.settings.timeout >= 0
          ? options.settings.timeout
          : this._swiftyper.getApiField('timeout');
      const isInsecureConnection = protocol === 'http';
      const agent = isInsecureConnection ? defaultHttpAgent : defaultHttpsAgent;

      const req = (isInsecureConnection ? http : https).request({
        host: host || this._swiftyper.getApiField('host'),
        port: this._swiftyper.getApiField('port'),
        protocol: protocol + ':',
        path,
        method,
        agent,
        headers,
        ciphers: 'DEFAULT:!aNULL:!eNULL:!LOW:!EXPORT:!SSLv2:!MD5',
      });

      this._swiftyper._lastRequest = req;

      const requestStartTime = Date.now();

      const requestEvent = utils.removeNullish({
        method,
        path,
        request_start_time: requestStartTime,
      });

      const requestRetries = numRetries || 0;

      const maxRetries = this._getMaxNetworkRetries(options.settings);

      req._requestEvent = requestEvent;

      req._requestStart = requestStartTime;

      this._swiftyper._emitter.emit('request', requestEvent);

      req.setTimeout(timeout, this._timeoutHandler(timeout, req));

      req.once('response', (res) => {
        if (this._shouldRetry(res, requestRetries, maxRetries)) {
          return retryRequest(
            makeRequest,
            headers,
            requestRetries,
            ((res || {}).headers || {})['retry-after']
          );
        } else {
          return this._responseHandler(req, callback)(res);
        }
      });

      req.on('error', (error) => {
        if (this._shouldRetry(null, requestRetries, maxRetries)) {
          return retryRequest(makeRequest, headers, requestRetries, null);
        } else {
          if (error.code === 'ETIMEDOUT') {
            return callback.call(
              this,
              new SwiftyperConnectionError({
                message: `Request aborted due to timeout being reached (${timeout}ms)`,
                detail: error,
              })
            );
          }
          return callback.call(
            this,
            new SwiftyperConnectionError({
              message: this._generateConnectionErrorMessage(requestRetries),
              detail: error,
            }),
            null
          );
        }
      });

      req.write(requestData);
      req.end();
    };

    const prepareAndMakeRequest = (error, data) => {
      if (error) {
        return callback(error);
      }

      requestData = data;

      const headers = this._makeHeaders(
        auth,
        requestData.length,
        method,
        options.headers,
        options.settings
      );

      makeRequest(headers);
    };

    if (this.requestDataProcessor) {
      this.requestDataProcessor(
        method,
        data,
        options.headers,
        prepareAndMakeRequest
      );
    } else {
      prepareAndMakeRequest(null, utils.stringifyRequestData(data || {}));
    }
  },
};

module.exports = SwiftyperResource;
