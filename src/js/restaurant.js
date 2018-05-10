import restAPI from './rest_api';
import reviewForm from './review_form';

let restaurantId;
let restaurantRequest;
let reviewsRequest;
let isFavorite;

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
function createRestaurantHoursHTML(restaurant) {
  let operatingHoursHTML = '';

  for (let key in restaurant.operating_hours) {
    operatingHoursHTML += '<tr>' +
    `<td>${key}</td>` + 
    `<td>${restaurant.operating_hours[key]}</td>` + 
    '<tr>';
  }

  return operatingHoursHTML;
}

/*
 * Create a stars SVG for the rating.
 */
function createRatingSVG(rating) {
  let starsSVG = '';

  for(let i = 0; i < 5; i++) {
    const star = '<svg width="16" viewBox="0 0 576 512"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>';
    const emptyStar = '<svg width="16" viewBox="0 0 576 512"><path fill="#d9d9d9" d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>';
    // If the index is smaller than the rating, then add a full star, else add an empty one(this loop runs up to 5)
    starsSVG += (i < rating) ? star : emptyStar;
  }

  return starsSVG;
}

/**
 * Create single review HTML and return it.
 */
function createReviewHTML(review) {
  return `<li class="review">
    <article>
      <span class="username">${review.name}</span>
      <span class="rating" role="img" aria-label="Rated ${review.rating} out of 5">${createRatingSVG(review.rating)}</span>
      <span class="date">${(new Date(review.createdAt)).toLocaleString('en-US', { hour12: false })}</span>
      <p class="comments">${review.comments}</p>
    </article>
  </li>`;
}

/*
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews) {
  const container = document.getElementById('reviews-list');
  let reviewsHTML = '';

  reviews.reverse().forEach(review => {
    reviewsHTML += createReviewHTML(review);
  });

  container.innerHTML = reviewsHTML;
}

/*
 * Create responsive image element.
 */
function createImageElement(restaurant) {
  const imgUrl = restAPI.imageUrlForRestaurant(restaurant);
  const picture = document.createElement('picture');
  const largeImage = imgUrl.replace('.', '_large.');
  const mediumImage = imgUrl.replace('.', '_medium.');
  const srcset = `${imgUrl} 800w, ${largeImage} 650w, ${mediumImage} 360w`;
  const sizes = '(min-width: 1460px) 650px, (min-width: 1024px) calc(50vw - 80px), (min-width: 725px) 650px, calc(100vw - 60px)';

  picture.innerHTML = `<source srcset="${srcset.replace(/\.jpg /g, '.webp ')}" sizes="${sizes}">` +
  `<source srcset="${srcset}" sizes="${sizes}">` +
  `<img id="restaurant-img" src="/img/1.jpg" alt="${restaurant.name}" aria-hidden="true">`;

  // Parse it before returning since this is expected to be an Element.
  return picture;
}

/*
 * Converts the strings 'true' or 'false' into booleans, and coerces all the other values according to the "normal" js rules.
 * This function is necesarry because 'is_favorite' that we get from the server can be a boolean, a strgin or undefined...
 */
function stringToBoolean(value) {
  // Validate the input.
  if(typeof value === 'string') {
    if(value !== 'true' && value !== 'false') throw Error('In case of a string the only acceptable values are "true" or "false"');
  }

  // return the right boolean.
  if(value === 'false' || !value) return false;
  return true;
}

/*
 * Create favorite button HTML
 */
function favoriteButtonHTML() {
  if(isFavorite) return '<svg width="28" aria-hidden="true" viewBox="0 0 512 512"><path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>';
  return '<svg width="28" aria-hidden="true" viewBox="0 0 512 512"><path fill="currentColor" d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z"></path></svg>';
}

