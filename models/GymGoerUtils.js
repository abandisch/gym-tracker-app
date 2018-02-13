/**
 * Validate the parameters
 * @param {Object[]} parameters - Array of parameters
 * @param {string} message - Error message to return if not all all parameters are defined
 * @returns {Promise} - resolved or rejected Promise
 */
const validateParameters = function(parameters, message) {
  return new Promise((resolve, reject) => {
    if (parameters.every(parameter => typeof parameter !== 'undefined') === true) {
      resolve(true);
    }
    reject(new Error(message));
  });
};

const toReadableISODate = function(date) {
  return new Date(date).toISOString().split('T')[0];
};

module.exports = {validateParameters, toReadableISODate};