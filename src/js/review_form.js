import restAPI from './rest_api';

export default class ReviewForm {

  /*
   * Add event listeners and setup the form.
   * Expects an already created layout to be inside the element.
   */
  constructor(formContainer, createReviewHTML) {
    this.formContainer = formContainer;
    this.createReviewHTML = createReviewHTML;
    this.form = formContainer.querySelector('form');

    // Add an event listener to submit events.
    this.form.addEventListener('submit', e => this.submit(e));

    // Add event to the form container only when its closed. this is used in order to reveal the form.
    document.querySelector('#leave-review.closed').addEventListener('click', this.open);
    document.querySelector('#leave-review.closed').addEventListener('focus', this.open);
    

    // Save the elements of the form fields.
    this.fieldElements = {
      name: this.form.querySelector('.name'),
      comments: this.form.querySelector('.comments'),
      // This one is a getter since the element changes on user's input.
      get rating() {
        return formContainer.querySelector('.rating input:checked');
      },
    };

    // Save the elements that hold verification errors
    this.errorsElements = {
      name: this.form.querySelector('.name-error'),
      comments: this.form.querySelector('.comments-error'),
      rating: this.form.querySelector('.rating-error'),
    };
  }

  /*
   * Reveal the form when the header is clicked for the first time.
   */
  open() {
    this.classList.remove('closed');
  }

  /*
   * Remove any previously rendered errors from the dom.
   */
  resetErrors() {
    // Reset all the error messages.
    for(let elementName in this.errorElements) {
      this.errorElements[elementName].innerHTML = '';
    }
  }

  /*
   * Renders the validation errors to the dom.
   */
  populateErrors(errors) {
    for(let error of errors) {
      this.errorsElements[error.fieldName].innerHTML = error.message;
    }
  }

  resetForm() {
    for(let fieldName in this.fieldElements) {
      if(fieldName === 'rating'){
        document.getElementById('star1').checked = true;
        continue;
      }

      this.fieldElements[fieldName].value = '';
    }
  }

  /*
   * Validate all the inputs in an object.
   * This function an object with a key-value pair of the field names and their data.
   * returns an array of errors.
   */
  validate(data) {
    // Will be filled with validation errors.
    let errors = [];
    
    // Check that no field is empty.
    for(let fieldName in data) {
      if(data[fieldName] === '') errors.push({fieldName, message: 'This field cannot be empty'});
    }

    return errors;
  }

  /*
   * Handle the form submission.
   */
  submit(e) {
    // prevent the submittion from redirecting the page.
    e.preventDefault();

    let data = {
      name: this.fieldElements.name.value.trim(),
      comments: this.fieldElements.comments.value.trim(),
      // If the user didnt select a rating the element will be null, in that case we default to an empty string.
      rating: this.fieldElements.rating.value.trim()
    };

    this.resetErrors();

    // Get validation errors.
    let errors = this.validate(data);

    // Add error messages to the form.
    if(errors.length) {
      this.populateErrors(errors);

      // return early
      return;
    }

    // Add the restaurant's Id to the data.
    data.restaurant_id = (new URL(window.location.href)).searchParams.get('id');

    // Try to post the review to the server and local DB.
    // And then clean up the form and update the DOM with the new reivew from the DB(with date and stuff).
    restAPI.postReview(data).then(review => {
      // Add the review to the DOM.
      this.addReviewToPage(review);

      // reset the input fields.
      this.resetForm();
    });
  }

  addReviewToPage(review) {
    // Create review HTML.
    let reviewHTML = this.createReviewHTML(review);

    // Create a helper element in order to convert the HTML string into a DOM element.
    let helper = document.createElement('div');
    helper.innerHTML = reviewHTML;

    // prepend it to the page.
    document.getElementById('reviews-list').prepend(helper.firstChild);
  }
}