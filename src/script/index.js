const RENDER = {
    renderList(list) {
        return list.map(weather => {
            return (`
                <li>
                <div class="weather__hour">
                    ${this.getDate(weather.dt).toLocaleTimeString()}
                    ${this.getDate(weather.dt).toLocaleDateString()}
                </div>
                <div class="weather__temp">
                    <img src="http://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="">
                    <div class="weather__celcius">
                        ${Math.floor((typeof weather.temp === 'number' ? weather.temp : weather.temp.day) - 273)}°
                    </div>
                </div>
            </li> 
            `);
        }).join('');
    },
    renderTodayDate(data) {
        return this.renderList(data.hourly);
    },
    renderWeekDate(data) {
        return this.renderList(data.daily);
    },
    fillTab(data) {
        const tabToday = document.getElementById('today');
        const tabWeek = document.getElementById('week');

        const contenToday = document.getElementById('weather-today-content');
        const contenWeek = document.getElementById('weather-week-content');

        tabToday.addEventListener('click', e => {
            e.preventDefault();
            tabToday.classList.add('active');
            tabWeek.classList.remove('active');

            contenToday.removeAttribute('hidden');
            contenToday.innerHTML = this.renderTodayDate(data);
            contenWeek.setAttribute('hidden', true);
        });

        tabWeek.addEventListener('click', e => { 
            e.preventDefault();
            tabWeek.classList.add('active');
            tabToday.classList.remove('active');

            contenWeek.removeAttribute('hidden');
            contenWeek.innerHTML = this.renderWeekDate(data);
            contenToday.setAttribute('hidden', true);
        });

        tabToday.click();
    },
    ready() {
        const loader = document.getElementById('page-loader');

        if (loader) {
            loader.classList.remove('open');
        }
    },
    getDate(dt) {
        const date = new Date(dt * 1000);

        return date;
    },
    base(weatherData) {
        const city = document.getElementById('city');
        const country = document.getElementById('country');
        const time = document.getElementById('time');
        const date = document.getElementById('date');
        const temperature = document.getElementById('temperature');
        const icon = document.querySelector('#icon img');
        const weatherDescription = document.getElementById('weather-description');

        const [currentWeather] = weatherData.weather;

        city.innerHTML = weatherData.name;
        country.innerHTML = weatherData.sys.country;
        time.innerHTML = this.getDate(weatherData.dt).toLocaleTimeString();
        date.innerHTML = this.getDate(weatherData.dt).toLocaleDateString();
        temperature.innerHTML = Math.floor(weatherData.main.temp - 273) + '°';

        console.log(currentWeather.icon);

        icon.src = `http://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`;
        weatherDescription.innerHTML = currentWeather.description;
    }
}

const APP = {
    init(event) {
        const weather = JSON.parse(event.target.response)

        RENDER.base(weather);
        RENDER.ready();

        API.getForecastWeather({
            lat: weather.coord.lat,
            lon: weather.coord.lon
        }, forecastEvent => {
            RENDER.fillTab(JSON.parse(forecastEvent.target.response));
        });
    },
    initWithCoordinates(lat, lon) {
        API.getCurrentWeather({lat, lon}, (event) => this.init(event));
    },
    initWithCityName() {
        const cityName = prompt('Enter your city name');
    
        API.getCurrentWeather({q: cityName}, (event) => this.init(event));
    }
}

function success(pos) {
    const crd = pos.coords;

    const lat = crd.latitude;
    const lon = crd.longitude;
    
    if (lat && lon) {
        APP.initWithCoordinates(lat, lon);
    }
}

function error() {
    console.log('Location not detected');

    APP.initWithCityName()
}

navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
});