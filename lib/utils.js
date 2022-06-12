'use strict';

const qs = require('qs');

const hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

const OPTIONS_KEYS = ['maxNetworkRetries', 'timeout'];

const DEPRECATED_OPTIONS = {};

const DEPRECATED_OPTIONS_KEYS = Object.keys(DEPRECATED_OPTIONS);

const utils = (module.exports = {
  isOptionsHash(o) {
    return (
      o &&
      typeof o === 'object' &&
      (OPTIONS_KEYS.some((prop) => hasOwn(o, prop)) ||
        DEPRECATED_OPTIONS_KEYS.some((prop) => hasOwn(o, prop)))
    );
  },

  /**
   * Stringifies an Object, accommodating nested objects
   * (forming the conventional key 'parent[child]=value')
   */
  stringifyRequestData: (data) => {
    return qs
      .stringify(data, {
        serializeDate: (d) => Math.floor(d.getTime() / 1000),
      })
      .replace(/%5B/g, '[')
      .replace(/%5D/g, ']');
  },

  /**
   * Outputs a new function with interpolated object property values.
   * Use like so:
   *   const fn = makeURLInterpolator('some/url/{param1}/{param2}');
   *   fn({ param1: 123, param2: 456 }); // => 'some/url/123/456'
   */
  makeURLInterpolator: (() => {
    const rc = {
      '\n': '\\n',
      '"': '\\"',
      '\u2028': '\\u2028',
      '\u2029': '\\u2029',
    };
    return (str) => {
      const cleanString = str.replace(/["\n\r\u2028\u2029]/g, ($0) => rc[$0]);
      return (outputs) => {
        return cleanString.replace(/\{([\s\S]+?)\}/g, ($0, $1) =>
          encodeURIComponent(outputs[$1] || '')
        );
      };
    };
  })(),

  extractUrlParams: (path) => {
    const params = path.match(/\{\w+\}/g);
    if (!params) {
      return [];
    }

    return params.map((param) => param.replace(/[{}]/g, ''));
  },

  /**
   * Return the data argument from a list of arguments
   *
   * @param {object[]} args
   * @returns {object}
   */
  getDataFromArgs(args) {
    if (!Array.isArray(args) || !args[0] || typeof args[0] !== 'object') {
      return {};
    }

    if (!utils.isOptionsHash(args[0])) {
      return args.shift();
    }

    const argKeys = Object.keys(args[0]);

    const optionKeysInArgs = argKeys.filter((key) =>
      OPTIONS_KEYS.includes(key)
    );

    if (
      optionKeysInArgs.length > 0 &&
      optionKeysInArgs.length !== argKeys.length
    ) {
      emitWarning(
        `Options found in arguments (${optionKeysInArgs.join(
          ', '
        )}). Did you mean to pass an options object? See https://github.com/swiftyper-sk/swiftyper-node/wiki/Passing-Options.`
      );
    }

    return {};
  },

  /**
   * Return the options hash from a list of arguments
   */
  getOptionsFromArgs: (args) => {
    const opts = {
      auth: null,
      headers: {},
      settings: {},
    };
    if (args.length > 0) {
      const arg = args[args.length - 1];
      if (typeof arg === 'string') {
        opts.auth = args.pop();
      } else if (utils.isOptionsHash(arg)) {
        const params = {...args.pop()};

        const extraKeys = Object.keys(params).filter(
          (key) => !OPTIONS_KEYS.includes(key)
        );

        if (extraKeys.length) {
          const nonDeprecated = extraKeys.filter((key) => {
            if (!DEPRECATED_OPTIONS[key]) {
              return true;
            }
            const newParam = DEPRECATED_OPTIONS[key];
            if (params[newParam]) {
              throw Error(
                `Both '${newParam}' and '${key}' were provided; please remove '${key}', which is deprecated.`
              );
            }
            /**
             * TODO turn this into a hard error in a future major version (once we have fixed our docs).
             */
            emitWarning(`'${key}' is deprecated; use '${newParam}' instead.`);
            params[newParam] = params[key];
          });
          if (nonDeprecated.length) {
            emitWarning(
              `Invalid options found (${extraKeys.join(', ')}); ignoring.`
            );
          }
        }

        if (Number.isInteger(params.maxNetworkRetries)) {
          opts.settings.maxNetworkRetries = params.maxNetworkRetries;
        }
        if (Number.isInteger(params.timeout)) {
          opts.settings.timeout = params.timeout;
        }
      }
    }
    return opts;
  },

  /**
   * Provide simple "Class" extension mechanism
   */
  protoExtend(sub) {
    const Super = this;
    const Constructor = hasOwn(sub, 'constructor')
      ? sub.constructor
      : function (...args) {
          Super.apply(this, args);
        };

    Object.assign(Constructor, Super);
    Constructor.prototype = Object.create(Super.prototype);
    Object.assign(Constructor.prototype, sub);

    return Constructor;
  },

  /**
   * Remove empty values from an object
   */
  removeNullish: (obj) => {
    if (typeof obj !== 'object') {
      throw new Error('Argument must be an object');
    }

    return Object.keys(obj).reduce((result, key) => {
      if (obj[key] != null) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  /**
   * Normalize standard HTTP Headers:
   * {'foo-bar': 'hi'}
   * becomes
   * {'Foo-Bar': 'hi'}
   */
  normalizeHeaders: (obj) => {
    if (!(obj && typeof obj === 'object')) {
      return obj;
    }

    return Object.keys(obj).reduce((result, header) => {
      result[utils.normalizeHeader(header)] = obj[header];
      return result;
    }, {});
  },

  /**
   * Stolen from https://github.com/marten-de-vries/header-case-normalizer/blob/master/index.js#L36-L41
   * without the exceptions which are irrelevant to us.
   */
  normalizeHeader: (header) => {
    return header
      .split('-')
      .map(
        (text) => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()
      )
      .join('-');
  },

  callbackifyPromiseWithTimeout: (promise, callback) => {
    if (callback) {
      // Ensure callback is called outside of promise stack.
      return promise.then(
        (res) => {
          setTimeout(() => {
            callback(null, res);
          }, 0);
        },
        (err) => {
          setTimeout(() => {
            callback(err, null);
          }, 0);
        }
      );
    }

    return promise;
  },

  /**
   * Allow for special capitalization cases
   */
  pascalToCamelCase: (name) => {
    return name[0].toLowerCase() + name.substring(1);
  },

  emitWarning,

  validateInteger: (name, n, defaultVal) => {
    if (!Number.isInteger(n)) {
      if (defaultVal !== undefined) {
        return defaultVal;
      } else {
        throw new Error(`${name} must be an integer`);
      }
    }

    return n;
  },
});

function emitWarning(warning) {
  if (typeof process.emitWarning !== 'function') {
    return console.warn(
      `Swiftyper: ${warning}`
    ); /* eslint-disable-line no-console */
  }

  return process.emitWarning(warning, 'Swiftyper');
}
