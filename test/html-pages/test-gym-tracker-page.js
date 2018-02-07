const expect = require('chai').expect;
const {TrainingSessionPage} = require('../../src/js/gym-tracker-pages');

describe('# Gym Tracker Pages', function () {
  describe('# TrainingSessionPage.noPreviousDataNote', function () {
    it('should return null if the sessionType is not provided', function () {
      const result = TrainingSessionPage.noPreviousDataNote();
      expect(result).to.be.equal(null);
    });
    it('should show the heading of the page', function () {
      const result = TrainingSessionPage.noPreviousDataNote({sessionType: 'CHEST'});
      expect(result.length).to.be.greaterThan(0);
      expect(result).to.contain('CHEST');
    });
  });

  describe('# TrainingSessionPage.noPreviousDataNote', function () {
    it('should return null if the sessionType is not provided', function () {
      const result = TrainingSessionPage.sessionHeading();
      expect(result).to.be.equal(null);
    });
    it('should show the heading of the page', function () {
      const result = TrainingSessionPage.sessionHeading({sessionType: 'CHEST'});
      expect(result.length).to.be.greaterThan(0);
      expect(result).to.contain('CHEST');
    });
  });

});