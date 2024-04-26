/*
 * ERROR HANDLING UTILITY FUNCTIONS
 * 
 */

export function reportWarning(errorHandler, msg) {

  if (errorHandler && errorHandler.warn && errorHandler.warn(msg))
    throw msg;

}

export function reportError(errorHandler, msg) {

  if (errorHandler && errorHandler.error && errorHandler.error(msg))
    throw msg;

}

export function reportFatal(errorHandler, msg) {

  if (errorHandler && errorHandler.fatal)
    errorHandler.fatal(msg);

  throw msg;

}
