const expect = require('chai').expect;
const {TrainingPageStaticContent, TrainingPageHeadingSection} = require('../../src/js/gym-tracker-pages');

describe('# Gym Tracker Pages', function () {
  describe('# TrainingSessionPage.noPreviousDataNote', function () {
    it('should return an empty string if the sessionType is not provided', function () {
      const result = TrainingPageStaticContent.noPreviousDataNote();
      expect(result).to.be.equal('');
    });
    it('should show the heading of the page', function () {
      const result = TrainingPageStaticContent.noPreviousDataNote({sessionType: 'CHEST'});
      expect(result.length).to.be.greaterThan(0);
      expect(result).to.contain('CHEST');
    });
  });

  describe('# TrainingSessionPage.noPreviousDataNote', function () {
    it('should return empty string if the sessionType is not provided', function () {
      const result = TrainingPageHeadingSection.render();
      expect(result).to.be.equal('');
    });
    it('should show the heading of the page', function () {
      const session = {
        sessionType: 'chest',
        sessionDate: new Date()
      };
      const result = TrainingPageHeadingSection.render({session: session});
      expect(result.length).to.be.greaterThan(0);
      expect(result).to.contain('CHEST');
    });
  });

});