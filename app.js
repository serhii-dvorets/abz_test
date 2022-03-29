'use strict';

const usersContainer = document.querySelector('.users__container');
const showMoreButton = document.querySelector('.users__button');
const radioInputContainer = document.querySelector('.registration__radio-container');
const labels = document.getElementsByTagName('LABEL');
const photoInput = document.querySelector('.registration__photo--input');
const photoInputField = document.querySelector('.registration__photo--uploaded-photo');
const nameInput = document.querySelector('.name');
const emailInput = document.querySelector('.email');
const phoneInput = document.querySelector('.phone');
const form = document.querySelector('.registration__form');
const successMessage = document.querySelector('.success');

let page = 1;
let totalPages;
let positionId = 1;
let photo;
let newToken;

function getUsers(page) {
  return fetch(`https://frontend-test-assignment-api.abz.agency/api/v1/users?page=${page}&count=6`)
    .then((response) => {
      if (!response.ok) {
        showMoreButton.classList.add('users__button--disabled');
        throw new Error(`${response.statusText} - ${response.status}`)
      } else {
        return response.json()
      }

    })
    .then(result => {
      totalPages = result.total_pages;

      result.users.map(user => {
        const userCard = document.createElement('div');
        userCard.className = 'users__card';

        const userPhoto = document.createElement('div');
        userPhoto.className = 'users__photo';
        userPhoto.style.background = `url(${user.photo}) center/cover no-repeat`;
        userCard.append(userPhoto);

        const userName = document.createElement('h3');
        userName.className = 'users__name';
        userName.textContent = user.name;
        userCard.append(userName);

        const userInfoContainer = document.createElement('div');
        userInfoContainer.className = 'users__info-container';

        const userPosition = document.createElement('div');
        userPosition.className = 'users__name';
        userPosition.textContent = user.position;
        userInfoContainer.append(userPosition);

        const userEmail = document.createElement('div');
        userEmail.className = 'users__name';
        userEmail.textContent = user.email;
        userInfoContainer.append(userEmail);

        const userPhone = document.createElement('div');
        userPhone.className = 'users__name';
        userPhone.textContent = user.phone;
        userInfoContainer.append(userPhone);

        userCard.append(userInfoContainer);
        usersContainer.append(userCard);
      })
    });
}

function getPositions() {
  return fetch(`https://frontend-test-assignment-api.abz.agency/api/v1/positions`)
    .then((response) => {
      if (!response.ok) {
        showMoreButton.classList.add('users__button--disabled');
        throw new Error(`${response.statusText} - ${response.status}`)
      } else {

        return response.json()
      }
    }).then(result => {
      result.positions.map(position => {
        const label = document.createElement('label');
        label.className = 'registration__radio-label';
        if (position.id === 1) {
          label.classList.add('registration__radio-label--active');
        }
        label.setAttribute('for', position.id);
        label.append(position.name);
        radioInputContainer.append(label);

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'position';
        input.className = 'registration__radio-input';
        input.value = position.id;
        input.setAttribute('id', position.id)
        radioInputContainer.append(input);
      })
    })
}

function getToken() {

  return fetch('https://frontend-test-assignment-api.abz.agency/api/v1/token')
    .then((response) => {
      if (!response.ok) {
        showMoreButton.classList.add('users__button--disabled');
        throw new Error(`${response.statusText} - ${response.status}`)
      } else {

        return response.json()
      }
    })
}

function fetchData() {

  let formData = new FormData();
  formData.append('position_id', positionId);
  formData.append('name', nameInput.value);
  formData.append('email', emailInput.value);
  formData.append('phone', phoneInput.value);
  formData.append('photo', photo);

  fetch('https://frontend-test-assignment-api.abz.agency/api/v1/users', {
    method: 'POST',
    body: formData,
    headers: {
      'Token': newToken,
    },
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        nameInput.value = '';
        emailInput.value = '';
        phoneInput.value = '';

        resetRadio();
        positionId = 1;

        const image = document.querySelector('.registration__image');
        image.remove();

        usersContainer.innerHTML = '';
        getUsers(1);

        successMessage.classList.remove('success--hidden');
        setTimeout(() => {
          successMessage.classList.add('success--hidden');
        }, 5000)

      } else {
        alert(data.message)
      }
    });
}

getUsers(1);
getPositions();
getToken().then(token => {
  newToken = token.token
})

showMoreButton.addEventListener('click', () => {
  page++;
  if (page === totalPages) {
    showMoreButton.classList.add('users__button--disabled');
    return;
  }
  getUsers(page);
})

radioInputContainer.addEventListener('click', (event) => {
  const activeLabel = event.target.closest('.registration__radio-label');

  if (activeLabel) {
    activeLabel.classList.add('registration__radio-label--active');

    [...labels].map(label => {
      if (label.getAttribute('for') !== activeLabel.getAttribute('for')) {
        label.classList.remove('registration__radio-label--active');
      }
    })

    positionId = activeLabel.getAttribute('for');
  }
})

photoInput.addEventListener('change', (event) => {

  const reader = new FileReader();
  reader.onload = event => {
    photoInputField.textContent = '';
    photoInputField.insertAdjacentHTML('afterend',
      `<img src=${event.target.result} alt="" class="registration__image"></img>`)
  }
  photo = event.target.files[0];
  reader.readAsDataURL(event.target.files[0]);
})

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const correctName = validateName(nameInput.value);
  const correctPhone = validatePhone(phoneInput.value);
  const correctEmail = validateEmail(emailInput.value);

  if (!correctName) {
    formAddError(nameInput);
    nameInput.focus();
  } else {
    formRemoveError(nameInput);
  }

  if (!correctEmail) {
    formAddError(emailInput);
    emailInput.focus();
  } else {
    formRemoveError(emailInput);
  }

  if (!correctPhone) {
    formAddError(phoneInput);
    phoneInput.focus();
  } else {
    formRemoveError(phoneInput);
  }

  if (!photo || photo.size > 5242880) {
    formAddError(photoInput);

  } else {
    formRemoveError(phoneInput);
    fetchData();
  }
});

form.addEventListener('input', (e) => {
  formRemoveError(e.target);
})

function formValidate(form) {
  let error = 0;
  let formRequired = document.querySelectorAll('.required');

  for (let i = 0; i < formRequired.length; i++) {
    const input = formRequired[i];

    formRemoveError(input);

    if (input.classList.contains('email')) {
      if (emailTest(input)) {
        formAddError(input);
        error++;
      }
    } else if (input.value === '') {
      formAddError(input);
      error++;
    }

    if (input.classList.contains('phone')) {
      if (phoneTest(input)) {
        formAddError(input);
        error++;
      }
    } else if (input.value === '') {
      formAddError(input);
      error++;
    }
  }
}

function validateName(input) {

  if (!input) {
    return false;
  }

  if (input.split('').length < 2 || input.split('').length > 60) {
    return false;
  }

  return true;
}

function validateEmail(input) {
  const reg = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
  return reg.test(String(input));
}

function validatePhone(input) {
  let reg = /^[\+]{0,1}380([0-9]{9})$/;
  return reg.test(input)
}

function formAddError(input) {
  input.parentElement.classList.add('error');
  input.classList.add('error');
}

function formRemoveError(input) {
  input.parentElement.classList.remove('error');
  input.classList.remove('error');
}

function resetRadio() {
  const firstLabel = document.querySelector('.registration__radio-label');
  [...labels].map(label => {
    label.classList.remove('registration__radio-label--active');
  })

  firstLabel.classList.add('registration__radio-label--active')
}