function favoriteClicked() {
  // Get the button element
  let button = document.getElementById('favorite');
  // Change the icon in the button to a loading icon.
  button.innerHTML = '<svg width="28" aria-hidden="true" viewBox="0 0 512 512" class="loading"><path fill="currentColor" d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg>';
  // Disable the button tp prevent multiple requests.
  button.disabled = true;

  // Make the API request and then update the button.
  restAPI.favoriteById(restaurantId, !isFavorite).then(response => {
    // Update the local favorite indicator.
    isFavorite = stringToBoolean(response.is_favorite);
    button.innerHTML = favoriteButtonHTML();
    button.disabled = false;

    // Set the right aria label.
    if(isFavorite) {
      button.setAttribute('aria-label', 'Remove restaurant from favorites');
    } else {
      button.setAttribute('aria-label', 'Mark restaurant as favorite');
    }
  });
}

/*
 * Set Up thhe favorite button.
 */
function setUpFavoriteButton(restaurant) {
  // Save the button element.
  let favoriteElement = document.getElementById('favorite');

  // Save the state on an external var.
  isFavorite = stringToBoolean(restaurant.is_favorite);

  // Render an the right image for each state.
  favoriteElement.innerHTML = favoriteButtonHTML();

  // If the restaurant is favorited, then change the 'aria-label' to "remove from favorites".
  if(isFavorite) favoriteElement.setAttribute('aria-label', 'Remove restaurant from favorites');

  favoriteElement.addEventListener('click', e => favoriteClicked(e));
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(restaurant) {
  // Set the restaurant's name
  document.getElementById('restaurant-name').innerHTML = restaurant.name;

  // Create the favorite button
  setUpFavoriteButton(restaurant);

  // Set the restaurant's cuisine
  document.getElementById('restaurant-cuisine').innerHTML = restaurant.cuisine_type;

  // Set the restaurant's address
  document.getElementById('restaurant-address').innerHTML = restaurant.address;

  // Set the restaurant's opening hours
  document.getElementById('restaurant-hours').innerHTML = createRestaurantHoursHTML(restaurant);

  // Replace the image placeholder with a responsive photo.
  // If there is no photo then change the placeholder to "no image".
  if(restaurant.photograph === undefined) {
    document.getElementById('restaurant-img').src = '/style/no_photo.svg';
    return;
  }
  document.getElementById('restaurant-img').replaceWith(createImageElement(restaurant));
}

/**
 * Add restaurant name to the breadcrumb navigation menu.
 */
function fillBreadcrumb(restaurant) {
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  document.getElementById('breadcrumb').appendChild(li);
}

/**
 * Get current restaurant from page URL.
 */
async function fetchRestaurantFromURL() {
  // Get a parameter by name from page URL and save it in an external var.
  restaurantId = (new URL(window.location.href)).searchParams.get('id');

  // If there is no id in the url return early and log the error.
  if (!restaurantId) {
    console.error('No restaurant id in URL');
    return;
  }

  // Fetch restaurant.
  restaurantRequest = restAPI.fetchRestaurantById(restaurantId);
  //fetch the reviews for the restaurant.
  reviewsRequest = restAPI.fetchReviewsByRestaurantId(restaurantId);
  fillBreadcrumb(await restaurantRequest);
  fillRestaurantHTML(await restaurantRequest);
  fillReviewsHTML(await reviewsRequest);
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  // Wait for the restaurant info request to finish before running this.
  restaurantRequest.then(restaurant => {
    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: restaurant.latlng,
      scrollwheel: false
    });
    restAPI.mapMarkerForRestaurant(restaurant, self.map);

  }).catch(error => {
    console.error(error);
  });
};

/*
 * Load map on user's request.
 */
window.loadMap = () => {
  // Create and add the script tag.
  let scriptTag = document.createElement('script');
  scriptTag.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBUq4x8U2rGSQtD_Gkl4BAjGxaEqTjFm3M&libraries=places&callback=initMap';
  document.body.appendChild(scriptTag);

  // Change the buttons text and disable it.
  let button = document.getElementById('load-map');
  button.disabled = true;
  button.getElementsByTagName('div')[0].innerHTML = 'Loading map...';
};

// Request the restaurant data and render it.
fetchRestaurantFromURL().catch(error => console.error(error));

// Initialize the form.
new reviewForm(document.getElementById('leave-review'), createReviewHTML);