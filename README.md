# Gym Exercise Tracker

This app lets people that regularly go to the gym track their exercise results in every session, allowing them to review their pervious results, so that with each new session, they can use the results of the previous session as the goal to beat (or match) for the current session. Over time the person going to the gym will be able to see how they have improved. 

### App Usage Walkthrough

To start off, enter in your email address - all recorded information will be associated with your email address, so you can log in from any device and pickup where you left off. 

Then on the 'Select your training session for today' select the type of gym weight lifting training session you would like to complete today. Choices are 'Chest', 'Back', 'Arms' and 'Legs'. 

Once you've selected a training session, go ahead and click the 'Add Exercise' button to add the exercise you're about to do at the gym. For example, if you're doing a 'Chest' session at the gym, you might start off with 'Bench Press' as your first exercise. Go ahead and add 'Bench Press'.

Once you've added your exercise, do you first set at your required weight. When you're done doing your set, click on 'Add Set' in the app to record the weight and reps for that set. If you made a typo, you can click the edit button to the right of the recorded set. Or if you simply don't want to keep that set, just click the delete button to the left of the recorded set.

When you're ready to move on to the next exercise, just add a new exercise and start recording the sets for it. 

When you come back to the gym the following week to do the same training session, the Gym Tracker App will automatically find the exercises you did last week and pre-populate them for you, so you don't have to type them in again. All you need to do is just add a set as per normal to the appropriate exercise. 
Addiionally, the Gym Tracker App will tell you what your best set was during the last session for each of the given exercises, so you know what to set your goal as for this session.

## Minimum Viable Product URL

The MVP will allow you to login with your email, select a training session, add exercises and add/edit/delete sets for each exercise. You'll also be able to change training sessions. However you won't be able to edit/delete the exercises.

MVP URL: https://murmuring-thicket-55410.herokuapp.com/

Travis CI Build Status: [![Build Status](https://travis-ci.org/abandisch/gym-tracker-app.svg?branch=master)](https://travis-ci.org/abandisch/gym-tracker-app)

## Stack

* Client: jQuery
* Web Server: Express
* Database: Mongo
* Tests: Mocha, Chai

## User Stories

- As a gym goer, I want to create a training session, so that I can track my exercises for that session
- As a gym goer, I want to add exercises to a training session, so I can track the weight lifted, number of sets completed and my max reps for that exercise
- As a gym goer, I want to see the results of my last training session (if any), so that I can set my goals (max reps and weight increase) for my current training session
- As a gym goer, I want to view all exercises for a training session, so I can see my results (max reps and weight lifted) for each exercise at a glance
- As a gym goer, I want to record my a set (weight and reps) for an exercise
- As a gym goer/app user, I want to remove an exercise from my training session
- As a gym goer/app user, I want to remove a training session (including any recorded exercises under that training session)
- As a gym goer/app user, I want to update a training session details, so that I can fix mistakes
- As a gym goer/app user, I want to update a exercise details, so that I can fix any mistakes

## User Stories for MVP

- As a gym goer, I want to create a training session, so that I can record my exercises for that training session
- As a gym goer, I want to add exercises to a training session, so I can track the weight lifted, number of sets and my max reps
- As a gym goer, I want to see the results of my last training session (if any), so that I can set my goals (max reps and weight increase) for my current training session
- As a gym goer, I want to record my a set (weight and reps) for an exercise

## MVP Feedback

Feedback on the app has been positive - from a usability and design perspective, the app has been well received. The only negative feedback was due to not being able to edit or delete exercises and/or sets, when a typo was accidentally made, which made tracking the rest of the exercise sets difficult. However this functionality was not included in the MVP.  

## MVP App Screenshots - Mobile View

![Gym Tracker App - MVP Screenshot](https://github.com/abandisch/gym-tracker-app/blob/master/resources/gym-tracker-mvp-screenshots.jpg)

## App Screen List

- Screen for login or registration
- Screen for listing all the training sessions
- Screen for adding/editing a training session
- Screen for adding/editing an exercise to a training session (including number of sets, weight lifted and max reps)

## User Flow Diagram

![Gym Tracker App - User Flow](https://github.com/abandisch/gym-tracker-app/blob/master/resources/user-flow.jpg)

## Wireframes

![Gym Tracker App - Start page and second page](https://github.com/abandisch/gym-tracker-app/blob/master/resources/Mobile_View_Page_1_and_2_templates.png)

![Gym Tracker App - Session page](https://github.com/abandisch/gym-tracker-app/blob/master/resources/Mobile_View_Page_3_templates.png)


