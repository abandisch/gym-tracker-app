const GymGoerModelUtils = {
  checkRequiredFields(fields, message) {
    let isDefined = true;
    fields.forEach(field => {
      if (typeof field === "undefined") {
        isDefined = false;
      }
    });

    return new Promise((resolve, reject) => {
      if (isDefined === false) {
        console.log('throwing error');
        reject(new Error(message));
      }
      resolve(true);
    });
  }
};

module.exports = GymGoerModelUtils;