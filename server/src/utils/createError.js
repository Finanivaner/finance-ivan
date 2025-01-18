/**
 * Creates a custom error object with status code and message
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @returns {Error} Custom error object
 */
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
  error.statusCode = statusCode;

  return error;
};

module.exports = createError;
