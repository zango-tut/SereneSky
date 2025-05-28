const dateElement = document.querySelector('.date');
const now = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateElement.textContent = now.toLocaleDateString('en-US', options);

const locationElement = document.querySelector('.location');

function getWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        alert("Geolocation is not supported by your browser.");
    }

    function success(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m,surface_pressure&daily=temperature_2m_max,weathercode&timezone=auto`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const weather = data.current_weather;

                // Location name
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
                    .then(res => res.json())
                    .then(loc => {
                        const addr = loc.address;
                        const city = addr.city || addr.town || addr.village || addr.hamlet || '';
                        const region = addr.state || addr.county || '';
                        const country = addr.country || '';

                        let locationName = [city, region, country].filter(Boolean).join(', ');
                        locationElement.textContent = locationName || "Your Location";
                    });

                // Weather basics
                document.querySelector('.temperature').textContent = `${weather.temperature}°C`;
                document.querySelector('.weather-description').textContent = `Wind: ${weather.windspeed} km/h`;

                const iconElement = document.querySelector('.weather-icon i');
                iconElement.className = `fas ${getIconClass(weather.weathercode)}`;

                // Humidity and pressure
                const time = weather.time;
                const index = data.hourly.time.indexOf(time);
                const humidity = data.hourly.relative_humidity_2m[index];
                const pressure = data.hourly.surface_pressure[index];

                document.querySelector('.detail-card:nth-child(1) .detail-value').textContent = `${weather.windspeed} km/h`;
                document.querySelector('.detail-card:nth-child(2) .detail-value').textContent = `${humidity}%`;
                document.querySelector('.detail-card:nth-child(3) .detail-value').textContent = `${pressure} hPa`;

                // Forecast
                const days = data.daily.time;
                const temps = data.daily.temperature_2m_max;
                const codes = data.daily.weathercode;
                const forecastCards = document.querySelectorAll('.forecast-card');

                forecastCards.forEach((card, i) => {
                    const date = new Date(days[i]);
                    const day = date.toLocaleDateString('en-US', { weekday: 'short' });

                    card.querySelector('.forecast-day').textContent = day;
                    card.querySelector('.forecast-temp').textContent = `${temps[i]}°C`;
                    card.querySelector('.forecast-icon i').className = `fas ${getIconClass(codes[i])}`;
                });
            })
            .catch(() => alert("Failed to fetch weather data."));
    }

    function error() {
        alert("Unable to retrieve your location.");
    }

    function getIconClass(code) {
        if (code === 0) return 'fa-sun';
        if ([1, 2].includes(code)) return 'fa-cloud-sun';
        if (code === 3) return 'fa-cloud';
        if ([45, 48].includes(code)) return 'fa-smog';
        if ([51, 53, 55].includes(code)) return 'fa-cloud-rain';
        if ([56, 57].includes(code)) return 'fa-cloud-showers-heavy';
        if ([61, 63, 65].includes(code)) return 'fa-cloud-rain';
        if ([66, 67].includes(code)) return 'fa-cloud-showers-heavy';
        if ([71, 73, 75, 77].includes(code)) return 'fa-snowflake';
        if ([80, 81, 82].includes(code)) return 'fa-cloud-showers-heavy';
        if ([85, 86].includes(code)) return 'fa-snowflake';
        if ([95, 96, 99].includes(code)) return 'fa-bolt';
        return 'fa-question';
    }
}

window.onload = getWeather;