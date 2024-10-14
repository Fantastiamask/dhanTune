function getWeather(name1, lat, lon) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m,surface_pressure,temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day&hourly=temperature_2m,apparent_temperature,precipitation_probability,visibility&daily=uv_index_max,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=auto&forecast_days=1`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.current.is_day == 0) {
            document.body.style.backgroundImage = 'linear-gradient(#365b78, #34664c)'
            
        }
        if (data.current.is_day == 1) {
            document.body.style.backgroundImage = 'linear-gradient(#66ADE2, #61BF8E)'
            
        }
        const name = document.getElementById('name')
        const current_temp = document.getElementById("output")
        const conditions = document.getElementById("cond")
        const high_temp = document.getElementById("high")
        const low_temp = document.getElementById("low")
        const feels_like = document.getElementById("feel")
        const sunrise = document.getElementById("sunrise")
        const sunset = document.getElementById("sunset")
        const wind_dir = document.getElementById("wind_dir")
        const wind_speed = document.getElementById("wind_speed")
        const wind_gust = document.getElementById("wind_gust")
        const rain = document.getElementById("rain")
        const visibility = document.getElementById("vis")
        const uv = document.getElementById("uv")
        const rain_prob = document.getElementById("rain_percent")

        name.innerText = name1
        current_temp.innerText = data.current.temperature_2m
        conditions.innerText = getWeatherDescription(data.current.weather_code)
        high_temp.innerText = data.daily.temperature_2m_max
        low_temp.innerText = data.daily.temperature_2m_min
        feels_like.innerText = data.current.apparent_temperature
        let date = new Date(data.daily.sunrise * 1000);
        sunrise.innerText = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        date = new Date(data.daily.sunset * 1000);
        sunset.innerText = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        wind_gust.innerText = data.current.wind_gusts_10m
        wind_speed.innerText = data.current.wind_speed_10m
        wind_dir.innerText = degToCompass(data.current.wind_direction_10m)
        rain.innerText = `${data.daily.precipitation_sum}"`
        const now = new Date();

        // Create a timestamp for the current hour (ignoring minutes and seconds)
        const currentHourTimestamp = Math.floor(now.setMinutes(0, 0, 0) / 1000); // Current hour in seconds
        
        // Find the index of the current hour
        const currentHourIndex = data.hourly.time.findIndex(hour => hour === currentHourTimestamp);
        
        console.log(currentHourIndex)
        rain_prob.innerText = `${data.hourly.precipitation_probability[currentHourIndex]}%`
        visibility.innerText = `${Math.round(((data.hourly.visibility[currentHourIndex])/5280))} mi`

        uv.innerText = data.daily.uv_index_max
        getHourly(lat, lon);
        getWeekly(lat, lon)

        document.getElementById('content').style.display = 'block'

    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}
document.getElementById('weather').addEventListener('submit', function(event) {
    event.preventDefault();
    document.getElementById('content').style.display = 'none'
    getWeatherText();
});

