# Restaurant Reviews
Udacity project for the Mobile Web Specialist Nanodegree Program.
This project is also hosted at: https://restaurant-reviews-26769.firebaseapp.com/

## Instructions
In order to test the project you can either build and serve it locally or use the hosted version(with the Local Development API Server running on your machine.)

### Build it and test locally
To build and run locally you need to:
1. Build the project and serve it.
2. Run the "Local Development API Server"

#### Step 1: Build the project and serve it.
First clone and install all the dependencies by running:
```
$ npm install
```

Then build it by running
```
$ npm run build
```

Now `cd` into the freshly built project in `dist/` and serve it
```
$ cd dist/
$ python -m SimpleHTTPServer 8000
```

Now the project is running on localhost:8000 but we have one thing left.

#### Step 2: Run the "Local Development API Server"
Run the "Local Development API Server" which can be found here: https://github.com/udacity/mws-restaurant-stage-2

## Test using the hosted version
This should be pretty simple, just install and run the "Local Development API Server" on your machine and visit: https://restaurant-reviews-26769.firebaseapp.com/

## Projects directory guide
All the code resides inside the `src` folder.
In there you will find three sub folders:
 - `assets` - all files and folders will be copied as is into `dist/`
 - `js` - All the javascript files
 - `style` - All the css styles

## Project overview and notes
The project is currently in **Stage 2**, which means that it fully responsive, hopefully, accessible and has a good offline experience, in addition it currently has a consistent score of 78/100/93 on the lighthouse audits: Performance/WPA/A11y

Other than trying to meet the Requirements for this stage, I also tried to improve the UI, and use the latest CSS and JS tech when possible, but there are still some improvements needed in that area.

I intentionally didn't use any pollyfills for new features, i intended it to be used on new browsers.