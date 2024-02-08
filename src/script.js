'use strict';
const notesContainer = document.querySelector('.weather-cards-container');

const addButton = document.querySelector('.input-box__add-btn');
const cityInput = document.getElementById('city-input');
const titleInput = document.querySelector('.note__title');

if (
  localStorage.getItem('cities') === null ||
  localStorage.getItem('cities') === ''
) {
  localStorage.setItem('cities', JSON.stringify([]));
}

const getCities = function () {
  const cityArrLs = JSON.parse(localStorage.getItem('cities') || []);

  return cityArrLs;
};

const displayCities = function (cities) {
  cities.map(city => {
    notesContainer.insertAdjacentHTML(
      'afterbegin',
      `<div class="weather-card" data-id="${city.id}">
        <div class="weather-card__horizontal-box">
          <h2 class="weather-card__city">${city.city}</h2>
          <img src="https://openweathermap.org/img/wn/${city.weatherIcon}@2x.png" alt="weather-icon" class="weather-card__icon" />
          <p class="weather-card__weather-name">${city.weatherName}</p>
          <p class="weather-card__temp">${city.temp}</p>
        </div>
        <div class="weather-card__vertical-box">
          <div>
            <img src="./src/img/humidity.png" alt="weather-icon" class="weather-card__humidity-wind" />
            <p class="weather-card__humidity-value">${city.humidity} </br> Wilgotność</p>
          </div>
          
          <div>
            <img src="./src/img/wind.png" alt="weather-icon" class="weather-card__humidity-wind" />
            <p class="weather-card__humidity-value">${city.windSpd}</br> Pr. Wiatru</p>
          </div>
        </div>
        <button class="weather-card__btn" onClick="deleteNote(${city.id})">Usuń</button>
      </div>`
    );
  });
};

const createOrUpdateCity = function (newData) {
  const cities = getCities();
  const checkIfExist = cities.find(city => city.city === newData.city);
  const checkInput = cities.find(city => city.city === cityInput.value);
  if (checkIfExist) {
    checkIfExist.city = newData.city;
    checkIfExist.temp = newData.temp;
    checkIfExist.humidity = newData.humidity;
    checkIfExist.windSpd = newData.windSpd;
    checkIfExist.weatherIcon = newData.weatherIcon;
    checkIfExist.weatherName = newData.weatherName;
  } else if (checkInput) {
    alert('Miasto już istnieje');
  } else {
    const lastId = Math.max(...cities.map(city => city.id), 0);

    newData.id = lastId + 1;
    console.log(cities, lastId);
    if (cities.length >= 10) {
      alert('Makskymalna liczba miast 10');
    } else {
      cities.push(newData);
      displayCities([newData]);
    }
  }

  localStorage.setItem('cities', JSON.stringify(cities));
};

const saveCities = async function (id) {
  const city = getCities().find(city => city.id === id);
  const dataToUpdate = await weather(city.city);
  if (!(dataToUpdate === undefined)) {
    createOrUpdateCity({
      city: dataToUpdate.name,
      temp: Math.round(dataToUpdate.main.temp) + '°C',
      humidity: dataToUpdate.main.humidity + '%',
      windSpd: dataToUpdate.wind.speed + ' km/h',
      weatherIcon: dataToUpdate.weather[0].icon,
      weatherName: dataToUpdate.weather[0].main,
    });
  }
  console.log(dataToUpdate);
};

const deleteNote = function (id) {
  const cities = getCities();
  const deleteCity = cities.filter(city => city.id != id);
  localStorage.setItem('cities', JSON.stringify(deleteCity));

  const cityToDelete = document.querySelector(`[data-id="${id}"]`);
  cityToDelete.remove();
  console.log(cityToDelete);
};

addButton.addEventListener('click', async function () {
  const weatherData = await weather(cityInput.value);
  console.log(weatherData);
  if (!(weatherData === undefined)) {
    const newCity = {
      city: weatherData.name,
      temp: Math.round(weatherData.main.temp) + '°C',
      humidity: weatherData.main.humidity + '%',
      windSpd: weatherData.wind.speed + ' km/h',
      weatherIcon: weatherData.weather[0].icon,
      weatherName: weatherData.weather[0].main,
    };

    createOrUpdateCity(newCity);
  }
});

const weather = async function (city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&&units=metric&appid=d505bbd10d90b23aa8879cdd9d18a261`
    );
    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      throw Error(response.statusText);
    }
    return data;
  } catch (err) {
    console.error(err);
  }
};

const fisrtRender = async function () {
  const allCities = document.querySelectorAll('.weather-card');
  allCities.forEach(city => city.remove());
  const cities = getCities();

  const saveCitiesPromises = cities.map(async element => {
    await saveCities(element.id);
  });

  // czekanie na wszystkie odświeżenie danych
  await Promise.all(saveCitiesPromises);

  console.log('///////////////////////////////////////////////');
  displayCities(cities);
};

fisrtRender();

setInterval(fisrtRender, 300000);
