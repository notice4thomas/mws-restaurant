const restAPI = require('./rest_api');
self.markers = [];

/**
 * lazy loading images.
 */
function lazyLoadImages() {
  const images = document.querySelectorAll('.restaurant-img');

  // If we don't have support for intersection observer, loads the images immediately
  if (!('IntersectionObserver' in window)) {
    images.forEach(image => loadImage(image));
    return;
  }

  function loadImage(image) {
    // Update the images attributes.
    image.src = image.dataset.src;

    // On restaurants without a photo there won't be srcset and sizes attributes so return;
    if(!image.dataset.srcset) return;
    image.srcset = image.dataset.srcset;
    image.sizes = image.dataset.sizes;
  }

  // Function that runs when images are intersecting.
  function onIntersection(entries) {
    entries.forEach(entry => {
      // If the image is not intersecting return.
      if(!entry.isIntersecting) return;
      observer.unobserve(entry.target); // Stop observing this image.
      loadImage(entry.target);
    });
  }

  const observer = new IntersectionObserver(onIntersection, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  images.forEach(image => {
    observer.observe(image);
  });
}

/**
 * Set neighborhoods HTML.
 */
function fillNeighborhoodsHTML(neighborhoods = self.neighborhoods) {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
function fetchNeighborhoods() {
  restAPI.fetchNeighborhoods().then(neighborhoods => {
    self.neighborhoods = neighborhoods;
    fillNeighborhoodsHTML();
  }).catch(error => {
    console.error(error);
  });
}

/**
 * Set cuisines HTML.
 */
function fillCuisinesHTML(cuisines = self.cuisines) {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Add markers for current restaurants to the map.
 */
function addMarkersToMap(restaurants = self.restaurants) {
  // Don't run if google maps didn't load yet.
  if(!window.google) return;

  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = restAPI.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML(restaurants = self.restaurants) {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Fetch all cuisines and set their HTML.
 */
function fetchCuisines() {
  restAPI.fetchCuisines().then(cuisines => {
    self.cuisines = cuisines;
    fillCuisinesHTML();
  }).catch(error => {
    console.error(error);
  });
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
function resetRestaurants(restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Update page and map for current restaurants.
 */
window.updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  restAPI.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood).then(restaurants => {
    resetRestaurants(restaurants);
    fillRestaurantsHTML();
    
    // Start the images lazy loader.
    lazyLoadImages();
  }).catch(error => {
    console.error(error);
  });
};

/**
 * Create responsive image element.
 */
function createImageElement(imgUrl) {
  const image = document.createElement('img');
  image.className = 'restaurant-img'; 

  // True when there is no image.
  if(imgUrl === '/img/undefined.jpg') {
    image.dataset.src = '/style/no_photo.svg';
    return image;
  }

  const largeImage = imgUrl.replace('.', '_large.');
  const mediumImage = imgUrl.replace('.', '_medium.');

  image.dataset.sizes = '(max-width: 650px) calc(100vw - 70px), 230px';
  image.dataset.srcset = `${imgUrl} 800w, ${largeImage} 650w, ${mediumImage} 360w`;
  image.dataset.src = imgUrl;

  // Add placeholder image.
  image.src = '/style/loading_image.svg';

  return image;
}

/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant) {
  const li = document.createElement('li');

  const article = document.createElement('article');
  li.appendChild(article);

  // Create responsive and accessible image element
  let image = createImageElement(restAPI.imageUrlForRestaurant(restaurant));
  image.alt = restaurant.name;
  image.setAttribute('aria-hidden', 'true');
  article.append(image);

  // Restaurant name
  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  article.append(name);

  // Address/neighberhood wrap
  const addressWrap = document.createElement('div');
  addressWrap.className = 'address-wrap';
  article.append(addressWrap);

  // Neighberhood
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  addressWrap.append(neighborhood);

  // Address
  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  addressWrap.append(address);

  // Details button
  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = restAPI.urlForRestaurant(restaurant);
  article.append(more);

  return li;
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };

  window.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false,
    disableDefaultUI: true
  });

  document.getElementById('map').style.height = '400px';
};

// Fetch data
fetchNeighborhoods();
fetchCuisines();

// Update restaurants list.
window.updateRestaurants();