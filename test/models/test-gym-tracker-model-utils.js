const expect = require('chai').expect;

const GymGoerModelUtils = require('../../models/GymGoerModelUtils');

describe.skip('# GymGoerModelUtils', function () {
  describe('# GymGoerModelUtils.checkRequiredField', function () {
    it('should throw an exception if the field is not defined', function () {
      let field1 = 'test';
      let field2 = 'test';
      return GymGoerModelUtils
        .checkRequiredFields([field1, field2])
        .then((result) => {
          expect(result).not.to.be.an.instanceOf(Boolean);
          expect(result).not.to.equal(true);
        })
        .catch((err) => {
          expect(err).to.be.an.instanceOf(Error);
        })
    });
    it('should resolve if the field is defined');
  });
});