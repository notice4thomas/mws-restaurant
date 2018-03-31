import restAPI from './rest_api';
let MARKERS, MAP, RESTAURANTS;

/* 
 * Fetch and render the the neighborhoods and cuisines filters.
 */
function fetchAndRenderFilters() {
  // Return a promise that will resolve once the restaurants and the cuisines are fetched and rendered.
  return Promise.all([
    restAPI.fetchNeighborhoods().then(restaurants => fillNeighborhoodsHTML(restaurants)),
    restAPI.fetchCuisines().then(cuisines => fillCuisinesHTML(cuisines))
  ]);
}

/*
 * Set neighborhoods HTML.
 */
function fillNeighborhoodsHTML(neighborhoods) {
  const select = document.getElementById('neighborhoods-select');

  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/*
 * Set cuisines HTML.
 */
function fillCuisinesHTML(cuisines) {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/*
 * Update page and map for current restaurants.
 * This function is called by the filters.
 */
window.updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  restAPI.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood).then(restaurants => {
    // Save the restaurants globally to save uninided request by the google maps callback.
    RESTAURANTS = restaurants;
    resetRestaurants();
    fillRestaurantsHTML(restaurants);
    lazyLoadImages(); // Start the images lazy loader.

    // Add markers to map only if google maps was loaded;
    // Checking for undefined is more performant than using coercion.
    if(typeof MAP !== 'undefined') addMarkersToMap();

  }).catch(error => {
    console.error(error);
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
function resetRestaurants() {
  document.getElementById('restaurants-list').innerHTML = '';

  // Remove all map markers if they exist.
  // Checking for undefined is more performant than using coercion.
  if(typeof MARKERS !== 'undefined') MARKERS.forEach(m => m.setMap(null));
  MARKERS = [];
}

/*
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML() {
  const ul = document.getElementById('restaurants-list');
  RESTAURANTS.forEach(restaurant => {
    ul.innerHTML += createRestaurantHTML(restaurant);
  });
}

/**
 * lazy loading images.
 */
function lazyLoadImages() {
  const images = document.querySelectorAll('.restaurant-img');

  // If we don't have support for intersection observer, loads the images immediately
  if (!('IntersectionObserver' in window)) {
    images.forEach(image => image.replaceWith(createImageHTML(image)));
    return;
  }

  // Function that will when the images are intersecting.
  function onIntersection(entries) {
    entries.forEach(entry => {
      // If the image is not intersecting return.
      if(!entry.isIntersecting) return;

      // Stop observing this image.
      observer.unobserve(entry.target);

      // Replace the image with the new Picture element unless it has no photo.
      if(typeof entry.target.dataset.src === 'undefined') return;
      entry.target.replaceWith(createImageHTML(entry.target));
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

/*
 * Create responsive image HTML.
 */
function createImageHTML(image) {
  const sizes = '(max-width: 650px) calc(100vw - 70px), 230px';
  const picture = document.createElement('picture');
  picture.innerHTML = `<source srcset="${image.dataset.srcset.replace(/\.jpg /g, '.webp ')}" sizes="${sizes}" alt="${image.alt}">` + 
    `<source srcset="${image.dataset.srcset}" sizes="${sizes}" alt="${image.alt}">` +
    `<img class="restaurant-img" src="${image.dataset.src}" alt="${image.alt}">`;

  // Parse it before returning since this is expected to be an Element.
  return picture;
}

/*
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant) {
  // Create responsive and accessible image element
  let image = createImagePlaceholderHTML(restAPI.imageUrlForRestaurant(restaurant), restaurant.name);

  return `<li>
    <article>
      ${image}
      <h3>${restaurant.name}</h3>
      <div class="address-wrap">
        <p>${restaurant.neighborhood}</p>
        <p>${restaurant.address}</p>
      </div>
      <a href="${restAPI.urlForRestaurant(restaurant)}">View Details</a>
    </article>
  </li>`;
}

/*
 * Create placeholder for images, the images will be lazy loaded with the info in the placeholder data-attributes.
 */
function createImagePlaceholderHTML(imgUrl, alt) {
  // If imgUrl is undefided(restaurant has no image) return a "no-photo" placeholder.
  if(imgUrl === '/img/undefined.jpg') return `<img class="restaurant-img" src="/style/no_photo.svg" alt="${alt}" aria-hidden="true">`;

  const largeImage = imgUrl.replace('.', '_large.');
  const mediumImage = imgUrl.replace('.', '_medium.');
  const srcset = `${imgUrl} 800w, ${largeImage} 650w, ${mediumImage} 360w`;

  return `<img class="restaurant-img" src="/style/loading_image.svg" alt="${alt}" data-src="${imgUrl}" data-srcset="${srcset}" aria-hidden="true">`;
}

/*
 * Add markers for current restaurants to the map.
 */
function addMarkersToMap() {
  RESTAURANTS.forEach(restaurant => {
    // Add marker to the map
    const marker = restAPI.mapMarkerForRestaurant(restaurant, MAP);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    // Save the marker so we can remove it later if needed.
    MARKERS.push(marker);
  });
}

/*
 * Google maps callback.
 */
window.initMap = () => {
  const mapElement = document.getElementById('map');
  MAP = new google.maps.Map(mapElement, {
    zoom: 12,
    center: {
      lat: 40.722216,
      lng: -73.987501
    },
    scrollwheel: false,
    disableDefaultUI: true
  });
  mapElement.style.height = '400px';
};

fetchAndRenderFilters().then(() => window.updateRestaurants());