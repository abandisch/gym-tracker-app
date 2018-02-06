const expect = require('chai').expect;
const {TrainingSessionPage} = require('../../src/js/gym-tracker-pages');

describe('# Gym Tracker Pages', function () {
  describe('# TrainingSessionPage.sessionHeading', function () {
    it('should show the heading of the page', function () {
      const result = TrainingSessionPage.noPreviousDataNote({sessionType: 'CHEST'});
      expect(result.length).to.be.greaterThan(0);
      expect(result).to.contain('CHEST');
    });
  });
});