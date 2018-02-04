
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
  getFilters: (obj, allowedFilters) => {
    return allowedFilters.reduce((filters, field) => {
      if (obj[field]) {
        filters[field] = obj[field];
      }
      return filters;
    }, {});
  },
  getLimit: (obj, defaultLimit) => {
    return obj['limit'] ? Number.parseInt(obj['limit']) : defaultLimit;
  }
};

module.exports = { routerUtils };
