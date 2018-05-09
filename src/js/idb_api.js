/*
 * Importing this file will return a promise to the 'raw' idb connection.
 * This file is also in charge of the installation of the database.
 */
import idb from 'idb';
const name = 'restaurant reviews';
const version = 1;
let database;

// Installation of the database.
function install(upgradeDB) {
  // Create the object store for restaurants.
  upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
  // Create the object store for reviews.
  let reviewsOS = upgradeDB.createObjectStore('reviews', { keyPath: 'id' });
  // Create an index for reviews by restaurant Id.
  reviewsOS.createIndex('restaurant_id', 'restaurant_id', { unique: false });
}

// Will return the database promise, or initialize if it wasn't required before.
function getDatabase() {
  if (database) return database;

  database = idb.open(name, version, install);
  return database;
}

/*
 * The API
 */
export default {
  /*
   * Restaurants Methods.
   */
  
  async addRestaurant(restaurant) {
    let tx = (await getDatabase()).transaction('restaurants', 'readwrite');
    let store = tx.objectStore('restaurants');

    store.put(restaurant);
    return tx.complete;
  },

  async addRestaurants(restaurantsArray) {
    return Promise.all(restaurantsArray.map(restaurant => this.addRestaurant(restaurant)));
  },

  async removeRestaurantById(restaurantId) {
    let tx = (await getDatabase()).transaction('restaurants', 'readwrite');
    let store = tx.objectStore('restaurants');

    store.delete(restaurantId);

    return tx.complete;
  },

  async getRestaurantById(id) {
    let tx = (await getDatabase()).transaction('restaurants', 'readwrite');
    let store = tx.objectStore('restaurants');

    return store.get(Number(id));
  },

  async getAllRestaurants() {
    let tx = (await getDatabase()).transaction('restaurants', 'readwrite');
    let store = tx.objectStore('restaurants');

    return store.getAll();
  },

  // Make sure there only are a max of 30 cached restaurants.
  async cleanUpRestaurants() {
    let tx = (await getDatabase()).transaction('restaurants', 'readwrite');
    let store = tx.objectStore('restaurants');

    return store.openCursor(null, 'prev').then( cursor => {
      return cursor.advance(30);
    }).then(function deleteRest(cursor) {
      if(!cursor) return;
      cursor.delete();
      return cursor.continue().then(deleteRest);
    });
  },

  /*
   * Reviews Methods
   */
  
  async addReview(review) {
    let tx = (await getDatabase()).transaction('reviews', 'readwrite');
    let store = tx.objectStore('reviews');

    store.put(review);
    return tx.complete;
  },

  async addReviews(reviewsArray) {
    return Promise.all(reviewsArray.map(review => this.addReview(review)));
  },

  async getReviewsByRestaurantId(restaurantId) {
    let tx = (await getDatabase()).transaction('reviews', 'readwrite');
    let store = tx.objectStore('reviews');
    let index = store.index('restaurant_id');

    return index.getAll(Number(restaurantId));
  },

  // Make sure there only are a max of 10 cached reviews for each restaurant.
  async cleanUpReviews() {
    let tx = (await getDatabase()).transaction('reviews', 'readwrite');
    let store = tx.objectStore('reviews');

    return store.openCursor(null, 'prev').then( cursor => {
      return cursor.advance(15);
    }).then(function deleteRest(cursor) {
      if(!cursor) return;
      cursor.delete();
      return cursor.continue().then(deleteRest);
    });
  },
};