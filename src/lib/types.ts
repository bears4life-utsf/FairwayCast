export type PlayDecision = 'YES' | 'MAYBE' | 'NO'

export type CourseResult = {
  lat: string
  lon: string
  display_name: string
}

export type HourForecast = {
  time: string
  temperature: number
  wind: number
  rainChance: number
  uvIndex: number
}

export type ForecastResult = {
  course: CourseResult
  courseQuery: string
  playDate: string
  teeTime: string
  golfHours: HourForecast[]
  minTemp: number
  maxTemp: number
  maxWind: number
  maxRainChance: number
  maxUv: number
  shouldPlay: PlayDecision
  decisionReason: string
  positives: string[]
  watchOuts: string[]
  itemsToBring: string[]
  tempAdvice: string
  windAdvice: string
  rainAdvice: string
  uvAdvice: string
  raw: unknown
}
