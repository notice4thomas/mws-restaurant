/*
 * Importing this file will return a promise to the 'raw' idb connection.
 * This file is also in charge of the installation of the database.
 */
const idb = require('idb');
const name = 'restaurant reviews';
const version = 1;
let database;

// Installation of the database.
function install(upgradeDB) {
  // Create an ObjectStore for the positions.
  upgradeDB.createObjectStore('restaurants', { keyPath: 'id'});
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
module.exports = {
  async add(restaurant) {
    let tx = (await getDatabase()).transaction('restaurants', 'readwrite');
    let store = tx.objectStore('restaurants');

    store.put(restaurant);
    return tx.complete;
  },

  async addMany(restaurantsArray) {
    return Promise.all(restaurantsArray.map(restaurant => this.add(restaurant)));
  },

  async remove(restaurantId) {
    let tx = (await getDatabase()).transaction('restaurants', 'readwrite');
    let store = tx.objectStore('restaurants');

    store.delete(restaurantId);

    return tx.complete;
  },

  async get(id) {
    let tx = (await getDatabase()).transaction('restaurants', 'readwrite');
    let store = tx.objectStore('restaurants');

    return store.get(Number(id));
  },

  async getAll() {
    let tx = (await getDatabase()).transaction('restaurants', 'readwrite');
    let store = tx.objectStore('restaurants');

    return store.getAll();
  },

  // Make sure there only are a max of 30 cached restaurants.
  async cleanUp() {
    let tx = (await getDatabase()).transaction('restaurants', 'readwrite');
    let store = tx.objectStore('restaurants');

    return store.openCursor(null, 'prev').then( cursor => {
      return cursor.advance(30);
    }).then(function deleteRest(cursor) {
      if(!cursor) return;
      cursor.delete();
      return cursor.continue().then(deleteRest);
    });
  }
};