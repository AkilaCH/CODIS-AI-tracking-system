export const getLiveWeatherAndTime = async () => {
  try {
    // Coordinates set to Kandy, Central Province
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=7.2906&longitude=80.6337&current_weather=true");
    const data = await res.json();
    
    const windSpeed = `${data.current_weather.windspeed} km/h`;
    const code = data.current_weather.weathercode;
    
    // Convert WMO weather codes to text
    let condition = "Clear";
    if (code > 0 && code <= 3) condition = "Partly Cloudy";
    if (code > 3 && code < 50) condition = "Overcast";
    if (code >= 50) condition = "Rain / Precipitation";

    return { wind: windSpeed, condition };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return { wind: "Offline", condition: "Offline" };
  }
};

export const getUTCTime = () => {
  return new Date().toISOString().substring(11, 19) + " UTC";
};