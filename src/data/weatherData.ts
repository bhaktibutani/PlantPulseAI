export interface ForecastDay {
  day: string;
  temp: string;
  condition: string;
  rainProbability: number;
}

export interface WeatherModel {
  districtId: string;
  temperature: string;
  condition: {
    en: string;
    gu: string;
    hi: string;
  };
  humidity: number;
  rainProbability: number;
  windSpeed: string;
  soilMoistureEst: string;
  smartCareRecommendation: {
    directive: {
      en: string;
      gu: string;
      hi: string;
    };
    reason: {
      en: string;
      gu: string;
      hi: string;
    };
    actionCode: 'skip' | 'delay' | 'water_light' | 'water_deep';
  };
  forecast: ForecastDay[];
}

export const DISTRICT_WEATHER_DATA: Record<string, WeatherModel> = {
  rajkot: {
    districtId: 'rajkot',
    temperature: '31°C',
    condition: { en: 'Partly Cloudy', gu: 'અંશતઃ વાદળછાયું', hi: 'आंशिक बादल' },
    humidity: 68,
    rainProbability: 80,
    windSpeed: '12 km/h WNW',
    soilMoistureEst: '42% (Normal)',
    smartCareRecommendation: {
      directive: {
        en: 'Skip watering today.',
        gu: 'આજે પાણી આપવાનું ટાળો.',
        hi: 'आज पानी देने से बचें।',
      },
      reason: {
        en: 'Rain is likely in the next few hours (80% probability). Soil has adequate moisture reserves.',
        gu: 'આગામી થોડા કલાકોમાં વરસાદની ૮૦% શક્યતા છે. જમીનમાં પૂરતો ભેજ સંગ્રહાયેલ છે.',
        hi: 'अगले कुछ घंटों में बारिश की ८०% संभावना है। मिट्टी में पर्याप्त नमी मौजूद है।',
      },
      actionCode: 'skip',
    },
    forecast: [
      { day: 'Today', temp: '31°C', condition: 'Rain Shower', rainProbability: 80 },
      { day: 'Tomorrow', temp: '29°C', condition: 'Scattered Clouds', rainProbability: 35 },
      { day: 'Day 3', temp: '32°C', condition: 'Sunny', rainProbability: 10 },
      { day: 'Day 4', temp: '33°C', condition: 'Clear Sky', rainProbability: 5 },
    ],
  },
  junagadh: {
    districtId: 'junagadh',
    temperature: '30°C',
    condition: { en: 'Humid Overcast', gu: 'ભેજવાળું વાદળછાયું', hi: 'आर्द्र बादलों से घिरा' },
    humidity: 74,
    rainProbability: 65,
    windSpeed: '16 km/h SW',
    soilMoistureEst: '48% (High)',
    smartCareRecommendation: {
      directive: {
        en: 'Delay irrigation by 24 hours.',
        gu: 'સિંચાઈ ૨૪ કલાક માટે મુલતવી રાખો.',
        hi: 'सिंचाई २४ घंटे के लिए टालें।',
      },
      reason: {
        en: 'High atmospheric humidity and mountain slope showers expected near Girnar foothills.',
        gu: 'ગીરનાર તળેટી વિસ્તારમાં ઊંચો ભેજ અને વરસાદી ઝાપટાંની શક્યતા છે.',
        hi: 'गिरनार तलहटी में उच्च आर्द्रता और हल्की बारिश की संभावना है।',
      },
      actionCode: 'delay',
    },
    forecast: [
      { day: 'Today', temp: '30°C', condition: 'Humid Rain', rainProbability: 65 },
      { day: 'Tomorrow', temp: '28°C', condition: 'Light Rain', rainProbability: 50 },
      { day: 'Day 3', temp: '31°C', condition: 'Partly Cloudy', rainProbability: 20 },
      { day: 'Day 4', temp: '32°C', condition: 'Sunny', rainProbability: 10 },
    ],
  },
  amreli: {
    districtId: 'amreli',
    temperature: '32°C',
    condition: { en: 'Warm Breeze', gu: 'ગરમ પવન', hi: 'गर्म हवा' },
    humidity: 58,
    rainProbability: 25,
    windSpeed: '14 km/h W',
    soilMoistureEst: '36% (Drying)',
    smartCareRecommendation: {
      directive: {
        en: 'Apply light evening drip irrigation.',
        gu: 'સાંજે હળવું ટપક સિંચાઈ કરો.',
        hi: 'शाम को हल्की ड्रिप सिंचाई करें।',
      },
      reason: {
        en: 'Low precipitation chance today (25%). Soil surface is drying under warm afternoon winds.',
        gu: 'આજે વરસાદની માત્ર ૨૫% સંભાવના છે. બપોરના પવનથી જમીન સુકાઈ રહી છે.',
        hi: 'आज बारिश की केवल २५% संभावना है। गर्म हवा से मिट्टी की ऊपरी परत सूख रही है।',
      },
      actionCode: 'water_light',
    },
    forecast: [
      { day: 'Today', temp: '32°C', condition: 'Warm Clouds', rainProbability: 25 },
      { day: 'Tomorrow', temp: '33°C', condition: 'Clear', rainProbability: 15 },
      { day: 'Day 3', temp: '34°C', condition: 'Sunny', rainProbability: 10 },
      { day: 'Day 4', temp: '34°C', condition: 'Hot & Clear', rainProbability: 5 },
    ],
  },
  ahmedabad: {
    districtId: 'ahmedabad',
    temperature: '33°C',
    condition: { en: 'Hazy Sun', gu: 'ઝાંખો તડકો', hi: 'धुंधली धूप' },
    humidity: 62,
    rainProbability: 30,
    windSpeed: '10 km/h NW',
    soilMoistureEst: '39% (Moderate)',
    smartCareRecommendation: {
      directive: {
        en: 'Water balcony pots around sunset.',
        gu: 'સૂર્યાસ્ત સમયે બાલ્કની કૂંડાંમાં પાણી આપો.',
        hi: 'सूर्यास्त के समय बालकनी के गमलों में पानी दें।',
      },
      reason: {
        en: 'Urban concrete heat absorption increases topsoil evaporation rate during mid-day.',
        gu: 'શહેરી ગરમીને કારણે બપોરે કૂંડાંની માટીનું પાણી ઝડપથી ઉડી જાય છે.',
        hi: 'शहरी गर्मी के कारण दोपहर में गमले की मिट्टी की नमी तेजी से वाष्पीकृत होती है।',
      },
      actionCode: 'water_light',
    },
    forecast: [
      { day: 'Today', temp: '33°C', condition: 'Warm Haze', rainProbability: 30 },
      { day: 'Tomorrow', temp: '34°C', condition: 'Sunny', rainProbability: 20 },
      { day: 'Day 3', temp: '34°C', condition: 'Clear', rainProbability: 15 },
      { day: 'Day 4', temp: '35°C', condition: 'Hot', rainProbability: 10 },
    ],
  },
};

export const getWeatherData = (districtId: string): WeatherModel => {
  return DISTRICT_WEATHER_DATA[districtId] || DISTRICT_WEATHER_DATA['rajkot'];
};
