'use strict';

class SwiftyperError extends Error {
  constructor(raw = {}) {
    super(raw.message);
    this.type = this.constructor.name;

    this.raw = raw;
    this.rawType = raw.type;
    this.code = raw.code;
    this.param = raw.param;
    this.headers = raw.headers;
    this.statusCode = raw.statusCode;
    this.message = raw.message;
  }

  static generate(rawSwiftyperError) {
    switch (rawSwiftyperError.code) {
      case 'over_query_limit':
        return new SwiftyperQuotaError(rawSwiftyperError);
      case 'missing':
        return new SwiftyperMissingError(rawSwiftyperError);
      case 'restricted':
        return new SwiftyperRestrictedError(rawSwiftyperError);
      case 'unexpected_parameter':
        return new SwiftyperUnexpectedParameterError(rawSwiftyperError);
      case 'invalid_request':
        return new SwiftyperInvalidRequestError(rawSwiftyperError);
      case 'invalid_parameter':
        return new SwiftyperInvalidParameterError(rawSwiftyperError);
      case 'missing_parameter':
        return new SwiftyperMissingParameterError(rawSwiftyperError);
      case 'invalid_api_key':
        return new SwiftyperInvalidApiKeyError(rawSwiftyperError);
      case 'rate_limit':
        return new SwiftyperRateLimitError(rawSwiftyperError);
      default:
        return new GenericError({message: 'Unknown Error'});
    }
  }
}

class GenericError extends SwiftyperError {}

class SwiftyperUnexpectedParameterError extends SwiftyperError {}

class SwiftyperRateLimitError extends SwiftyperError {}

class SwiftyperInvalidRequestError extends SwiftyperError {}

class SwiftyperInvalidParameterError extends SwiftyperError {}

class SwiftyperMissingParameterError extends SwiftyperError {}

class SwiftyperInvalidApiKeyError extends SwiftyperError {}

class SwiftyperAPIError extends SwiftyperError {}

class SwiftyperQuotaError extends SwiftyperError {}

class SwiftyperMissingError extends SwiftyperError {}

class SwiftyperRestrictedError extends SwiftyperError {}

class SwiftyperConnectionError extends SwiftyperError {}

module.exports.generate = SwiftyperError.generate;
module.exports.SwiftyperError = SwiftyperError;
module.exports.SwiftyperUnexpectedParameterError =
  SwiftyperUnexpectedParameterError;
module.exports.SwiftypeRateLimitError = SwiftyperRateLimitError;
module.exports.SwiftyperInvalidApiKeyError = SwiftyperInvalidApiKeyError;
module.exports.SwiftyperInvalidParameterError = SwiftyperInvalidParameterError;
module.exports.SwiftyperAPIError = SwiftyperAPIError;
module.exports.SwiftyperMissingError = SwiftyperMissingError;
module.exports.SwiftyperRestrictedError = SwiftyperRestrictedError;
module.exports.SwiftyperConnectionError = SwiftyperConnectionError;
