import {
  buildLists,
  decidePlay,
  getRainAdvice,
  getTemperatureAdvice,
  getUvAdvice,
  getWindAdvice,
} from './advice'
import type { CourseResult, ForecastResult, HourForecast } from './types'

type OpenMeteoHourly = {
  time: string[]
  temperature_2m: number[]
  wind_speed_10m: number[]
  precipitation_probability: number[]
  uv_index: number[]
}

async function searchCourse(courseQuery: string): Promise<CourseResult> {
  const searchQuery = `${courseQuery} golf course`
  const url =
    'https://nominatim.openstreetmap.org/search' +
    `?q=${encodeURIComponent(searchQuery)}` +
    '&format=json&limit=1'

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Course lookup failed. Try again in a moment.')
  }

  const data = (await response.json()) as CourseResult[]
  if (!data.length) {
    throw new Error('Could not find that golf course.')
  }

  return data[0]
}

async function fetchWeather(lat: string, lon: string) {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    '&hourly=temperature_2m,precipitation_probability,wind_speed_10m,uv_index' +
    '&forecast_days=7' +
    '&temperature_unit=fahrenheit' +
    '&wind_speed_unit=mph' +
    '&timezone=auto'

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Weather lookup failed. Try again in a moment.')
  }

  return response.json() as Promise<{ hourly: OpenMeteoHourly }>
}

function buildRoundHours(
  hourly: OpenMeteoHourly,
  playDate: string,
  teeTime: string,
): HourForecast[] {
  const teeHour = teeTime.slice(0, 2)
  const teeTimeString = `${playDate}T${teeHour}:00`
  const startIndex = hourly.time.findIndex((time) => time === teeTimeString)

  if (startIndex === -1) {
    throw new Error(
      'Could not find forecast for that date and tee time. Try a date within the next 7 days.',
    )
  }

  const golfHours: HourForecast[] = []
  for (let i = startIndex; i < startIndex + 6 && i < hourly.time.length; i += 1) {
    golfHours.push({
      time: hourly.time[i],
      temperature: hourly.temperature_2m[i],
      wind: hourly.wind_speed_10m[i],
      rainChance: hourly.precipitation_probability[i],
      uvIndex: hourly.uv_index[i],
    })
  }

  return golfHours
}

export async function getGolfCourseForecast(input: {
  courseQuery: string
  playDate: string
  teeTime: string
}): Promise<ForecastResult> {
  const { courseQuery, playDate, teeTime } = input

  if (!playDate) {
    throw new Error('Please select a date.')
  }
  if (!courseQuery.trim()) {
    throw new Error('Please enter a golf course.')
  }

  const course = await searchCourse(courseQuery.trim())
  const weatherData = await fetchWeather(course.lat, course.lon)
  const golfHours = buildRoundHours(weatherData.hourly, playDate, teeTime)

  const temps = golfHours.map((hour) => hour.temperature)
  const winds = golfHours.map((hour) => hour.wind)
  const rainChances = golfHours.map((hour) => hour.rainChance)
  const uvIndexes = golfHours.map((hour) => hour.uvIndex)

  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const maxWind = Math.max(...winds)
  const maxRainChance = Math.max(...rainChances)
  const maxUv = Math.max(...uvIndexes)

  const { shouldPlay, decisionReason } = decidePlay(maxRainChance, maxWind, maxTemp)
  const { positives, watchOuts, itemsToBring } = buildLists(
    minTemp,
    maxTemp,
    maxWind,
    maxRainChance,
    maxUv,
  )

  return {
    course,
    courseQuery,
    playDate,
    teeTime,
    golfHours,
    minTemp,
    maxTemp,
    maxWind,
    maxRainChance,
    maxUv,
    shouldPlay,
    decisionReason,
    positives,
    watchOuts,
    itemsToBring,
    tempAdvice: getTemperatureAdvice(minTemp, maxTemp),
    windAdvice: getWindAdvice(maxWind),
    rainAdvice: getRainAdvice(maxRainChance),
    uvAdvice: getUvAdvice(maxUv),
    raw: {
      searchedCourse: courseQuery,
      courseFound: course,
      playDate,
      teeTime,
      golfHours,
      shouldPlay,
      decisionReason,
      fullWeatherData: weatherData,
    },
  }
}
