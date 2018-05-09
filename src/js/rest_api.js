import idbAPI from './idb_api';
let restaurantsList;
let restaurantReviews;

/**
 * helper for the restaurants api
 */
export default class restAPI {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    return 'http://localhost:1337/';
  }

  /**
   * Fetch all restaurants.
   * Returns a promise. will throw fetch exceptions.
   */
  static async fetchRestaurants() {
    // Make sure we only make this request once.
    if(restaurantsList) return restaurantsList;

    // Fire async tasks before doing anything.
    const cachedRestaurants = idbAPI.getAllRestaurants();
    const fetchedRestaurants = fetch(this.DATABASE_URL + 'restaurants').then(response => response.json());

    // Update the cache after the network request is finished.
    fetchedRestaurants.then(restaurants => {
      idbAPI.addRestaurants(restaurants);
      idbAPI.cleanUpRestaurants(); // Remove old restaurants.
    }).catch(error => console.error(error));

    // Get the restaurants from the cache first, and if it is empty, then wait for the network.
    let restaurants = new Promise(async resolve => {
      if((await cachedRestaurants).length) {
        resolve(cachedRestaurants);
        return;
      }

      resolve(fetchedRestaurants);
    });

    // Save them in a var so we know the request was already made.
    restaurantsList = restaurants;

    return restaurantsList;
  }

  /**
   * Fetch a restaurant by its ID.
   * Returns a promise. will throw fetch exceptions.
   */
  static async fetchRestaurantById(id) {
    // TODO: I need to DRY this a bit.

    // Fire async tasks before doing anything.
    const cachedRestaurant = idbAPI.getRestaurantById(id);
    const fetchedRestaurant = fetch(this.DATABASE_URL + 'restaurants/' + id).then(response => response.json());

    // Update the cache after the network request is finished.
    fetchedRestaurant.then(restaurant => {
      idbAPI.addRestaurant(restaurant);
      idbAPI.cleanUpRestaurants(); // Remove old restaurants.
    }).catch(error => console.error(error));

    // Get the restaurants from the cache first, and if it is empty, then wait for the network.
    // and return it.
    return new Promise(async resolve => {
      if(await cachedRestaurant) {
        resolve(cachedRestaurant);
        return;
      }
      resolve(fetchedRestaurant);
    });
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

  /*
   * Fetch reviews for a specific resttaurant by Id.
   * Returns a promise.
   */
  static async fetchReviewsByRestaurantId(restaurantId) {
    // Make sure we only make this request once.
    if(restaurantReviews) return restaurantReviews;

    // Fire async tasks before doing anything.
    const cachedReviews = idbAPI.getReviewsByRestaurantId(restaurantId);
    const fetchedReviews = fetch(this.DATABASE_URL + 'reviews/?restaurant_id=' + restaurantId).then(response => response.json());

    // Update the cache after the network request is finished.
    fetchedReviews.then(reviews => {
      idbAPI.addReviews(reviews);
      idbAPI.cleanUpReviews(); // Remove old reviews.
    }).catch(error => console.error(error));

    // Get the reviews from the cache first, and if it is empty, then wait for the network.
    let reviews = new Promise(async resolve => {
      if((await cachedReviews).length) {
        resolve(cachedReviews);
        return;
      }

      resolve(fetchedReviews);
    });

    // Save them in a var so we know the request was already made.
    restaurantReviews = reviews;

    return restaurantReviews;
  }

  /*
   * Add a new review to a restaurant by Id and cache it in the local DB.
   */
  static async postReview(data) {
    // Make the network post request.
    const postRequest = fetch(this.DATABASE_URL + 'reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => response.json());

    // Update the cache after the network request is finished.
    postRequest.then(review => {
      idbAPI.addReview(review);
      idbAPI.cleanUpReviews(); // Remove old reviews.
    }).catch(error => console.error(error));

    // Finally return the returned review from the network(with the id and date).
    return postRequest;
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
    return (`/img/${restaurant.photograph}.jpg`);
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
      url: this.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  /*
   * Add a restaurant from favorites by using an id.
   * This function receives two arguments, first one is the ID nad the second one is a boolean that tells the function
   * either to add or remove the restaurant from favorites.
   * 
   * The default for the second agrument is true.
   */
  static async favoriteById(id, favorite = true) {
    // Create the query string based on the `favorite` boolean.
    const queryString = this.DATABASE_URL + 'restaurants/' + id + '/?is_favorite=' + favorite;
    // Save the request for later.
    const request = fetch(queryString, {method: 'POST'}).then(response => response.json());

    // Update the cache after the network request is finished(it will return the entire restaurant).
    request.then(restaurant => {
      idbAPI.addRestaurant(restaurant);
      idbAPI.cleanUpRestaurants(); // Remove old restaurants.
    }).catch(error => console.error(error));

    return request;
  }
}