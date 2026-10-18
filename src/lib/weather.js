/// <reference types="vite/client" />
export async function fetchWeather(location) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenWeather API key is not configured');
  }

  // Use a default location if none is provided
  const query = location || 'New Delhi, IN';

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=${apiKey}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(query)}&units=metric&appid=${apiKey}`)
    ]);

    if (!currentRes.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await currentRes.json();
    
    let forecast = [];
    if (forecastRes.ok) {
      const forecastData = await forecastRes.json();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Grab 4 data points spaced ~24h apart
      forecast = [0, 8, 16, 24].map((idx, i) => {
        const item = forecastData.list[idx];
        if (!item) return null;
        
        let dayStr = '';
        if (i === 0) dayStr = 'Today';
        else if (i === 1) dayStr = 'Tomorrow';
        else {
          dayStr = dayNames[new Date(item.dt * 1000).getDay()];
        }

        // OpenWeather uses main condition like 'Clouds', 'Rain', 'Clear'
        const mainCond = item.weather[0]?.main || 'Clear';
        const desc = item.weather[0]?.description || mainCond;
        
        return {
          day: dayStr,
          temp: Math.round(item.main.temp),
          cond: desc.charAt(0).toUpperCase() + desc.slice(1), // Capitalize
          condMain: mainCond,
          rain: item.pop ? Math.round(item.pop * 100) : 0,
        };
      }).filter(Boolean);
    }
    
    // Calculate a rough "rain probability" from humidity/clouds or pop if available in 2.5 API
    let rainProb = 0;
    if (data.rain && data.rain['1h']) {
      rainProb = Math.min(100, Math.round(data.rain['1h'] * 10));
    } else {
      rainProb = Math.round((data.clouds?.all * 0.5) + (data.main.humidity * 0.2));
    }

    return {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      rain: Math.min(100, rainProb),
      condition: data.weather[0]?.main || 'Clear',
      description: data.weather[0]?.description || 'clear sky',
      icon: data.weather[0]?.icon,
      forecast: forecast
    };
  } catch (error) {
    console.error('Weather API error:', error);
    // Return fallback demo data if it fails
    return {
      temp: 28,
      humidity: 72,
      rain: 40,
      condition: 'Partly cloudy',
      forecast: [
        { day: 'Today', temp: 28, cond: 'Partly cloudy', condMain: 'Clouds', rain: 40 },
        { day: 'Tomorrow', temp: 26, cond: 'Light rain', condMain: 'Rain', rain: 70 },
        { day: 'Wed', temp: 30, cond: 'Sunny', condMain: 'Clear', rain: 10 },
        { day: 'Thu', temp: 27, cond: 'Cloudy', condMain: 'Clouds', rain: 30 }
      ],
      error: true
    };
  }
}
