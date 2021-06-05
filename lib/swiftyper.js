'use strict';

const resources = require('./resources');

const DEFAULT_HOST = 'api.swiftyper.sk';
const DEFAULT_PORT = '443';
const DEFAULT_BASE_PATH = '/v1/';

const DEFAULT_TIMEOUT = 8000;

const MAX_NETWORK_RETRY_DELAY_SEC = 2;
const INITIAL_NETWORK_RETRY_DELAY_SEC = 0.5;

const ALLOWED_CONFIG_PROPERTIES = [
  'maxNetworkRetries',
  'timeout',
  'host',
  'port',
  'protocol',
];

const EventEmitter = require('events').EventEmitter;
const utils = require('./utils');

Swiftyper.SwiftyperResource = require('./SwiftyperResource');
Swiftyper.resources = resources;

function Swiftyper(key, config = {}) {
  if (!(this instanceof Swiftyper)) {
    return new Swiftyper(key, config);
  }

  const props = this._getPropsFromConfig(config);

  Object.defineProperty(this, '_emitter', {
    value: new EventEmitter(),
    enumerable: false,
    configurable: false,
    writable: false,
  });

  this.on = this._emitter.on.bind(this._emitter);
  this.once = this._emitter.once.bind(this._emitter);
  this.off = this._emitter.removeListener.bind(this._emitter);

  if (
    props.protocol &&
    props.protocol !== 'https' &&
    (!props.host || /\.swiftyper\.(cz|pl|sk)/.test(props.host))
  ) {
    throw new Error(
      'The `https` protocol must be used when sending requests to Swiftyper'
    );
  }

  this._api = {
    auth: null,
    host: props.host || DEFAULT_HOST,
    port: props.port || DEFAULT_PORT,
    protocol: props.protocol || 'https',
    basePath: DEFAULT_BASE_PATH,
    timeout: utils.validateInteger('timeout', props.timeout, DEFAULT_TIMEOUT),
    maxNetworkRetries: utils.validateInteger(
      'maxNetworkRetries',
      props.maxNetworkRetries,
      0
    ),
  };

  this._prepResources();
  this._setApiKey(key);

  this.errors = require('./Error');

  this.SwiftyperResource = Swiftyper.SwiftyperResource;
}

Swiftyper.errors = require('./Error');

Swiftyper.prototype = {
  /**
   * @private
   */
  _setApiKey(key) {
    if (key) {
      this._setApiField('auth', key);
    }
  },

  /**
   * @private
   */
  _setApiField(key, value) {
    this._api[key] = value;
  },

  /**
   * @private
   */
  getApiField(key) {
    return this._api[key];
  },

  getMaxNetworkRetries() {
    return this.getApiField('maxNetworkRetries');
  },

  getMaxNetworkRetryDelay() {
    return MAX_NETWORK_RETRY_DELAY_SEC;
  },

  getInitialNetworkRetryDelay() {
    return INITIAL_NETWORK_RETRY_DELAY_SEC;
  },

  /**
   * @private
   */
  _prepResources() {
    for (const name in resources) {
      this[utils.pascalToCamelCase(name)] = new resources[name](this);
    }
  },

  /**
   * @private
   */
  _getPropsFromConfig(config) {
    if (!config) {
      return {};
    }

    const isObject = config === Object(config) && !Array.isArray(config);

    if (!isObject) {
      throw new Error('Config must be an object');
    }

    const values = Object.keys(config).filter(
      (value) => !ALLOWED_CONFIG_PROPERTIES.includes(value)
    );

    if (values.length > 0) {
      throw new Error(
        `Config object may only contain the following: ${ALLOWED_CONFIG_PROPERTIES.join(
          ', '
        )}`
      );
    }

    return config;
  },
};

module.exports = Swiftyper;

module.exports.Swiftyper = Swiftyper;

module.exports.default = Swiftyper;
