# Restaurant Reviews
Udacity project for the Mobile Web Specialist Nanodegree Program.

## Instructions
In order to test the project, you can either build and serve it locally or use the hosted version(with the Local Development API Server running on your machine.)

### Test by using my hosted version
This should be pretty simple, just install and run the "Local Development API Server" on your machine and visit: https://restaurant-reviews-26769.firebaseapp.com/

### Build it and test locally
To build and run locally you need to:
1. Build the project and serve it.
2. Run the "Local Development API Server"

#### Step 1: Build the project and serve it.
First clone and install all the dependencies by running:
```
$ npm install
```

Then build and run the local version by running:
```
$ npm run start
```

Now the project is running on localhost:8000 but we have one thing left.

#### Step 2: Run the "Local Development API Server"
Run the "Local Development API Server" which can be found here: https://github.com/udacity/mws-restaurant-stage-3

## Directory guide
All the code resides inside the `src` folder.
In there you will find three sub folders:
 - `assets` - All files and folders will be copied as is into `dist/`
 - `js` - All the javascript files
 - `style` - All the css styles

## Overview and notes
The project is currently in **Stage 3** and complies with the stage 3 rubic:
1. Fully Responsive - **DONE**
2. Fully accessible - **DONE**
3. Pages that were visited are fully accesible offline: **DONE**
4. Lighthohuse audits score(consistently) over 90: **DONE**

NOTE: I intentionally didn't use any polyfills for new features, I intended it to be used in new browsers.