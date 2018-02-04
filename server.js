'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const app = express();

const { DATABASE_URL, PORT } = require('./config');
const { GymGoer } = require('./models/GymGoerModel');

// Router
const gymTrackerRouter = require('./routers/gymTrackerRouter');

// Logs
app.use(morgan('tiny'));

// Static files
app.use(express.static('public'));

// Home page
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

// Handle /gym-tracker route
app.use('/gym-tracker', gymTrackerRouter);

// Start / Stop Server
let server;
function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`\n  === App is listening on port ${port} ===\n`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('\n  === Closing server ===\n');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}


if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}


module.exports = {app, runServer, closeServer};