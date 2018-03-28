/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const baseUrl = (new URL(window.location.href)).origin;
    return `${baseUrl}/data/restaurants.json`;
  }

  /**
   * Fetch all restaurants.
   * Returns a promise. will throw exceptions if any.
   */
  static async fetchRestaurants() {
    const response =  await (await fetch(this.DATABASE_URL)).json();
    return response.restaurants;
  }

  /**
   * Fetch a restaurant by its ID.
   * Returns a promise. will throw exceptions if any.
   */
  static async fetchRestaurantById(id) {
    const restaurants = await this.fetchRestaurants();
    const result = restaurants.find(r => r.id == id);
    // If no match, throw an error.
    if(!result) throw Error('Restaurant does not exist');

    return result;
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   * Returns a promise. will throw exceptions if any.
   */
  static async fetchRestaurantByCuisine(cuisine) {
    const restaurants = await this.fetchRestaurants();
    // Filter restaurants to have only given cuisine type and return.
    return restaurants.filter(r => r.cuisine_type == cuisine);
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   * Returns a promise. will throw exceptions if any.
   */
  static async fetchRestaurantByNeighborhood(neighborhood) {
    // Fetch all restaurants
    const restaurants = await this.fetchRestaurants();
    // Filter restaurants to have only given neighborhood and return.
    return restaurants.filter(r => r.neighborhood == neighborhood);
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   * Returns a promise. will throw exceptions if any.
   */
  static async fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    // Fetch all restaurants
    let results = await this.fetchRestaurants();

    // filter by cuisine
    if (cuisine != 'all') {
      results = results.filter(r => r.cuisine_type == cuisine);
    }

    // filter by neighborhood
    if (neighborhood != 'all') {
      results = results.filter(r => r.neighborhood == neighborhood);
    }

    return results;
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   * Returns a promise. will throw exceptions if any.
   */
  static async fetchNeighborhoods() {
    // Fetch all restaurants
    let restaurants = await this.fetchRestaurants();

    // Get all neighborhoods from all restaurants
    const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);

    // Remove duplicates from neighborhoods and return.
    return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
  }

  /**
   * Fetch all cuisines with proper error handling.
   * Returns a promise. will throw exceptions if any.
   */
  static async fetchCuisines() {
    // Fetch all restaurants
    let restaurants = await this.fetchRestaurants();

    // Get all cuisines from all restaurants
    const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
  
    // Remove duplicates from cuisines and return.
    return cuisines.filter((v, i) => cuisines.indexOf(v) == i);
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // No need to run this if google maps didn't load, it will break the page.
    if(!window.google) return;

    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }
}

module.exports = DBHelper;