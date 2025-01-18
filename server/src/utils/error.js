/**
 * Custom error creator utility
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @returns {Error} Custom error object
 */
const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = {
  createError,
};
