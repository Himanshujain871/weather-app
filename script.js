// OPENWEATHER API CONFIGURATION
        const API_KEY = '249aae9732ced22fcdbb7d497f4932bc';
        // Base URL for OpenWeatherMap API
        const BASE_URL = 'https://api.openweathermap.org/data/2.5';

        // DOM ka Elements
        const searchInput = document.getElementById('search-input');
        const recentSearchesDiv = document.getElementById('recent-searches');
        const weatherIcon = document.getElementById('weather-icon');
        const temperature = document.getElementById('temperature');
        const condition = document.getElementById('condition');
        const locationEl = document.getElementById('location');
        const datetime = document.getElementById('datetime');
        const windSpeed = document.getElementById('wind-speed');
        const humidity = document.getElementById('humidity');
        const visibility = document.getElementById('visibility');
        const pressure = document.getElementById('pressure');
        const sunrise = document.getElementById('sunrise');
        const feelsLike = document.getElementById('feels-like');
        const forecastList = document.getElementById('forecast-list');
        const mapLocation = document.getElementById('map-location');

        // Weather icon mapping
        const weatherIcons = {
            '01d': '☀️', '01n': '🌙',
            '02d': '🌤️', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };

        // Function to get recent searches from the localStorage
        function getRecentSearches() {
            const stored = localStorage.getItem('recentSearches');
            return stored ? JSON.parse(stored) : [];
        }

        // Function to save recent searches to localStorage
        function saveRecentSearches(recentSearches) {
            // Limit to last 10 searches
            const limitedSearches = recentSearches.slice(0, 10);
            localStorage.setItem('recentSearches', JSON.stringify(limitedSearches));
        }

        // Function to add a new search to recent searches
        function addRecentSearch(city) {
            let recentSearches = getRecentSearches();
            // Remove duplicate if exists
            recentSearches = recentSearches.filter(search => search.toLowerCase() !== city.toLowerCase());
            // Add new search at the beginning
            recentSearches.unshift(city);
            saveRecentSearches(recentSearches);
            showRecentSearches();
        }

        // Function to show recent searches dropdown
        function showRecentSearches() {
            const recentSearches = getRecentSearches();
            recentSearchesDiv.innerHTML = '';
            
            if (recentSearches.length > 0) {
                recentSearches.forEach(city => {
                    const item = document.createElement('div');
                    item.className = 'recent-search-item';
                    item.textContent = city;
                    item.onclick = () => {
                        searchInput.value = city;
                        fetchWeatherData(city);
                        recentSearchesDiv.style.display = 'none';
                    };
                    recentSearchesDiv.appendChild(item);
                });
            }
        }

        // Function to get weather icon based on weather code
        function getWeatherIcon(code, isDay) {
            if (!code) return '🌤️';
            // Have to ensure day/night version of icon
            const iconCode = code.slice(0, -1) + (isDay ? 'd' : 'n');
            return weatherIcons[iconCode] || '🌤️';
        }

        // Convert temperature from Kelvin to Celsius
        function kelvinToCelsius(kelvin) {
            return Math.round(kelvin - 273.15);
        }

        // Converting timestamp to readable format
        function formatDateTime(timestamp) {
            const date = new Date(timestamp * 1000);
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return date.toLocaleDateString('en-US', options);
        }

        // Formating time for sunrise/sunset
        function formatTime(timestamp) {
            const date = new Date(timestamp * 1000);
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
            });
        }

        // Update kar rahe h current weather display
        function updateCurrentWeather(data) {
            console.log("Current Weather Data:", data); // Debug log
            
            const isDay = data.weather && data.weather[0] && data.weather[0].icon.includes('d');
            
            // Update weather icon
            weatherIcon.textContent = data.weather && data.weather[0] ? 
                getWeatherIcon(data.weather[0].icon, isDay) : '🌤️';
            
            // Update temperature
            temperature.textContent = data.main && data.main.temp ? 
                `${kelvinToCelsius(data.main.temp)}°C` : '--°C';
            
            // Update condition
            condition.textContent = data.weather && data.weather[0] ? 
                data.weather[0].description : 'Loading...';
            
            // Update location
            locationEl.textContent = `${<i class="ri-map-pin-line"></i>} ${data.name || '--'}, ${data.sys?.country || '--'}`;
            
            // Update date/time
            datetime.textContent = data.dt ? 
                `${<i class="ri-calendar-line"></i>} ${formatDateTime(data.dt)}` : `${<i class="ri-calendar-line"></i>} --`;
            
            // Update wind speed
            windSpeed.textContent = data.wind && data.wind.speed ? 
                `${data.wind.speed} m/s` : '--';
            
            // Update humidity
            humidity.textContent = data.main && data.main.humidity ? 
                `${data.main.humidity}%` : '--%';
            
            // Update visibility (Main Value)
            visibility.textContent = data.visibility ? 
                `${Math.round(data.visibility / 1000)} km` : '-- km';

            // Update pressure (Footer)
            if (pressure) {
                pressure.textContent = data.main && data.main.pressure ? 
                    `${data.main.pressure} hPa` : '-- hPa';
            }
            
            // Update sunrise & sunset
            const sunriseEl = document.getElementById('sunrise');
            const sunsetEl = document.getElementById('sunset');
            
            if (sunriseEl) {
                sunriseEl.textContent = data.sys && data.sys.sunrise ? 
                    formatTime(data.sys.sunrise) : '--:--';
            }
            
            if (sunsetEl) {
                sunsetEl.textContent = data.sys && data.sys.sunset ? 
                    formatTime(data.sys.sunset) : '--:--';
            }
            
            // Updating feels like
            // Note: I added ID="feels-like" to HTML, so selecting by ID is safer
            const feelsLikeEl = document.getElementById('feels-like'); 
            if (feelsLikeEl) {
                feelsLikeEl.textContent = data.main && data.main.feels_like ? 
                `${kelvinToCelsius(data.main.feels_like)}°` : '--°';
            }
            
            // Update map location label
            mapLocation.textContent = `${data.name || '--'}, ${data.sys?.country || '--'}`;

            // Update Map Iframe
            const mapFrame = document.getElementById('map-frame');
            if (mapFrame && data.coord) {
                const lat = data.coord.lat;
                const lon = data.coord.lon;
                // Create bounding box for the map (approx 0.1 degrees around the point)
                const bbox = `${lon - 0.1},${lat - 0.1},${lon + 0.1},${lat + 0.1}`;
                mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
            }
        }

        // Update forecast display
        function updateForecast(forecastData) {
            console.log("Forecast Data:", forecastData); // Debug log
            
            forecastList.innerHTML = '';
            
            if (!forecastData || !forecastData.list) {
                return;
            }
            
            // Group forecast by day
            const dailyForecasts = {};
            forecastData.list.forEach(item => {
                const date = new Date(item.dt * 1000).toDateString();
                if (!dailyForecasts[date]) {
                    dailyForecasts[date] = item;
                }
            });

            // Get next 5 days (excluding today)
            const dates = Object.keys(dailyForecasts).slice(0, 5);
            
            dates.forEach(date => {
                const item = dailyForecasts[date];
                const forecastDate = new Date(item.dt * 1000);
                const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'long' });
                const fullDate = forecastDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                const forecastItem = document.createElement('div');
                forecastItem.className = 'forecast-item';
                forecastItem.innerHTML = `
                    <div class="forecast-icon">${getWeatherIcon(item.weather[0].icon, true)}</div>
                    <div class="forecast-details">
                        <div class="forecast-temp">+${kelvinToCelsius(item.main.temp_max)}° / +${kelvinToCelsius(item.main.temp_min)}°</div>
                        <div class="forecast-date">${fullDate} • ${dayName}</div>
                    </div>
                `;
                
                forecastList.appendChild(forecastItem);
            });
        }

        // Function to show error message
        function showError(message) {
            let errorDiv = document.querySelector('.error-message');
            // Remove existing error if any
            if (errorDiv) {
                errorDiv.remove();
            }
            
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `⚠️ ${message}`;
            
            // Insert after search bar or at top of main content
            const header = document.querySelector('.header');
            header.parentNode.insertBefore(errorDiv, header.nextSibling);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                if(errorDiv.parentNode) {
                    errorDiv.remove(); // Direct removal is safer
                }
            }, 5000);
        }

        // Fetch weather data from OpenWeatherMap API
        async function fetchWeatherData(city) {
            try {
                // Clear any previous errors
                const existingError = document.querySelector('.error-message');
                if (existingError) existingError.remove();

                // Check if API key is set
                if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
                    throw new Error('Please add your OpenWeatherMap API key in the JavaScript code.');
                }

                // Show loading state
                condition.textContent = 'Loading...';
                temperature.textContent = '--°C';

                // Fetch current weather
                const currentResponse = await fetch(
                    `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`
                );
                
                if (!currentResponse.ok) {
                    if (currentResponse.status === 404) {
                        throw new Error(`City "${city}" not found. Please try another name.`);
                    } else if (currentResponse.status === 401) {
                         throw new Error('Invalid API Key. Please Check Code.');
                    } else {
                        throw new Error(`Weather check failed (${currentResponse.status}). Text: ${currentResponse.statusText}`);
                    }
                }
                
                const currentData = await currentResponse.json();
                console.log("Current API Response:", currentData); // Debug log
                updateCurrentWeather(currentData);

                // Fetch 5-day forecast
                const forecastResponse = await fetch(
                    `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`
                );
                
                if (!forecastResponse.ok) {
                     // If forecast fails but weather succeeded, we can just log it or show a mild warning, 
                     // but usually if one fails, the other might too. Let's treat it safely.
                     console.warn('Forecast fetch failed:', forecastResponse.status);
                } else {
                    const forecastData = await forecastResponse.json();
                     console.log("Forecast API Response:", forecastData); // Debug log
                    updateForecast(forecastData);
                }
                
                // Add to recent searches only on success
                addRecentSearch(`${currentData.name}, ${currentData.sys.country}`);

            } catch (error) {
                console.error('Error fetching weather data:', error);
                showError(error.message);
                
                // Reset to default values on error
                weatherIcon.textContent = '🌤️';
                temperature.textContent = '--°C';
                condition.textContent = 'Data Unavailable';
                locationEl.textContent = '📍 --';
            }
        }

        // Initialize with default location
        function initApp() {
            showRecentSearches(); // Show recent searches on page load
            
            // Try to load weather for last searched city, otherwise use default
            const recentSearches = getRecentSearches();
            if (recentSearches.length > 0) {
                // Extract city name from stored format "City, Country"
                const lastCity = recentSearches[0].split(',')[0].trim();
                fetchWeatherData(lastCity);
            } else {
                fetchWeatherData('London'); // Default location
            }
        }

        // Event listeners
        searchInput.addEventListener('focus', function() {
            showRecentSearches();
            if (getRecentSearches().length > 0) {
                recentSearchesDiv.style.display = 'block';
            }
        });

        searchInput.addEventListener('blur', function() {
            setTimeout(() => {
                recentSearchesDiv.style.display = 'none';
            }, 200);
        });

        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            if (query) {
                const filteredSearches = getRecentSearches().filter(city => 
                    city.toLowerCase().includes(query)
                );
                
                recentSearchesDiv.innerHTML = '';
                filteredSearches.forEach(city => {
                    const item = document.createElement('div');
                    item.className = 'recent-search-item';
                    item.textContent = city;
                    item.onclick = () => {
                        searchInput.value = city;
                        // Extract city name from stored format "City, Country"
                        const cityName = city.split(',')[0].trim();
                        fetchWeatherData(cityName);
                        recentSearchesDiv.style.display = 'none';
                    };
                    recentSearchesDiv.appendChild(item);
                });
                
                if (filteredSearches.length > 0) {
                    recentSearchesDiv.style.display = 'block';
                }
            } else {
                showRecentSearches();
                if (getRecentSearches().length > 0) {
                    recentSearchesDiv.style.display = 'block';
                } else {
                    recentSearchesDiv.style.display = 'none';
                }
            }
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const city = this.value.trim();
                if (city) {
                    fetchWeatherData(city);
                    recentSearchesDiv.style.display = 'none';
                }
            }
        });

        // Initialize the app when page loads
        window.addEventListener('DOMContentLoaded', initApp);