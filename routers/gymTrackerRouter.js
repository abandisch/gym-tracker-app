const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {GymGoerModel} = new require('../models/GymGoerModel');
const {routerUtils} = require('./routerUtils');

router.get('/', (req, res) => {
  const filters = routerUtils.getFilters(req.query, ['email']);
  const limit = routerUtils.getLimit(req.query, 10);

  GymGoerModel
    .find(filters)
    .limit(limit)
    .then(results => {
      res.json({
        gymGoers: results.map((gymgGoer) => {
          return gymgGoer.serialize();
        })
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({message: 'Internal Server Error'});
    });
});

router.get('/:id', (req, res) => {
  GymGoerModel
    .findById(req.params.id)
    .then(gymGoer => {
      if (gymGoer) {
        res.status(200).json(gymGoer.serialize());
      } else {
        console.log(`Cannot GET gym goer. Invalid id supplied (${req.params.id})`);
        res.status(400).json({ error: 'Invalid id supplied' });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({message: 'Internal Server Error'});
    });
});

module.exports = router;