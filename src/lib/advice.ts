import type { PlayDecision } from './types'

export function getTemperatureAdvice(minTemp: number, maxTemp: number): string {
  if (maxTemp < 50) return 'Cold round. Dress warm and expect the ball to travel shorter.'
  if (minTemp < 55 && maxTemp < 70) return 'Cool but playable. A light jacket or pullover is smart.'
  if (maxTemp <= 85) return 'Comfortable golf temperature.'
  if (maxTemp <= 95) return 'Hot round. Bring extra water and expect fatigue later.'
  return 'Very hot round. Hydration is a major factor.'
}

export function getWindAdvice(maxWind: number): string {
  if (maxWind < 8) return 'Low wind. It should not affect shots much.'
  if (maxWind < 15) return 'Moderate wind. Club selection may matter on longer shots.'
  if (maxWind < 25) return 'Windy round. Expect the wind to affect drives, approach shots, and putting feel.'
  return 'Very windy. Scoring may be difficult.'
}

export function getRainAdvice(maxRainChance: number): string {
  if (maxRainChance < 20) return 'Low rain risk.'
  if (maxRainChance < 40) return 'Some rain risk. Keep an eye on the sky.'
  if (maxRainChance < 60) return 'Moderate rain risk. Bring rain gear.'
  return 'High rain risk. Consider a different tee time.'
}

export function getUvAdvice(maxUv: number): string {
  if (maxUv < 3) return 'Low UV. Sunscreen is optional but still smart.'
  if (maxUv < 6) return 'Moderate UV. Sunscreen is a good idea.'
  if (maxUv < 8) return 'High UV. Wear sunscreen.'
  if (maxUv < 11) return 'Very high UV. Sunscreen, hat, and sunglasses strongly recommended.'
  return 'Extreme UV. Avoid long exposure if possible.'
}

export function decidePlay(
  maxRainChance: number,
  maxWind: number,
  maxTemp: number,
): { shouldPlay: PlayDecision; decisionReason: string } {
  if (maxRainChance >= 70) {
    return { shouldPlay: 'NO', decisionReason: 'Rain risk is too high during your round.' }
  }
  if (maxWind >= 30) {
    return { shouldPlay: 'NO', decisionReason: 'Wind is likely too strong to enjoy the round.' }
  }
  if (maxTemp >= 100) {
    return { shouldPlay: 'NO', decisionReason: 'It may be dangerously hot for a full round.' }
  }
  if (maxRainChance >= 50 || maxWind >= 22 || maxTemp >= 95) {
    return {
      shouldPlay: 'MAYBE',
      decisionReason: 'Playable, but conditions could make the round frustrating.',
    }
  }
  return { shouldPlay: 'YES', decisionReason: 'Conditions look good enough to play.' }
}

export function buildLists(
  minTemp: number,
  maxTemp: number,
  maxWind: number,
  maxRainChance: number,
  maxUv: number,
) {
  const positives: string[] = []
  const watchOuts: string[] = []
  const itemsToBring: string[] = []

  if (maxTemp >= 55 && maxTemp <= 85) positives.push('Comfortable temperature')
  if (maxWind < 15) positives.push('Wind should be manageable')
  if (maxRainChance < 30) positives.push('Low rain risk')

  if (maxWind >= 15) watchOuts.push('Wind may affect shots')
  if (maxRainChance >= 30) watchOuts.push('Rain risk during the round')
  if (maxTemp >= 85) watchOuts.push('Heat may become a factor')
  if (maxUv >= 6) watchOuts.push('High UV exposure')

  if (maxUv >= 3) itemsToBring.push('Sunscreen')
  if (maxUv >= 6) itemsToBring.push('Hat')
  if (maxUv >= 6) itemsToBring.push('Sunglasses')
  if (maxTemp >= 80) itemsToBring.push('Extra water')
  if (maxRainChance >= 40) itemsToBring.push('Rain gear')
  if (minTemp < 60) itemsToBring.push('Light jacket')
  if (maxWind >= 15) itemsToBring.push('Wind shirt')

  return { positives, watchOuts, itemsToBring }
}
