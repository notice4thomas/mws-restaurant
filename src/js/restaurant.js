const restAPI = require('./rest_api');
let restaurantRequest;

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
    const star = '<svg width="14" viewBox="0 0 576 512"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>';
    const emptyStar = '<svg width="14" viewBox="0 0 576 512"><path fill="#c9c9c9" d="M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z"></path></svg>';
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
      <span class="date">${review.date}</span>
      <p class="comments">${review.comments}</p>
    </article>
  </li>`;
}

/*
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(restaurant) {
  console.log(restaurant);
  const container = document.getElementById('reviews-list');
  let reviewsHTML = '';

  if (!restaurant.reviews) {
    reviewsHTML = '<p>No reviews yet!</p>';
    return;
  }

  restaurant.reviews.forEach(review => {
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

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(restaurant) {
  // Set the restaurant's name
  const title = document.getElementById('restaurant-name');
  title.innerHTML = restaurant.name;

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
  // Get a parameter by name from page URL.
  const id = (new URL(window.location.href)).searchParams.get('id');

  // If there is no id in the url return early and log the error.
  if (!id) {
    console.error('No restaurant id in URL');
    return;
  }

  restaurantRequest = restAPI.fetchRestaurantById(id);  
  fillBreadcrumb(await restaurantRequest);
  fillRestaurantHTML(await restaurantRequest);
  fillReviewsHTML(await restaurantRequest);
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

/*
 * Handle review form submittion.
 */
function submitReview(e) {
  // prevent the submittion from redirecting the page.
  e.preventDefault();

  const errorElements = {
    name: e.target.querySelector('#name-error'),
    rating: e.target.querySelector('#rating-error'),
    comments: e.target.querySelector('#comments-error')
  };

  let elements = {
    name: e.target.querySelector('.name'),
    comments: e.target.querySelector('.comments'),
    rating: e.target.querySelector('.rating input:checked'),
  };

  let data = {
    name: elements.name.value,
    comments: elements.comments.value,
    // If the user didnt select a rating the element will be null, in that case we default to an empty string.
    rating: elements.rating ? elements.rating.value : ''
  };

  // Reset all the error messages.
  for(let element in errorElements) {
    errorElements[element].innerHTML = '';
  }
  
  // Will be filled with validation errors.
  let errors = [];

  // Check that no fields are empty.
  for(let fieldName in data) {
    if(data[fieldName].trim() === '') errors.push({fieldName, message: 'This field cannot be empty'});
  }

  // Add error messages in the form.
  if(errors.length) {
    for(let error of errors) {
      errorElements[error.fieldName].innerHTML = error.message;
    }

    // return early to avoid submitting the form.
    return;
  }

  // Add the Id to the data.
  data.restaurant_id = (new URL(window.location.href)).searchParams.get('id');

  // Try to add the review.
  restAPI.postReview(data);
}

/*
 * Attach event listener to the review form.
 */
document.getElementById('leave-review-form').addEventListener('submit', submitReview);

fetchRestaurantFromURL().catch(error => console.error(error));