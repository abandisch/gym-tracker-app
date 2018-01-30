const express = require('express');
const app = express();

// Static files
app.use(express.static('public'));

// Home page
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

// Mock data
app.get('/resources/mock-data', (req, res) => {
  res.sendFile(`${__dirname}/resources/mock-data/data.json`);
});

// Start / Stop Server
let server;
function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`\n  === App is listening on port ${port} ===\n`);
      resolve(server);
    }).on('error', err => {
      reject(err)
    });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('\n  === Closing server ===\n');
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};