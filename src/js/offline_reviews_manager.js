import idbAPI from './idb_api';
import restAPI from './rest_api';
import { createReviewHTML } from './restaurant';

/*
 * This file exports a class that helps us manage reviews that failed to be posted due to network issues.
 * The class will attempt to re-post the reviews untill it succedes.
 */

class OfflineTaskManager {
  constructor() {
    // Save the request for the "offline reviews".
    this.reviewsPromise = idbAPI.getAllOfflineReviews();

    // Render and start a countdown if there are any reviews waiting to be posted.
    this.reviewsPromise.then(reviews => {
      // If there are reviews waiting to be posted then start a countdown for resubmittion.
      if(reviews.length) this.startCountdown();

      // Render the offline reviews to the page.
      this.renderReviews(reviews);
    });
  }

  // Add a review to the local DB.
  // returns a promise.
  addReview(review) {
    return idbAPI.addOfflineReview(review).then(async () => {
      // Update the reviews list.
      this.reviewsPromise = idbAPI.getAllOfflineReviews();

      // Update the DOM.
      this.renderReviews(await this.reviewsPromise);

      // Start a countdown.
      this.startCountdown();
    });
  }

  // Remove a review from the queue.
  // returns a promise.
  removeReviewById(id) {
    return idbAPI.removeOfflineReviewById(id).then(async () => {
      // Update the reviews list.
      this.reviewsPromise = idbAPI.getAllOfflineReviews();

      // Update the DOM.
      this.renderReviews(await this.reviewsPromise);
    });
  }

  // Return the result of the promise we already made.
  // returns a promise.
  getAllReviews() {
    return this.reviewsPromise;
  }

  // Countdown 10 seconds for resubmittion.
  startCountdown() {
    // Using a closure to preserve 'this'.
    setTimeout(() => this.resubmit(), 3000);
  }

  /*
   * Render the reviews to the page.
   * This function should receive the reviews as the first argument.
   */
  renderReviews(reviews) {
    let container = document.getElementById('offline-reviews-list');
    let reviewsHTML = '';
  
    reviews.reverse().forEach(review => {
      review.is_offline = true;
      reviewsHTML += createReviewHTML(review);
    });
  
    container.innerHTML = reviewsHTML;
  }

  /*
   * Resubmit a single review, if the submittion failed then dont do anything, if it succeded then remove it from the queue.
   * Returns a promise for the single review submittion.
   */
  resubmitSingleReview(offlineReview) {
    // Save the id because we need to remove it, but we need it later.
    let id = offlineReview.id;
    
    // Clone the object and remove the id for submittion.
    offlineReview = Object.assign({}, offlineReview, {id: null});

    // return the request promise.
    return restAPI.postReview(offlineReview).then(review => {
      // This will run only if suceeded.
      // Remove the review from the offline db and the DOM.
      this.removeReviewById(id);

      // Add the review to the DOM
      // Create review HTML.
      let reviewHTML = createReviewHTML(review);
  
      // Create a helper element in order to convert the HTML string into a DOM element.
      let helper = document.createElement('div');
      helper.innerHTML = reviewHTML;
  
      // prepend it to the page.
      document.getElementById('reviews-list').prepend(helper.firstChild);
    });
  }

  async resubmit() {
    // Wait for the reviews to arrive.
    const reviews = await this.reviewsPromise;

    // Resubmit each one independently.
    return Promise.all(reviews.map(review => {
      return this.resubmitSingleReview(review);

    })).catch(() => {
      // If a request failed then restart the countdown for resubmittion.
      this.startCountdown();
    });
  }
}

/*
 * Export a singleton.
 */
export default new OfflineTaskManager();