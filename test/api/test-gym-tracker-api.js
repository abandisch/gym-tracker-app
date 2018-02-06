'use strict';

const chai = require('chai');
const expect = chai.expect;
const faker = require('faker');
const chaiHttp = require('chai-http');
const { runServer, closeServer, app } = require('../../server');
const mongoose = require('mongoose');

const {GymGoerModel} = require('../../models/GymGoerModel');
const {TEST_DATABASE_URL} = require('../../config');

const API_URL = '/gym-tracker';

chai.use(chaiHttp);

function seedGymTrackerData() {
  console.info('  ==> seeding gym tracker data');
  const seedData = [];

  for (let i=1; i<=5; i++) {
    seedData.push(generateGymTrackerData());
  }
  // this will return a promise
  return GymGoerModel.insertMany(seedData);
}

function tearDownDb() {
  console.warn('  ==x Deleting database');
  return mongoose.connection.dropDatabase();
}

function generateSessionType() {
  const sessions = ['chest', 'legs', 'arms', 'shoulders', 'back'];
  return sessions[Math.floor(Math.random() * 5)];
}

function generateExerciseName() {
  const exercises = ['bench press', 'leg press', 'barbell rows', 'dips', 'inclined bench press'];
  return exercises[Math.floor(Math.random() * exercises.length)];
}

function generateExercises(howmany) {
  let exercises = [];
  for (let i = 0; i < howmany; i++) {
    exercises.push({
      name: generateExerciseName(),
      sets: generateSets(3)
    })
  }
  return exercises;
}

function generateSets(howmany) {
  let sets = [];
  let weight = Math.floor(Math.random() * 120) + 40;
  for (let i = 1; i <= howmany; i++) {
    sets.push({
      setNumber: i,
      weight: weight,
      reps: Math.floor(Math.random() * 4) + 8
    });
  }
  return sets;
}

function generateGymTrackerData() {
  return {
    email: faker.internet.email(),
    trainingSessions: [
      {
        sessionType: generateSessionType(),
        exercises: generateExercises(Math.floor(Math.random() * 3) + 1)
      }
    ]
  }
}