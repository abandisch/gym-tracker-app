
const routerUtils = {
  // Check for required property
  hasRequiredProperty: (obj, property) => {
    return Object.keys(obj).findIndex(key => key === property) >= 0;
  },
  confirmRequiredProperties: (obj, properties, callback) => {
    const msgs = [];
    properties.forEach(prop => {
      if (!routerUtils.hasRequiredProperty(obj, prop)) {
        const msg = `Missing field: ${prop}`;
        msgs.push(msg);
      }
    });
    if (msgs.length) {
      callback(msgs.join('\n'));
    }
  },
  isValidISODate(dateString) {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) {
      return false;  // Invalid format
    }
    let d = new Date(dateString);
    if(!d.getTime() && d.getTime() !== 0) {
      return false; // Invalid date
    }
    return d.toISOString().slice(0,10) === dateString;
  }
};

module.exports = { routerUtils };
