/* 
 * This is the app entry point
 * The only thing that it currenlt does is decide if we should load the himeapge or restaurant_info js files.
 */

let isRestaurantInfo = document.body.classList.contains('inside');

if(isRestaurantInfo) {
  require('./restaurant_info.js');
} else {
  require('./homepage.js');
}

/*
 * Register the service worker.
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../sw.js').catch((error) => {
    // registration failed :(
    console.error('ServiceWorker registration failed: ', error);
  });
}