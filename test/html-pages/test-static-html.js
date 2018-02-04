'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, runServer, closeServer } = require('../../server');
const expect = chai.expect;
const {TEST_DATABASE_URL} = require('../../config');

chai.use(chaiHttp);

describe('# Static HTML files', function () {
  before(function () {
    runServer(TEST_DATABASE_URL);
  });
  after(function () {
    closeServer();
  });

  describe('# Home/Start Page', function () {
    it('should get HTML file with http 200 response code', function () {
      return chai.request(app)
        .get('/')
        .then(function (res) {
          expect(res).to.be.html;
          expect(res).to.have.status(200);
        });
    });
  });

});