function getHourly(lat, lon) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=auto&forecast_days=1`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const hourly = document.getElementById('hourly')
        hourly.innerText = ''
        data.hourly.time.forEach((time, index) => {
            if (index > 5) {
                let date = new Date(time * 1000);
                let current_time = date.toLocaleTimeString([], {hour: '2-digit'});
                console.log(current_time, data.hourly.temperature_2m[index], getWeatherDescription(data.hourly.weather_code[index]));
                hourly.innerHTML += `
                <div class="col-2" style="min-width: 80px; text-align: center;">
                ${current_time}<br>
                <i class="${getWeatherIcon(data.hourly.weather_code[index])}"></i>
                <br>
                <b>${data.hourly.temperature_2m[index]}</b>
                </div>`;

            }
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function getWeekly(lat, lon) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=auto&days=7`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const weekly = document.getElementById('weekly')
        weekly.innerText = ''
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        let birthday;
        let day_id;
        data.daily.time.forEach((date, index) => {
            if (index < 7) {
                
              
                birthday = new Date(date*1000);
                console.log(birthday)
                day_id = birthday.getDay();
                console.log(day_id)
                let day = 'Error'
                console.log(index)
                if (index > 0) {
                    day = dayNames[day_id]
                } else{
                    day = 'Today'
                }
                let code = data.daily.weather_code[index]
                code = getWeatherIcon(code)

                weekly.innerHTML += `
                <tr style="border-bottom: 1px solid #c6c4c47d;">
                    <td><b>${day}</b></td>
                    <td><i class="${code}"></i></td>
                    <td>${data.daily.temperature_2m_max[index]} °F</td>
                    <td>-</td>
                    <td>${data.daily.temperature_2m_min[index]} °F</td>
                </tr>
                `
            }

            
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function getWeatherText() {
    const input = document.getElementById('input').value;
    fetch(`https://nominatim.openstreetmap.org/search.php?q=${input}&format=json`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        data.forEach((location, index) => {
            if (index === 0) {
                const lat = location.lat;
                const lon = location.lon;
                const name = location.name; // Use display_name for better representation
                getWeather(name, lat, lon);
            }
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function startWeather() {
    const lat = document.getElementById('lat');
    const lon = document.getElementById('lon');
    getWeather(lat.value, lon.value);
}

// document.getElementById('weather').addEventListener('submit', function(event) {
//     event.preventDefault();
//     getWeatherText();
// });

function getWeatherDescription(code) {
    switch (code) {
        case 0: return "Clear sky";
        case 1: return "Mainly clear";
        case 2:
        case 3: return "Partly cloudy";
        case 45:
        case 48: return "Foggy";
        case 51: return "Light Drizzle";
        case 53: return "Moderate Drizzle";
        case 55: return "Dense Drizzle";
        case 56: return "Light Freezing Drizzle";
        case 57: return "Dense Freezing Drizzle";
        case 61: return "Light Rain";
        case 63: return "Raining";
        case 65: return "Heavy Rain";
        case 66:
        case 67: return "Freezing Rain";
        case 71: return "Light Snow fall";
        case 73: return "Snow fall";
        case 75: return "Heavy Snow fall";
        case 77: return "Snow grains";
        case 80: return "Light Rain showers";
        case 81: return "Heavy Rain showers";
        case 82: return "Violent Rain showers";
        case 85:
        case 86: return "Snow showers slight and heavy";
        case 95: return "Thunderstorm: Slight or moderate";
        case 96:
        case 99: return "Thunderstorm with slight and heavy hail";
        default: return "Unknown weather code";
    }
}
function getWeatherIcon(code) {
    switch (code) {
        case 0: return "fa-solid fa-sun";
        case 1: return "fa-solid fa-cloud-sun"
        case 2:
        case 3: return "fa-solid fa-cloud"
        case 45:
        case 48: return "fa-solid fa-smog"
        case 51: return "fa-solid fa-cloud-sun-rain"
        case 53: return "fa-solid fa-cloud-sun-rain"
        case 55: return "fa-solid fa-cloud-sun-rain"
        case 56: return "fa-solid fa-cloud-rain";
        case 57: return "fa-solid fa-umbrella"
        case 61: return "fa-solid fa-cloud-rain"
        case 63: return "fa-solid fa-cloud-showers-heavy"
        case 65: return "fa-solid fa-cloud-showers-water"
        case 66:
        case 67: return "Freezing Rain";
        case 71: return "fa-solid fa-snowflake"
        case 73: return "fa-solid fa-snowflake"
        case 75: return "fa-solid fa-snowflake"
        case 77: return "fa-solid fa-cloud-meatball"
        case 80: return "fa-solid fa-cloud-showers-heavy"
        case 81: return "fa-solid fa-cloud-showers-heavy"
        case 82: return "fa-solid fa-cloud-showers-heavy"
        case 85:
        case 86: return "fa-solid fa-hill-avalanche"
        case 95: return "fa-solid fa-cloud-bolt"
        case 96:
        case 99: return "fa-solid fa-cloud-bolt"
        default: return "fa-solid fa-question"
    }
}


function getUserLocation() {
    let ip = 0
    fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        console.log(data.ip);
        ip = data.ip
        fetch(`https://ipapi.co/${ip}/json/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            getWeather('Your Location', data.latitude, data.longitude)
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    })
    .catch(error => {
        console.log('Error:', error);
    });

}
    
getUserLocation()

function degToCompass(num) {
    var val = Math.floor((num / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

function toggle_show() {
    document.getElementById('show').style.display = 'none'
    document.getElementById('weather').style.display = 'block'

    
}

function toggle_hide() {
    document.getElementById('show').style.display = 'block'
    document.getElementById('weather').style.display = 'none'
    document.getElementById('content').style.display = 'block'

    
}